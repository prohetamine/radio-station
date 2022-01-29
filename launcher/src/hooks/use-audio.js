import { useState, useEffect } from 'react'

const useAudio = () => {
  const [audio, setAudio] = useState(null)

  useEffect(() => {
    const audio = new Audio()
    audio.muted = true

    setAudio(audio)
  }, [])

  return audio
}

export default useAudio
