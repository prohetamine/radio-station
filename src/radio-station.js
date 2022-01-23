const path            = require('path')
    , CFonts          = require('cfonts')
    , sleep           = require('sleep-promise')
    , Tracks          = require('./tracks')
    , Stream          = require('./stream')
    , StreamHelper    = require('./stream-helper')
    , Launcher        = require('./launcher')

const defaultCreateArgs = {
  pathWorkDir: path.join(__dirname, 'station'),
  pathLauncher: path.join(__dirname, 'public'),
  port: null,
  login: null,
  password: null
}

const defaultOnUseArgs = {
  isSafe: true
}

const create = async ({
  pathWorkDir = defaultCreateArgs.pathWorkDir,
  pathLauncher = defaultCreateArgs.pathLauncher,
  port = null,
  login = null,
  password = null,
  isStart = true,
  puppeteer = {}
} = defaultCreateArgs) => {
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

  const isLauncher = !!(port && login && password)
  let launcher = null

  if (isLauncher) {
    launcher = await Launcher({ pathLauncher, login, password, port })
  }

  const tracks = await Tracks({ pathWorkDir })
      , stream = Stream({ isStart })
      , streamHelper = await StreamHelper({ /* puppeteer */ })

  if (isLauncher) {
    launcher.onLoad(tracks.load)
    launcher.onUnload(tracks.unload)
    launcher.onAllTracks(tracks.all)
    launcher.onInfo(tracks.info)
    launcher.onPicture(tracks.picture)
    launcher.onAllStream(stream.all)
    launcher.onCurrentTrack(stream.current)
    tracks.onLoad(launcher.airkiss.allTracks)
    tracks.onUnload(launcher.airkiss.allTracks)
    stream.onUse(launcher.airkiss.currentTrack)
    stream.onUse(launcher.airkiss.allStream)
    stream.onUnload(tracks.unload)
    stream.onPop(launcher.airkiss.allStream)
    stream.onPush(launcher.airkiss.allStream)
    launcher.onListener(stream.addListener)
    launcher.onPush(stream.push)
    launcher.onPop(stream.pop)
  }

  stream.onAllTracks(tracks.all)
  stream.onFind(tracks.find)

  /*const addListener = (req, res) =>
                          isLauncher
                            ? launcher.addListener(req, res)
                            : stream.addListener(req, res)*/

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

  return {
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
      launcher
    }
  }
}

module.exports = { create }
