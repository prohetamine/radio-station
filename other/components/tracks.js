import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import queryString from 'query-string'
import axios from 'axios'
import useLocalStorageState from 'use-local-storage-state'

import SectionTitle from './section-title'
import Search from './search'
import AddTrack from './add-track'
import TrackItem from './track-item'

const Body = styled.div`
  width: 380px;
  min-width: 380px;
  height: 100%;
  padding: 0px 25px;
  box-sizing: border-box;
  overflow-y: scroll;
  overflow-x: hidden;
`

const Tracks = ({
  settings,
  login,
  password,
  favorites,
  onFavorites,
  tracks,
  onTracks,
  onStream
}) => {
  const [search, setSearch] = useLocalStorageState('search-tracks', '')
  const [filter, setFilter] = useLocalStorageState('filter-tracks', {})
  const regExpSearch = new RegExp(search, 'gi')

  useEffect(() => {
    window.socket.on('onAllTracks', data => {
      onTracks(data)
    })

    window.socket.emit('allTracks')
  }, [])

  return (
    <Body>
      <SectionTitle theme={settings.theme}>Треки</SectionTitle>
      <Search type='tracks' value={search} onChange={value => setSearch(value)} theme={settings.theme}>Поиск 🔎</Search>
      <AddTrack
        theme={settings.theme}
        count={tracks.length}
        onLoad={
          (blob, name) => {
            return axios.post(`http://127.0.0.1:9933/load?name=${name}&login=localhost&password=hackme`, blob, {
              headers: {
                'Content-Type': blob.type
              }
            })
            .then(({ data }) => {
              if (data.ok) {
                onTracks(data.tracks)
              }
            })
          }
        }
      />
      {
         tracks.filter(track => {
          if (search.length === 0) {
            return true
          }
          const { title, album, artist, date, filename } = filter[track.id] || { title: '', album: '', artist: '', date: '', filename: '' }
          return title?.match(regExpSearch) || album?.match(regExpSearch) || artist?.match(regExpSearch) || date?.match(regExpSearch)
        })
        .map(
          (track, key) => (
            <TrackItem
              isImage={settings.isImage}
              theme={settings.theme}
              key={track.id}
              track={track}
              type='tracks'
              onFilter={data => setFilter(tracks => ({ ...tracks, [track.id]: data }))}
              onDelete={
                () => {
                  const { login, password } = queryString.parse(window.location.search)
                  axios.get(`http://138.201.204.214:9933/unload?login=${login}&password=${password}&id=${track.id}`)
                }
              }
              onPush={
                position => {
                  if (position < window.innerWidth - 380 && position > 380) {
                    const { login, password } = queryString.parse(window.location.search)
                    axios.post(`http://138.201.204.214:9933/push?login=${login}&password=${password}&id=${track.id}`)
                  }

                  if (position < 380) {
                    onFavorites([track, ...favorites.filter(favorite => favorite.id !== track.id)])
                  }
                }
              }
            />
          )
        )
      }
    </Body>
  )
}

export default Tracks
