import styled from 'styled-components'

const SectionTitle = styled.div`
  user-select: none;
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 31px;
  line-height: 36px;
  text-align: center;
  color: ${props => props.theme === 'dark' ? '#141414' : '#ffffff'};
  text-shadow: ${props => props.theme === 'dark' ? '0px 2px 8px rgba(40, 40, 40, 0.15), 0px 0px 2px rgb(68, 68, 68, 0.30)' : '0px 2px 8px rgba(111, 111, 111, 0.15), 0px 0px 2px rgb(34, 34, 34, 0.30)'};
  margin-top: 8px;
  margin-bottom: 15px;
`

export default SectionTitle
