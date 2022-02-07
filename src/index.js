const path          = require('path')
    , CFonts        = require('cfonts')
    , hash          = require('./utils/hash')
    , md5           = require('md5')
    , sleep         = require('sleep-promise')
    , Tracks        = require('./tracks')
    , Stream        = require('./stream')
    , StreamHelper  = require('./stream-helper')
    , Launcher      = require('./launcher')
    , express       = require('express')
    , http          = require('http')
    , IO            = require('socket.io')
    , cors          = require('cors')
    , splitSlice    = require('split-slice')
    , myIP          = require('my-ip')

const defaultArgs = {
  create: {
    pathWorkDir: path.join(__dirname, 'station'),
    isLauncher: true,
    port: 9933,
    login: `localhost_${hash().slice(0, 16)}`,
    password: `hackme_${hash().slice(0, 16)}`,
    isAutoStart: true,
    puppeteerLauncher: {
      headless: true,
      args: ['--no-sandbox']
    },
    debug: false,
    mainPort: false
  },
  onUse: {
    isSafe: true
  }
}

const create = async (
  {
    pathWorkDir = defaultArgs.create.pathWorkDir,
    isLauncher = defaultArgs.create.isLauncher,
    port = defaultArgs.create.port,
    login = defaultArgs.create.login,
    password = defaultArgs.create.password,
    isAutoStart = defaultArgs.create.isAutoStart,
    puppeteerLauncher = defaultArgs.create.puppeteerLauncher,
    debug = defaultArgs.create.debug,
    mainPort = defaultArgs.create.mainPort
  } = defaultArgs.create
) => {
  const app = express()
      , server = http.createServer(app)
      , io = IO(server)

  if (isLauncher) {
    app.use(cors())

    app.get('/auth', (req, res) => {
      const {
        login: _login = '',
        password: _password = ''
      } = req.query

      const isLogin = login.toString() === _login.toString()
          , isPassword = password.toString() === _password.toString()

      if (
        !(isLogin && isPassword)
      ) {
        res.send(
          JSON.stringify({
            isOk: false,
            token: null
          })
        )
      } else {
        const token = md5(_login.toString() + _password.toString() + '19988222')

        res.send(
          JSON.stringify({
            isOk: true,
            token
          })
        )
      }
    })

    app.use('/', (req, res, next) => {
      const {
        login: _login = '',
        password: _password = '',
        token = null
      } = req.query

      const isLogin = login.toString() === _login.toString()
          , isPassword = password.toString() === _password.toString()
          , isToken = md5(_login.toString() + _password.toString() + '19988222') === md5(login.toString() + password.toString() + '19988222') ||
                      token === md5(login.toString() + password.toString() + '19988222')
      if (
        !((isLogin && isPassword) || isToken)
      ) {
        res.status(401)
        res.send('not auth')
        return
      } else {
        next()
      }
    })
  }

  const tracks = await Tracks({ pathWorkDir, debug })
      , stream = Stream({ isAutoStart, debug })
      , streamHelper = await StreamHelper({ login, password, port, puppeteerLauncher, debug })

  let launcher = null

  if (isLauncher) {
    launcher = await Launcher({ debug })
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
    launcher.onSwitch(streamHelper.switch)
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
    app.get('/status', (req, res) => res.send('').status(200))
  }

  io.on('connection', socket => {
    const {
      login: _login = '',
      password: _password = '',
      token = null
    } = socket.handshake.auth

    const isLogin = login.toString() === _login.toString()
        , isPassword = password.toString() === _password.toString()
        , isToken = md5(_login.toString() + _password.toString() + '19988222') === md5(login.toString() + password.toString() + '19988222') ||
                    token === md5(login.toString() + password.toString() + '19988222')

    if (
      !((isLogin && isPassword) || isToken)
    ) {
      socket.disconnect()
      return
    }

    if (isLauncher) {
      launcher.allTracks(socket)
      launcher.allStream(socket)
      launcher.currentTrack(socket)
      launcher.stream(socket)
      launcher.switch(socket)
    }

    stream.stream(socket)
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

  const info = async (req, res) => {
    const { id } = req.query
    if (id) {
      const info = await tracks.info(id)
      if (info) {
        res.end(
          JSON.stringify(info)
        )
        return
      }
    }
    res.end(
      JSON.stringify(null)
    )
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

  const onUse = async (callback, { isSafe = defaultArgs.onUse.isSafe } = defaultArgs.onUse) => {
    stream.onUse(async () => {
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
      onUnload: tracks.onUnload
    },
    stream: {
      start: stream.start,
      pop: stream.pop,
      push: stream.push,
      current: stream.current,
      all: stream.all,
      onStart: stream.onStart,
      onPush: stream.onPush,
      onPop: stream.onPop,
      onUse: stream.onUse
    },
    addListener: streamHelper.addListener,
    picture,
    info,
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

      const siteHost = `http://${myIP()}:${mainPort ? mainPort : '%yourport%'}`
          , launcherHost = `${myIP()}:${port}`

      const messageLauncher = isLauncher ? `Auth:${' '.repeat(43)}|host: ${launcherHost}${' '.repeat(39-launcherHost.length)}|login: ${login}${' '.repeat(38-login.length)}|password: ${password}${' '.repeat(35-password.length)}||` : ''

      CFonts.say(`${messageLauncher}Site url: ${siteHost}${' '.repeat(38-siteHost.length)}`, {
        font: 'console',
        align: 'center',
        colors: ['yellow'],
        background: 'transparent',
        space: true,
        lineHeight: 0,
        env: 'node'
      })

      const message = splitSlice(`It will take some time to start and start playback in the browser... open the page and wait. If you have any questions, please contact telegram: @prohetamine. And don't be afraid to help the project. by Stas Prohetamie 2022.01.27`, 60, { space: true, align: 'left' }).join('|')

      CFonts.say(message, {
        font: 'console',
        align: 'center',
        colors: ['yellow'],
        background: 'transparent',
        space: false,
        lineHeight: 0,
        env: 'node'
      })

      resolve(returned)
    })
  })
}

module.exports = { create }
