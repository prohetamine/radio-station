import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import normalize from './../../../utils/normalize'
import { observer } from 'mobx-react'
import useStore from './../../store'
import { createUrl } from './../../auth-provider.js'

import trackItemBackgroundLight from './../../../assets/svg/track-item-background-light.svg'
import trackItemBackgroundDark from './../../../assets/svg/track-item-background-dark.svg'

import BigText from './../atoms/big-text'
import SmallText from './../atoms/small-text'
import MiddleText from './../atoms/middle-text'

const Body = styled.div`
  user-select: none;
  overflow: hidden;
  width: 330px;
  height: 170px;
  background-image: url(${props => props.theme === 'dark' ? trackItemBackgroundDark : trackItemBackgroundLight});
  box-shadow: ${props => props.theme === 'dark' ? '0px 2px 8px rgba(40, 40, 40, 0.15), 0px 0px 2px rgb(68, 68, 68, 0.30)' : '0px 2px 8px rgba(111, 111, 111, 0.15), 0px 0px 2px rgb(34, 34, 34, 0.30)'};
  border-radius: 5px;
  padding: 9px;
  position: relative;
  box-sizing: border-box;
  margin-bottom: 12px;
  cursor: move;
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  &:active {
    cursor: grabbing;
    cursor: -moz-grabbing;
    cursor: -webkit-grabbing;
    cursor: grabbing !important;
  }
`

const Delete = styled.div`
  top: 6px;
  right: 8px;
  width: 17px;
  height: 17px;
  position: absolute;
  cursor: pointer;
`

const First = styled.div`
  width: 285px;
  height: 104px;
  display: flex;
  margin-bottom: 9px;
`

const Picture = styled.img`
  width: 104px;
  height: 104px;
  border-radius: 5px;
  opacity: 0px;
`

const Profile = styled.div`
  margin-top: 3px;
  margin-left: 10px;
  height: 101px;
  width: 171px;
  height: 104px;
  box-sizing: border-box;
`

const Last = styled.div`
  width: 100%;
  height: 39px;
`

const TrackItem = observer(({
  track,
  onDelete,
  onPush,
}) => {
  const ref = useRef()
  const { settings } = useStore()
  const [grabblePosition, setGrabblePosition] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (node) {
      const handler = event => setGrabblePosition(event.offsetX)

      node.addEventListener('mousedown', handler)
      return () => node.removeEventListener('mousedown', handler)
    }
  }, [ref.current])

  useEffect(() => {
    const node = ref.current
    if (node) {
      const handleDragEnd = async ({ pageX }) => onPush(pageX - grabblePosition)

      node.addEventListener('dragend', handleDragEnd)

      return () => node.removeEventListener('dragend', handleDragEnd)
    }
  }, [ref.current, grabblePosition, track.id])

  return (
    <Body theme={settings.theme} ref={ref} draggable>
      <Delete onClick={() => onDelete()} />
      <First>
        <Picture style={{ opacity: (settings.pictureAlbum && track.isAlbumImage) ? 1 : 0 }} draggable={false} src={createUrl({ pathname: 'picture', params: { id: track.id }})} alt={track.id} />
        <Profile>
          <SmallText theme={settings.theme} style={{ marginBottom: '7px' }}>Исполнитель: </SmallText>
          <MiddleText theme={settings.theme} style={{ marginBottom: '10px' }}>{track.artist ? normalize.text(track.artist, 19) : 'Не заполненно'}</MiddleText>
          <SmallText theme={settings.theme} style={{ marginBottom: '7px' }}>Альбом: </SmallText>
          <MiddleText theme={settings.theme} style={{ marginBottom: '10px' }}>{track.album ? normalize.text(track.album, 19) : 'Не заполненно'}</MiddleText>
          <SmallText theme={settings.theme} style={{ marginBottom: '7px' }}>Дата: </SmallText>
          <MiddleText theme={settings.theme}>{track.date ? normalize.date(track.date) || track.date : 'Не заполненно'}</MiddleText>
        </Profile>
      </First>
      <Last>
        <SmallText theme={settings.theme} style={{ marginBottom: '7px' }}>Название: </SmallText>
        <BigText theme={settings.theme}>{track.title ? normalize.text(track.title, 34) : normalize.text(track.filename, 34)}</BigText>
      </Last>
    </Body>
  )
})

export default TrackItem
