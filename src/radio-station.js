const mm                  = require('music-metadata')
    , fs                  = require('fs')
    , fsPromise           = require('fs-extra')
    , Throttle            = require('throttle')
    , { spawn }           = require('child_process')
    , sleep               = require('sleep-promise')
    , moment              = require('moment')
    , path                = require('path')
    , cors                = require('cors')
    , md5                 = () => require('md5')(Math.random())

const Launcher = require('./launcher')

class RadioStation extends Launcher {
  constructor (data) {
    super(data)
    const {
      workDir = path.join(__dirname, 'radio-station'),
      launcher = path.join(__dirname, 'public'),
      login = null,
      password = null,
      port = null,
      debug = false
    } = data

    this.workDir = workDir
    this.launcher = launcher
    this.login = login
    this.password = password
    this.port = port
    this.debug = debug
  }

  log (...args) {
    this.debug && console.log(...args)
  }

  async start () {
    this.log('start')

    this.listeners = []
    this.index = 0
    this.tracks = []
    this.pathTrack = ''
    this.workDirTracks = path.join(this.workDir, 'tracks')
    this.workDirTemp = path.join(this.workDir, 'temp')
    this.workDirData = path.join(this.workDir, 'data.json')
    this.__safeFileMode = {}
    this.isReady = true
    this.sockets = []

    await this.initTracks()
    await this.convertingTracks()
    this.loop()

    if (this.adminMode) {
      return await this.initLauncher()
    }
  }

  ready () {
    return new Promise(res => {
      const timeId = setInterval(() => {
        if (this.isReady) {
          clearInterval(timeId)
          res()
        }
      }, 1000)
    })
  }

  async startLauncher (data) {
    const {
      port = this.port,
      password = this.password,
      login = this.login,
      launcher = this.launcher
    } = data

    this.login = login
    this.password = password
    this.port = port
    this.launcher = launcher

    this.login && this.password && this.port
      ? this.adminMode = true
      : this.adminMode = false

    if (this.adminMode) {
      return await this.initLauncher()
    }
  }

  onListen (url) {
    this.log(`
      ----------------------------
       ${url}
      ----------------------------
    `)
  }
}

module.exports = RadioStation
