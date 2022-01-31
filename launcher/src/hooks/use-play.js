import { useEffect, useState } from 'react'

const usePlay = (setVolumeLocalAudio) => {
  const [isPlay, setPlay] = useState(false)

  useEffect(() => {
    if (setVolumeLocalAudio) {
      setVolumeLocalAudio(isPlay ? 1 : 0)
    }
  }, [isPlay, setVolumeLocalAudio])

  return [isPlay, setPlay]
}

export default usePlay
