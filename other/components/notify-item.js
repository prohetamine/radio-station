import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import queryString from 'query-string'
import normalize from './../lib/normalize'
import useLocalStorageState from 'use-local-storage-state'

import miniDeleteBackgroundLight from './../assets/mini-delete-backgroud-light.svg'
import miniDeleteBackgroundDark from './../assets/mini-delete-backgroud-dark.svg'

import BigBlackText from './big-black-text'
import GrayText from './gray-text'
import MiddleBlackText from './middle-black-text'

const MainBody = styled.div`
  user-select: none;
  overflow: hidden;
  width: 560px;
  min-width: 560px;
  height: 174px;
  min-height: 174px;
  box-shadow: 0px 2px 6px rgba(115, 111, 111, 0.25);
  border-radius: 5px;
  position: relative;
  box-sizing: border-box;
  display: flex;
  margin-bottom: 14px;
`

const Body = styled.div`
  width: 525px;
  min-width: 525px;
  height: 100%;
  background: ${props => props.theme === 'dark' ? '#141414' : '#fff'};
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 14px;
  color: ${props => props.theme === 'dark' ? '#BDBDBD' : '#424242'};
  box-sizing: border-box;
  padding: 10px;
`

const OtherBody = styled.div`
  width: 100%;
  height: 100%;
`

const EmptyBody = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.theme === 'dark' ? '#141414' : '#fff'};
`

const DeleteBody = styled.div`
  width: 35px;
  height: 33px;
  background-image: url(${props => props.theme === 'dark' ? miniDeleteBackgroundDark : miniDeleteBackgroundLight});
  position: relative;
`

const Delete = styled.div`
  top: 6px;
  right: 8px;
  width: 17px;
  height: 17px;
  position: absolute;
  cursor: pointer;
`

const NotifyItem = ({
  theme,
  onDelete
}) => (
  <MainBody theme={theme}>
    <Body theme={theme}>
      Приветствую, ведущий! У меня для тебя есть несколько важных слов, мои инструкции помогут тебе вести трансляцию без проблем.
      <br />
      <br />
      <b>1.</b> Никогда не пытайся в ручную добавлять или изменять треки в рабочей папке!
      <br />
      <br />
      <b>2.</b> Случайный порядок треков включается и выключается автоматически после добавления трека или звукозаписи.
      <br />
      <br />
      <b>3.</b> Добавь больше треков чтоб они не повторялись в режиме случайного порядка.
    </Body>
    <OtherBody>
      <DeleteBody theme={theme}>
        <Delete onClick={() => onDelete()} />
      </DeleteBody>
      <EmptyBody theme={theme} />
    </OtherBody>
  </MainBody>
)

export default NotifyItem
