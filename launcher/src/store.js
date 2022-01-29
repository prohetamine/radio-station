import { createContext, useContext } from 'react'
import { observable, autorun, toJS } from 'mobx'
import images from './../assets/backgrounds/2.jpg'

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
      backgroundImage: images
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
