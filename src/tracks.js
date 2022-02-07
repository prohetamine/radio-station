const path              = require('path')
    , mm                = require('music-metadata')
    , fsPromise         = require('fs-extra')
    , base64            = require('base-64')
    , utf8              = require('utf8')
    , pathToName        = require('./utils/path-to-name')
    , convertingTrack   = require('./utils/converting-track')
    , hashByName        = require('./utils/hash-by-name')
    , callback          = require('./utils/callback')

const Tracks = async ({ pathWorkDir, debug }) => {
  const pathWorkDirTracks = path.join(pathWorkDir, 'tracks')
      , pathWorkDirTemp = path.join(pathWorkDir, 'temp')
      , pathWorkDirData = path.join(pathWorkDir, 'data.json')

  let trackList = {}

  try {
    const text = await fsPromise.readFile(pathWorkDirData, 'utf8')
        , bytes = base64.decode(text)
        , json = utf8.decode(bytes)

    trackList = JSON.parse(json)
  } catch (err) {
    debug && console.log(err)
    debug && console.log('Create work folders and files..')
    const isPathWorkDir = await fsPromise.exists(pathWorkDirTracks)
        , isWorkDirTemp = await fsPromise.exists(pathWorkDirTemp)
        , isWorkDirData = await fsPromise.exists(pathWorkDirData)

    !isPathWorkDir && await fsPromise.mkdir(pathWorkDirTracks, { recursive: true })
    !isWorkDirTemp && await fsPromise.mkdir(pathWorkDirTemp, { recursive: true })
    !isWorkDirData && await fsPromise.writeFile(pathWorkDirData, JSON.stringify({}))
  }

  const write = async () => {
    try {
      const stringData = JSON.stringify(trackList)
          , bytes = utf8.encode(stringData)
          , text = base64.encode(bytes)

      await fsPromise.writeFile(pathWorkDirData, text)
    } catch (err) {
      debug && console.log('write', err)
      debug && console.log(trackList)
    }
  }

  trackList = new Proxy(trackList, {
    async deleteProperty (target, prop) {
      delete target[prop]
      await write()
    },
    async set (target, prop, value) {
      target[prop] = value
      await write()
    }
  })

  const [onLoad, loadPush] = callback()
      , [onUnload, unloadPush] = callback()
      , [onAll, allPush] = callback()
      , [onInfo, infoPush] = callback()
      , [onFind, findPush] = callback()
      , [onPicture, picturePush] = callback()

  const clean = async pathDir => {
    const tracks = Object.values(trackList)
    const tracksDir = await fsPromise.readdir(pathDir)
    await Promise.all(
      tracksDir.map(async track => {
        if (!tracks.find(({ name }) => track === name)) {
          return await fsPromise.rm(path.join(pathDir, track))
        }
      })
    )
  }

  await clean(pathWorkDirTemp)
  await clean(pathWorkDirTracks)

  const find = data => {
    const _name = pathToName(data)
    const track = Object.values(trackList)
                    .find(
                      ({ path, parentPath, id, name }) =>
                              path === data ||
                        parentPath === data ||
                                id === data ||
                              name === data ||
                              name === _name
                    ) || null

    onFind(track)
    return track
  }

  const unload = async id => {
    const track = trackList[id]

    if (track) {
      const path = track.path
      delete trackList[id]

      if (track) {
        try {
          await fsPromise.unlink(path)
          onUnload(id)
          return id
        } catch (err) {
          debug && console.log('unload', err)
          track[id] = track
        }
      }
    }

    onUnload(null)
    return null
  }

  const load = async (...args) => {
    const isPathFile = args.length === 1
        , isBufferFile = args.length === 2

    if (isPathFile) {
      const parentPath = args[0]

      const name = pathToName(parentPath)
          , _path = path.join(pathWorkDirTracks, name)

      const track = find(parentPath)

      if (track && track.id) {
        await onLoad(track.id)
        return track.id
      }

      if (await fsPromise.exists(_path)) {
        await fsPromise.unlink(_path)
      }

      const isOk = await convertingTrack(parentPath, _path)

      if (isOk) {
        const id = hashByName(name)

        trackList[id] = {
          id,
          path: _path,
          parentPath,
          name
        }

        await onLoad(id)
        return id
      }

      await onLoad(null)
      return null
    }

    if (isBufferFile) {
      let name = args[0]
        , buffer = args[1]

      const writeFileBuffer = async resolve => {
        const tempPath = path.join(pathWorkDirTemp, name)
        const _path = path.join(pathWorkDirTracks, name.replace(/\..+$/, '.mp3'))

        const track = find(_path)

        if (track && track.path) {
          await onLoad(track.id)
          resolve(track.id)
          return
        }

        const tempFile = await fsPromise.createWriteStream(tempPath)

        buffer.forEach(chunk => tempFile.write(chunk))

        tempFile.on('finish', async () => {
          const isOk = await convertingTrack(tempPath, _path)

          if (isOk) {
            const id = hashByName(name)

            trackList[id] = { id, path: _path, name: name.replace(/\..+$/, '.mp3') }

            if (await fsPromise.exists(tempPath)) {
              await fsPromise.unlink(tempPath)
            }

            await onLoad(id)
            resolve(id)
            return
          }

          if (await fsPromise.exists(tempPath)) {
            await fsPromise.unlink(tempPath)
          }

          await onLoad(null)
          resolve(null)
        })

        tempFile.on('error', async () => {
          if (await fsPromise.exists(tempPath)) {
            await fsPromise.unlink(tempPath)
          }

          await clean(pathWorkDirTemp)
          await onLoad(null)
          resolve(null)
        })

        tempFile.end()
      }

      return new Promise(writeFileBuffer)
    }

    debug && console.log('Is not type file, one or two args')
    return null
  }

  const loads = async pathDir => {
    let paths = await fsPromise.readdir(pathDir)
    paths = paths.filter(path => path.match(/\.mp3$/))
    const ids = []
    for (let i = 0; i < paths.length; i++) {
      const filePath = path.join(pathDir, paths[i])
      const id = await load(filePath)
      ids.push(id)
    }

    return ids
  }

  const all = () => {
    const tracks = Object.values(trackList)
    onAll(tracks)
    return tracks
  }

  const info = async data => {
    const track = find(data)

    if (track && track.path) {
      try {
        const data = await mm.parseFile(track.path)

        const isAlbumImage = !!data.common?.picture

        delete data.common.picture
        delete data.native
        delete data.quality

        const info = {
          ...track,
          ...data,
          isAlbumImage
        }

        await onInfo(info)
        return info
      } catch (err) {
        debug && console.log('info', err)
        delete trackList[track.id]
      }
    }

    await onInfo(null)
    return null
  }

  const picture = async data => {
    const track = find(data)

    if (track && track.path) {
      try {
        const data = await mm.parseFile(track.path)

        const buffer = data.common.picture[0].data
            , contentType = data.common.picture[0].format

        const picture = {
          contentType,
          contentLength: buffer.length,
          buffer
        }

        await onPicture(picture)
        return picture
      } catch (err) {
        debug && console.log(err)
      }
    }

    await onPicture(null)
    return null
  }

  return {
    loads,
    load,
    unload,
    all,
    find,
    info,
    picture,
    onLoad: loadPush,
    onUnload: unloadPush,
    onAll: allPush,
    onFind: findPush,
    onInfo: infoPush,
    onPicture: picturePush
  }
}

module.exports = Tracks
