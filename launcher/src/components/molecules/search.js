import React from 'react'
import useLocalStorageState from 'use-local-storage-state'
import styled from 'styled-components'
import useStore from './../../store'
import { observer } from 'mobx-react'

import miniSearchIconLight from './../../../assets/mini-search-light.svg'
import miniSearchIconDark from './../../../assets/mini-search-dark.svg'
import miniDeleteIconLight from './../../../assets/mini-delete-light.svg'
import miniDeleteIconDark from './../../../assets/mini-delete-dark.svg'

const Body = styled.div`
  width: 100%;
  height: 46px;
  background: ${props => props.theme === 'dark' ? '#141414' : '#FFFFFF'};
  box-shadow: ${props => props.theme === 'dark' ? '0px 2px 8px rgba(40, 40, 40, 0.15), 0px 0px 2px rgb(68, 68, 68, 0.30)' : '0px 2px 8px rgba(111, 111, 111, 0.15), 0px 0px 2px rgb(34, 34, 34, 0.30)'};
  border-radius: 5px;
  margin-bottom: 14px;
  padding: 10px;
  box-sizing: border-box;
  cursor: pointer;
`

const Center = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Label = styled.div`
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 18px;
  display: flex;
  align-items: center;
  text-align: center;
  color: ${props => props.theme === 'dark' ? '#A2A2A2' : '#848484'};
`

const Icon = styled.div`
  width: 12px;
  height: 12px;
  margin-left: 3px;
  background-image: url(${props => props.src});
`

const Input = styled.input`
  width: 288px;
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 18px;
  display: flex;
  align-items: center;
  outline: none;
  border: none;
  background: rgba(0, 0, 0, 0);
  color: ${props => props.theme === 'dark' ? '#A2A2A2' : '#848484'};
`

const Search = observer(({ type, value, onChange }) => {
  const { settings } = useStore()
  const [isFocus, setFocus] = useLocalStorageState(`focus-${type}`, false)

  return (
    <Body
      theme={settings.theme}
      onClick={() => isFocus || setFocus(true)}
    >
      <Center style={{ justifyContent: isFocus ? 'space-between' : 'center' }}>
        {
            isFocus
              ? (
                <>
                  <Input
                    placeholder='Поиск ..'
                    theme={settings.theme}
                    autoFocus={true}
                    value={value}
                    onChange={({ target: { value } }) => onChange(value)}
                  >
                  </Input>
                  <Icon
                    onClick={() => setFocus(false) || onChange('')}
                    src={settings.theme === 'dark' ? miniDeleteIconDark : miniDeleteIconLight}
                  />
                </>
              )
              : (
                <>
                  <Label
                    theme={settings.theme}
                    style={{ marginLeft: isFocus ? '0px' : '15px' }}
                  >
                    Поиск
                  </Label>
                  <Icon src={settings.theme === 'dark' ? miniSearchIconDark : miniSearchIconLight} />
                </>
              )
        }
      </Center>
    </Body>
  )
})

export default Search
