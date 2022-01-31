import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import queryString from 'query-string'
import { MediaPresenter } from 'sfmediastream'
import useLocalStorageState from 'use-local-storage-state'
import './index.css'
import { io } from 'socket.io-client'

import images from './assets/svg/1026-1189x755.jpg'
//import Favorites from './components/favorites'
//import Stream from './components/stream'
//import Tracks from './components/tracks'
//import SectionLine from './components/section-line'

const Body = styled.div`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  backgroud: #fff;
  position: absolute;
`

const Background = styled.img`
  width: 100%;
  height: 100vh;
  position: absolute;
  left: 0px;
  top: 0px;
`

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  position: absolute;
  left: 0px;
  top: 0px;
`

const { login, password } = queryString.parse(window.location.search)

/*

window.socket = io('http://127.0.0.1:9933', {
  transports : ['websocket'],
  auth: {
    login: 'localhost',
    password: 'hackme'
  }
})

window.audio = new Audio()

;(async () => {
  await new Promise(res => window.addEventListener('click', res))

  const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true })

  var mediaSource = new MediaSource()
  window.audio.src = window.URL.createObjectURL(mediaSource)
  window.audio.autoplay = true

  mediaSource.addEventListener('sourceopen', function () {
    window.sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

    window.socket.on('stream', data => {
      window.sourceBuffer.appendBuffer(data)
    })
  })

  const context = new AudioContext()

  const source = context.createMediaElementSource(window.audio)
  const streamSourse = context.createMediaStreamSource(stream)

  const destination = context.createMediaStreamDestination()

  var gainNode = context.createGain();
  gainNode.gain.value = 5
  var gainNode1 = context.createGain();
  gainNode1.gain.value = 0.2

  streamSourse.connect(gainNode)
  source.connect(gainNode1)

  gainNode.connect(destination)
  gainNode1.connect(destination)

  window.presenterMedia = new MediaPresenter({
    mediaStream: new MediaStream(destination.stream),
    audio: {
      channelCount: 2,
      echoCancellation: false
    }
  }, 100)

  window.presenterMedia.onRecordingReady = function(packet){
    console.log("Recording started!");
    console.log(packet)
    console.log("Header size: " + packet.data.size + "bytes");
    window.socket.emit('launcher-header', packet.data)
  }

  window.presenterMedia.onBufferProcess = function(packet){
    console.log("Buffer sent: " + packet[0].size + "bytes");
    window.socket.emit('launcher-audio', packet[0])
  }

  await window.presenterMedia.startRecording()
})()
*/

const App = () => {
  const [favorites, setFavorites] = useLocalStorageState('favorites', [])
  const [tracks, setTracks] = useLocalStorageState('tracks', [])
  const [stream, setStream] = useLocalStorageState('stream', [])

  const [settings, setSettings] = useLocalStorageState('main-state', {
    theme: 'light',
    isImage: true,
    isSettings: false,
    echoCancellation: false,
    sendChunkMicrophoneInterval: 60000
  })

  return (
    <Body theme={settings.theme}>
      <Background theme={settings.theme} src={images} />
      {/*<Wrapper>
        <Favorites
          login={login}
          password={password}
          settings={settings}
          favorites={favorites}
          onFavorites={data => setFavorites(data)}
          onStream={data => setStream(data)}
        />
      <SectionLine theme={settings.theme} onClick={() => window.socket.emit('switch-launcher-off')} />
        <Stream
          login={login}
          password={password}
          settings={settings}
          onSettings={data => setSettings(data)}
          stream={stream}
          onStream={data => setStream(data)}
          tracks={tracks}
        />
      <SectionLine theme={settings.theme} onClick={() => window.socket.emit('switch-launcher-on')} />
        <Tracks
          login={login}
          password={password}
          settings={settings}
          favorites={favorites}
          onFavorites={data => setFavorites(data)}
          tracks={tracks}
          onTracks={data => setTracks(data)}
          onStream={data => setStream(data)}
        />
      </Wrapper>*/}
    </Body>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
