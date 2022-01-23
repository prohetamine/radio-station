const callback = require('./utils/callback')
const puppeteer = require('puppeteer')
    , express       = require('express')
    , http          = require('http')
    , IO            = require('socket.io')
    , cors          = require('cors')
    , sendChunk     = require('./utils/send-chunk')

const StreamHelper = async ({ isStart }) => {
  const app = express()
      , server = http.createServer(app)
      , io = IO(server)

  const listeners = []
  let microphoneHeaders = null

  const addListener = (req, res) => {
    res.writeHead(200, {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'audio/webm',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-store',
      'Connection': 'keep-alive'
    })

    if (microphoneHeaders) {
      res.write(microphoneHeaders)
    }

    listeners.push(res)
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()

  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/sfmediastream@v1' })
  await page.addScriptTag({ url: 'https://cdn.socket.io/socket.io-3.0.5.js' })

  setTimeout(() => {
    console.log('start')
    page.evaluate(async () => {
      const socket = io('http://127.0.0.1:42777', {
        transports : ['websocket']
      })

      const context = new AudioContext()

      const audio = new Audio()
      audio.src = 'http://127.0.0.1:1111/radio'
      audio.crossOrigin = 'anonymous'
      audio.play()

      await new Promise((res) => audio.oncanplaythrough = () => res())

      const source = context.createMediaElementSource(audio)
      //const streamSourse = context.createMediaStreamSource(stream)

      const destination = context.createMediaStreamDestination()

      var gainNode = context.createGain();
      gainNode.gain.value = 5
      var gainNode1 = context.createGain();
      gainNode1.gain.value = 1

      //streamSourse.connect(gainNode)
      source.connect(gainNode1)

      gainNode.connect(destination)
      gainNode1.connect(destination)

      window.presenterMedia = new ScarletsMediaPresenter({
        mediaStream: new MediaStream(destination.stream),
        audio: {
          channelCount: 2,
          echoCancellation: false
        }
      }, 1000)

      presenterMedia.onRecordingReady = function(packet){
        socket.emit('microphoneHeader', packet.data)
      }

      presenterMedia.onBufferProcess = function(packet){
        socket.emit('microphone', packet[0])
      }

      await presenterMedia.startRecording()
    })
  }, 10000)

  //await browser.close()

  const returned = {
    addListener
  }

  const port = 42777

  return new Promise(resolve => {
    app.use(cors())

    io.on('connection', socket => {
      /*const {
        login = '',
        password = ''
      } = socket.handshake.auth

      const isLogin = login.toString() === _login.toString()
          , isPassword = password.toString() === _password.toString()

      if (
        !(isLogin && isPassword)
      ) {
        socket.disconnect()
        return
      }*/

      //addAdmin(socket)
      //disconnect(socket)
      //allTracks(socket)
      //allStream(socket)
      //currentTrack(socket)

      socket.on('microphoneHeader', chunk => {
        microphoneHeaders = Buffer.from(chunk)
      })

      socket.on('microphone', chunk => {
        if (!microphoneHeaders) {
          return
        }
        console.log(listeners.length, chunk)
        sendChunk(listeners, chunk)
      })
    })

    server.listen(port, () => {
      const host = `http://127.0.0.1:${port}`
      resolve(returned)
    })


  })
}

module.exports = StreamHelper
