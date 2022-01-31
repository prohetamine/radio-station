import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import useStore from './../../store'
import { useAuth } from './../../auth-provider.js'

import useLocalStorageState from 'use-local-storage-state'

import SectionTitle from './../atoms/section-title'
import Search from './../molecules/search'
import TrackItem from './../molecules/track-item'

const Body = styled.div`
  width: 380px;
  min-width: 380px;
  height: 100%;
  padding: 0px 25px;
  box-sizing: border-box;
  overflow-y: scroll;
  overflow-x: hidden;
`

const Favorites = observer(() => {
  const store = useStore()
  const { request } = useAuth()
  const [search, setSearch] = useLocalStorageState('favorite-search', '')
  const regExpSearch = new RegExp(search, 'gi')

  return (
    <Body>
      <SectionTitle theme={store.settings.theme}>Закладки</SectionTitle>
      <Search type='favorites' placeholder='Поиск' value={search} onChange={value => setSearch(value)} />
      {
        store.favorites
          .filter(track => {
            const { title, album, artist, date, filename } = track || { title: '', album: '', artist: '', date: '', filename: '' }
            return title?.match(regExpSearch) || album?.match(regExpSearch) || artist?.match(regExpSearch) || date?.match(regExpSearch) || filename?.match(regExpSearch)
          })
          .map(
            track => (
              <TrackItem
                key={track.id}
                track={track}
                type='favorites'
                onDelete={
                  () =>
                    store.favorites = store.favorites.filter(({ id }) => id !== track.id)
                }
                onPush={
                  position => {
                    if (position > 380) {
                      request.post(`/push?id=${track.id}`)
                    }
                  }
                }
              />
            )
          )
      }
    </Body>
  )
})

export default Favorites
