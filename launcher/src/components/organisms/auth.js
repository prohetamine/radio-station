import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import useStore from './../../store'
import { useAuth } from './../../auth-provider.js'
import backgrounds from './../../../utils/backgrounds'

import Background from './../atoms/background'
import Login from './../molecules/login'
import Password from './../molecules/password'

const Body = styled.div`
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 99999;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const Wrapper = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const Auth = observer(() => {
  const store = useStore()
  const { settings, auth } = store
  const { request } = useAuth()

  useEffect(() => {
    if (!settings.backgroundImage) {
      settings.backgroundImage = backgrounds[parseInt(Math.random() * backgrounds.length)]
    }
  }, [settings.backgroundImage, backgrounds])

  useEffect(() => {
    if (request && auth.login && auth.password) {
      const timeId = setTimeout(() => {
        request.get('/auth').then(({ data }) => {
          if (data.isOk) {
            auth.token = data.token
            auth.password = ''
            auth.login = ''
          }
        })
      }, 1000)

      return () => clearTimeout(timeId)
    }
  }, [request, auth.login, auth.password])

  return (
    <Body theme={settings.theme}>
      <Wrapper>
        <Login
          style={{ width: '300px' }}
          value={auth.value}
          placeholder='Логин'
          onChange={
            value => {
              auth.login = value
            }
          }
        />
        <Password
          style={{ width: '300px' }}
          value={auth.password}
          placeholder='Пароль'
          onChange={
            value => {
              auth.password = value
            }
          }
        />
      </Wrapper>
      <Background />
    </Body>
  )
})

export default Auth
