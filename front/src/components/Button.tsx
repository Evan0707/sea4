import React, { type ReactNode } from 'react'

type props ={
    children : ReactNode
    variant: 'Primary'|'Secondary'|'Destructive'
    classname?: string
    onClick?:()=>void
}

const Button = ({children , variant, classname, onClick }: props) => {
  return (
        <button onClick={onClick} className={`${variant=='Primary'&& 'bg-primary text-white' || variant=='Secondary'&&'border-[1.5px] border-border bg-secondary text-black' || variant=='Destructive'&&'border-[1.5px] border-red bg-red-bg text-red'} ${classname} flex items-center space-x justify-center py-2 font-bold rounded-[6px] text-[14] hover:opacity-70`} >{children}</button>
  )
}

export default Button