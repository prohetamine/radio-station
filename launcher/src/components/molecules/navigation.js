import React, { useState } from 'react'
import styled from 'styled-components'
import useStore from './../../store'
import backgrounds from './../../../utils/backgrounds'
import { observer } from 'mobx-react'

import navigationProhetamineLight from './../../../assets/svg/navigation-prohetamine-light.svg'
import navigationProhetamineDark from './../../../assets/svg/navigation-prohetamine-dark.svg'
import navigationSettingsLight from './../../../assets/svg/navigation-settings-light.svg'
import navigationSettingsDark from './../../../assets/svg/navigation-settings-dark.svg'
import navigationImageYesLight from './../../../assets/svg/navigation-image-yes-light.svg'
import navigationImageNoLight from './../../../assets/svg/navigation-image-no-light.svg'
import navigationImageYesDark from './../../../assets/svg/navigation-image-yes-dark.svg'
import navigationImageNoDark from './../../../assets/svg/navigation-image-no-dark.svg'
import navigationThemeDarkDark from './../../../assets/svg/navigation-theme-dark-dark.svg'
import navigationThemeLightDark from './../../../assets/svg/navigation-theme-light-dark.svg'
import navigationThemeDarkLight from './../../../assets/svg/navigation-theme-dark-light.svg'
import navigationThemeLightLight from './../../../assets/svg/navigation-theme-light-light.svg'

import SmallText from './../atoms/small-text'
import MiddleText from './../atoms/middle-text'

const Body = styled.div`
  user-select: none;
  width: 404px;
  height: 69px;
  background: ${props => props.theme === 'dark' ? '#141414' : '#FFFFFF'};
  box-shadow: ${props => props.theme === 'dark' ? '0px 2px 8px rgba(40, 40, 40, 0.15), 0px 0px 2px rgb(68, 68, 68, 0.30)' : '0px 2px 8px rgba(111, 111, 111, 0.15), 0px 0px 2px rgb(34, 34, 34, 0.30)'};
  border-radius: 8px;
  margin-bottom: 14px;
  padding: 10px 15px;
  box-sizing: border-box;
  display: flex;
`

const Wrapper = styled.div`
  width: 86px;
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

const Menu = styled.div`
  position: absolute;
  top: 65px;
  user-select: none;
  width: 200px;
  max-height: 300px;
  background: ${props => props.theme === 'dark' ? '#141414' : '#FFFFFF'};
  box-shadow: ${props => props.theme === 'dark' ? '0px 2px 8px rgba(40, 40, 40, 0.15), 0px 0px 2px rgb(68, 68, 68, 0.30)' : '0px 2px 8px rgba(111, 111, 111, 0.15), 0px 0px 2px rgb(34, 34, 34, 0.30)'};
  border-radius: 8px;
  margin-bottom: 14px;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  z-index: 9999999999;
  overflow: hidden;
  overflow-y: scroll;
`

const ImageSelect = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const ImageOption = styled.div`
  width: 85px;
  height: 85px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center center;
  cursor: pointer;
`

const Range = styled.input`
  -webkit-appearance: none;
  width: 100%;
  &:focus {
    outline: none;
  }

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 36px;
    cursor: pointer;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #000000;
    background: ${props => props.theme === 'dark' ? '#A1A1A1' : '#848484'};
    border-radius: 5px;
    padding: 4px;
    box-sizing: border-box;
    border: 0px solid #000101;
  }

  &::-webkit-slider-thumb {
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #000000;
    border: 0px solid ${props => props.theme === 'dark' ? '#A1A1A1' : '#848484'};
    height: 28px;
    width: 28px;
    border-radius: 5px;
    background: ${props => props.theme === 'dark' ? '#141414' : '#ffffff'};
    cursor: pointer;
    -webkit-appearance: none;
  }
`

const Button = styled.div`
  width: 100%;
  height: 36px;
  border-radius: 5px;
  background: ${props => props.theme === 'dark' ? '#A1A1A1' : '#848484'};
  color: ${props => props.theme === 'dark' ? '#141414' : '#ffffff'};
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  display: flex;
  align-items: center;
  cursor: pointer;
