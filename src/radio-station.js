const path            = require('path')
    , CFonts          = require('cfonts')
    , hash            = require('./utils/hash')
    , sleep           = require('sleep-promise')
    , Tracks          = require('./tracks')
    , Stream          = require('./stream')
    , StreamHelper    = require('./stream-helper')
    , Launcher        = require('./launcher')
    , express         = require('express')
    , http            = require('http')
    , IO              = require('socket.io')
    , cors            = require('cors')

const defaultCreateArgs = {
  pathWorkDir: path.join(__dirname, 'station'),
  pathLauncher: path.join(__dirname, 'public'),
  isLauncher: true,
  port: 9933,
  login: `localhost_${hash().slice(0, 16)}`,
  password: `hackme_${hash().slice(0, 16)}`,
  isAutoStart: true,
  puppeteerLauncher: { headless: true, args: ['--no-sandbox'] }
}

const defaultOnUseArgs = {
  isSafe: true
}

const create = async ({
  pathWorkDir = defaultCreateArgs.pathWorkDir,
  pathLauncher = defaultCreateArgs.pathLauncher,
  isLauncher = defaultCreateArgs.isLauncher,
  port = defaultCreateArgs.port,
  login = defaultCreateArgs.login,
  password = defaultCreateArgs.password,
  isAutoStart = defaultCreateArgs.isAutoStart,
  puppeteerLauncher = defaultCreateArgs.puppeteerLauncher
} = defaultCreateArgs) => {
  const app = express()
      , server = http.createServer(app)
      , io = IO(server)

  app.use(cors())

  const tracks = await Tracks({ pathWorkDir })
      , stream = Stream({ isAutoStart })
      , streamHelper = await StreamHelper({ login, password, port, puppeteerLauncher })

  let launcher = null

  if (isLauncher) {
    launcher = await Launcher({ pathLauncher, login, password, port })
  }

  if (isLauncher) {
    launcher.onLoad(tracks.load)
    launcher.onUnload(tracks.unload)
    launcher.onAllTracks(tracks.all)
    launcher.onInfo(tracks.info)
    launcher.onPicture(tracks.picture)
    launcher.onAllStream(stream.all)
    launcher.onCurrentTrack(stream.current)
    launcher.onPush(stream.push)
    launcher.onPop(stream.pop)
    launcher.onSwitchLauncher(streamHelper.switchLauncher)
    stream.onUse(launcher.airkiss.currentTrack)
    stream.onUse(launcher.airkiss.allStream)
    stream.onPop(launcher.airkiss.allStream)
    stream.onPush(launcher.airkiss.allStream)
    tracks.onLoad(launcher.airkiss.allTracks)
    tracks.onUnload(launcher.airkiss.allTracks)
  }

  stream.onAllTracks(tracks.all)
  stream.onFind(tracks.find)
  stream.onStart(streamHelper.start)

  if (isLauncher) {
    app.post('/push', launcher.push)
    app.post('/pop', launcher.pop)
    app.post('/load', launcher.load)
    app.get('/unload', launcher.unload)
    app.get('/picture', launcher.picture)
    app.get('/info', launcher.info)
    app.get('/radio', launcher.radio)
    app.get('/launcher-stream', launcher.addListener)
  }

  app.get('/stream', stream.addListener)

  io.on('connection', socket => {
    const {
      login:_login = '',
      password:_password = ''
    } = socket.handshake.auth

    const isLogin = login.toString() === _login.toString()
        , isPassword = password.toString() === _password.toString()

    if (
      !(isLogin && isPassword)
    ) {
      socket.disconnect()
      return
    }

    if (isLauncher) {
      launcher.addAdmin(socket)
      launcher.disconnect(socket)
      launcher.allTracks(socket)
      launcher.allStream(socket)
      launcher.currentTrack(socket)
      launcher.microphone(socket)
      launcher.switchLauncher(socket)
    }

    streamHelper.stream(socket)
  })

  const picture = async (req, res) => {
    const { id } = req.query
    if (id) {
      const picture = await tracks.picture(id)
      if (picture) {
        res.writeHead(200, {
          'Content-Type': picture.contentType,
          'Content-Length': picture.contentLength,
          'Cache-Control': 'max-age=31536000'
        })
        res.end(picture.buffer)
        return
      }
    }
    res.end('')
  }

  const useWrapper = async (isSafe) => {
    const current = stream.current()
    if (current) {
      let info = await tracks.info(current.id)
      info = {
        ...info,
        ...current
      }

      if (isSafe) {
        delete info.path
        delete info.parentPath
      }

      return info
    }
    return null
  }

  const onUse = async (callback, { isSafe = defaultOnUseArgs.isSafe } = defaultOnUseArgs) => {
    stream.onUse(async (_, use) => {
      const info = await useWrapper(isSafe)
      if (info) {
        callback(info)
      }
    })

    for (;;) {
      const info = await useWrapper(isSafe)
      if (info) {
        callback(info)
        break
      }
      await sleep(3000)
    }
  }

  const returned = {
    track: {
      load: tracks.load,
      loads: tracks.loads,
      unload: tracks.unload,
      all: tracks.all,
      find: tracks.find,
      info: tracks.info,
      picture: tracks.picture,
      onLoad: tracks.onLoad,
    },
    stream: {
      start: stream.start,
      pop: stream.pop,
      push: stream.push,
      current: stream.current,
      all: stream.all,
      onPush: stream.onPush,
      onPop: stream.onPop,
      onUse: stream.onUse
    },
    addListener: streamHelper.addListener,
    picture,
    onUse,
    source: {
      tracks,
      stream,
      launcher,
      streamHelper
    }
  }

  return new Promise(resolve => {
    server.listen(port, () => {
      console.log('')
      console.log('')
      CFonts.say('Radio|Station', {
        font: 'simple',
        align: 'center',
        colors: ['yellow'],
        background: 'transparent',
        letterSpacing: 1,
        space: false,
        env: 'node',
      })

      const launcherHost = `http://127.0.0.1:${port}`
      const audioHost = `http://127.0.0.1:%yourport%/radio`

      const stringLauncherHost = isLauncher ? `Launcher url: ${launcherHost}${' '.repeat(32-launcherHost.length)}|login: ${login}${' '.repeat(39-login.length)}|password: ${password}${' '.repeat(36-password.length)}|` : ''

      CFonts.say(`${stringLauncherHost}Audio url: ${audioHost}${' '.repeat(35-audioHost.length)}||It will take some time to start and start playback in the browser... |open the page and wait. If you have any questions, please contact telegram: @prohetamine |and don't be afraid to help the project.| by Stas Prohetamie 2022.01.24`, {
        font: 'console',
        align: 'center',
        colors: ['yellow'],
        background: 'transparent',
        space: true,
        lineHeight: 0,
        env: 'node'
      })

      resolve(returned)
    })
  })
}

module.exports = { create }
