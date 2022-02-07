const mm          = require('music-metadata')
    , { spawn }   = require('child_process')
    , pathToFfmpeg = require('ffmpeg-static')

const convertingTrack = (oldTrack, newTrack) => new Promise(validTrack => {
  const ffmpeg = spawn(pathToFfmpeg, ['-i', oldTrack, '-acodec', 'mp3', '-ar', '48000', '-ac', '2', newTrack])

  ffmpeg.stdout.on('data', () => {
    /* none */
  })

  ffmpeg.stderr.on('data', () => {
    /* none */
  })

  ffmpeg.on('close', async () => {
    try {
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
    }
  })
})

module.exports = convertingTrack
