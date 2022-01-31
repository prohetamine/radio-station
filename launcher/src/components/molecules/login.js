import React from 'react'
import miniProfileIconLight from './../../../assets/svg/mini-profile-light.svg'
import miniProfileIconDark from './../../../assets/svg/mini-profile-dark.svg'

import Input from './../atoms/input'

const Login = (props) => (
  <Input
    type='login'
    {...props}
    icons={{
      light: miniProfileIconLight,
      dark: miniProfileIconDark
    }}
  />
)

export default Login
