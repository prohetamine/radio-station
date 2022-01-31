import { useEffect, useState } from 'react'
import { MediaPresenter } from 'sfmediastream'
import useLocalStorageState from 'use-local-storage-state'

const useMediaController = (audio, settings) => {
  const [presenterMedia, setPresenterMedia] = useState(null)
      , [volumeAudio, setVolumeAudio] = useLocalStorageState('volume-audio', 0)
      , [volumeStream, setVolumeStream] = useLocalStorageState('volume-stream', 0)
      , [volumeLocalAudio, setVolumeLocalAudio] = useLocalStorageState('volume-local-audio', 0)
      , [volumeLocalStream, setVolumeLocalStream] = useLocalStorageState('volume-local-stream', 0)

  useEffect(() => {
    if (presenterMedia?.audioGain) {
      presenterMedia.audioGain.gain.value = volumeAudio
    }
  }, [presenterMedia?.audioGain, volumeAudio])

  useEffect(() => {
    if (presenterMedia?.streamGain) {
      presenterMedia.streamGain.gain.value = volumeStream
    }
  }, [presenterMedia?.streamGain, volumeStream])

  useEffect(() => {
    if (presenterMedia?.localAudioGain) {
      presenterMedia.localAudioGain.gain.value = volumeLocalAudio
    }
  }, [presenterMedia?.localAudioGain, volumeLocalAudio])

  useEffect(() => {
    if (presenterMedia?.localStreamGain) {
      presenterMedia.localStreamGain.gain.value = volumeLocalStream
    }
  }, [presenterMedia?.localStreamGain, volumeLocalStream])

  useEffect(async () => {
    if (audio) {
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true })
      const context = new AudioContext()

      const sourceAudio = context.createMediaElementSource(audio)
      const streamSourse = context.createMediaStreamSource(stream)
      audio.muted = false

      const destination = context.createMediaStreamDestination()

      const streamGain = context.createGain()
          , audioGain = context.createGain()
          , localStreamGain = context.createGain()
          , localAudioGain = context.createGain()

      const streamAnalyser = context.createAnalyser()
          , audioAnalyser = context.createAnalyser()
          , localStreamAnalyser = context.createAnalyser()
          , localAudioAnalyser = context.createAnalyser()

      streamGain.gain.value = 0
      audioGain.gain.value = 0
      localStreamGain.gain.value = 0
      localAudioGain.gain.value = 0

      streamAnalyser.fftSize = 2048
      audioAnalyser.fftSize = 2048
      localStreamAnalyser.fftSize = 2048
      localAudioAnalyser.fftSize = 2048

      streamSourse.connect(streamGain)
      sourceAudio.connect(audioGain)
      streamSourse.connect(localStreamGain)
      sourceAudio.connect(localAudioGain)

      streamGain.connect(streamAnalyser)
      audioGain.connect(audioAnalyser)
      localStreamGain.connect(localStreamAnalyser)
      localAudioGain.connect(localAudioAnalyser)

      streamAnalyser.connect(destination)
      audioAnalyser.connect(destination)
      localStreamAnalyser.connect(context.destination)
      localAudioAnalyser.connect(context.destination)

      const presenterMedia = new MediaPresenter({
        mediaStream: new MediaStream(destination.stream),
        audio: {
          channelCount: 2,
          echoCancellation: settings.echoCancellation
        }
      }, 100)

      setPresenterMedia({
        audioGain,
        streamGain,
        localStreamGain,
        localAudioGain,
        streamAnalyser,
        audioAnalyser,
        localStreamAnalyser,
        localAudioAnalyser,
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
