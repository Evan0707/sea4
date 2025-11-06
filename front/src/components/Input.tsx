import React, { type ReactNode } from 'react'

type props ={
    variant: 'Primary'|'Error'
    label: string
    placeholder: string
    classname?: string
    onChange:(e:any)=>void
    type:'password' | 'text' | 'email'
    lefIcon?:ReactNode
    rightIcon?:ReactNode
}

const Input = ({variant, label, placeholder, classname, onChange, type, lefIcon, rightIcon }: props) => {
  return (
        <div className={`${classname} max-w`} >
          <label htmlFor="">{label}</label>
          <div className='flex items-center'>
            {lefIcon}
            <input type={type} placeholder={placeholder}/>
            {rightIcon}
          </div>
        </div>
  )
}

export default Input