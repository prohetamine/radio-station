const express         = require('express')
    , app             = express()
    , fs              = require('fs')
    , cors            = require('cors')
    , path            = require('path')
    , RadioStation    = require('./../src/radio-station')

console.log('/* Example [simple-radio-express] */')

//const tracksDir = undefined //`${__dirname}/../../assets`

const radio = new RadioStation({
  debug: false,
  workDir: path.join(__dirname, 'radio-station-tracks'),
  port: 1111,
  login: 'localhost',
  password: 'hackme'
})

const pathTrack1 = path.join(__dirname, '/../assets/track1.mp3')
    , pathTrack2 = path.join(__dirname, '/../assets/track2.mp3')
    , pathTrack3 = path.join(__dirname, '/../assets/track3.mp3')

;(async () => {
  await radio.start()

  let currentTrack = radio.getStreamTrack(true) // <-- full path
  console.log('current track:', currentTrack) // false

  let isLoad = await radio.trackLoad(pathTrack1) // <-- full path
  console.log('load track 1:', isLoad) // Если файл загружен вернет true, а если нет или уже был загружен то false

  isLoad = await radio.trackLoad(pathTrack2) // <-- full path
  console.log('load track 2:', isLoad) // Если файл загружен вернет true, а если нет или уже был загружен то false

  await radio.ready() // закончится когда в эфире появится трек
  console.log('ready')

  currentTrack = radio.getStreamTrack(true) // <-- full path
  console.log('current track:', currentTrack) // {}

  let find1 = await radio.findNameTrack(pathTrack1) // <-- full path or track name
  console.log('find track 1:', find1) // Вернет имя если найдет или false

  let find2 = await radio.findNameTrack(pathTrack2) // <-- full path or track name
  console.log('find track 2:', find2) // Вернет имя если найдет или false

  if (find1) {
    let isDelete = await radio.trackDelete(pathTrack1) // <-- full path
    console.log('delete track 1:', isDelete) // Вернет true если удаление удалось, трек не может быть удален если он занят другим процессом
  } else {
    let isDelete = await radio.trackDelete(pathTrack2) // <-- full path
    console.log('delete track 2:', isDelete) // Вернет true если удаление удалось, трек не может быть удален если он занят другим процессом
  }

  setInterval(() => {
    const allTracks = radio.getAllStreamTracks(true)
    console.log('all stream tracks:', allTracks)
  }, 1000)






  //await radio.trackLoad(pathTrack1)
  //await radio.trackLoad(pathTrack2)
  //await radio.trackLoad(pathTrack3)
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

app.get('/radio', (req, res) => {
  radio.addListener(res)
})

app.listen(8080, () =>
  console.log('listen: 8080, open: http://127.0.0.1:8080/radio')
)
