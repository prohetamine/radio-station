import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import navigationProhetamineLight from './../assets/navigation-prohetamine-light.svg'
import navigationProhetamineDark from './../assets/navigation-prohetamine-dark.svg'
import navigationSettingsLight from './../assets/navigation-settings-light.svg'
import navigationSettingsDark from './../assets/navigation-settings-dark.svg'
import navigationImageYesLight from './../assets/navigation-image-yes-light.svg'
import navigationImageNoLight from './../assets/navigation-image-no-light.svg'
import navigationImageYesDark from './../assets/navigation-image-yes-dark.svg'
import navigationImageNoDark from './../assets/navigation-image-no-dark.svg'
import navigationThemeDarkDark from './../assets/navigation-theme-dark-dark.svg'
import navigationThemeLightDark from './../assets/navigation-theme-light-dark.svg'
import navigationThemeDarkLight from './../assets/navigation-theme-dark-light.svg'
import navigationThemeLightLight from './../assets/navigation-theme-light-light.svg'

import BigBlackText from './big-black-text'
import GrayText from './gray-text'
import MiddleBlackText from './middle-black-text'

const Body = styled.div`
  user-select: none;
  width: 404px;
  height: 69px;
  background: ${props => props.theme === 'dark' ? '#141414' : '#FFFFFF'};
  box-shadow: 0px 2px 6px rgba(115, 111, 111, 0.25);
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

const Navigation = ({ theme, imageValue, themeValue, onProhetamine, onSettings, onImage, onTheme }) => {
  /// ...

  return (
    <Body theme={theme}>
      <Wrapper style={{ marginLeft: '10px' }} onClick={() => onProhetamine()}>
        <Image src={theme === 'dark' ? navigationProhetamineDark : navigationProhetamineLight} />
        <GrayText theme={theme} style={{ color: theme === 'dark' ? '#848484' : '#A2A2A2' }}>Prohetamine</GrayText>
      </Wrapper>
      <Wrapper style={{ marginLeft: '10px' }} onClick={() => onSettings()}>
        <Image src={theme === 'dark' ? navigationSettingsDark : navigationSettingsLight} />
        <GrayText theme={theme} style={{ color: theme === 'dark' ? '#848484' : '#A2A2A2' }}>Настройки</GrayText>
      </Wrapper>
      <Wrapper style={{ marginLeft: '10px' }} onClick={() => onImage(!imageValue)}>
        <Image
          src={
            theme === 'dark'
              ? imageValue
                  ? navigationImageYesDark
                  : navigationImageNoDark
              : imageValue
                  ? navigationImageYesLight
                  : navigationImageNoLight
          }
        />
        <GrayText theme={theme} style={{ color: theme === 'dark' ? '#848484' : '#A2A2A2' }}>Изображения</GrayText>
      </Wrapper>
      <Wrapper style={{ marginLeft: '10px' }} onClick={() => onTheme(themeValue === 'dark' ? 'light' : 'dark')}>
        <Image
          src={
            theme === 'dark'
              ? themeValue === 'dark'
                  ? navigationThemeDarkDark
                  : navigationThemeLightDark
              : themeValue === 'dark'
                  ? navigationThemeDarkLight
                  : navigationThemeLightLight
          }
        />
        <GrayText theme={theme} style={{ color: theme === 'dark' ? '#848484' : '#A2A2A2' }}>Тема</GrayText>
      </Wrapper>
    </Body>
  )
}

export default Navigation
