const express         = require('express')
    , app             = express()
    , http            = require('http')
    , path            = require('path')
    , { Server }      = require('socket.io')
    , RadioStation    = require('./../../src/index')

const server = http.createServer(app)
    , io = new Server(server)

const pathTrack3 = path.join(__dirname, '../../assets/track3.mp3')
const folder = path.join(__dirname, '../../assets')

const port = 8080

RadioStation.create({
  pathWorkDir: path.join(__dirname, 'tracks-data-folder'),
  isLauncher: true,
  mainPort: port,
  login: 'localhost',
  password: 'hackme'
}).then(radio => {
  app.get('/picture', async (req, res) =>
    radio.picture(req, res)
  )

  app.get('/info', async (req, res) =>
    radio.info(req, res)
  )

  io.on('connection', async socket => {
    radio.onUse(info => {
      socket.emit('onUse', info)
    })
  })

  app.get('/radio', (req, res) =>
    radio.addListener(req, res)
  )
})

app.use('/', express.static(__dirname+'/public'))

server.listen(8080, () => {

})
