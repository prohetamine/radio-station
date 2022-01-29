import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import useStore from './../../store'
import { useAuth } from './../../auth-provider.js'

import SectionTitle from './../atoms/section-title'
import Navigation from './../molecules/navigation'
import NotifyItem from './../molecules/notify-item'
import StreamItem from './../molecules/stream-item'
import ShadowBackground from './../atoms/shadow-background'
import MainNavigation from './../molecules/main-navigation'

const Body = styled.div`
  width: 100%;
  height: 100%;
  min-width: 610px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Overflow = styled.div`
  width: 100%;
  height: calc(100% - 104px);
  box-sizing: border-box;
  padding: 0px 25px;
  overflow-y: scroll;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
`

const Stream = observer(() => {
  const store = useStore()
  const { socket, request } = useAuth()

  const ref = useRef()

  useEffect(() => {
    if (socket && request) {
      socket.on('onAllStream', data => {
        Promise.all(
          data
            .map(async track => {
              const { data } = await request.get(`/info?id=${track.id}`)

              delete track.name

              return ({
                artist: null,
                date: null,
                album: null,
                title: null,
                filename: data ? data.name : null,
                isAlbumImage: data.isAlbumImage,
                ...data.common,
                ...track,
              })
            })
        ).then(stream => {
          store.stream = stream
        })
      })

      socket.emit('allStream')
      return () => socket.off('onAllStream')
    }
  }, [socket, request])

  useEffect(() => {
    const node = ref.current
    if (node) {
      node.scrollTo(0, node.scrollHeight)
    }
  }, [store.stream.length, ref.current])

  return (
    <Body>
      <Overflow
        style={{
          height: store.isEther
                    ? 'calc(100% - 160px)'
                    : 'calc(100% - 104px)'
        }}
        ref={ref}
      >
        <SectionTitle theme={store.settings.theme}>Эфир</SectionTitle>
        <Navigation />
        <NotifyItem />
        {
          store.stream.map((track, key) => {
            return (
              <StreamItem
                isImage={store.settings.pictureAlbum}
                theme={store.settings.theme}
                key={key}
                track={track}
                count={store.tracks.length}
                onDelete={
                  () =>
                    request.post(`/pop?id=${track.streamId}`)
                }
              />
            )
          })
        }
        <ShadowBackground
          style={{
            bottom: store.isEther
                      ? '160px'
                      : '104px'
          }}
        />
      </Overflow>
      <MainNavigation />
    </Body>
  )
})

export default Stream
