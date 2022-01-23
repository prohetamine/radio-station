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

;(async () => {
  const pathWorkDir = path.join(__dirname, 'radio-station-tracks')

  const pathTrack1 = path.join(__dirname, '/../assets/track1.mp3')
      , pathTrack2 = path.join(__dirname, '/../assets/track2.mp3')
      , pathTrack3 = path.join(__dirname, '/../assets/track3.mp3')

  const radio = await RadioStation.create({
    pathWorkDir: path.join(__dirname, 'radio-station-tracks'),
    isLauncher: false
  })

  radio.stream.onUse((...data) => {
    console.log('--> onUse', ...data)
  })

  radio.track.onLoad(id => {
    const name = radio.track.find(id).name
    console.log('--> onLoad', name, id)
  })

  const ids = await radio.track.loads(
    path.join(__dirname, '/../assets')
  )

  console.log('--> loads', ids)

  const unloadId = radio.track.all()[0].id

  console.log('--> unload id', await radio.track.unload(unloadId))

  radio.track.all().forEach(track => {
    console.log('--> all', track.id)
  })

  const loadId = await radio.track.load(
    path.join('/Users/stas/Desktop/Искала\ -\ Земфира.mp3')
  )

  console.log('--> load', loadId)

  console.log('--> picture', await radio.track.picture(loadId))
  console.log('--> info', await radio.track.info(loadId))


  console.log('--> currnet stream', radio.stream.current())
  const popId = await radio.stream.push(loadId)
  console.log('--> stream push', popId)
  console.log('--> stream all', radio.stream.all())
  console.log('--> stream pop', radio.stream.pop(popId))
  console.log('--> stream all', radio.stream.all())

  app.get('/radio', (req, res) => {
    radio.addListener(req, res)
  })
})()


/*

// radio.push(__dirname+'/name.mp3')
// radio.pop(__dirname+'/name.mp3')

*/

/*

const radio = new RadioStation({
  login: 'localhost',
  password: 'hackme',
  port: 1111,
  workDir: `${__dirname}/../../assets`
})

*/

app.use(cors())

app.use('/', express.static(__dirname+'/public'))


app.listen(8080, () => {})/*() =>
  //console.log('listen: 8080, open: http://127.0.0.1:8080/radio')
)*/
