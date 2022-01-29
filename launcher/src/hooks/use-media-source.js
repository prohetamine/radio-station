import { useEffect } from 'react'

const useMediaSource = ({ socket, audio }) => {
  useEffect(async () => {
    if (socket && audio) {
      const mediaSource = new MediaSource()
      audio.src = window.URL.createObjectURL(mediaSource)
      audio.autoplay = true


      const handlerSourceOpen = () => {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg')

        socket.on('stream', data => {
          try {
            sourceBuffer.appendBuffer(data)
          } catch (e) { /* normal */ }
        })
      }

      mediaSource.addEventListener('sourceopen', handlerSourceOpen)

      return () => {
        audio.src = null
        mediaSource.removeEventListener('sourceopen', handlerSourceOpen)
        socket.off('stream')
      }
    }
  }, [socket, audio])
}

export default useMediaSource
