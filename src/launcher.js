const mm                  = require('music-metadata')
    , fs                  = require('fs')
    , fsPromise           = require('fs-extra')
    , Throttle            = require('throttle')
    , { spawn }           = require('child_process')
    , sleep               = require('sleep-promise')
    , moment              = require('moment')
    , path                = require('path')
    , express             = require('express')
    , http                = require('http')
    , IO                  = require('socket.io')
    , cors                = require('cors')
    , md5                 = () => require('md5')(Math.random())

const Stream = require('./stream')

class Launcher extends Stream {
  constructor (data) {
    super(data)
  }

  async initLauncher () {
    this.log('initExpress')

    const app = express()
        , server = http.createServer(app)
        , io = IO(server)

    app.use(cors())
    app.use('/', express.static(this.launcher))

    io.on('connection', socket => {
      const {
        login = '',
        password = ''
      } = socket.handshake.auth

      if (
        !(login.toString() === this.login.toString() &&
          password.toString() === this.password.toString())
      ) {
        socket.disconnect()
        return
      }

      this.socketAddAdmin(socket)
      this.socketDisconnect(socket)
      this.socketGetAllTracksName(socket)
      this.socketGetAllStreamTracks(socket)
      this.socketMicrophone(socket)
      this.socketGetTrackInfo(socket)
      this.socketPushTrack(socket)
      this.socketPopTrack(socket)
      this.socketGetStreamTrackInfo(socket)
    })

    app.get('/getTrackPicture', (req, res) => this.serverGetTrackPicture(req, res))
    app.get('/getStreamTrackPicture', (req, res) => this.serverGetStreamTrackPicture(req, res))

    app.use((req, res, next) => {
      const {
        password = '',
        login = ''
      } = req.query

      if (
        !(login.toString() === this.login.toString() &&
          password.toString() === this.password.toString())
      ) {
        res.end('')
        return
      }
      next()
    })

    app.post('/trackLoad', (req, res) => this.serverTrackLoad(req, res))
    app.post('/headerMicrophone', (req, res) => this.serverHeaderMicrophone(req, res))

    server.listen(this.port, () =>
      this.onListen(`http://127.0.0.1:${this.port}`)
    )

    return server
  }

  socketAddAdmin (socket) {
    this.log('socketAddAdmin')

    this.sockets.push(socket)
  }

  socketDisconnect (socket) {
    this.log('socketDisconnect')

    socket.on('disconnect', () => {
      this.sockets = this.sockets.filter(_socket => _socket.id !== socket.id)
    })
  }

  socketGetAllTracksName (socket) {
    this.log('socketGetAllTracksName')

    socket.on('getAllTracksName', async () => {
      const allTracks = await this.getAllTracksName()
      socket.emit('setAllTracksName', allTracks)
    })
  }

  socketGetAllStreamTracks (socket) {
    this.log('socketGetAllStreamTracks')

    socket.on('getAllStreamTracks', () => {
      socket.emit('setAllStreamTracks', this.getAllStreamTracks())
    })
  }

  socketMicrophone (socket) {
    this.log('socketMicrophone')

    let tmpMicrophone = false
    let headerMicrophone = false

    socket.on('microphoneHeader', packet => {
      this.log('microphoneHeader')

      headerMicrophone = Buffer.from(packet.data)
      tmpMicrophone = false
    })

    socket.on('microphoneStream', packet => {
      this.log('microphoneStream')

      if (!headerMicrophone) {
        return
      }

      const voice = this.voice()
          , tmpFilePath = `${this.workDirTemp}/tmp-${voice.name}`
          , filePath = `${this.workDirTemp}/${voice.name}`

      if (this.safeFileMode(voice.name) && this.safeFileMode(`tmp-${voice.name}`)) {
        return
      }

      this.safeFileMode(voice.name, true)
      this.safeFileMode(`tmp-${voice.name}`, true)

      if (!tmpMicrophone) {
        tmpMicrophone = fs.createWriteStream(tmpFilePath)
        tmpMicrophone.write(headerMicrophone)

        tmpMicrophone.on('finish', async () => {
          tmpMicrophone = false
          await spawn('ffmpeg', ['-i', tmpFilePath, '-acodec', 'mp3', '-ar', '48000', '-ac', '2', filePath])
          const meta = await mm.parseFile(filePath)

          if (meta.format.duration > 0.5) {
            this.tracks.push({
              ...voice,
              duration: moment((meta.format.duration * 1000) - 1000 * 60 * 60 * 3).format('HH:mm:ss')
            })
            this.socketSetStreamTracks()
            this.safeFileMode(voice.name, false)
            this.safeFileMode(`tmp-${voice.name}`, false)
            await fsPromise.unlink(tmpFilePath)
            return
          }

          await fsPromise.unlink(tmpFilePath)
          await fsPromise.unlink(filePath)
        })
      }

      tmpMicrophone.write(packet[0])
    })

    socket.on('microphoneStreamEnd', () => {
      this.log('microphoneStreamEnd')

      tmpMicrophone.end()
    })
  }

