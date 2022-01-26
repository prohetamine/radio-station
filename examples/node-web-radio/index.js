const express         = require('express')
    , app             = express()
    , http            = require('http')
    , path            = require('path')
    , { Server }      = require('socket.io')
    , RadioStation    = require('./../../src/radio-station')

const server = http.createServer(app)
    , io = new Server(server)

RadioStation.create({
  pathWorkDir: path.join(__dirname, 'tracks-data-folder'),
  isLauncher: false
}).then(async radio => {

  await radio.track.loads(
    path.join(__dirname, '/../../assets')
  )

  app.get('/radio', (req, res) => {
    radio.addListener(req, res)
  })

  io.on('connection', async socket => {
    radio.onUse(info => {
      socket.emit('onUse', info)
    })
  })

  app.get('/picture', async (req, res) => {
    radio.picture(req, res)
  })

  app.get('/info', async (req, res) => {
    radio.info(req, res)
  })
})

app.use('/', express.static(__dirname+'/public'))

server.listen(8080)
