import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import useStore from './../../store'
import { observer } from 'mobx-react'

const Body = styled.div`
  width: 100%;
  min-width: 100px;
  height: 10px;
  position: absolute;
  bottom: 104px;
  filter: brightness(${props => props.brightness});
`

const ShadowBackground = observer(({ style }) => {
  const ref = useRef()
  const { settings } = useStore()
  const [image, setImage] = useState('')
  const [isImageProcessing, setImageProcessing] = useState(true)

  useEffect(() => {
    const node = ref.current
    if (node) {
      const handler = () => {
        setImageProcessing(true)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const img = new Image()

        const reader = new FileReader()
        const svg = new Blob(
          [`
            <svg xmlns="http://www.w3.org/2000/svg" width="${window.innerWidth}" height="${window.innerHeight}">
              <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">
                  <div style='width: 100%; height: 100vh; background-image: url(${settings.backgroundImage}); background-size: cover; background-position: center center;'>
                  </div>
                </div>
              </foreignObject>
            </svg>
          `],
          {
            type: 'image/svg+xml;base64'
          }
        )

        reader.readAsDataURL(svg)

        reader.onloadend = function() {
          const base64data = reader.result
          img.onload = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight

            ctx.drawImage(
              img,
              0,
              0,
              canvas.width,
              canvas.height
            )

            const { left, top, width, height } = node.getBoundingClientRect()

            const imageData = ctx.getImageData(left, top, width, height)

            const data = imageData.data

            for (let i = 0; i < data.length; i += 4) {
              data[i + 3] = parseInt((i - 4) / data.length * 255)
            }

            canvas.width = width
            canvas.height = height

            ctx.putImageData(imageData, 0, 0)

            setImage(canvas.toDataURL('image/png'))
          }

          setImageProcessing(false)
          img.src = base64data
        }
      }

      handler()
      window.addEventListener('resize', handler)
      return () => window.removeEventListener('resize', handler)
    }
  }, [ref.current, settings.backgroundImage, style])

  return (
    <Body
      brightness={settings.brightness}
      ref={ref}
      style={{
        opacity: isImageProcessing ? 0 : 1,
        backgroundImage: `url(${image})`,
        ...style
      }}
    />
  )
})

export default ShadowBackground
