import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { arrayBufferToBlob } from 'blob-util'

import addTrackBackgroundLight from './../../../assets/svg/add-track-background-light.svg'
import addTrackBackgroundDark from './../../../assets/svg/add-track-background-dark.svg'

import BigText from './../atoms/big-text'

const Body = styled.div`
  user-select: none;
  overflow: hidden;
  width: 330px;
  height: 68px;
  background-image: url(${props => props.theme === 'dark' ? addTrackBackgroundDark : addTrackBackgroundLight});
  box-shadow: ${props => props.theme === 'dark' ? '0px 2px 8px rgba(40, 40, 40, 0.15), 0px 0px 2px rgb(68, 68, 68, 0.30)' : '0px 2px 8px rgba(111, 111, 111, 0.15), 0px 0px 2px rgb(34, 34, 34, 0.30)'};
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
  const [isLoad, setLoad] = useState(false)
  const [loadCountTracks, setLoadCountTracks] = useState(0)
  const [loadIndexTrack, setLoadIndexTrack] = useState(0)

  useEffect(() => {
    if (!isLoad) {
      setLoadCountTracks(0)
    }
  }, [isLoad])

  const loadFile = async ({ target }) => {
    const files = target.files
    setLoad(true)
    setLoadCountTracks(files.length)
    for (let i = 0; i < files.length; i++) {
      await new Promise(res => {
        const file = files[i]
        const fileReader = new FileReader()
        fileReader.onloadend = async ({ target }) => {
          const arrayBuffer = target.result
              , fileType = file.type
              , name = file.name
          const blob = arrayBufferToBlob(arrayBuffer, fileType)
          await onLoad(blob, name)
          res()
        }
        fileReader.readAsArrayBuffer(file)
      })
      setLoadIndexTrack(i + 1)
    }
    setLoadIndexTrack(0)
    setLoad(false)
  }

  return (
    <>
      <label htmlFor='add-track'>
        <Body theme={theme}>
          {
            isLoad
              ? (
                <BigText theme={theme} style={{ marginLeft: '60px' }}>Загрузка треков: {loadIndexTrack} из {loadCountTracks}</BigText>
              )
              : (
                <BigText theme={theme} style={{ marginLeft: '60px' }}>Добавить треки (всего: {count})</BigText>
              )
          }
        </Body>
      </label>
      <input
        id='add-track'
        hidden
        multiple='multiple'
        type='file'
        onChange={loadFile}
      />
    </>
  )
}

export default AddTrack
