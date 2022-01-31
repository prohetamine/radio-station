import React from 'react'
import miniLockIconLight from './../../../assets/svg/mini-lock-light.svg'
import miniLockIconDark from './../../../assets/svg/mini-lock-dark.svg'

import Input from './../atoms/input'

const Password = (props) => (
  <Input
    type='password'
    {...props}
    icons={{
      light: miniLockIconLight,
      dark: miniLockIconDark
    }}
  />
)

export default Password
