const path                = require('path')
    , sendChunk           = require('./utils/send-chunk')
    , noise               = require('./utils/noise')
    , puppeteerProtector  = require('./utils/puppeteer-protector')

const StreamHelper = async ({ login, password, port, puppeteerLauncher }) => {
  let listeners = []
    , audioHeaders = null
    , instances = []

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

  const start = async isLauncher => {
    instances = instances.filter(kill => kill())
    const streamHelper = await puppeteerProtector(path.join(__dirname, '/utils/stream-helper'), login, password, port, isLauncher, JSON.stringify(puppeteerLauncher))
    instances.push(streamHelper)
  }

  const switchLauncher = async isLauncher => start(isLauncher)

  return {
    start,
    switchLauncher,
    stream,
    addListener
  }
}

module.exports = StreamHelper
