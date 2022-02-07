const fs          = require('fs')
    , path        = require('path')
    , puppeteer   = require('puppeteer')
    , chromium    = require('chrome-aws-lambda')

const sfmediastream$v1  = fs.readFileSync(path.join(__dirname, '/sfmediastream@v1.js'), 'utf8')
    , socket$v3_0_5     = fs.readFileSync(path.join(__dirname, '/socket.io-3.0.5.js'), 'utf8')
    , noise             = require('./noise')

const start = async ({ login, password, port, isLauncher, puppeteerLauncher }) => {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath,
    ...puppeteerLauncher
  })
  const [page] = await browser.pages()

  await page.addScriptTag({ content: sfmediastream$v1 })
  await page.addScriptTag({ content: socket$v3_0_5 })

  const evaluateScript = async ({ login, password, port, noise, isLauncher }) => {
    const AudioPlayer = async resolve => {
      const socket = io(`http://127.0.0.1:${port}`, {
        transports : ['websocket'],
        auth: {
          login,
          password
        }
      })

      const context = new AudioContext()
          , mediaSource = new MediaSource()
          , streamAudio = new Audio()

      const destination = context.createMediaStreamDestination()

      streamAudio.src = window.URL.createObjectURL(mediaSource)
      streamAudio.autoplay = true
      streamAudio.crossOrigin = 'anonymous'

      mediaSource.addEventListener('sourceopen', () => {
        const event = isLauncher ? 'launcher-stream' : 'stream'
            , mimeType = isLauncher ? 'audio/webm;codecs=opus' : 'audio/mpeg'

        const sourceBuffer = mediaSource.addSourceBuffer(mimeType)

        socket.on(event, data => {
          sourceBuffer.appendBuffer(data)
        })

        let prevCurrentTime = 0
        isLauncher && sourceBuffer.addEventListener('updateend', () => {
          const currentTime = streamAudio.currentTime

          if (streamAudio.buffered.length > 0) {
            const startBuffer = streamAudio.buffered.start(streamAudio.buffered.length - 1)
                , endBuffer = streamAudio.buffered.end(streamAudio.buffered.length - 1)

            if (currentTime < startBuffer) {
              streamAudio.currentTime = startBuffer
            }

            if (currentTime > endBuffer) {
              streamAudio.currentTime = startBuffer
            }

            if (currentTime - prevCurrentTime != 0 && endBuffer - currentTime > 3) {
              streamAudio.currentTime = endBuffer
            }

            for (let i = 0; i < streamAudio.buffered.length - 1; i++) {
              const prestart = streamAudio.buffered.start(i)
                  , preend = streamAudio.buffered.end(i)

              if (!sourceBuffer.updating) {
                sourceBuffer.remove(prestart, preend)
              }
            }

            if (currentTime - start > 10 && !sourceBuffer.updating) {
              sourceBuffer.remove(0, currentTime - 3)
            }

            if(endBuffer - currentTime > 10 && !sourceBuffer.updating) {
              sourceBuffer.remove(0, endBuffer - 3)
            }
          }

          prevCurrentTime = currentTime
        })
      })

      const noiseAudio = new Audio()
      noiseAudio.src = noise
      noiseAudio.loop = true
      noiseAudio.autoplay = true
      noiseAudio.volume = 0.2
      await new Promise(load => noiseAudio.addEventListener('canplaythrough', load))
      noiseAudio.play()

      const noiseSourse = context.createMediaElementSource(noiseAudio)
          , streamSourse = context.createMediaElementSource(streamAudio)

      const streamAnalyser = context.createAnalyser()

      streamAnalyser.fftSize = 2048

      const streamArray = new Uint8Array(streamAnalyser.frequencyBinCount)

      let reload = 0
      const intervalId = setInterval(async () => {
        streamAnalyser.getByteTimeDomainData(streamArray)
        const isPlayStream = !!streamArray.find(byte => byte !== 128)

        if (isPlayStream) {
          noiseAudio.pause()
          reload = 0
        } else {
          if (reload > 20) {
            clearInterval(intervalId)
            resolve()
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
      }, 3000)

      presenterMedia.onRecordingReady = packet =>
        socket.emit('stream-helper-headers', packet.data)

      presenterMedia.onBufferProcess = packet =>
        socket.emit('stream-helper-audio', packet[0])

      await presenterMedia.startRecording()
    }

    return new Promise(AudioPlayer)
  }

  await page.evaluate(evaluateScript, { login, password, port, noise, isLauncher })
  await browser.close()
  await start({ login, password, port, isLauncher, puppeteerLauncher })
}

start({
  login: process.argv[2],
  password: process.argv[3],
  port: process.argv[4],
  isLauncher: process.argv[5] === 'true',
  puppeteerLauncher: JSON.parse(process.argv[6])
})
