import React from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

export type CheckboxProps = {
  name: string
  label: string
  className?: string
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (checked: boolean) => void
  checked?: boolean
  defaultChecked?: boolean
}

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label,
  className,
  error,
  register,
  onChange,
  checked,
  defaultChecked,
}) => {
  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined


  const reg = register ?? ({} as UseFormRegisterReturn)
  const mergedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    reg.onChange?.(e)
    onChange?.(e.target.checked)
  }


  const controlProps: React.InputHTMLAttributes<HTMLInputElement> = {
    ...(checked !== undefined ? { checked } : {}),
    ...(defaultChecked !== undefined ? { defaultChecked } : {}),
  }

  return (
    <div className={`${className ?? ''} flex items-center gap-2`}>
      <div className="relative flex items-center">
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={`
            w-5 h-5 cursor-pointer 
            border-[1.5px] ${hasError ? 'border-red' : 'border-border'} 
            rounded
            text-primary
            focus:ring-primary
            focus:ring-2
            focus:ring-offset-2
            bg-transparent
            accent-primary
          `}
          onChange={mergedOnChange}
          {...controlProps}
          name={reg.name ?? name}
          onBlur={reg.onBlur}
          ref={reg.ref}
        />
      </div>
      <label 
        htmlFor={inputId}
        className="cursor-pointer text-text-primary select-none text-[14px]"
      >
        {label}
      </label>
      {hasError && (
        <p id={describedBy} className='text-red text-[13px] font-semibold ml-1'>{error}</p>
      )}
    </div>
  )
}

export default Checkbox