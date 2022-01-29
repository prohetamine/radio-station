import React, { useEffect, useRef } from 'react'
import { roundRect } from './../../../utils/round-rect'
import { observer } from 'mobx-react'
import useStore from './../../store'

const Canvas = observer(({ isPlay }) => {
  const store = useStore()
  const refCanvas = useRef(0)
  useEffect(() => {
    const node = refCanvas.current

    if (node) {
      const ctx = node.getContext('2d')

      ctx.fillStyle = store.settings.theme === 'dark' ? '#141414' : '#fff'
      ctx.strokeStyle = '#00000000'

      const animation = x => {
        let i = parseInt(Math.random() * 10) - 3
        let flag = false
        return (s, r) => {
          const int = i - s
          roundRect(ctx, x, 36/2 - int, 3, int + 36/2, 4)
          if (flag) {
            i -= Math.random() * 1
          } else {
            i += Math.random() * 1
          }

          if (i > r) {
            flag = true
          }

          if (i < -3) {
            flag = false
          }
        }
      }

      const a = animation(11)
          , b = animation(16)
          , c = animation(21)
          , d = animation(26)
          , h = animation(31)
          , l = animation(36)

      if (isPlay) {
        const timeId = setInterval(() => {
          ctx.clearRect(0, 0, 49, 49)
          const max = 5
              , random = 9
          a(max, random)
          b(max, random)
          c(max, random)
          d(max, random)
          h(max, random)
          l(max, random)
        }, 15)

        return () => clearInterval(timeId)
      } else {
        const timeId = setInterval(() => {
          ctx.clearRect(0, 0, 49, 49)
          const max = 9
              , random = -2
          a(max, random)
          b(max, random)
          c(max, random)
          d(max, random)
          h(max, random)
          l(max, random)
        }, 75)

        return () => clearInterval(timeId)
      }
    }
  }, [store.settings.theme, refCanvas.current, isPlay])

  return (
    <canvas width={49} height={49} ref={refCanvas}></canvas>
  )
})

export default Canvas
