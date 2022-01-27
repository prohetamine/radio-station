import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import queryString from 'query-string'

import SectionTitle from './section-title'
import Navigation from './navigation'
import NotifyItem from './notify-item'
import StreamItem from './stream-item'
import Shadow from './shadow'
import MainNavigation from './main-navigation'

const Body = styled.div`
  width: 100%;
  height: 100%;
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

const Stream = ({ settings, onSettings, login, password, stream, onStream, tracks }) => {
  const ref = useRef()
  const [hideNotify, setHideNotify] = useState(false)

  useEffect(() => {
    window.socket.on('onAllStream', data => {
      console.log('--> all stream', data)
      onStream(data)
    })

    window.socket.emit('allStream')

    /*axios.get(`http://127.0.0.1:8080/rad.io?getAllStreamTracks&login=${login}&password=${password}`)
      .then(({ data }) => {
        if (data instanceof Array && data.length !== undefined) {
          onStream(data)
        }
      })

    let oldTime = 0

    window.audio.addEventListener('timeupdate', () => {
      const newTime = window.audio.buffered.end(0) - window.audio.currentTime
      if (oldTime === 0 || newTime - oldTime > 1) {
        oldTime = window.audio.buffered.end(0) - window.audio.currentTime
        axios.get(`http://127.0.0.1:8080/rad.io?getAllStreamTracks&login=${login}&password=${password}`)
          .then(({ data }) => {
            if (data instanceof Array && data.length !== undefined) {
              onStream(data)
            }
          })

        setTimeout(() => {
          axios.get(`http://127.0.0.1:8080/rad.io?getAllStreamTracks&login=${login}&password=${password}`)
            .then(({ data }) => {
              if (data instanceof Array && data.length !== undefined) {
                onStream(data)
              }
            })
        }, 10000)
      }
    })*/


  }, [])

  useEffect(() => {
    const node = ref.current

    if (node) {
      node.scrollTo(0, node.scrollHeight)
    }
  }, [stream.length, ref.current])

  return (
    <Body>
      <Overflow ref={ref}>
        <SectionTitle theme={settings.theme}>Эфир</SectionTitle>
        <Navigation
          theme={settings.theme}
          imageValue={settings.isImage}
          themeValue={settings.theme}
          onProhetamine={() => window.open('https://prohetamine.ru', '_blank')}
          onSettings={
            () =>
              onSettings(
                state => ({
                  ...state,
                  isSettings: true
                })
              )
          }
          onImage={
            isImage =>
              onSettings(
                state => ({
                  ...state,
                  isImage
                })
              )
          }
          onTheme={
            theme =>
              onSettings(
                state => ({
                  ...state,
                  theme
                })
              )
          }
        />
        {
          hideNotify
            ? null
            : (
              <NotifyItem
                theme={settings.theme}
                onDelete={() => setHideNotify(true)}
              />
            )
        }
        {
          stream.map((track, key) => {
            return (
              <StreamItem
                isImage={settings.isImage}
                theme={settings.theme}
                key={track.id}
                track={track}
                count={tracks.length}
                onDelete={
                  () => {
                    const { login, password } = queryString.parse(window.location.search)
                    axios.post(`http://127.0.0.1:1111/pop?login=${login}&password=${password}&id=${track.id}&streamId=${track.streamId}&isTemp=${track.isTemp}`)
                  }
                }
              />
            )
          })
        }
      </Overflow>
      <Shadow />
      <MainNavigation theme={settings.theme} onStream={onStream} />
    </Body>
  )
}

export default Stream
