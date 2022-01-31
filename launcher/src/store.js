import { createContext, useContext } from 'react'
import { observable, autorun, toJS } from 'mobx'

let defaultStore = null

try {
  defaultStore = JSON.parse(localStorage.store)
} catch (e) {
  defaultStore = {
    auth: {
      login: '',
      password: '',
      token: ''
    },
    settings: {
      theme: 'light',
      lang: 'ru',
      pictureAlbum: true,
      brightness: 0.4,
      backgroundImage: '',
      echoCancellation: false
    },
    tracks: [],
    stream: [],
    favorites: []
  }
}

const store = observable(defaultStore)

autorun(() => {
  localStorage.store = JSON.stringify(toJS(store))
})

const context = createContext(store)

const useStore = () => useContext(context)

export default useStore
