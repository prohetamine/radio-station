import React, { useEffect } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import styled from 'styled-components'
import miniSearchIconLight from './../assets/mini-search-light.svg'
import miniSearchIconDark from './../assets/mini-search-dark.svg'
import miniDeleteIconLight from './../assets/mini-delete-light.svg'
import miniDeleteIconDark from './../assets/mini-delete-dark.svg'

const Body = styled.div`
  width: 100%;
  height: 46px;
  background: ${props => props.theme === 'dark' ? '#141414' : '#FFFFFF'};
  box-shadow: 0px 2px 6px rgba(115, 111, 111, 0.25);
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

const Search = ({ theme, type, value, onChange }) => {
  const [isFocus, setFocus] = useLocalStorageState(`focus-${type}`, false)

  return (
    <Body
      theme={theme}
      onClick={() => isFocus || setFocus(true)}
    >
      <Center style={{ justifyContent: isFocus ? 'space-between' : 'center' }}>
        {
            isFocus
              ? (
                <>
                  <Input
                    placeholder='Поиск ..'
                    theme={theme}
                    autoFocus={true}
                    value={value}
                    onChange={({ target: { value } }) => onChange(value)}
                  >
                  </Input>
                  <Icon
                    onClick={() => setFocus(false) || onChange('')}
                    src={theme === 'dark' ? miniDeleteIconDark : miniDeleteIconLight}
                  />
                </>
              )
              : (
                <>
                  <Label
                    theme={theme}
                    style={{ marginLeft: isFocus ? '0px' : '15px' }}
                  >
                    Поиск
                  </Label>
                  <Icon src={theme === 'dark' ? miniSearchIconDark : miniSearchIconLight} />
                </>
              )
        }
      </Center>
    </Body>
  )
}

export default Search
