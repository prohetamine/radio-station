const { spawn } = require('child_process')

module.exports = (...args) => {
  const protector = spawn('node', args)

  protector.stdout.on('data', (data) => {
    console.log(`NodeExecuter: [${args.join(', ')}] \n\n ${data}`)
  })

  protector.stderr.on('data', (data) => {
    console.error(`NodeExecuter: [${args.join(', ')}] \n\n ${data}`)
  })

  return (signal = 'SIGINT') => protector.kill(signal)
}
