import React, { useEffect, useRef } from 'react'
import canvasAnalyserAnimation from './../../../utils/canvas-analyser-animation'
import { observer } from 'mobx-react'
import useStore from './../../store'

const Canvas = observer(({ isAnalyse, analyser, canvas: { width, height, positions = [11, 16, 21, 26, 31, 36], bottom = 36, max = 23, min = 3 }, style,}) => {
  const store = useStore()
  const refCanvas = useRef(0)

  useEffect(() => {
    const node = refCanvas.current

    if (node) {
      const ctx = node.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.fillStyle = store.settings.theme === 'dark' ? '#141414' : '#fff'
      ctx.strokeStyle = '#00000000'

      if (isAnalyse && analyser) {
        const animations = positions.map(x => canvasAnalyserAnimation(ctx, x, bottom, max, min))
        const streamArray = new Uint8Array(analyser.frequencyBinCount)
        let isLoop = true
        const loop = () => {
          analyser.getByteTimeDomainData(streamArray)
          const average = parseInt(streamArray.length / animations.length)
          animations.forEach(({ animation }, key) => animation(streamArray[key * average]))
          isLoop && requestAnimationFrame(loop)
        }
        requestAnimationFrame(loop)

        return () => {
          animations.forEach(({ kill }) => kill())
          isLoop = false
        }
      } else {
        const animations = positions.map(x => canvasAnalyserAnimation(ctx, x, bottom, max, min))
        let isLoop = true

        const loop = () => {
          animations.forEach(({ animation }) => animation(128))
          isLoop && requestAnimationFrame(loop)
        }
        requestAnimationFrame(loop)

        return () => {
          animations.forEach(({ kill }) => kill())
          isLoop = false
        }
      }
    }
  }, [store.settings.theme, refCanvas.current, isAnalyse, analyser, bottom, positions, max, min])

  return (
    <canvas width={width} height={height} style={style} ref={refCanvas}></canvas>
  )
})

export default Canvas
