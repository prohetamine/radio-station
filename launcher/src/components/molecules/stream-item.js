import React from 'react'
import styled from 'styled-components'
import normalize from './../../../utils/normalize'
import useStore from './../../store'
import { observer } from 'mobx-react'
import { createUrl } from './../../auth-provider.js'

import streamTrackRandomItemBackgroundLight from './../../../assets/stream-track-random-item-background-light.svg'
import streamTrackRandomItemBackgroundDark from './../../../assets/stream-track-random-item-background-dark.svg'
import streamTrackQueueItemBackgroundLight from './../../../assets/stream-track-queue-item-background-light.svg'
import streamTrackQueueItemBackgroundDark from './../../../assets/stream-track-queue-item-background-dark.svg'

import BigText from './../atoms/big-text'
import MiddleText from './../atoms/middle-text'

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
        : props.theme === 'dark'
            ? streamTrackQueueItemBackgroundDark
            : streamTrackQueueItemBackgroundLight

  });
  box-shadow: ${props => props.theme === 'dark' ? '0px 2px 8px rgba(40, 40, 40, 0.15), 0px 0px 2px rgb(68, 68, 68, 0.30)' : '0px 2px 8px rgba(111, 111, 111, 0.15), 0px 0px 2px rgb(34, 34, 34, 0.30)'};
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
  opacity: 0px;
`

const Profile = styled.div`
  width: 434px;
  height: 72px;
  margin-top: 3px;
  margin-left: 10px;
  box-sizing: border-box;
`

const StreamItem = observer(({
  onDelete,
  track,
  count
}) => {
  const { settings } = useStore()

  const title = track.title || track.filename

  return (
    <Body type={track.type} theme={settings.theme}>
      {
        track.type !== 'random'
          ? (
            <Delete onClick={() => onDelete(track.streamId)} />
          )
          : (
            null
          )
      }
      <Picture style={{ opacity: (settings.pictureAlbum && track.isAlbumImage) ? 1 : 0 }} draggable={false} src={createUrl({ pathname: 'picture', params: { id: track.id }})} alt={track.id} />
      <Profile>
        {
          track.type === 'queue'
            ? (
              <>
                <BigText theme={settings.theme} style={{ marginBottom: '12px' }}>{title ? normalize.text(title, 45) : 'Не заполнено'}</BigText>
                <MiddleText theme={settings.theme} style={{ marginBottom: '10px' }}>{track.artist ? normalize.text(track.artist, 50) : 'Не заполнено'}</MiddleText>
                <MiddleText theme={settings.theme}>{track.album ? normalize.text(track.album, 50) : 'Не заполнено'}</MiddleText>
              </>
            )
            : (
              <>
                <BigText theme={settings.theme} style={{ marginBottom: '12px' }}>Случайный порядок</BigText>
                <MiddleText theme={settings.theme} style={{ marginBottom: '10px' }}>случаный из {count} треков</MiddleText>
              </>
            )
        }
      </Profile>
    </Body>
  )
})

export default StreamItem
