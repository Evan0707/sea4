import React, { type ReactNode, useState } from 'react'
import { DangerCircle, InfoCircleSolid, Eye, EyeSlash } from '@mynaui/icons-react'
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
  onFocus?: () => void;

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
  width='w-full',
  onFocus
}) => {
  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined


  const reg = register ?? ({} as UseFormRegisterReturn)
  const mergedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    reg.onChange?.(e)
    onChange?.(e)
  }

  const [showPassword, setShowPassword] = useState(false)

  const controlProps: React.InputHTMLAttributes<HTMLInputElement> = {
    ...(value !== undefined ? { value } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
  }

  return (
    <div className={`${className ?? ''} relative ${width} mb-6`}>
      <div className='flex items-center'>
        {label&& <Label className='m-1 text-text-primary' weight='bold' htmlFor={inputId}>{label}</Label>}
        {info&&
          <Tooltip content={message}>
            <InfoCircleSolid size={14} className='text-text-secondary ml-1'/>
          </Tooltip>
        }
      </div>
        <div className={`border-[1px] ${hasError ? 'border-red' : 'border-border'} px-3 flex items-center rounded-[6px] focus-within:border-primary focus-within:outline-[1px] outline-border justify-between mt-1 mb-0 w-full`}>
        <div className='flex flex-row items-center flex-1'>
          {leftIcon}
          <input
            id={inputId}
            type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
            placeholder={placeholder}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={`focus:outline-none h-[38px] ${leftIcon?'px-[10px]':'px-[0px]'} text-text-primary ml-1 flex-1 bg-transparent w-full placeholder-placeholder`}
            onChange={mergedOnChange}
            onFocus={onFocus}
            {...controlProps}
            name={reg.name ?? name}
            onBlur={reg.onBlur}
            ref={reg.ref}
          />
        </div>
        <div className='flex items-center gap-2'>
          {rightIcon}
          {type === 'password' && (
            <button
              type='button'
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              onClick={() => setShowPassword((s) => !s)}
              className='p-1 text-text-secondary hover:text-text-primary'
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          )}
          {hasError && <DangerCircle aria-hidden={true} size={18} className='text-red' />}
      </div>
      {hasError && (
        <p id={describedBy} className='text-red text-[13px] font-semibold ml-1 mt-1 absolute bottom-[-20px] left-0'>{error}</p>
      )}
    </div>
    </div>
  )
}

export default Input