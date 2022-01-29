import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import useStore from './../../store'
import { useAuth } from './../../auth-provider.js'

const Body = styled.div`
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0px;
  top: 0px;
  background: #fff;
  z-index: 999999
`

const Auth = observer(() => {
  const { settings, auth } = useStore()
  const { request } = useAuth()

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
      <input
        type='text'
        placeholder='login'
        value={auth.login}
        onChange={
          ({ target: { value } }) => {
            auth.login = value
          }
        }
      />
      <input
        type='text'
        placeholder='password'
        value={auth.password}
        onChange={
          ({ target: { value } }) => {
            auth.password = value
          }
        }
      />
    </Body>
  )
})

export default Auth
