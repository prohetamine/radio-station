import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
//import normalize from './../lib/normalize'
import { roundRect } from './../../../utils/round-rect'
import { MediaPresenter } from 'sfmediastream'
import { observer } from 'mobx-react'
import useStore from './../../store'
import { useAuth } from './../../auth-provider.js'

import mainNavigationBackgroundLight from './../../../assets/main-navigation-background-light.svg'
import mainNavigationBackgroundDark from './../../../assets/main-navigation-background-dark.svg'

import navigationSoundOnLight from './../../../assets/navigation-sound-on-light.svg'
import navigationSoundOffLight from './../../../assets/navigation-sound-off-light.svg'
import navigationSoundOnDark from './../../../assets/navigation-sound-on-dark.svg'
import navigationSoundOffDark from './../../../assets/navigation-sound-off-dark.svg'

import navigationRecordOnLight from './../../../assets/navigation-record-on-light.svg'
import navigationRecordOffLight from './../../../assets/navigation-record-off-light.svg'
import navigationRecordOnDark from './../../../assets/navigation-record-on-dark.svg'
import navigationRecordOffDark from './../../../assets/navigation-record-off-dark.svg'

/*


import BigBlackText from './big-black-text'
*/
import SmallText from './../atoms/small-text'

const Body = styled.div`
  user-select: none;
  overflow: hidden;
  width: 560px;
  height: 69px;
  background-image: url(${props => props.theme === 'dark' ? mainNavigationBackgroundDark : mainNavigationBackgroundLight});
  box-shadow: 0px 2px 6px rgba(115, 111, 111, 0.25);
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 8px;
  display: flex;
`

const Profile = styled.div`
  width: 342px;
  height: 46px;
  margin-top: 3px;
  margin-left: 10px;
  box-sizing: border-box;
`

const Wrapper = styled.div`
  width: 57px;
  height: 49px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`

const Image = styled.div`
  width: 36px;
  height: 36px;
  background-image: url(${props => props.src});
  margin-bottom: 4px;
`

const useAudio = () => {
  const [audio, setAudio] = useState(null)

  useEffect(() => {
    const audio = new Audio()
    audio.muted = true

    setAudio(audio)
  }, [])

  return audio
}

const useMediaSource = ({ socket, audio }) => {
  useEffect(async () => {
    if (socket && audio) {
      const mediaSource = new MediaSource()
      audio.src = window.URL.createObjectURL(mediaSource)
      audio.autoplay = true

      await new Promise(res =>
        mediaSource.addEventListener('sourceopen', res)
      )

      const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg')

      socket.on('stream', data =>
        sourceBuffer.appendBuffer(data)
      )

      return () => socket.off('stream')
    }
  }, [socket, audio])
}

const useMediaController = (audio) => {
  const [presenterMedia, setPresenterMedia] = useState(null)
      , [volumeAudio, setVolumeAudio] = useState(0)
      , [volumeStream, setVolumeStream] = useState(0)
      , [volumeLocalAudio, setVolumeLocalAudio] = useState(0)
      , [localVolumeStream, setVolumeLocalStream] = useState(0)

  useEffect(() => {
    if (presenterMedia?.audio) {
      presenterMedia.audio.gain.value = volumeAudio
    }
  }, [presenterMedia?.audio, volumeAudio])

  useEffect(() => {
    if (presenterMedia?.stream) {
      presenterMedia.stream.gain.value = volumeStream
    }
  }, [presenterMedia?.stream, volumeStream])

  useEffect(() => {
    if (presenterMedia?.localAudio) {
      presenterMedia.localAudio.gain.value = volumeLocalAudio
    }
  }, [presenterMedia?.localAudio, volumeLocalAudio])

  useEffect(() => {
    if (presenterMedia?.localStream) {
      presenterMedia.localStream.gain.value = localVolumeStream
    }
  }, [presenterMedia?.localStream, localVolumeStream])

  useEffect(async () => {
    if (audio) {
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true })
      const context = new AudioContext()

      const sourceAudio = context.createMediaElementSource(audio)
      const streamSourse = context.createMediaStreamSource(stream)
      audio.muted = false

      const destination = context.createMediaStreamDestination()

      const _stream = context.createGain()
          , _audio = context.createGain()
          , localStream = context.createGain()
          , localAudio = context.createGain()

      _stream.gain.value = 0
      _audio.gain.value = 0
      localStream.gain.value = 0
      localAudio.gain.value = 0

      streamSourse.connect(_stream)
      sourceAudio.connect(_audio)
      streamSourse.connect(localStream)
      sourceAudio.connect(localAudio)

      _stream.connect(destination)
      _audio.connect(destination)

      localStream.connect(context.destination)
      localAudio.connect(context.destination)

      const presenterMedia = new MediaPresenter({
        mediaStream: new MediaStream(destination.stream),
        audio: {
          channelCount: 2,
          echoCancellation: false
        }
      }, 100)

      setPresenterMedia({
        audio: _audio,
        stream: _stream,
        localStream,
        localAudio,
        presenterMedia
      })
    }
  }, [audio])

  return {
    setVolumeAudio,
    setVolumeStream,
    setVolumeLocalAudio,
    setVolumeLocalStream,
    ...presenterMedia
  }
}

