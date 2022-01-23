const { spawn }   = require('child_process')
    , moment      = require('moment')

const durationTrack = (track) => new Promise(resolve => {
  const ffmpeg = spawn('ffmpeg', ['-i', track])

  ffmpeg.stdout.on('data', data => {
    /* none */
    //console.log(''+data)
  })

  ffmpeg.stderr.on('data', data => {
    /* none */
    try {
      const ms = moment(`${data}`.match(/Duration: [^.]+/)[0], 'hh:mm:ss')
      const seconds = ((moment(ms).valueOf() - moment(ms).startOf('day').valueOf()) + (parseInt(`${data}`.match(/Duration: [^,]+/)[0].match(/[^\.]+$/)[0]) * 10)) / 1000
      console.log(seconds)
      resolve(seconds)
    } catch (e) {}
  })

  ffmpeg.on('close', async code => {

  })
})

module.exports = durationTrack
