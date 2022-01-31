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
  width: 300px;
  background: ${props => props.theme === 'dark' ? '#141414' : '#FFFFFF'};
  box-shadow: ${props => props.theme === 'dark' ? '0px 2px 8px rgba(40, 40, 40, 0.15), 0px 0px 2px rgb(68, 68, 68, 0.30)' : '0px 2px 8px rgba(111, 111, 111, 0.15), 0px 0px 2px rgb(34, 34, 34, 0.30)'};
  border-radius: 8px;
  margin-bottom: 14px;
  padding: 10px 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  z-index: 9999999999;
`

const Navigation = observer(() => {
  const { settings } = useStore()
  const [isMenu, setMenu] = useState(false)

  return (
    <Body theme={settings.theme}>
      <Wrapper style={{ marginLeft: '10px' }} onClick={() => window.open('https://prohetamine.ru', '_blank')}>
        <Image src={settings.theme === 'dark' ? navigationProhetamineDark : navigationProhetamineLight} />
        <SmallText theme={settings.theme} style={{ color: settings.theme === 'dark' ? '#848484' : '#A2A2A2' }}>Prohetamine</SmallText>
      </Wrapper>
      <Wrapper style={{ marginLeft: '10px' }} onClick={() => console.log('lol')}>
        <Image src={settings.theme === 'dark' ? navigationSettingsDark : navigationSettingsLight} />
        <SmallText theme={settings.theme} style={{ color: settings.theme === 'dark' ? '#848484' : '#A2A2A2' }}>Настройки</SmallText>
      </Wrapper>
      <Wrapper style={{ marginLeft: '10px' }} onClick={() => settings.pictureAlbum = !settings.pictureAlbum}>
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
      <Wrapper style={{ marginLeft: '10px', position: 'relative' }} onMouseEnter={() => setMenu(true)} onClick={() => settings.theme = settings.theme === 'dark' ? 'light' : 'dark'}>
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
          isMenu
            ? (
              <Menu style={{ cursor: 'default' }} theme={settings.theme} onClick={(e) => e.stopPropagation()} onMouseEnter={() => setMenu(true)} onMouseLeave={() => setMenu(false)}>
                <input type='range' max={1} min={0} step={0.01} value={settings.brightness} onChange={({ target: { value } }) => settings.brightness = value} />
                <button
                  onClick={
                    () => {
                      settings.backgroundImage = backgrounds[parseInt(Math.random() * backgrounds.length)]
                    }
                  }
                >image</button>
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
