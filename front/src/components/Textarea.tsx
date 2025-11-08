import React from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

export type TextareaProps = {
  name: string
  label: string
  placeholder?: string
  className?: string
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  value?: string
  defaultValue?: string
  // accept a type prop to stay backward-compatible with existing usages,
  // but it's ignored since <textarea> doesn't support it
  type?: string
}

const Textarea: React.FC<TextareaProps> = ({
  name,
  label,
  placeholder,
  className,
  error,
  register,
  onChange,
  value,
  defaultValue,
}) => {
  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined

  // Merge RHF register and external props safely
  const reg = register ?? ({} as UseFormRegisterReturn)
  const mergedOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    reg.onChange?.(e)
    onChange?.(e)
  }
  // Only pass value/defaultValue when explicitly provided to avoid React controlled with undefined
  const controlProps: React.TextareaHTMLAttributes<HTMLTextAreaElement> = {
    ...(value !== undefined ? { value } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
  }

  return (
    <div className={`${className ?? ''}`}>
      <label className='m-1 font-bold text-[14px]' htmlFor={inputId}>{label}</label>
      <div className={`border-[1.5px] ${hasError ? 'border-red' : 'border-border'} flex items-center rounded-[6px] focus-within:border-primary focus-within:outline-[1px] outline-border justify-between mt-1 mb-0`}>
          <textarea
            id={inputId}
            placeholder={placeholder}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={`focus:outline-none relative min-h-[90px] p-2 flex-1`}
            onChange={mergedOnChange}
            {...controlProps}
            name={reg.name ?? name}
            onBlur={reg.onBlur}
            ref={reg.ref}
          />
      </div>
      {hasError && (
        <p id={describedBy} className='text-red text-[13px] font-semibold ml-1 mt-1 absolute b-0'>{error}</p>
      )}
    </div>
  )
}

export default Textarea