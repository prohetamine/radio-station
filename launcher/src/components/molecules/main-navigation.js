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
    localStreamAnalyser,
    presenterMedia
  } = useMediaController(_audio)

  const [isPlay, setPlay] = usePlay(setVolumeLocalAudio)

  const [isEther, setEther] = useEther({
    socket,
    presenterMedia
  })

  useEffect(() => {
    store.isEther = isEther
    if (isEther && setVolumeLocalAudio) {
      setPlay(true)
    }
  }, [isEther, setVolumeLocalAudio])

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
                    Внутренний звук:
                  </SmallText>
                  <CanvasAnalyser
                    style={{ marginTop: '6px' }}
                    isAnalyse={true}
                    analyser={localAudioAnalyser}
                    canvas={{
                      width: 180,
                      height: 34,
                      bottom: 29,
                      max: 23,
                      positions: [6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96, 101, 106, 111, 116, 121, 126, 131, 136, 141]
                    }}
                  />
                  <SmallText style={{ marginTop: '7px', marginBottom: '1px' }} theme={settings.theme}>
                    Внутренний микрофон:
                  </SmallText>
                  <CanvasAnalyser
                    style={{ marginTop: '6px' }}
                    isAnalyse={true}
                    analyser={localStreamAnalyser}
                    canvas={{
                      width: 180,
                      height: 34,
                      bottom: 29,
                      max: 23,
                      positions: [6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96, 101, 106, 111, 116, 121, 126, 131, 136, 141]
                    }}
                  />
                </CanvasWrapper>
                <MediaRange
                  value={volumeAudio}
                  onChange={value => setVolumeAudio(value)}
                  max={3}
                  min={0}
                  theme={settings.theme}
                  label='Внеш. звук'
                />
                <MediaRange
                  value={volumeLocalAudio}
                  onChange={value => setVolumeLocalAudio(value)}
                  max={3}
                  min={0}
                  theme={settings.theme}
                  label='звук'
                />
                <MediaRange
                  value={volumeStream}
                  onChange={value => setVolumeStream(value)}
                  max={3}
                  min={0}
                  theme={settings.theme}
                  label='Внеш. микр.'
                />
                <MediaRange
                  value={volumeLocalStream}
                  onChange={value => setVolumeLocalStream(value)}
                  max={3}
                  min={0}
                  theme={settings.theme}
                  label='микрофон'
                />
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
