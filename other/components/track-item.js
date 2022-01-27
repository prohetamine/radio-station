import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import queryString from 'query-string'
import normalize from './../lib/normalize'
import useLocalStorageState from 'use-local-storage-state'

import trackItemBackgroundLight from './../assets/track-item-background-light.svg'
import trackItemBackgroundDark from './../assets/track-item-background-dark.svg'

import BigBlackText from './big-black-text'
import GrayText from './gray-text'
import MiddleBlackText from './middle-black-text'

const Body = styled.div`
  user-select: none;
  overflow: hidden;
  width: 330px;
  height: 170px;
  background-image: url(${props => props.theme === 'dark' ? trackItemBackgroundDark : trackItemBackgroundLight});
  box-shadow: 0px 2px 6px rgba(115, 111, 111, 0.25);
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
  opacity: 0;
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

const TrackItem = ({
  theme,
  track,
  type,
  isImage,
  onDelete,
  onPush,
  onFilter
}) => {
  const ref = useRef()

  const { login, password } = queryString.parse(window.location.search)

  const [grabblePosition, setGrabblePosition] = useState(0)
  const [isGrabble, setIsGrabble] = useState(false)
  const [isImageError, setImageError] = useState(true)
  const [trackInfo, setTrackInfo] = useLocalStorageState(`${track.id}-${type}`, {
    artist: 'Не заполненно',
    date: 'Не заполненно',
    album: 'Не заполненно',
    title: track.name,
    filename: track.name,
    isLoad: false
  })

  useEffect(() => {
    if (trackInfo.isLoad) {
      onFilter({
        ...trackInfo,
        date: normalize.date(trackInfo.date) || ''
      })
      return
    }

    axios.get(`http://127.0.0.1:1111/info?id=${track.id}`)
        .then(({ data }) => {
          if (data) {
            setTrackInfo(
              trackInfo => ({
                ...trackInfo,
                ...data.common,
                isLoad: true
              })
            )
          }
        })
  }, [trackInfo.isLoad, track.id])

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
      const handleDragStart = (e) => {
        setIsGrabble(true)
      }

      const handleDragEnd = async (e) => {
        setIsGrabble(false)
        onPush(e.pageX - grabblePosition)
      }

      node.addEventListener('dragstart', handleDragStart)
      node.addEventListener('dragend', handleDragEnd)

      return () => {
        node.removeEventListener('dragstart', handleDragStart)
        node.removeEventListener('dragend', handleDragEnd)
      }
    }
  }, [ref.current, grabblePosition, track.id])

  return (
    <Body theme={theme} ref={ref} draggable>
      <Delete onClick={() => onDelete()} />
      <First>
        <Picture style={{ opacity: isImage ? isImageError ? '0' : '1' : '0' }} onLoad={e => setImageError(false)} draggable={false} src={`http://127.0.0.1:1111/picture?id=${track.id}`} alt={track.id} />
        <Profile>
          <GrayText theme={theme} style={{ marginBottom: '7px' }}>Исполнитель: </GrayText>
          <MiddleBlackText theme={theme} style={{ marginBottom: '10px' }}>{normalize.text(trackInfo.artist, 19)}</MiddleBlackText>
          <GrayText theme={theme} style={{ marginBottom: '7px' }}>Альбом: </GrayText>
          <MiddleBlackText theme={theme} style={{ marginBottom: '10px' }}>{normalize.text(trackInfo.album, 19)}</MiddleBlackText>
          <GrayText theme={theme} style={{ marginBottom: '7px' }}>Дата: </GrayText>
          <MiddleBlackText theme={theme}>{normalize.date(trackInfo.date) || trackInfo.date}</MiddleBlackText>
        </Profile>
      </First>
      <Last>
        <GrayText theme={theme} style={{ marginBottom: '7px' }}>Название: </GrayText>
        <BigBlackText theme={theme}>{trackInfo.isLoad ? normalize.text(trackInfo.title, 34) : 'Загрузка...'}</BigBlackText>
      </Last>
    </Body>
  )
}

export default TrackItem
