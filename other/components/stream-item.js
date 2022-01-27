import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import queryString from 'query-string'
import normalize from './../lib/normalize'
import useLocalStorageState from 'use-local-storage-state'

import streamTrackRandomItemBackgroundLight from './../assets/stream-track-random-item-background-light.svg'
import streamTrackRandomItemBackgroundDark from './../assets/stream-track-random-item-background-dark.svg'
import streamTrackVoiceItemBackgroundLight from './../assets/stream-track-voice-item-background-light.svg'
import streamTrackVoiceItemBackgroundDark from './../assets/stream-track-voice-item-background-dark.svg'
import streamTrackFileItemBackgroundLight from './../assets/stream-track-file-item-background-light.svg'
import streamTrackFileItemBackgroundDark from './../assets/stream-track-file-item-background-dark.svg'

import BigBlackText from './big-black-text'
import MiddleBlackText from './middle-black-text'

const Body = styled.div`
  user-select: none;
  overflow: hidden;
  width: 560px;
  min-width: 560px;
  min-height: 92px;
  background: url(${
    props =>
      props.type === 'random'
        ? props.theme === 'dark'
            ? streamTrackRandomItemBackgroundDark
            : streamTrackRandomItemBackgroundLight
        : props.type === 'voice'
            ? props.theme === 'dark'
                ? streamTrackVoiceItemBackgroundDark
                : streamTrackVoiceItemBackgroundLight
            : props.theme === 'dark'
                ? streamTrackFileItemBackgroundDark
                : streamTrackFileItemBackgroundLight

  });
  box-shadow: 0px 2px 6px rgba(115, 111, 111, 0.25);
  border-radius: 5px;
  padding: 10px;
  position: relative;
  box-sizing: border-box;
  margin-bottom: 12px;
  display: flex;
`

const Delete = styled.div`
  top: 6px;
  right: 8px;
  width: 17px;
  height: 17px;
  position: absolute;
  cursor: pointer;
`

const Picture = styled.img`
  width: 73px;
  height: 73px;
  border-radius: 5px;
  opacity: 0;
`

const Profile = styled.div`
  width: 434px;
  height: 72px;
  margin-top: 3px;
  margin-left: 10px;
  box-sizing: border-box;
`

const Title = styled.div`
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 17px;
  line-height: 14px;
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#BDBDBD' : '#424242'};
`

const Description = styled.div`
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#BDBDBD' : '#424242'};
`

const StreamItem = ({
  theme,
  onDelete,
  track,
  isImage,
  count
}) => {
  const { login, password } = queryString.parse(window.location.search)

  const [isImageError, setImageError] = useState(true)
  const [trackInfo, setTrackInfo] = useState({
    artist: 'Не заполненно',
    date: 'Не заполненно',
    album: 'Не заполненно',
    title: track.name,
    isLoad: false
  })

  useEffect(() => {
    if (trackInfo.isLoad) {
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

  return (
    <Body type={track.type} theme={theme}>
      {track.type !== 'random' && <Delete onClick={() => onDelete(track.streamId)} />}
      <Picture style={{ opacity: isImage ? isImageError ? '0' : '1' : '0' }} onLoad={e => setImageError(false)} draggable={false} src={`http://127.0.0.1:1111/picture?id=${track.id}`} alt={track.id} />
      <Profile>
        {
          track.type === 'file'
            ? (
              <>
                <Title theme={theme} style={{ marginBottom: '6px' }}>{normalize.text(trackInfo.title, 45)}</Title>
                <Description theme={theme} style={{ marginBottom: '4px' }}>{normalize.text(trackInfo.artist, 50)}</Description>
                <Description theme={theme}>{normalize.text(trackInfo.album, 50)}</Description>
              </>
            )
            : track.type === 'random'
                ? (
                  <>
                    <Title theme={theme} style={{ marginBottom: '6px' }}>Случайный порядок</Title>
                    <Description theme={theme} style={{ marginBottom: '4px' }}>случаный из {count} треков</Description>
                  </>
                )
                : (
                  <>
                    <Title theme={theme} style={{ marginBottom: '6px' }}>Звукозапись</Title>
                    <Description theme={theme} style={{ marginBottom: '4px' }}>время записи: {track.duration}</Description>
                  </>
                )
        }
      </Profile>
    </Body>
  )
}

export default StreamItem
