const express         = require('express')
    , app             = express()
    , http            = require('http')
    , cors            = require('cors')
    , fs              = require('fs')
    , path            = require('path')
    , { Server }      = require("socket.io")
    , RadioStation    = require('./../src/radio-station')

const server = http.createServer(app)
    , io = new Server(server)

RadioStation.create({
  pathWorkDir: path.join(__dirname, 'radio-station-tracks'),
  isLauncher: false
}).then(radio => {
  app.use(cors())

  app.get('/picture', async (req, res) => {
    radio.picture(req, res)
  })

  io.on('connection', async socket => {
    radio.onUse(info => {
      console.log('--> onUse', info)
      socket.emit('onUse', info)
    })
  })

  app.get('/radio', (req, res) => {
    radio.addListener(req, res)
  })

  setInterval(() => {
    console.log('worked')
  }, 1000)
})

app.use('/', express.static(__dirname+'/public'))

server.listen(8080, () => {

})
