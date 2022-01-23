const callback      = require('./utils/callback')
const puppeteer     = require('puppeteer')
    , express       = require('express')
    , http          = require('http')
    , path          = require('path')
    , IO            = require('socket.io')
    , cors          = require('cors')
    , sendChunk     = require('./utils/send-chunk')
    , noise         = require('./utils/noise')

const sfmediastream$v1 = fs.readFileSync(path.join(__dirname, '/utils/sfmediastream@v1.js'), 'utf8')
    , socket$v3_0_5 = fs.readFileSync(path.join(__dirname, '/utils/socket.io-3.0.5.js'), 'utf8')

const StreamHelper = async ({ login, password, port }) => {
  let listeners = []
    , audioHeaders = null

  const addListener = (req, res) => {
    res.writeHead(200, {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'audio/webm',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-store',
      'Connection': 'keep-alive'
    })

    if (audioHeaders) {
      res.write(audioHeaders)
    }

    listeners.push(res)
  }

  let browser = null

  const start = async (isLauncher = false) => {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    const [page] = await browser.pages()

    await page.addScriptTag({ content: sfmediastream$v1 })
    await page.addScriptTag({ content: socket$v3_0_5 })

    await page.evaluate(async ({ login, password, port, noise, isLauncher }) => {
      const socket = io(`http://127.0.0.1:${port}`, {
        transports : ['websocket'],
        auth: {
          login,
          password
        }
      })

      const context = new AudioContext()
      const destination = context.createMediaStreamDestination()

      const noiseAudio = new Audio()
      noiseAudio.src = noise
      noiseAudio.loop = true
      await new Promise(load => noiseAudio.addEventListener('canplaythrough', load))
      noiseAudio.play()

      const noiseSourse = context.createMediaElementSource(noiseAudio)

      const streamAudio = new Audio()
      streamAudio.src = isLauncher
                          ? `http://127.0.0.1:${port}/launcher-stream`
                          : `http://127.0.0.1:${port}/stream`
      streamAudio.crossOrigin = 'anonymous'
      streamAudio.autoplay = true

      const events = ['error', 'emptied', 'abort']

      events.map(event =>
        streamAudio.addEventListener(event, () =>
          streamAudio.load()
        )
      )

      const streamSourse = context.createMediaElementSource(streamAudio)
      const streamAnalyser = context.createAnalyser()

      streamAnalyser.fftSize = 2048

      let streamArray = new Uint8Array(streamAnalyser.frequencyBinCount)

      const intervalId = setInterval(() => {
        streamAnalyser.getByteTimeDomainData(streamArray)
        const isPlayStream = !!streamArray.find(byte => byte !== 128)

        if (isPlayStream) {
          noiseAudio.pause()
        } else {
          noiseAudio.play()
        }
      }, 500)

      streamSourse.connect(streamAnalyser)
      streamAnalyser.connect(destination)

      noiseSourse.connect(destination)

      const presenterMedia = new ScarletsMediaPresenter({
        mediaStream: new MediaStream(destination.stream),
        audio: {
          channelCount: 2,
          echoCancellation: false
        }
      }, 1000)

      presenterMedia.onRecordingReady = packet => {
        socket.emit('stream-helper-headers', packet.data)
      }

      presenterMedia.onBufferProcess = packet => {
        socket.emit('stream-helper-audio', packet[0])
      }

      await presenterMedia.startRecording()
    }, { login, password, port, noise, isLauncher })
  }

  const stream = socket => {
    socket.on('stream-helper-headers', chunk => {
      audioHeaders = Buffer.from(chunk)
    })

    socket.on('stream-helper-audio', chunk => {
      if (!audioHeaders) {
        return
      }
      sendChunk(listeners, chunk)
    })
  }

  const switchLauncher = async isLauncher => {
    if (browser) {
      await browser.close()
      if (browser && browser.process() != null) {
        browser.process().kill('SIGINT')
      }
      start(isLauncher)
    }
  }

  return {
    start,
    switchLauncher,
    stream,
    addListener
  }
}

module.exports = StreamHelper
