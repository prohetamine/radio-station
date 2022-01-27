import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import queryString from 'query-string'
import * as musicMetadata from 'music-metadata-browser'
import normalize from './../lib/normalize'
import useLocalStorageState from 'use-local-storage-state'
import { roundRect } from './../lib/round-rect'
import { arrayBufferToBlob } from 'blob-util'
import moment from 'moment'

import mainNavigationBackgroundLight from './../assets/main-navigation-background-light.svg'
import mainNavigationBackgroundDark from './../assets/main-navigation-background-dark.svg'

import navigationSoundOnLight from './../assets/navigation-sound-on-light.svg'
import navigationSoundOffLight from './../assets/navigation-sound-off-light.svg'
import navigationSoundOnDark from './../assets/navigation-sound-on-dark.svg'
import navigationSoundOffDark from './../assets/navigation-sound-off-dark.svg'
import navigationRecordOnLight from './../assets/navigation-record-on-light.svg'
import navigationRecordOffLight from './../assets/navigation-record-off-light.svg'
import navigationRecordOnDark from './../assets/navigation-record-on-dark.svg'
import navigationRecordOffDark from './../assets/navigation-record-off-dark.svg'

import BigBlackText from './big-black-text'
import GrayText from './gray-text'

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

const MainNavigation = ({ theme, onStream }) => {
  const refCanvas = useRef()
  const [isPlay, setPlay] = useState(false)
  const [isLoad, setLoad] = useState(true)
  const [isRecord, setRecord] = useState(false)
  const [recordTime, setRecordTime] = useState(false)
  const [info, setInfo] = useState({})

  const { login, password } = queryString.parse(window.location.search)

  useEffect(() => {
    const node = refCanvas.current

    if (node) {
      const ctx = node.getContext('2d')

      ctx.fillStyle = theme === 'dark' ? '#141414' : '#fff'
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

      if (!isLoad) {
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
  }, [theme, refCanvas.current, isLoad])

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

  return (
    <Body theme={theme}>
      <canvas width={49} height={49} ref={refCanvas}></canvas>
      <Profile>
        <GrayText theme={theme} style={{ marginBottom: '7px' }}>Сейчас играет:</GrayText>
        <BigBlackText theme={theme}>
          {
            /*info.radioStation.type === 'voice'
              ? 'Звукозапись'
              : */normalize.text(info.common?.title || info.radioStation?.name || 'Загрузка..', 38)
          }
        </BigBlackText>
      </Profile>
      <Wrapper style={{ marginLeft: '10px' }} onClick={() => setPlay(s => !s)}>
        <Image
          src={
            theme === 'dark'
              ? isPlay
                  ? navigationSoundOnDark
                  : navigationSoundOffDark
              : isPlay
                  ? navigationSoundOnLight
                  : navigationSoundOffLight
          }
        />
      <GrayText
        theme={theme}
      >
        {
          isLoad
            ? isPlay
                ? 'Загрузка..'
                : 'Звук'
            : 'Звук'
        }
      </GrayText>
      </Wrapper>
      <Wrapper style={{ marginLeft: '10px' }} onClick={() => setRecord(s => !s)}>
        <Image
          src={
            theme === 'dark'
              ? isRecord
                  ? navigationRecordOnDark
                  : navigationRecordOffDark
              : isRecord
                  ? navigationRecordOnLight
                  : navigationRecordOffLight
          }
        />
        <GrayText
          style={{
            color: theme === 'dark'
                      ? isRecord
                          ? '#DF1414'
                          : '#848484'
                      : isRecord
                          ? '#DF1414'
                          : '#A2A2A2'
          }}
        >{isRecord ? recordTime : 'Запись'}</GrayText>
      </Wrapper>
    </Body>
  )
}

export default MainNavigation
