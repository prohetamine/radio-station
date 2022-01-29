import { useEffect, useState } from 'react'

const useCurrentTrack = ({ socket, request }) => {
  const [track, setTrack] = useState({
    artist: null,
    date: null,
    album: null,
    title: null,
    filename: null,
    id: null
  })

  useEffect(() => {
    if (socket && request) {
      socket.on('onCurrentTrack', data => {
        request.get(`/info?id=${data.id}`)
            .then(({ data }) => {
              setTrack({
                artist: null,
                date: null,
                album: null,
                title: null,
                filename: data.name,
                ...data.common,
                id: data.id
              })
            })
      })

      socket.emit('currentTrack')
      return () => socket.off('onCurrentTrack')
    }
  }, [socket, request])

  return track
}

export default useCurrentTrack
