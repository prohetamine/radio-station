import React, { useEffect } from 'react'
import axios from 'axios'
import queryString from 'query-string'
import useLocalStorageState from 'use-local-storage-state'

export default (name) => {
  const { login, password } = queryString.parse(window.location.search)

  if (!name) {
    return {
      artist: 'Не заполненно',
      date: 'Не заполненно',
      album: 'Не заполненно',
      title: name,
      isLoad: false
    }
  }

  const [trackInfo, setTrackInfo] = useLocalStorageState(name, {
    artist: 'Не заполненно',
    date: 'Не заполненно',
    album: 'Не заполненно',
    title: name,
    isLoad: false
  })

  useEffect(() => {
    if (trackInfo.isLoad) {
      return
    }

    axios.get(`http://127.0.0.1:8080/radio?getTrackInfo&login=${login}&password=${password}&name=${name}`)
        .then(({ data }) => {
          if (data && data.ok) {
            setTrackInfo(
              trackInfo => ({
                ...trackInfo,
                ...data.common,
                isLoad: true
              })
            )
          }
        })
  }, [login, password, trackInfo.isLoad])

  return trackInfo
}
