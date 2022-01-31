import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import SmallText from './small-text'
import roundRect from './../../../utils/round-rect'

const Body = styled.div`
  width: 60px;
  height: 105px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`

const Slider = styled.canvas`
  background: ${props => props.theme === 'dark' ? '#A1A1A1' : '#848484'};
  border-radius: 5px;
`

const MediaRange = ({ value, onChange, max, min, theme, label }) => {
  const ref = useRef()
  const [move, setMove] = useState(0.5)
  const [down, setDown] = useState(false)

  useEffect(() => {
    setMove((value / max) - min)
  }, [value, max])

  useEffect(() => {
    const node = ref.current
    if (node) {
      const ctx = node.getContext('2d')
      ctx.fillStyle = theme === 'dark' ? '#141414' : '#ffffff'
      const normalize = (69 * move) + 20
      ctx.clearRect(0, 0, 40, 93)
      roundRect(ctx, 4, 93 - normalize, 32, normalize - 4, 5)
      ctx.font = '9px Roboto'
      ctx.fillStyle = theme === 'dark' ? '#AFAFAF' : '#505050'
      ctx.textAlign = 'center'
      ctx.fillText(move === 0 ? 'off' : parseInt(move * 100)+'%', node.width / 2, 85)
    }
  }, [ref.current, move, theme])

  useEffect(() => {
    const node = ref.current
    if (node) {
      const moveHandler = ({ offsetY }) => {

        if (down) {
          const reverseValue = 93 - offsetY
          const collisionValue = reverseValue < 20
                                  ? 20
                                  : reverseValue > 89
                                      ? 89
                                      : reverseValue

          onChange(((collisionValue - 20) / 69) * max)
        }
      }

      const downHandler = () => setDown(true)
          , upHandler = () => setDown(false)

      node.addEventListener('mousedown', downHandler)
      window.addEventListener('mouseup', upHandler)
      node.addEventListener('mousemove', moveHandler)

      return () => {
        node.removeEventListener('mousemove', moveHandler)
        node.removeEventListener('mousedown', moveHandler)
        window.removeEventListener('mouseup', upHandler)
      }
    }
  }, [ref.current, max, down])

  return (
    <Body>
      <Slider theme={theme} ref={ref} width={40} height={93} />
      <SmallText theme={theme} style={{ marginTop: '6px' }}>{label}</SmallText>
    </Body>
  )
}

export default MediaRange
