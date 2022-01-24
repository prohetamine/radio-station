const fs          = require('fs')
    , path        = require('path')
    , puppeteer   = require('puppeteer')

const sfmediastream$v1  = fs.readFileSync(path.join(__dirname, '/sfmediastream@v1.js'), 'utf8')
    , socket$v3_0_5     = fs.readFileSync(path.join(__dirname, '/socket.io-3.0.5.js'), 'utf8')
    , noise             = require('./noise')

const start = async ({ login, password, port, isLauncher, puppeteerLauncher }) => {
  const browser = await puppeteer.launch(puppeteerLauncher)
  const [page] = await browser.pages()

  await page.addScriptTag({ content: sfmediastream$v1 })
  await page.addScriptTag({ content: socket$v3_0_5 })

  const reload = await page.evaluate(async ({ login, password, port, noise, isLauncher }) =>
    new Promise(async resolve => {
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

      events.forEach(event =>
        streamAudio.addEventListener(event, () =>
          streamAudio.load()
        )
      )

      const streamSourse = context.createMediaElementSource(streamAudio)
      const streamAnalyser = context.createAnalyser()

      streamAnalyser.fftSize = 2048

      let streamArray = new Uint8Array(streamAnalyser.frequencyBinCount)

      let reload = 0

      const intervalId = setInterval(() => {
        streamAnalyser.getByteTimeDomainData(streamArray)
        const isPlayStream = !!streamArray.find(byte => byte !== 128)

        if (isPlayStream) {
          noiseAudio.pause()
          reload = 0
        } else {
          if (reload > 60) {
            clearInterval(intervalId)
            resolve({ isLauncher })
          }
          reload++
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
    })
  , { login, password, port, noise, isLauncher })

  await start(reload.isLauncher)
}

;(async () => {
  for (;;) {
    try {
      await start({
        login: process.argv[2],
        password: process.argv[3],
        port: process.argv[4],
        isLauncher: process.argv[5],
        puppeteerLauncher: JSON.parse(process.argv[6])
      })
    } catch (e) {}
  }
})()
