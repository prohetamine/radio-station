import { useEffect, useState } from 'react'
import { MediaPresenter } from 'sfmediastream'

const useMediaController = (audio) => {
  const [presenterMedia, setPresenterMedia] = useState(null)
      , [volumeAudio, setVolumeAudio] = useState(0)
      , [volumeStream, setVolumeStream] = useState(0)
      , [volumeLocalAudio, setVolumeLocalAudio] = useState(0)
      , [volumeLocalStream, setVolumeLocalStream] = useState(0)

  useEffect(() => {
    if (presenterMedia?.audio) {
      presenterMedia.audio.gain.value = volumeAudio
    }
  }, [presenterMedia?.audio, volumeAudio])

  useEffect(() => {
    if (presenterMedia?.stream) {
      presenterMedia.stream.gain.value = volumeStream
    }
  }, [presenterMedia?.stream, volumeStream])

  useEffect(() => {
    if (presenterMedia?.localAudio) {
      presenterMedia.localAudio.gain.value = volumeLocalAudio
    }
  }, [presenterMedia?.localAudio, volumeLocalAudio])

  useEffect(() => {
    if (presenterMedia?.localStream) {
      presenterMedia.localStream.gain.value = volumeLocalStream
    }
  }, [presenterMedia?.localStream, volumeLocalStream])

  useEffect(async () => {
    if (audio) {
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true })
      const context = new AudioContext()

      const sourceAudio = context.createMediaElementSource(audio)
      const streamSourse = context.createMediaStreamSource(stream)
      audio.muted = false

      const destination = context.createMediaStreamDestination()

      const _stream = context.createGain()
          , _audio = context.createGain()
          , localStream = context.createGain()
          , localAudio = context.createGain()

      _stream.gain.value = 0
      _audio.gain.value = 1
      localStream.gain.value = 0
      localAudio.gain.value = 0

      streamSourse.connect(_stream)
      sourceAudio.connect(_audio)
      streamSourse.connect(localStream)
      sourceAudio.connect(localAudio)

      _stream.connect(destination)
      _audio.connect(destination)

      localStream.connect(context.destination)
      localAudio.connect(context.destination)

      const presenterMedia = new MediaPresenter({
        mediaStream: new MediaStream(destination.stream),
        audio: {
          channelCount: 2,
          echoCancellation: false
        }
      }, 100)

      setPresenterMedia({
        audio: _audio,
        stream: _stream,
        localStream,
        localAudio,
        presenterMedia
      })
    }
  }, [audio])

  return {
    volumeAudio,
    volumeStream,
    volumeLocalAudio,
    volumeLocalStream,
    setVolumeAudio,
    setVolumeStream,
    setVolumeLocalAudio,
    setVolumeLocalStream,
    ...presenterMedia
  }
}

export default useMediaController
