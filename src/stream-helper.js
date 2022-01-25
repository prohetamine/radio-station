const path          = require('path')
    , nodeExecuter  = require('./utils/node-executer')

const scriptStreamHelper = path.join(__dirname, '/utils/stream-helper')

const StreamHelper = async ({ login, password, port, puppeteerLauncher }) => {
  let listeners = []
    , audioHeaders = null
    , instances = []

  const addListener = (req, res) => {
    res.writeHead(200, {
      'Cache-Control': 'no-store, no-cache',
      'Content-Type': 'audio/webm',
      'Transfer-Encoding': 'chunked',
      'Content-Transfer-Encoding': 'binary',
      'Connection': 'Close'
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

      listeners.forEach(
        client =>
          client.write(chunk)
      )
    })
  }

  const start = async (isLauncher = false) => {
    instances = instances.filter(kill => kill())
    const streamHelper = await nodeExecuter(scriptStreamHelper, login, password, port, isLauncher, JSON.stringify(puppeteerLauncher))
    instances.push(streamHelper)
  }

  const switchLauncher = async isLauncher => start(isLauncher)

  return {
    start,
    switch: switchLauncher,
    stream,
    addListener
  }
}

module.exports = StreamHelper
