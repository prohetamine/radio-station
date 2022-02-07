const express         = require('express')
    , app             = express()
    , http            = require('http')
    , path            = require('path')
    , { Server }      = require('socket.io')
    , RadioStation    = require('./../src/index')

const server = http.createServer(app)
    , io = new Server(server)

const pathTrack3 = path.join(__dirname, 'tracks-for-load/track3.mp3')
const folder = path.join(__dirname, 'tracks-for-load')

const port = 8080

RadioStation.create({
  pathWorkDir: path.join(__dirname, 'tracks-data-folder'), // optional
  isLauncher: true, // optional
  //debug: false, // optional
  isAutoStart: false, // optional
  mainPort: port,
  login: 'localhost',
  password: 'hackme',

}).then(async radio => {
  console.log('')
  console.log('---------- radio ----------')

  console.log('radio -->', radio)

  console.log('')
  console.log('---------- radio.track.* ----------')

  radio.track.onLoad(id => {
    const name = radio.track.find(id).name
    console.log('--> radio.track.onLoad', name, id)
  })

  radio.track.onUnload(id =>
    console.log('--> radio.track.onUnload', id)
  )

  const loadId = await radio.track.load(pathTrack3)
  console.log('--> radio.track.load', loadId)

  const unloadId = radio.track.all()[0].id
  const id = await radio.track.unload(unloadId)
  console.log('--> radio.track.unload', id)

  const ids = await radio.track.loads(folder)
  console.log('--> radio.track.loads', ids)

  const tracks = radio.track.all() //.map(track => track.id)
  console.log('--> radio.track.all', tracks)

  const picture = await radio.track.picture(tracks[0].id)
  console.log('--> radio.track.picture', picture)

  const info = await radio.track.info(tracks[0].id)
  console.log('--> radio.track.info', info)

  console.log('')
  console.log('---------- radio.stream.* ----------')

  radio.stream.onUse((...data) => {
    console.log('--> radio.stream.onUse', ...data)
  })

  radio.stream.onPush((...data) => {
    console.log('--> radio.stream.onPush', ...data)
  })

  radio.stream.onPop((...data) => {
    console.log('--> radio.stream.onPop', ...data)
  })

  radio.stream.onStart((...data) => {
    console.log('--> radio.stream.onStart', ...data)
  })
  const isStart = radio.stream.start() // isAutoStart: false
  await new Promise(radio.stream.onStart)
  console.log('radio.stream.start -->', isStart)

  const current = radio.stream.current()
  console.log('--> radio.stream.current', current)

  const pushId = await radio.stream.push(tracks[0].id)
  console.log('--> radio.stream.push', pushId)

  console.log('--> radio.stream.all', radio.stream.all())

  const popId = await radio.stream.pop(pushId)
  console.log('--> radio.stream.pop', popId)

  console.log('--> radio.stream.all', radio.stream.all())

  console.log('')
  console.log('---------- radio.* ----------')

  console.log('Address link for audio tag, open: http://127.0.0.1:8080/radio')
  app.get('/radio', (req, res) => {
    /* Actions with headers if required */
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    console.log('--> radio.addListener', ip)
    radio.addListener(req, res)
  })

  console.log('---')
  console.log("WARNING: radio.onUse and radio.picture, may not work according to schedule, this is due to the characteristics of each listener, it is not possible to fix it if you do not track the track titles in the browser.. or don't keep a buffering report")
  console.log('---')

  io.on('connection', async socket => {
    console.log('--> socket connection')
    radio.onUse(info => {
      console.log('--> radio.onUse', info)
      socket.emit('onUse', info)
    }, { isSafe: true }) /* You confirm that you will send information about the location of files on the disk, it may not be safe */
  })

  app.get('/picture', async (req, res) => {
    console.log('--> radio.picture', req.query.id)
    radio.picture(req, res)
  })

  app.get('/info', async (req, res) => {
    console.log('--> radio.picture', req.query.id)
    radio.info(req, res)
  })

  console.log('Example radio page, open: http://127.0.0.1:8080')
  app.use('/', express.static(__dirname+'/public'))
})

server.listen(port)