  socketGetTrackInfo (socket) {
    this.log('socketGetTrackInfo')
    socket.on('getTrackInfo', async name => {
      const info = await this.getTrackInfo(name)
      if (info) {
        socket.emit('setTrackInfo', info)
      }
    })
  }

  socketLoadTrack (name) {
    this.log('socketLoadTrack')
    this.adminMode && this.sockets.forEach(socket =>
      socket.emit('setLoadTrack', name)
    )
  }

  socketDeleteTrack (name) {
    this.log('socketDeleteTrack')
    this.adminMode && this.sockets.forEach(socket =>
      socket.emit('setDeleteTrack', name)
    )
  }

  socketSetStreamTracks () {
    this.log('socketSetStreamTracks')
    this.adminMode && this.sockets.forEach(socket =>
      socket.emit('setStreamTrack')
    )
  }

  socketPushTrack (socket) {
    this.log('socketGetPushTrack')
    socket.on('getPushTrack', name => {
      const isOk = this.pushTrack(name)
      if (isOk) {
        socket.emit('setPushTrack', name)
      }
    })
  }

  socketPopTrack (socket) {
    this.log('socketPopTrack')
    socket.on('getPopTrack', name => {
      const isOk = this.popTrack(name)
      if (isOk) {
        socket.emit('setPopTrack', name)
      }
    })
  }

  socketGetStreamTrackInfo (socket) {
    this.log('socketGetStreamTrackInfo')
    socket.on('getStreamTrackInfo', () => {
      const isOk = this.getStreamTrackInfo()
      if (isOk) {
        socket.emit('setStreamTrackInfo')
      }
    })
  }

  async serverGetTrackPicture (req, res) {
    this.log('serverGetTrackPicture')

    const { name } = req.query
    if (!name) {
      res.end('')
      return
    }

    const picture = await this.getTrackPicture(name)

    picture
      ? res.end(picture)
      : res.end('')
  }

  async serverGetStreamTrackPicture (req, res) {
    this.log('serverGetTrackPicture')

    const { name } = req.query

    if (!name) {
      res.end('')
      return
    }

    const picture = await this.getStreamTrackPicture()

    picture
      ? res.end(picture)
      : res.end('')
  }

  async serverTrackLoad (req, res) {
    this.log('serverTrackLoad')

    const { name } = req.query
    if (name) {
      const newName = name.replace(/\..+$/, '.mp3')
          , tmpFilePath = path.join(this.workDirTemp, `tmp-${name}`)
          , filePath = path.join(this.workDirTracks, `${newName}`)

      const isTmpFilePath = await fsPromise.exists(tmpFilePath)
      const isFilePath = await fsPromise.exists(tmpFilePath)

      if (isTmpFilePath && !this.safeFileMode(name)) {
        await fsPromise.rm(tmpFilePath)
      }

      if (isFilePath && !this.safeFileMode(newName)) {
        await fsPromise.rm(filePath)
      }

      this.safeFileMode(newName, true)
      this.safeFileMode(name, true)

      const tmpFile = fs.createWriteStream(tmpFilePath)

      req.on('data', chunk => {
        tmpFile.write(chunk)
      })

      req.on('end', () => {
        tmpFile.on('finish', async () => {
          await spawn('ffmpeg', ['-i', tmpFilePath, '-acodec', 'mp3', '-ar', '48000', '-ac', '2', filePath])
          await fsPromise.unlink(tmpFilePath)

          const name = filePath.match(/[^\/]+\..+$/)[0]
              , trackDirPath = path.join(this.workDirTracks, name)
          const isTrack = await this.convertingTrack(filePath, trackDirPath, true)

          if (isTrack) {
            this.socketLoadTrack(name)
          }

          this.safeFileMode(newName, false)
          this.safeFileMode(name, false)

          res.end(
            JSON.stringify({
              isOk: isTrack
            })
          )
        })
        tmpFile.end()
      })
    } else {
      res.end(
        JSON.stringify({
          isOk: false
        })
      )
    }
  }

  async serverDeleteTrack (req, res) {
    this.log('serverDeleteTrack')

    const { name } = req.query
    if (name) {
      const path = path.join(this.workDirTracks, name)

      this.safeFileMode(name, true)
      if (await fsPromise.exists(path)) {
        await fsPromise.rm(path)
        this.socketDeleteTrack(name)
        this.safeFileMode(name, false)
        res.end('')
      } else {
        res.end('')
      }
    }
  }
}

module.exports = Launcher
