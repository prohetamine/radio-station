import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import queryString from 'query-string'
import axios from 'axios'
import useLocalStorageState from 'use-local-storage-state'

import SectionTitle from './section-title'
import Search from './search'
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

const Favorites = ({ theme, login, password, settings, favorites, onFavorites, onStream }) => {
  const [search, setSearch] = useLocalStorageState('search-favorites', '')
  const [filter, setFilter] = useLocalStorageState('filter-favorites', {})
  const regExpSearch = new RegExp(search, 'gi')

  return (
    <Body>
      <SectionTitle theme={settings.theme}>Закладки</SectionTitle>
      <Search type='favorites' value={search} onChange={value => setSearch(value)} theme={settings.theme}>Поиск 🔎</Search>
      {
        favorites
          .filter(track => {
            if (search.length === 0) {
              return true
            }
            const { title, album, artist, date, filename } = filter[track.id] || { title: '', album: '', artist: '', date: '', filename: '' }
            return title?.match(regExpSearch) || album?.match(regExpSearch) || artist?.match(regExpSearch) || date?.match(regExpSearch)
          })
          .map(
            track => (
              <TrackItem
                isImage={settings.isImage}
                theme={settings.theme}
                key={track.id}
                track={track}
                type='favorites'
                onFilter={data => setFilter(tracks => ({ ...tracks, [track.id]: data }))}
                onDelete={
                  () =>
                    onFavorites(favorites.filter(({ id }) => id !== track.id))
                }
                onPush={
                  position => {
                    if (position > 380) {
                      const { login, password } = queryString.parse(window.location.search)
                      axios.post(`http://127.0.0.1:1111/push?login=${login}&password=${password}&id=${track.id}`)
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

export default Favorites
