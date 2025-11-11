import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'
import { FilterOne } from '@mynaui/icons-react'

interface FilterPopoverProps {
  trigger: ReactNode
  children: ReactNode
  onApply?: () => void
  onReset?: () => void
  applyText?: string
  resetText?: string
}

const FilterPopover = ({
  trigger,
  children,
  onApply,
  onReset,
  applyText = 'Appliquer',
  resetText = 'Réinitialiser',
}: FilterPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      })
    }
    setIsOpen(!isOpen)
  }

  const handleApply = () => {
    onApply?.()
    setIsOpen(false)
  }

  const handleReset = () => {
    onReset?.()
  }

  return (
    <>
      <div ref={buttonRef} onClick={handleToggle}>
        <FilterOne size={28}/>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'absolute',
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
            className="z-[99999] bg-white rounded-lg shadow-lg border border-border p-4 min-w-[300px] animate-in fade-in zoom-in-95 duration-200"
          >
            <h3 className="font-bold text-[16px] text-black mb-4">Filtres</h3>
            
            <div className="space-y-4 mb-4">
              {children}
            </div>
            <FilterSeparator/>
            <div className="flex gap-3 justify-end pt-4  border-border">
              <Button variant="Secondary" onClick={handleReset} classname="px-4 py-2">
                {resetText}
              </Button>
              <Button variant="Primary" onClick={handleApply} classname="px-4 py-2">
                {applyText}
              </Button>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

// Radio Component
interface FilterRadioProps {
  label: string
  name: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

const FilterRadio = ({ label, name, options, value, onChange }: FilterRadioProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-primary border-border focus:ring-primary cursor-pointer"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

// Checkbox Component
interface FilterCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const FilterCheckbox = ({ label, checked, onChange }: FilterCheckboxProps) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-primary border-border rounded focus:ring-primary cursor-pointer"
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  )
}

// Separator Component
const FilterSeparator = () => {
  return <div className="border-t-[1.5px] border-border my-2" />
}

// Range Component
interface FilterRangeProps {
  label: string
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  step?: number
  showValue?: boolean
}

const FilterRange = ({ 
  label, 
  min, 
  max, 
  value, 
  onChange, 
  step = 1,
  showValue = true 
}: FilterRangeProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold">{label}</label>
        {showValue && <span className="text-sm text-placeholder">{value}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs text-placeholder mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

FilterPopover.Radio = FilterRadio
FilterPopover.Checkbox = FilterCheckbox
FilterPopover.Separator = FilterSeparator
FilterPopover.Range = FilterRange

export default FilterPopover
