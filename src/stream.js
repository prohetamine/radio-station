const sleep         = require('sleep-promise')
    , mm            = require('music-metadata')
    , fsPromise     = require('fs-extra')
    , arrayRandom   = require('./utils/array-random')
    , hash          = require('./utils/hash')
    , callback      = require('./utils/callback')

const Stream = ({ isAutoStart, debug }) => {
  let sockets = []
    , trackIds = []
    , currentTrack = null
    , index = 0
    , isStart = false

  const [onUse, usePush] = callback()
      , [onPush, pushPush] = callback()
      , [onPop, popPush] = callback()
      , [onFind, findPush] = callback()
      , [onAllTracks, allTracksPush] = callback()
      , [onStart, startPush] = callback()

  const socketEmit = (event, data) =>
    sockets.forEach(socket => {
      socket.emit(event, data)
    })

  const push = async id => {
    if (id) {
      const track = onFind(id)[0]
      if (!track) {
        onPush(null)
        return null
      }
      const streamId = hash()
      trackIds.push({ ...track, streamId, type: 'queue' })
      onPush(streamId)
      return streamId
    } else {
      onPush(null)
      return null
    }
  }

  const pop = id => {
    const trackIdsFilter = trackIds.filter(({ streamId }, _index) => !(streamId === id && _index > index))
    const isDelete = JSON.stringify(trackIds) !== JSON.stringify(trackIdsFilter)
    trackIds = trackIdsFilter
    const result = isDelete ? id : null
    onPop(result)
    return result
  }

  const stream = socket => {
    socket.on('disconnect', () =>
      sockets = sockets.filter(_socket => _socket.id !== socket.id)
    )

    sockets.push(socket)
  }

  const start = () => {
    try {
      loop()
      return true
    } catch (err) {
      debug && console.log('start', err)
      return false
    }
  }

  const all = () => trackIds
  const current = () => currentTrack

  const loop = async () => {
    if (!trackIds[index]) {
      trackIds.push({ type: 'random' })
    }

    main: while (true) {
      let track = null

      isExist: while (true) {
        let tracks = onAllTracks()

        if (!(tracks && tracks[0])) {
          await sleep(2000)
          continue isExist
        }

        tracks = tracks[0]

        const isRandom = trackIds[index].type === 'random'

        track = isRandom
                    ? arrayRandom(tracks)
                    : tracks.find(({ id }) => id == trackIds[index].id) || null

        track = trackIds[index] = {
          ...track,
          type: trackIds[index].type
        }

        if (!track.path && track.type !== 'random') {
          trackIds[index].type = 'error'
          break main
        }

        if (track.path) {
          break isExist
        }
        await sleep(2000)
      }

      currentTrack = trackIds[index]
      onUse(index, trackIds[index])

      const trackRead = async end => {
        const file = await fsPromise.stat(track.path)
            , meta = await mm.parseFile(track.path)
            , bitrate = Math.ceil(file.size / meta.format.duration)

        const buffer = await fsPromise.readFile(track.path)

        for (let i = 0; i < meta.format.duration; i += 1) {
          const start = Math.ceil(i * bitrate)
              , end = Math.ceil((i + 1) * bitrate)

          if (end === undefined) { break }
          const chunk = buffer.slice(start, end)
          socketEmit('stream', chunk)

          if (i > 10) {
            if (!isStart) {
              onStart()
              isStart = true
            }
          }

          await sleep(1000)
        }
        end()
      }

      await new Promise(trackRead)

      if (trackIds[index].type !== 'random') {
        break main
      } else {
        if (trackIds.slice(-1)[0].type !== 'random') {
          break main
        }
      }
    }

    index++
    await loop()
  }

  isAutoStart && loop()

  return {
    push,
    pop,
    stream,
    all,
    current,
    start,
    onPush: pushPush,
    onPop: popPush,
    onStart: startPush,
    onUse: usePush,
    onFind: findPush,
    onAllTracks: allTracksPush
  }
}

module.exports = Stream
