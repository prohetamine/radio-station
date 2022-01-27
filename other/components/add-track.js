import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import queryString from 'query-string'
import { arrayBufferToBlob } from 'blob-util'

import addTrackBackgroundLight from './../assets/add-track-background-light.svg'
import addTrackBackgroundDark from './../assets/add-track-background-dark.svg'

import BigBlackText from './big-black-text'

const Body = styled.div`
  user-select: none;
  overflow: hidden;
  width: 330px;
  height: 68px;
  background-image: url(${props => props.theme === 'dark' ? addTrackBackgroundDark : addTrackBackgroundLight});
  box-shadow: 0px 2px 6px rgba(115, 111, 111, 0.25);
  border-radius: 5px;
  padding: 9px;
  position: relative;
  box-sizing: border-box;
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-top: 14px;
`

const AddTrack = ({ theme, onLoad, count }) => {
  const ref = useRef()
  const [isLoad, setLoad] = useState(false)
  const [loadCountTracks, setLoadCountTracks] = useState(0)
  const [loadIndexTrack, setLoadIndexTrack] = useState(0)

  useEffect(() => {
    if (!isLoad) {
      setLoadCountTracks(0)
    }
  }, [isLoad])

  return (
    <>
      <label htmlFor='add-track'>
        <Body theme={theme}>
          {
            isLoad
              ? (
                <BigBlackText theme={theme} style={{ marginLeft: '60px' }}>Загрузка треков: {loadIndexTrack} из {loadCountTracks}</BigBlackText>
              )
              : (
                <BigBlackText theme={theme} style={{ marginLeft: '60px' }}>Добавить треки (всего: {count})</BigBlackText>
              )
          }
        </Body>
      </label>
      <input
        id='add-track'
        hidden
        multiple='multiple'
        type='file'
        onChange={
          async e => {
            const files = e.target.files
            setLoad(true)
            setLoadCountTracks(files.length)
            for (let i = 0; i < files.length; i++) {
              await new Promise(res => {
                const file = files[i]
                const fileReader = new FileReader()
                fileReader.onloadend = async e => {
                  var arrayBuffer = e.target.result
                  var fileType = file.type
                  const name = file.name
                  var blob = arrayBufferToBlob(arrayBuffer, fileType)
                  await onLoad(blob, name)
                  res()
                }
                fileReader.readAsArrayBuffer(file)
              })
              setLoadIndexTrack(i + 1)
            }
            setLoad(false)
          }
        }
      />
    </>
  )
}

export default AddTrack
