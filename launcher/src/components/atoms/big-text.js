import styled from 'styled-components'

const BigText = styled.div`
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 17px;
  line-height: 14px;
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#BDBDBD' : '#424242'};
`

export default BigText