const usePlay = (setVolumeLocalAudio) => {
  const [isPlay, setPlay] = useState(false)
  useEffect(() => {
    if (setVolumeLocalAudio) {
      setVolumeLocalAudio(isPlay ? 1 : 0)
    }
  }, [setVolumeLocalAudio, isPlay])

  return [isPlay, setPlay]
}

const useEther = ({ setVolumeStream, presenterMedia, socket }) => {
  const [isEther, setEther] = useState(false)
  useEffect(() => {
    if (presenterMedia && setVolumeStream) {
      if (isEther) {
        socket.emit('switch-launcher-on')
        presenterMedia.startRecording()
        setVolumeStream(1)
      } else {
        socket.emit('switch-launcher-off')
        presenterMedia.stopRecording()
        setVolumeStream(0)
      }
    }
  }, [isEther, setVolumeStream, presenterMedia])

  useEffect(async () => {
    if (socket && presenterMedia) {
      presenterMedia.onRecordingReady = function(packet){
        console.log("Recording started!");
        console.log(packet)
        console.log("Header size: " + packet.data.size + "bytes");
        socket.emit('launcher-header', packet.data)
      }

      presenterMedia.onBufferProcess = function(packet){
        console.log("Buffer sent: " + packet[0].size + "bytes");
        socket.emit('launcher-audio', packet[0])
      }
    }
  }, [socket, presenterMedia])

  return [isEther, setEther]
}

