import { useState, useEffect } from 'react'

const usePlay = (setVolumeLocalAudio) => {
  const [isPlay, setPlay] = useState(false)
  useEffect(() => {
    if (setVolumeLocalAudio) {
      setVolumeLocalAudio(isPlay ? 1 : 0)
    }
  }, [setVolumeLocalAudio, isPlay])

  return [isPlay, setPlay]
}

export default usePlay
