import { InfoCircleSolid, Calendar } from '@mynaui/icons-react'
import { useRef, useState, useEffect } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import Tooltip from './Tooltip'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Label } from './Typography'
import { cn } from '@/shared/lib/utils'

export type DateInputProps = {
  name: string
  label?: string
  placeholder?: string
  className?: string
  error?: string
  register?: UseFormRegisterReturn
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
  defaultValue?: string
  info?: boolean
  message?: string
  min?: string
  max?: string
  size?: 'small' | 'default'
  required?: boolean
}

const DateInput: React.FC<DateInputProps> = ({
  name,
  label,
  placeholder = 'Sélectionnez une date',
  className,
  error,
  register,
  onChange,
  value,
  defaultValue,
  info = false,
  message = '',
  min,
  max,
  size = 'default',
  required = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : defaultValue ? new Date(defaultValue) : null
  )
  const datePickerRef = useRef<ReactDatePicker>(null)

  useEffect(() => {
    if (value) setSelectedDate(new Date(value))
    else if (defaultValue) setSelectedDate(new Date(defaultValue))
  }, [value, defaultValue])

  const hasError = Boolean(error)
  const inputId = name || label
  const describedBy = hasError ? `${inputId}-error` : undefined
  const reg = register ?? ({} as UseFormRegisterReturn)

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd')
      const event = {
        target: { name: reg.name ?? name, value: formattedDate },
      } as React.ChangeEvent<HTMLInputElement>
      reg.onChange?.(event)
      onChange?.(event)
    }
  }

  const minDate = min ? new Date(min) : undefined
  const maxDate = max ? new Date(max) : undefined

  return (
    <div className={cn('relative w-full', size === 'small' && 'max-w-[300px]', className)}>
      {/* Label */}
      {(label || info) && (
        <div className="flex items-center mb-1.5">
          {label && (
            <Label weight="medium" className="text-text-primary whitespace-nowrap" htmlFor={inputId}>
              {label}
              {required && <span className="text-red ml-1">*</span>}
            </Label>
          )}
          {info && (
            <Tooltip content={message}>
              <InfoCircleSolid size={14} className="text-placeholder ml-1.5 cursor-help" />
            </Tooltip>
          )}
        </div>
      )}

      {/* Input wrapper */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 rounded-[var(--radius)] border bg-bg-primary transition-[border-color,box-shadow]',
          'focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary',
          hasError
            ? 'border-red focus-within:ring-red/25 focus-within:border-red'
            : 'border-border'
        )}
      >
        <ReactDatePicker
          ref={datePickerRef}
          id={inputId}
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          locale={fr}
          placeholderText={placeholder}
          minDate={minDate}
          maxDate={maxDate}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className="h-9 flex-1 bg-transparent text-sm text-text-primary placeholder:text-placeholder focus:outline-none w-full"
          calendarClassName="custom-datepicker"
          showPopperArrow={false}
          onBlur={reg.onBlur}
          popperClassName="!z-[100]"
        />
        <button
          type="button"
          onClick={() => datePickerRef.current?.setFocus()}
          className="shrink-0 p-0.5 text-placeholder hover:text-text-primary transition-colors"
          aria-label="Ouvrir le calendrier"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {hasError && (
        <p id={describedBy} className="mt-1.5 text-xs font-medium text-red">
          {error}
        </p>
      )}
    </div>
  )
}

export default DateInput
