const callback = require('./utils/callback')

const NULL = JSON.stringify(null)

const Launcher = ({ debug }) => {
  let sockets = []
  let audioHeaders = null

  const [onLoad, loadPush] = callback()
      , [onUnload, unloadPush] = callback()
      , [onPush, pushPush] = callback()
      , [onPop, popPush] = callback()
      , [onAllStream, allStreamPush] = callback()
      , [onAllTracks, allTracksPush] = callback()
      , [onCurrentTrack, currentTrackPush] = callback()
      , [onInfo, infoPush] = callback()
      , [onPicture, picturePush] = callback()
      , [onSwitch, switchPush] = callback()

  const socketEmit = (event, data) =>
    sockets.forEach(socket => {
      socket.emit(event, data)
    })

  const switchLauncher = socket => {
    socket.on('switch-launcher-off', () => onSwitch(false))
    socket.on('switch-launcher-on', () => onSwitch(true))
  }

  const allTracks = async socket =>
    socket.on('allTracks', async () => {
      try {
        let tracks = await onAllTracks()
        tracks = await tracks[0]
        if (tracks) {
          socket.emit('onAllTracks', tracks)
        }
      } catch (err) {
        debug && console.log('allTracks', err)
      }
    })

  const allStream = async socket =>
    socket.on('allStream', async () => {
      try {
        let tracks = await onAllStream()
        tracks = tracks[0]
        if (tracks) {
          socket.emit('onAllStream', tracks)
        }
      } catch (err) {
        debug && console.log('allStream', err)
      }
    })

  const currentTrack = async socket =>
    socket.on('currentTrack', async () => {
      try {
        let track = await onCurrentTrack()
        track = track[0]
        if (track) {
          socket.emit('onCurrentTrack', track)
        }
      } catch (err) {
        debug && console.log('currentTrack', err)
      }
    })

  const stream = socket => {
    sockets.push(socket)

    socket.on('disconnect', () =>
      sockets = sockets.filter(_socket => _socket.id !== socket.id)
    )

    socket.on('launcher-header', chunk => {
      audioHeaders = Buffer.from(chunk)
    })

    if (audioHeaders) {
      socket.emit('launcher-stream', audioHeaders)
    }

    socket.on('launcher-audio', chunk => {
      socketEmit('launcher-stream', chunk)
    })
  }

  const picture = async (req, res) => {
    const { id = null } = req.query
    if (id) {
      try {
        let picture = await onPicture(id)
        picture = await picture[0]
        if (picture) {
          res.writeHead(200, {
            'Content-Type': picture.contentType,
            'Content-Length': picture.contentLength,
            'Cache-Control': 'max-age=31536000'
          })
          res.end(picture.buffer)
          return
        }
      } catch (err) {
        debug && console.log('picture', err)
      }
    }

    res.end(NULL)
  }

  const info = async (req, res) => {
    const { id = null } = req.query
    if (id) {
      try {
        let track = await onInfo(id)
        track = await track[0]
        if (track) {
          res.end(
            JSON.stringify(track)
          )
          return
        }
      } catch (err) {
        debug && console.log('info', err)
      }
    }

    res.end(NULL)
  }

  const push = async (req, res) => {
    const { id = null } = req.query
    if (id) {
      try {
        let _id = await onPush(id)
        _id = await _id[0]
        if (_id) {
          res.end(
            JSON.stringify(_id)
          )
          return
        }
      } catch (err) {
        debug && console.log('push', err)
      }
    }

    res.end(NULL)
  }

  const pop = async (req, res) => {
    const { id = null } = req.query
    if (id) {
      try {
        let _id = onPop(id)
            _id = _id[0]
        if (_id) {
          res.end(
            JSON.stringify(_id)
          )
          return
        }
      } catch (err) {
        debug && console.log('pop', err)
      }
    }

    res.end(NULL)
  }

  const load = async (req, res) => {
    const { name = null } = req.query
    if (name) {
      try {
        const buffer = await new Promise(resolve => {
          const buffer = []
          req.on('data', chunk => buffer.push(chunk))
          req.on('end', () => resolve(buffer))
        })

        let id = await onLoad(name, buffer)
        id = await id[0]
        if (id) {
          res.end(
            JSON.stringify(id)
          )
          return
        }
      } catch (err) {
        debug && console.log('load', err)
      }
    }

    res.end(NULL)
  }

  const unload = async (req, res) => {
    let { id = null } = req.query
    if (id) {
      try {
        id = await onUnload(id)
        id = await id[0]
        if (id) {
          res.end(
            JSON.stringify(id)
          )
          return
        }
      } catch (err) {
        debug && console.log('unload', err)
      }
    }

    res.end(NULL)
  }

  return {
    allTracks,
    allStream,
    currentTrack,
    stream,
    picture,
    info,
    push,
    pop,
    load,
    unload,
    switch: switchLauncher,
    onLoad: loadPush,
    onUnload: unloadPush,
    onPush: pushPush,
    onPop: popPush,
    onAllStream: allStreamPush,
    onAllTracks: allTracksPush,
    onCurrentTrack: currentTrackPush,
    onInfo: infoPush,
    onPicture: picturePush,
    onSwitch: switchPush,
    airkiss: {
      allStream: async () => {
        try {
          let tracks = await onAllStream()
          tracks = await tracks[0]
          if (tracks) {
            socketEmit('onAllStream', tracks)
          }
        } catch (err) {
          debug && console.log('allStream', err)
        }
      },
      currentTrack: async () => {
        try {
          let track = await onCurrentTrack()
          track = await track[0]
          if (track) {
            socketEmit('onCurrentTrack', track)
          }
        } catch (err) {
          debug && console.log('currentTrack', err)
        }
      },
      allTracks: async () => {
        try {
          let tracks = await onAllTracks()
          tracks = await tracks[0]
          if (tracks) {
            socketEmit('onAllTracks', tracks)
          }
        } catch (err) {
          debug && console.log('allTracks', err)
        }
      }
    }
  }
}

module.exports = Launcher
