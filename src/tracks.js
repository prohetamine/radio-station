const mm          = require('music-metadata')
    , fsPromise   = require('fs-extra')
    , { spawn }   = require('child_process')
    , path        = require('path')

class Tracks {
  async initTracks () {
    this.log('init')

    const isWorkDir = await fsPromise.exists(this.workDirTracks)
        , isWorkDirTemp = await fsPromise.exists(this.workDirTemp)
        , isWorkDirData = await fsPromise.exists(this.workDirData)

    !isWorkDir && await fsPromise.mkdir(this.workDirTracks, { recursive: true })
    !isWorkDirTemp && await fsPromise.mkdir(this.workDirTemp, { recursive: true })

    if (isWorkDirData) {
      try {
        this.trackList = JSON.parse(
          await fsPromise.readFile(this.workDirData, 'utf8')
        )
      } catch (e) {
        this.trackList = []
      }
    } else {
      this.trackList = []
    }
  }

  safeFileMode (name, flag) {
    this.log('safeFileMode')

    if (flag !== undefined) {
      this.__safeFileMode = {
        [name]: flag
      }
    }

    this.log(this.__safeFileMode)

    return this.__safeFileMode[name]
  }

  findNameTrackByPath (path) {
    this.log('findNameTrackByPath')

    const name = path.match(/[^\/]+\..+$/)
    try {
      return this.trackList.find(track => (name && name[0]) === track) || false
    } catch (e) {
      return false
    }
  }

  async findNameTrack (name) {
    this.log('findNameTrack')

    const isName = this.findNameTrackByPath(name)

    try {
      return (isName || this.trackList.find(track => track === name))
    } catch (e) {
      await this.initTracks()
      return await this.findNameTrack()
    }
  }

  async convertingTrack (oldTrack, newTrack, flag) {
    this.log('convertingTrack')

    const name = newTrack.match(/[^\/]+\..+$/)[0]
    this.safeFileMode(name, true)

    const isValid = await new Promise(validTrack => {
      const ffmpeg = spawn('ffmpeg', ['-i', oldTrack, '-acodec', 'mp3', '-ar', '48000', '-ac', '2', newTrack])

      ffmpeg.stdout.on('data', data => {
        //this.log(`ounput: ${data}`)
      })

      ffmpeg.stderr.on('data', data => {
        //this.log(`error: ${data}`)
      })

      ffmpeg.on('close', async code => {
        //this.log(`close: ${code}`)
        try {
          const info = await this.getTrackInfo(newTrack, true)
          validTrack(info?.format?.numberOfChannels === 2)
        } catch (e) {
          return validTrack(false)
        }
      })
    })

    if (!isValid) {
      return false
    }

    if (flag) {
      if (this.trackList.length) {
        !this.trackList.find(track => track === name) && this.trackList.push(name)
      } else {
        this.trackList.push(name)
      }
    }

    await fsPromise.writeFile(path.join(this.workDirData), JSON.stringify(this.trackList))
    this.safeFileMode(name, false)
    return name
  }

  async convertingTracks () {
    this.log('convertingTracks')

    const tracks = (await fsPromise.readdir(this.workDirTracks))
      .filter(
        _track =>
          this.trackList.length === 0 && this.trackList.map(
            track =>
              track === _track
          )
      )

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]
      const isTrack = await this.convertingTrack(
        path.join(this.workDirTracks, track),
        path.join(this.workDirTracks, track)
      )

      if (isTrack) {
        !this.trackList.find(track => track === isTrack) && this.trackList.push(isTrack)
      }
    }
  }

  async trackLoad (filePath) {
    this.log('trackLoad')

    const name = filePath.match(/[^\/]+\..+$/)[0]
        , trackDirPath = path.join(this.workDirTracks, name)

    if (!await fsPromise.exists(trackDirPath) && !this.safeFileMode(name)) {
      const isTrack = await this.convertingTrack(filePath, trackDirPath, true)
      if (isTrack) {
        this.socketLoadTrack(name)
      }
      return isTrack
    }

    return false
  }

  async trackDelete (filePath) {
    this.log('trackDelete')

    const name = filePath.match(/[^\/]+\..+$/)[0]
        , trackDirPath = path.join(this.workDirTracks, name)

    if (await fsPromise.exists(trackDirPath) && !this.safeFileMode(name)) {
      await fsPromise.rm(trackDirPath)

      this.trackList = this.trackList.filter(track => track !== name)
      this.socketDeleteTrack(name)
      return true
    }

    return false
  }

  async getAllTracksName () {
    this.log('getAllTracksName')

    const tracks = await fsPromise.readdir(this.workDirTracks)
    return tracks.filter(track => this.trackList.find(_track => track === _track))
  }

  async getTrackInfo (isName, isInformally) {
    this.log('getTrackInfo')

    const name = await this.findNameTrack(isName)

    if (name || isInformally) {
      const trackDirPath = isInformally
                            ? isName
                            : path.join(this.workDirTracks, name)

      if (await fsPromise.exists(trackDirPath)) {
        return await mm.parseFile(trackDirPath).then(data => {
          delete data.common.picture
          delete data.native
          delete data.quality
          return data
        })
      }
    }

    return false
  }

  async getTrackPicture (isName) {
    this.log('getTrackPicture')
    const name = await this.findNameTrack(isName)

    if (name) {
      const trackDirPath = path.join(this.workDirTracks, name)

      if (await fsPromise.exists(trackDirPath)) {
        return mm.parseFile(trackDirPath).then(data => {
          try {
            const buffer = data.common.picture[0].data
            return `data:${ContentType};base64,${new Buffer(data).toString('base64')}`
          } catch (e) {}
        })
      }
    }

    return false
  }
}

module.exports = Tracks
