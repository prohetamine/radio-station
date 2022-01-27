import styled from 'styled-components'

const SectionLine = styled.div`
  width: 3px;
  min-width: 3px;
  margin-top: 10px;
  height: calc(100% - 20px);
  background: ${props => props.theme === 'dark' ? '#141414' : '#FFFFFF'};
  border-radius: 4px;
`

export default SectionLine
