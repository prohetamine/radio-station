import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import useStore from './../../store'
import { useAuth } from './../../auth-provider.js'

import useLocalStorageState from 'use-local-storage-state'

import SectionTitle from './../atoms/section-title'
import Search from './../molecules/search'
import AddTrack from './../molecules/add-track'
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

const Tracks = observer(() => {
  const store = useStore()
  const { socket, request } = useAuth()

  const [search, setSearch] = useLocalStorageState('tracks-search', '')

  useEffect(() => {
    if (socket && request) {
      socket.on('onAllTracks', data => {
        store.tracks = store.tracks.filter(track => data.find(({ id }) => track.id === id))

        Promise.all(
          data
            .map(async ({ id }) => {
              const isFind = store.tracks.find(({ id: _id }) => _id === id)

              if (isFind) {
                return false
              }

              const { data } = await request.get(`/info?id=${id}`)

              return ({
                artist: null,
                date: null,
                album: null,
                title: null,
                filename: data ? data.name : null,
                isAlbumImage: data.isAlbumImage,
                ...data.common,
                id: data.id
              })
            })
        ).then(tracks => {
          store.tracks = Object.values(
            [...store.tracks, ...tracks]
              .reduce((ctx, track) => {
                ctx[track.id] = track
                return ctx
              }, {})
          ).filter(f => f)
        })
      })

      socket.emit('allTracks')

      return () => socket.off('onAllTracks')
    }
  }, [socket, request])

  const regExpSearch = new RegExp(search, 'gi')

  return (
    <Body>
      <SectionTitle theme={store.settings.theme}>Треки</SectionTitle>
      <Search type='tracks' placeholder='Поиск' value={search} onChange={value => setSearch(value)} />
      <AddTrack
        theme={store.settings.theme}
        onLoad={
          (blob, name) => {
            return request.post(`/load?name=${name}`, blob, {
              headers: {
                'Content-Type': blob.type
              }
            })
          }
        }
        count={store.tracks.length}
      />
      {
        store.tracks
          .filter(track => {
            const { title, album, artist, date, filename } = track || { title: '', album: '', artist: '', date: '', filename: '' }
            return title?.match(regExpSearch) || album?.match(regExpSearch) || artist?.match(regExpSearch) || date?.match(regExpSearch) || filename?.match(regExpSearch)
          })
          .map(
            track => (
              <TrackItem
                key={track.id}
                track={track}
                type='tracks'
                onDelete={
                  () =>
                    request.get(`/unload?id=${track.id}`).then(({ data }) => {
                      if (data) {
                        store.favorites = store.favorites.filter(favorite => favorite.id !== track.id)
                      }
                    })
                }
                onPush={
                  position => {
                    if (position < window.innerWidth - 380 && position > 380) {
                      request.post(`/push?id=${track.id}`)
                    }

                    if (position < 380) {
                      store.favorites = [track, ...store.favorites.filter(favorite => favorite.id !== track.id)]
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

export default Tracks
