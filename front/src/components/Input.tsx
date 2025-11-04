import React from 'react'


type prop={
  label?:string
  placeholder?:string
  onchange:(e:any)=>void
}


const Input = ({label, placeholder, onchange}:prop) => {

  return (
    <div className='flex flex-col items-start'>
      <label htmlFor={label}>{label}</label>
        <input onChange={(e)=>onchange(e)} type="text" placeholder={placeholder}/>
    </div>
  )
}

export default Input