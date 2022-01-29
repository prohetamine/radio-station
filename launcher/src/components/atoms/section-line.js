import styled from 'styled-components'

const SectionLine = styled.div`
  width: 3px;
  min-width: 3px;
  margin-top: 10px;
  height: calc(100% - 20px);
  background: ${props => props.theme === 'dark' ? '#141414' : '#FFFFFF'};
  box-shadow: ${props => props.theme === 'dark' ? '0px 2px 8px rgba(40, 40, 40, 0.15), 0px 0px 2px rgb(68, 68, 68, 0.30)' : '0px 2px 8px rgba(111, 111, 111, 0.15), 0px 0px 2px rgb(34, 34, 34, 0.30)'};
  border-radius: 4px;
`

export default SectionLine
