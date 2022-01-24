const { spawn } = require('child_process')

module.exports = (...args) => new Promise(resolve => {
  const protector = spawn('node', args)

  protector.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  protector.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })

  protector.on('close', resolve)

  resolve(() => 
    protector.kill(0)
  )
})