const MainNavigation = observer(() => {
  const store = useStore()
  const { socket } = useAuth()
  const audio = useAudio()
  useMediaSource({ audio, socket })
  const {
    //setVolumeAudio,
    setVolumeStream,
    setVolumeLocalAudio,
    //setVolumeLocalStream,
    presenterMedia
  } = useMediaController(audio)

  const [isEther, setEther] = useEther({ setVolumeStream, presenterMedia, socket })
  const [isPlay, setPlay]= usePlay(setVolumeLocalAudio)

  const refCanvas = useRef(0)
  useEffect(() => {
    const node = refCanvas.current

    if (node) {
      const ctx = node.getContext('2d')

      ctx.fillStyle = store.settings.theme === 'dark' ? '#141414' : '#fff'
      ctx.strokeStyle = '#00000000'

      const animation = x => {
        let i = parseInt(Math.random() * 10) - 3
        let flag = false
        return (s, r) => {
          const int = i - s
          roundRect(ctx, x, 36/2 - int, 3, int + 36/2, 4)
          if (flag) {
            i -= Math.random() * 1
          } else {
            i += Math.random() * 1
          }

          if (i > r) {
            flag = true
          }

          if (i < -3) {
            flag = false
          }
        }
      }

      const a = animation(11)
          , b = animation(16)
          , c = animation(21)
          , d = animation(26)
          , h = animation(31)
          , l = animation(36)

      if (isPlay) {
        const timeId = setInterval(() => {
          ctx.clearRect(0, 0, 49, 49)
          const max = 5
              , random = 9
          a(max, random)
          b(max, random)
          c(max, random)
          d(max, random)
          h(max, random)
          l(max, random)
        }, 15)

        return () => clearInterval(timeId)
      } else {
        const timeId = setInterval(() => {
          ctx.clearRect(0, 0, 49, 49)
          const max = 9
              , random = -2
          a(max, random)
          b(max, random)
          c(max, random)
          d(max, random)
          h(max, random)
          l(max, random)
        }, 75)

        return () => clearInterval(timeId)
      }
    }
  }, [store.settings.theme, refCanvas.current, isPlay])

  /*const refCanvas = useRef()
  const [isPlay, setPlay] = useState(false)
  const [isLoad, setLoad] = useState(true)
  const [isRecord, setRecord] = useState(false)
  const [recordTime, setRecordTime] = useState(false)
  const [info, setInfo] = useState({})



  useEffect(() => {
    //isPlay && window.audio.play()
    //window.audio.muted = !isPlay
  }, [isPlay])

  useEffect(() => {
    window.audio.addEventListener('canplay', () => {
      setLoad(false)
    })

    window.audio.addEventListener('canplaythrough', () => {
      setLoad(false)
    })

    window.socket.on('onCurrentTrack', data => {
      console.log(`http://127.0.0.1:1111/info?id=${data.id}`, data)
      axios.get(`http://127.0.0.1:1111/info?id=${data.id}`)
          .then(({ data }) => {
            if (data) {
              setInfo(data)
            }
          })
    })

    window.socket.emit('currentTrack')
  }, [])

  useEffect(() => {
    let timeIntervalId = 0
    let timeIntervalRecordId = 0

    if (isRecord) {
      //window.presenterInstance.startRecording()

      const startDate = new Date() - 0
      timeIntervalRecordId = setInterval(() => {
        console.log('lol')
        const currentDate = new Date() - 0
        setRecordTime(moment(currentDate - startDate - 1000 * 60 * 60 * 3).format("HH:mm:ss"))
      }, 1000)
    } else {
      //window.presenterInstance.stopRecording()
      window.socket.emit('microphoneStreamEnd')
    }

    return () => {
      clearInterval(timeIntervalRecordId)
      setRecordTime('00:00:00')
    }
  }, [isRecord])
  */

  /*
  <input type='range' max={3} min={0} step={0.01} value={volumeAudio} onChange={({ target: { value } }) => setVolumeAudio(value)} />
  <input type='range' max={3} min={0} step={0.01} value={volumeStream} onChange={({ target: { value } }) => setVolumeStream(value)} />
  <br />
  <br />
  <input type='range' max={3} min={0} step={0.01} value={localVolumeAudio} onChange={({ target: { value } }) => setLocalVolumeAudio(value)} />
  <input type='range' max={3} min={0} step={0.01} value={localVolumeStream} onChange={({ target: { value } }) => setLocalVolumeStream(value)} />
  */

  return (
    <Body theme={store.settings.theme}>
      <canvas width={49} height={49} ref={refCanvas}></canvas>
      <Profile>


        {/*<GrayText theme={theme} style={{ marginBottom: '7px' }}>Сейчас играет:</GrayText>
        <BigBlackText theme={theme}>
          {*/
            /*info.radioStation.type === 'voice'
              ? 'Звукозапись'
              : normalize.text(info.common?.title || info.radioStation?.name || 'Загрузка..', 38)
          /*}
        </BigBlackText>*/}
      </Profile>
      <Wrapper style={{ marginLeft: '10px' }} onClick={() => setPlay(s => !s)}>
        <Image
          src={
            store.settings.theme === 'dark'
              ? isPlay
                  ? navigationSoundOnDark
                  : navigationSoundOffDark
              : isPlay
                  ? navigationSoundOnLight
                  : navigationSoundOffLight
          }
        />
        <SmallText
          theme={store.settings.theme}
        >
          {
            isPlay
              ? 'Звук'
              : 'Мут'
          }
        </SmallText>
      </Wrapper>
      <Wrapper style={{ marginLeft: '10px' }} onClick={() => setEther(s => !s)}>
        <Image
          src={
            store.settings.theme === 'dark' && navigationRecordOnDark
              ? isEther
                  ? navigationRecordOnDark
                  : navigationRecordOffDark
              : isEther
                  ? navigationRecordOnLight
                  : navigationRecordOffLight
          }
        />
        <SmallText
          style={{
            color: store.settings.theme === 'dark' && '#A2A2A2'
                      ? isEther
                          ? '#DF1414'
                          : '#848484'
                      : isEther
                          ? '#DF1414'
                          : '#A2A2A2'
          }}
        >Запись</SmallText>
      </Wrapper>
    </Body>
  )
})

export default MainNavigation
