import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'

const AuthContext = createContext()

const AuthProvider = ({ auth, baseURL, children }) => {
  const [socket, setSocket] = useState(null)

  const request = axios.create({
    baseURL: baseURL,
    timeout: 100000,
    params: {
      login: auth.login,
      password: auth.password,
      token: auth.token
    }
  })

  useEffect(() => {
    const socket = io(baseURL, {
      transports : ['websocket'],
      auth: {
        login: auth.login,
        password: auth.password,
        token: auth.token
      }
    })

    setSocket(socket)
    return () => socket.close()
  }, [setSocket, auth, baseURL])

  return (
    <AuthContext.Provider value={{ baseURL, auth, socket, request }}>{children}</AuthContext.Provider>
  )
}

const useAuth = () => useContext(AuthContext)

const createUrl = ({ pathname, params }) => {
  const { baseURL, auth } = useContext(AuthContext)

  let url = new URL(baseURL+pathname)

  const _params = {
    ...params,
    token: auth.token,
    login: auth.login,
    password: auth.password
  }

  Object.keys(_params)
    .forEach(
      key =>
        _params[key] && url.searchParams.set(key, _params[key])
    )

  return url.href
}

export {
  AuthProvider,
  useAuth,
  createUrl
}
