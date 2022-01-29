import styled from 'styled-components'

const SmallText = styled.div`
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#A2A2A2' : '#848484' };
  height: 7px;
`

export default SmallText
