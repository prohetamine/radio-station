import React from 'react'
import miniSearchIconLight from './../../../assets/svg/mini-search-light.svg'
import miniSearchIconDark from './../../../assets/svg/mini-search-dark.svg'

import Input from './../atoms/input'

const Search = (props) => (
  <Input
    {...props}
    icons={{
      light: miniSearchIconLight,
      dark: miniSearchIconDark
    }}
  />
)

export default Search
