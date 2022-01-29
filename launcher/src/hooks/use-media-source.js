import { useEffect } from 'react'

const useMediaSource = ({ socket, audio }) => {
  useEffect(async () => {
    if (socket && audio) {
      const mediaSource = new MediaSource()
      audio.src = window.URL.createObjectURL(mediaSource)
      audio.autoplay = true

      await new Promise(res =>
        mediaSource.addEventListener('sourceopen', res)
      )

      const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg')

      socket.on('stream', data =>
        sourceBuffer.appendBuffer(data)
      )

      return () => socket.off('stream')
    }
  }, [socket, audio])
}

export default useMediaSource
