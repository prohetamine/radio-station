import React, { useEffect } from 'react'
import styled from 'styled-components'
import normalize from './../../../utils/normalize'
import { observer } from 'mobx-react'
import useStore from './../../store'
import { useAuth } from './../../auth-provider.js'

import useAudio from './../../hooks/use-audio'
import useMediaSource from './../../hooks/use-media-source'
import useMediaController from './../../hooks/use-media-controller'
import useEther from './../../hooks/use-ether'
import useCurrentTrack from './../../hooks/use-current-track'
import usePlay from './../../hooks/use-play'

import CanvasRectEffect from './../atoms/canvas-rect-effect'
import BigText from './../atoms/big-text'
import MiddleText from './../atoms/middle-text'
import SmallText from './../atoms/small-text'

import mainNavigationBackgroundLight from './../../../assets/main-navigation-background-light.svg'
import mainNavigationBackgroundDark from './../../../assets/main-navigation-background-dark.svg'
import mainMaxNavigationBackgroundLight from './../../../assets/main-max-navigation-background-light.svg'
import mainMaxNavigationBackgroundDark from './../../../assets/main-max-navigation-background-dark.svg'

import navigationSoundOnLight from './../../../assets/navigation-sound-on-light.svg'
import navigationSoundOffLight from './../../../assets/navigation-sound-off-light.svg'
import navigationSoundOnDark from './../../../assets/navigation-sound-on-dark.svg'
import navigationSoundOffDark from './../../../assets/navigation-sound-off-dark.svg'

import navigationRecordOnLight from './../../../assets/navigation-record-on-light.svg'
import navigationRecordOffLight from './../../../assets/navigation-record-off-light.svg'
import navigationRecordOnDark from './../../../assets/navigation-record-on-dark.svg'
import navigationRecordOffDark from './../../../assets/navigation-record-off-dark.svg'

const Body = styled.div`
  user-select: none;
  overflow: hidden;
  width: 560px;
  box-shadow: ${props => props.theme === 'dark' ? '0px 2px 8px rgba(40, 40, 40, 0.15), 0px 0px 2px rgb(68, 68, 68, 0.30)' : '0px 2px 8px rgba(111, 111, 111, 0.15), 0px 0px 2px rgb(34, 34, 34, 0.30)'};
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

const CanvasWrapper = styled.div`
  width: 230px;
  height: 105px;
  user-select: none;
`

const Image = styled.div`
  width: 36px;
  height: 36px;
  background-image: url(${props => props.src});
  margin-bottom: 4px;
`

const MainNavigation = observer(() => {
  const store = useStore()
  const { settings } = store
  const { socket, request } = useAuth()
  const track = useCurrentTrack({
    socket,
    request
  })
  const _audio = useAudio()
  useMediaSource({
    audio: _audio,
    socket
  })
  const {
    volumeAudio,
    volumeStream,
    volumeLocalAudio,
    volumeLocalStream,
    setVolumeAudio,
    setVolumeStream,
    setVolumeLocalAudio,
    setVolumeLocalStream,
    presenterMedia
  } = useMediaController(_audio)

  const [isEther, setEther] = useEther({
    socket,
    setVolumeStream,
    presenterMedia
  })

  useEffect(() => {
    store.isEther = isEther
  }, [isEther])

  const [isPlay, setPlay] = usePlay(setVolumeLocalAudio)

  return isEther
            ? (
              <Body
                theme={settings.theme}
                style={{
                  height: '125px',
                  backgroundImage: `url(${settings.theme === 'dark' ? mainMaxNavigationBackgroundDark : mainMaxNavigationBackgroundLight})`
                }}
              >
                <CanvasWrapper>
                  <SmallText style={{ marginTop: '3px' }} theme={settings.theme}>
                    Внутренний звук:
                  </SmallText>
                  <div style={{ marginTop: '7px', background: '#fa0', height: '27px', width: '180px' }}></div>
                    <SmallText style={{ marginTop: '7px' }} theme={settings.theme}>
                      Внутренний микрофон:
                    </SmallText>
                    <div style={{ marginTop: '7px', background: '#fa0', height: '27px', width: '180px' }}></div>
                </CanvasWrapper>
                <div>
                  <input type='range' max={3} min={0} step={0.01} value={volumeAudio} onChange={({ target: { value } }) => setVolumeAudio(value)} />
                  <br />
                  <input type='range' max={3} min={0} step={0.01} value={volumeStream} onChange={({ target: { value } }) => setVolumeStream(value)} />
                  <br />
                  <input type='range' max={3} min={0} step={0.01} value={volumeLocalAudio} onChange={({ target: { value } }) => setVolumeLocalAudio(value)} />
                  <br />
                  <input type='range' max={3} min={0} step={0.01} value={volumeLocalStream} onChange={({ target: { value } }) => setVolumeLocalStream(value)} />
                </div>
              </Body>
            )
            : (
              <Body
                theme={settings.theme}
                style={{
                  height: '69px',
                  backgroundImage: `url(${settings.theme === 'dark' ? mainNavigationBackgroundDark : mainNavigationBackgroundLight})`
                }}
              >
                <CanvasRectEffect isPlay={isPlay} />
                <Profile>
                  <MiddleText theme={settings.theme} style={{ marginBottom: '7px' }}>Сейчас играет:</MiddleText>
                  <BigText theme={settings.theme}>
                    {
                      normalize.text(track.title || track.filename || 'Загрузка..', 38)
                    }
                  </BigText>
                </Profile>
                <Wrapper style={{ marginLeft: '10px' }} onClick={() => setPlay(s => !s)}>
                  <Image
                    src={
                      settings.theme === 'dark'
                        ? isPlay
                            ? navigationSoundOnDark
                            : navigationSoundOffDark
                        : isPlay
                            ? navigationSoundOnLight
                            : navigationSoundOffLight
                    }
                  />
                  <SmallText
                    theme={settings.theme}
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
                      settings.theme === 'dark' && navigationRecordOnDark
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
                      color: settings.theme === 'dark' && '#A2A2A2'
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
