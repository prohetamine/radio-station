const mm        = require('music-metadata')
    , fs        = require('fs')
    , fsPromise = require('fs-extra')
    , Throttle  = require('throttle')
    , sleep     = require('sleep-promise')
    , path      = require('path')
    , md5       = () => require('md5')(Math.random())

const Tracks = require('./tracks')

class Stream extends Tracks {
  constructor (data) {
    super(data)
  }

  addListener (client) {
    this.log('addListener')
    client.writeHead(200, {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive'
    })

    this.listeners.push(client)
  }

  voice (duration) {
    return ({
      type: 'voice',
      name: `${md5()}.mp3`,
      id: md5(),
      duration: '00:00:00'
    })
  }

  file (name) {
    return ({
      type: 'file',
      name,
      id: md5()
    })
  }

  random () {
    return ({
      type: 'random'
    })
  }

  send (chunk) {
    // this.log('send')

    this.listeners.forEach(
      client =>
        client.write(chunk)
    )
  }

  async loop () {
    this.log('loop')

    if (!this.tracks[this.index]) {
      this.tracks.push(this.random())
    }

    const track = this.tracks[this.index]

    while (true) {
      this.log('>>>>>>>>', this.index, track.type)

      if (track.type !== 'random') {
        this.pathTrack = track.type === 'voice'
                            ? path.join(this.workDirTemp, track.name)
                            : path.join(this.workDirTracks, track.name)

        this.safeFileMode(track.name, true)
      } else {
        let tracks = []

        while (true) {
          tracks = await this.getAllTracksName()
          if (tracks.length !== 0) {
            break
          }
          await sleep(3000)
        }

        track.name = tracks[parseInt(Math.random() * tracks.length)]

        if (this.safeFileMode(track.name)) {
          await sleep(3000)
          break
        }

        this.pathTrack = path.join(this.workDirTracks, track.name)
        this.safeFileMode(track.name, true)
      }

      await new Promise(async end => {
        const file = await fsPromise.stat(this.pathTrack)
            , meta = await mm.parseFile(this.pathTrack)
            , bitrate = Math.ceil(file.size / meta.format.duration)
            , throttle = new Throttle(bitrate)

        const streamTrack = fs.createReadStream(this.pathTrack)
        this.socketSetStreamTracks()
        this.isReady = true
        streamTrack.pipe(throttle)
          .on('data', chunk =>
            this.send(chunk)
          )
          .on('end', async () => {
            this.safeFileMode(track.name, false)
            if (track.type === 'voice') {
              await fsPromise.unlink(this.pathTrack)
            }
            end()
          })
      })

      if (track.type !== 'random') {
        break
      } else {
        if (this.tracks.slice(-1)[0].type !== 'random') {
          break
        }
      }
    }

    this.index++
    await this.loop()
  }

  async pushTrack (isName) {
    this.log('pushTrack')

    const name = await this.findNameTrack(isName)
    if (name) {
      this.tracks.push(this.file(name))
      this.socketSetStreamTracks()
    }
    return name
  }

  async popTrack (isName) {
    this.log('popTrack')

    const id = isName
    const name = await findNameTrack(isName)

    if (id) {
      const filteredTracks = this.tracks
                                    .filter(
                                      async (track, index) => {
                                        if (
                                          !(
                                              index > this.trackIndex &&
                                              track.type !== 'random' &&
                                              name
                                                ? track.id === parseInt(id)
                                                : track.name === name

                                          )
                                        ) {
                                          return true
                                        } else {
                                          if (track.type === 'voice') {
                                            const filePath = path.join(this.workDirTemp, track.name)
                                            if (await fsPromise.exists(path)) {
                                              await fsPromise.rm(path)
                                            }
                                          }
                                          return false
                                        }
                                      }
                                    )

      if (this.tracks.length !== filteredTracks.length) {
        this.tracks = filteredTracks
        this.socketSetStreamTracks()
        return true
      }
    }

    return false
  }

  getAllStreamTracks (isFullPath) {
    this.log('getAllStreamTracks')

    if (isFullPath) {
      return this.tracks.map(track => {
        if (track.type !== 'voice') {
          return {
            ...track,
            path: path.join(this.workDirTracks, track.name)
          }
        }
        return track
      })
    } else {
      return this.tracks
    }
  }

  getStreamTrack (isFullPath) {
    this.log('getStreamTrack')

    const isTrack = this.tracks[this.index] || false

    if (isTrack && isTrack.name) {
      if (isFullPath) {
        if (isTrack.type !== 'voice') {
          return {
            ...isTrack,
            path: path.join(this.workDirTracks, isTrack.name)
          }
        }
      }
      return isTrack
    }

    return false
  }

  getStreamTrackPicture () {
    this.log('getStreamTrackPicture')

    const track = this.getStreamTrack()
    if (track.type === 'file') {
      return getTrackPicture(track.name)
    }
  }

  getStreamTrackInfo () {
    this.log('getStreamTrackPicture')

    const track = this.getStreamTrack()
    if (track.type === 'file') {
      return getTrackInfo(track.name)
    }
  }
}

module.exports = Stream
