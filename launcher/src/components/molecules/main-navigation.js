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

import CanvasAnalyser from './../atoms/canvas-analyser'
import BigText from './../atoms/big-text'
import MiddleText from './../atoms/middle-text'
import SmallText from './../atoms/small-text'
import MediaRange from './../atoms/media-range'

import mainNavigationBackgroundLight from './../../../assets/svg/main-navigation-background-light.svg'
import mainNavigationBackgroundDark from './../../../assets/svg/main-navigation-background-dark.svg'
import mainMaxNavigationBackgroundLight from './../../../assets/svg/main-max-navigation-background-light.svg'
import mainMaxNavigationBackgroundDark from './../../../assets/svg/main-max-navigation-background-dark.svg'

import navigationSoundOnLight from './../../../assets/svg/navigation-sound-on-light.svg'
import navigationSoundOffLight from './../../../assets/svg/navigation-sound-off-light.svg'
import navigationSoundOnDark from './../../../assets/svg/navigation-sound-on-dark.svg'
import navigationSoundOffDark from './../../../assets/svg/navigation-sound-off-dark.svg'

import navigationRecordOnLight from './../../../assets/svg/navigation-record-on-light.svg'
import navigationRecordOffLight from './../../../assets/svg/navigation-record-off-light.svg'
import navigationRecordOnDark from './../../../assets/svg/navigation-record-on-dark.svg'
import navigationRecordOffDark from './../../../assets/svg/navigation-record-off-dark.svg'

const positions = [6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96, 101, 106, 111, 116, 121, 126, 131, 136, 141]

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
  align-items: center;
  justify-content: space-between;
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
  width: 180px;
  height: 105px;
  user-select: none;
  font-size: 0px;
`

const Image = styled.div`
  width: 36px;
  height: 36px;
  background-image: url(${props => props.src});
  margin-bottom: 4px;
`

const ColumnButtons = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
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
    localAudioAnalyser,
    streamAnalyser,
    audioAnalyser,
    presenterMedia
  } = useMediaController(_audio, settings)

  const [isPlay, setPlay] = usePlay(setVolumeLocalAudio)

  const [isEther, setEther] = useEther({
    socket,
    presenterMedia
  })

  useEffect(() => {
    store.isEther = isEther
  }, [isEther])

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
                  <SmallText style={{ marginTop: '3px', marginBottom: '1px' }} theme={settings.theme}>
                    Внешний звук: (Звук. 2)
                  </SmallText>
                  <CanvasAnalyser
                    style={{ marginTop: '6px' }}
                    isAnalyse={true}
                    analyser={audioAnalyser}
                    canvas={{
                      width: 180,
                      height: 34,
                      bottom: 29,
                      max: 23,
                      positions
                    }}
                  />
                  <SmallText style={{ marginTop: '7px', marginBottom: '1px' }} theme={settings.theme}>
                    Внешний микрофон: (Микр. 2)
                  </SmallText>
                  <CanvasAnalyser
                    style={{ marginTop: '6px' }}
                    isAnalyse={true}
                    analyser={streamAnalyser}
                    canvas={{
                      width: 180,
                      height: 34,
                      bottom: 29,
                      max: 23,
                      positions
                    }}
                  />
                </CanvasWrapper>
                <MediaRange
                  value={volumeAudio}
                  onChange={value => setVolumeAudio(value)}
                  max={3}
                  min={0}
                  theme={settings.theme}
                  label='Звук 2'
                />
                <MediaRange
                  value={volumeLocalAudio}
                  onChange={value => setVolumeLocalAudio(value)}
                  max={3}
                  min={0}
                  theme={settings.theme}
                  label='Звук 1'
                />
                <MediaRange
                  value={volumeStream}
                  onChange={value => setVolumeStream(value)}
                  max={3}
                  min={0}
                  theme={settings.theme}
                  label='Микр. 2'
                />
                <MediaRange
                  value={volumeLocalStream}
                  onChange={value => setVolumeLocalStream(value)}
                  max={3}
                  min={0}
                  theme={settings.theme}
                  label='Микр. 1'
                />
                <ColumnButtons>
                  <Wrapper style={{ marginLeft: '10px' }} onClick={() => setPlay(s => !s)}>
                    <Image
                      src={
                        settings.theme === 'dark'
                          ? (isPlay && volumeLocalAudio !== 0)
                              ? navigationSoundOnDark
                              : navigationSoundOffDark
                          : (isPlay && volumeLocalAudio)
                              ? navigationSoundOnLight
                              : navigationSoundOffLight
                      }
                    />
                    <SmallText
                      theme={settings.theme}
                    >
                      {
                        (isPlay && volumeLocalAudio !== 0)
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
                    >Эфир</SmallText>
                  </Wrapper>
                </ColumnButtons>
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
                <CanvasAnalyser
                  isAnalyse={isPlay}
                  analyser={localAudioAnalyser}
                  canvas={{
                    width: 49,
                    height: 49,
                    bottom: 36,
                    max: 23,
                    positions: [11, 16, 21, 26, 31, 36]
                  }}
                />
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
                        ? (isPlay && volumeLocalAudio !== 0)
                            ? navigationSoundOnDark
                            : navigationSoundOffDark
                        : (isPlay && volumeLocalAudio)
                            ? navigationSoundOnLight
                            : navigationSoundOffLight
                    }
                  />
                  <SmallText
                    theme={settings.theme}
                  >
                    {
                      (isPlay && volumeLocalAudio !== 0)
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
                  >Эфир</SmallText>
                </Wrapper>
              </Body>
            )
})

export default MainNavigation
