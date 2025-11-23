import React, { type ReactNode } from 'react'
import { DangerCircle, InfoCircleSolid } from '@mynaui/icons-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import Tooltip from './Tooltip'
import { Label } from './Typography'

export type InputProps = {
  name: string
  label?: string
  type: 'password' | 'text' | 'email'
  placeholder?: string
  className?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
  defaultValue?: string
  info?:boolean;
  message?:string;
  width?:string;
}

const Input: React.FC<InputProps> = ({
  name,
  label,
  type,
  placeholder,
  className,
  leftIcon,
  rightIcon,
  error,
  register,
  onChange,
  value,
  defaultValue,
  info=false,
  message='',
  width='w-full'
}) => {
  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined


  const reg = register ?? ({} as UseFormRegisterReturn)
  const mergedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    reg.onChange?.(e)
    onChange?.(e)
  }

  const controlProps: React.InputHTMLAttributes<HTMLInputElement> = {
    ...(value !== undefined ? { value } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
  }

  return (
    <div className={`${className ?? ''} relative ${width}`}>
      <div className='flex items-center'>
        {label&& <Label className='m-1 text-text-primary text-[14px]' weight='bold' htmlFor={inputId}>{label}</Label>}
        {info&&
          <Tooltip content={message}>
            <InfoCircleSolid size={14} className='text-text-secondary ml-1'/>
          </Tooltip>
        }
      </div>
      <div className={`border-[1px] ${hasError ? 'border-red' : 'border-border'} px-3 flex items-center rounded-[6px] focus-within:border-primary focus-within:outline-[1px] outline-border justify-between mt-1 mb-0 w-full"`}>
        <div className='flex flex-row items-center flex-1'>
          {leftIcon}
          <input
            id={inputId}
            type={type}
            placeholder={placeholder}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={`focus:outline-none h-[38px] ${leftIcon?'px-[10px]':'px-[0px]'} text-text-primary ml-1 flex-1 bg-transparent w-full placeholder-placeholder`}
            onChange={mergedOnChange}
            {...controlProps}
            name={reg.name ?? name}
            onBlur={reg.onBlur}
            ref={reg.ref}
          />
        </div>
        {rightIcon}
        {hasError && <DangerCircle aria-hidden className='text-red' />}
      </div>
      {hasError && (
        <p id={describedBy} className='text-red text-[13px] font-semibold ml-1 mt-1 absolute b-0'>{error}</p>
      )}
    </div>
  )
}

export default Input