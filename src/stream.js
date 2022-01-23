const path              = require('path')
    , sleep             = require('sleep-promise')
    , mm                = require('music-metadata')
    , Throttle          = require('throttle')
    , fsPromise         = require('fs-extra')
    , sendChunk         = require('./utils/send-chunk')
    , arrayRandom       = require('./utils/array-random')
    , pathToName        = require('./utils/path-to-name')
    , convertingTrack   = require('./utils/converting-track')
    , hash              = require('./utils/hash')
    , callback          = require('./utils/callback')

const Stream = ({ isAutoStart }) => {
  let listeners = []
    , allTrackCallbacks = []
    , trackIds = []
    , currentTrack = null
    , index = 0
    , isStart = false

  const [onUse, usePush] = callback()
      , [onPush, pushPush] = callback()
      , [onPop, popPush] = callback()
      , [onFind, findPush] = callback()
      , [onUnload, unloadPush] = callback()
      , [onAllTracks, allTracksPush] = callback()
      , [onStart, startPush] = callback()

  const push = async id => {
    if (id) {
      const track = onFind(id)[0]
      const streamId = hash()
      trackIds.push({ ...track, streamId, type: 'file' })
      onPush(streamId)
      return streamId
    } else {
      onPush(null)
      return null
    }
  }

  const pop = id => {
    const trackIdsFilter = trackIds.filter(({ streamId }, _index) => !(streamId === id && _index > index))
    isDelete = JSON.stringify(trackIds) !== JSON.stringify(trackIdsFilter)
    trackIds = trackIdsFilter
    onPop(id)
    return isDelete
  }

  const addListener = (req, res) => {
    res.writeHead(200, {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-store',
      'Connection': 'keep-alive'
    })

    listeners.push(res)
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

      await new Promise(async end => {
        const file = await fsPromise.stat(track.path)
            , meta = await mm.parseFile(track.path)
            , bitrate = Math.ceil(file.size / meta.format.duration)

        const buffer = await fsPromise.readFile(track.path)

        for (let i = 0; i < meta.format.duration; i += 0.1) {
          const start = Math.ceil(i * bitrate)
              , end = Math.ceil((i + 0.1) * bitrate)

          if (end === undefined) { break }
          const chunk = buffer.slice(start, end)
          sendChunk(listeners, chunk)

          if (i > 10) {
            if (!isStart) {
              onStart()
              isStart = true
            }
          }

          await sleep(100)
        }
        end()
      })

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
    addListener,
    all,
    current,
    start: () => loop(),
    onStart: startPush,
    onUse: usePush,
    onPop: popPush,
    onPush: pushPush,
    onFind: findPush,
    onUnload: unloadPush,
    onAllTracks: allTracksPush
  }
}

module.exports = Stream
