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
  margin-top: 8px;
  margin-bottom: 15px;
`

export default SectionTitle
