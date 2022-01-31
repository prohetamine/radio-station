import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import './index.css'
import styled from 'styled-components'
import useStore from './store'
import { AuthProvider } from './auth-provider.js'

import Background from './components/atoms/background'

import Auth from './components/organisms/auth'
import Favorites from './components/organisms/favorites'
import Tracks from './components/organisms/tracks'
import Stream from './components/organisms/stream'
import SectionLine from './components/atoms/section-line'

const Body = styled.div`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: ${props => props.theme === 'light' ? '#141414' : '#ffffff'};
  position: absolute;
  display: flex;
  justify-content: center;
`

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1440px;
  height: 100vh;
  position: absolute;
  top: 0px;
  overflow: hidden;
`

const App = observer(() => {
  const { settings, auth } = useStore()

  return (
    <AuthProvider baseURL={window.location.href} auth={{ login: auth.login, password: auth.password, token: auth.token }}>
      <Body theme={settings.theme}>
        {
          !auth.token
            ? (
              <Auth />
            )
            : (
              <>
                <Background />
                <Wrapper>
                  <Favorites />
                  <SectionLine theme={settings.theme} />
                  <Stream />
                  <SectionLine theme={settings.theme} />
                  <Tracks />
                </Wrapper>
              </>
            )
        }
      </Body>
    </AuthProvider>
  )
})

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
