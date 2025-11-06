import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Plus } from '@mynaui/icons-react'

import './App.css'
import Button from './components/Button'
import Input from './components/Input'

function App() {

  return (
    <>
      <Button variant='Secondary' classname='w-60'><Plus/> Click</Button>
      <Input onChange={(e)=>{}} placeholder='Hello' label='Hello' type='password' variant='Primary' />
    </>
  )
}

export default App