`

const Navigation = observer(() => {
  const { settings, auth } = useStore()
  const [isThemeMenu, setThemeMenu] = useState(false)
      , [isSettingMenu, setSettingMenu] = useState(false)

  return (
    <Body theme={settings.theme}>
      <Wrapper
        style={{ marginLeft: '10px' }}
        onClick={() => window.open('https://prohetamine.ru', '_blank')}
        onMouseEnter={() => {
          setThemeMenu(false)
          setSettingMenu(false)
        }}
      >
        <Image src={settings.theme === 'dark' ? navigationProhetamineDark : navigationProhetamineLight} />
        <SmallText theme={settings.theme} style={{ color: settings.theme === 'dark' ? '#848484' : '#A2A2A2' }}>Prohetamine</SmallText>
      </Wrapper>
      <Wrapper
        style={{ marginLeft: '10px', position: 'relative' }}
        onMouseEnter={() => {
          setThemeMenu(false)
          setSettingMenu(true)
        }}
      >
        <Image src={settings.theme === 'dark' ? navigationSettingsDark : navigationSettingsLight} />
        <SmallText theme={settings.theme} style={{ color: settings.theme === 'dark' ? '#848484' : '#A2A2A2' }}>Настройки</SmallText>
        {
          isSettingMenu
            ? (
              <Menu style={{ cursor: 'default' }} theme={settings.theme} onClick={(e) => e.stopPropagation()} onMouseEnter={() => setSettingMenu(true)} onMouseLeave={() => setSettingMenu(false)}>
                <MiddleText theme={settings.theme} style={{ marginBottom: '8px' }}>Подавление эха</MiddleText>
                <Button
                  onClick={() => {
                    settings.echoCancellation = !settings.echoCancellation
                    window.location.reload()
                  }}
                  theme={settings.theme}
                >{settings.echoCancellation ? 'Да' : 'Нет'}</Button>
                <MiddleText theme={settings.theme} style={{ marginTop: '10px', marginBottom: '8px' }}>Авторизация</MiddleText>
                <Button
                  onClick={() => {
                    auth.token = ''
                    auth.login = ''
                    auth.password = ''
                    window.location.reload()
                  }}
                  theme={settings.theme}
                >Выйти</Button>
              </Menu>
            )
            : (
              null
            )
        }
      </Wrapper>
      <Wrapper
        style={{ marginLeft: '10px' }}
        onClick={() => settings.pictureAlbum = !settings.pictureAlbum}
        onMouseEnter={() => {
          setThemeMenu(false)
          setSettingMenu(false)
        }}
      >
        <Image
          src={
            settings.theme === 'dark'
              ? settings.pictureAlbum
                  ? navigationImageYesDark
                  : navigationImageNoDark
              : settings.pictureAlbum
                  ? navigationImageYesLight
                  : navigationImageNoLight
          }
        />
        <SmallText theme={settings.theme} style={{ color: settings.theme === 'dark' ? '#848484' : '#A2A2A2' }}>Изображения</SmallText>
      </Wrapper>
      <Wrapper
        style={{ marginLeft: '10px', position: 'relative' }}
        onMouseEnter={() => {
          setSettingMenu(false)
          setThemeMenu(true)
        }}
        onClick={() => settings.theme = settings.theme === 'dark' ? 'light' : 'dark'}
      >
        <Image
          src={
            settings.theme === 'dark'
              ? settings.theme === 'dark'
                  ? navigationThemeDarkDark
                  : navigationThemeLightDark
              : settings.theme === 'dark'
                  ? navigationThemeDarkLight
                  : navigationThemeLightLight
          }
        />
        <SmallText theme={settings.theme} style={{ color: settings.theme === 'dark' ? '#848484' : '#A2A2A2' }}>Тема</SmallText>
        {
          isThemeMenu
            ? (
              <Menu style={{ cursor: 'default' }} theme={settings.theme} onClick={(e) => e.stopPropagation()} onMouseEnter={() => setThemeMenu(true)} onMouseLeave={() => setThemeMenu(false)}>
                <MiddleText theme={settings.theme} style={{ marginBottom: '8px' }}>Контраст</MiddleText>
                <Range theme={settings.theme} type='range' max={1} min={0} step={0.01} value={settings.brightness} onChange={({ target: { value } }) => settings.brightness = value} />
                <MiddleText theme={settings.theme} style={{ marginTop: '10px', marginBottom: '8px' }}>Фоновая картинка</MiddleText>
                <ImageSelect>
                  {
                    backgrounds.map(
                      (background, key) => (
                        <ImageOption
                          key={key}
                          src={background}
                          onClick={() => {
                            settings.backgroundImage = background
                          }}
                        />
                      )
                    )
                  }
                </ImageSelect>
              </Menu>
            )
            : (
              null
            )
        }
      </Wrapper>
    </Body>
  )
})

export default Navigation
