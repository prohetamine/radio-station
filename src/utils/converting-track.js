const mm          = require('music-metadata')
    , { spawn }   = require('child_process')

const convertingTrack = (oldTrack, newTrack) => new Promise(validTrack => {
  const ffmpeg = spawn('ffmpeg', ['-i', oldTrack, '-ar', '48000', '-ac', '2', newTrack])
  //const ffmpeg = spawn('ffmpeg', ['-i', oldTrack, '-acodec', 'mp3', '-ar', '48000', '-ac', '2', newTrack])

  ffmpeg.stdout.on('data', data => {
    /* none */
  })

  ffmpeg.stderr.on('data', data => {
    /* none */
  })

  ffmpeg.on('close', async code => {
    validTrack(true)
    /*try {
      const info = await await mm.parseFile(newTrack).then(data => {
        delete data.common.picture
        delete data.native
        delete data.quality
        return data
      })

      validTrack(info?.format?.numberOfChannels === 2)
    } catch (e) {
      console.log(e)
      validTrack(false)
    }*/
  })
})

module.exports = convertingTrack
