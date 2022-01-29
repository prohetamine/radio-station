import styled from 'styled-components'

const MiddleText = styled.div`
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#AFAFAF' : '#505050'};
  height: 12px;
`

export default MiddleText
