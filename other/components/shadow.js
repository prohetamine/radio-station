import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import images from './../assets/1026-1189x755.jpg'

const Shadow = styled.div`
  width: 100%;
  min-width: 100px;
  height: 10px;
  position: absolute;
  bottom: 104px;
`

export default ({  }) => {
  const ref = useRef()
  const [image, setImage] = useState('')

  useEffect(() => {
    const node = ref.current
    if (node) {
      const canvas = document.createElement('canvas')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const ctx = canvas.getContext('2d')

      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const { left, top, width, height } = node.getBoundingClientRect()

        const imageData = ctx.getImageData(left, top, width, height)

        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          data[i + 3] = parseInt((i - 4) / data.length * 255)
        }

        canvas.width = width
        canvas.height = height

        ctx.putImageData(imageData, 0, 0)

        setImage(canvas.toDataURL("image/png"))
      }

      img.src = images
    }
  }, [ref.current])

  return (
    <Shadow ref={ref} style={{ backgroundImage: `url(${image})` }} />
  )
}
