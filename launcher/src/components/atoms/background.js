import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import useStore from './../../store'
import { observer } from 'mobx-react'

const Body = styled.div`
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0px;
  top: 0px;
  filter: brightness(${props => props.brightness});
`

const DOMURL = window.URL || window.webkitURL || window

const Background = observer(({ style }) => {
  const { settings } = useStore()
  const [image, setImage] = useState('')

  useEffect(() => {
    const handler = () => {
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
          type: 'image/svg+xml;charset=utf-8'
        }
      )

      const image = DOMURL.createObjectURL(svg)
      setImage(image)
    }

    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [settings.backgroundImage])

  return (
    <Body
      brightness={settings.brightness}
      style={{
        ...style,
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center'
      }}
    >
    </Body>
  )
})

export default Background
