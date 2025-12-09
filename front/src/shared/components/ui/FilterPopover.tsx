import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'
import { FilterOne } from '@mynaui/icons-react'
import { H3, Label, Text } from './Typography'

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
            className="z-99999 bg-bg-primary rounded-lg shadow-lg border border-border p-4 min-w-[300px] animate-in fade-in zoom-in-95 duration-200"
          >
            <H3 >Filtres</H3>
            
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
      <Label className="block text-sm font-semibold mb-2 mt-1">{label}</Label>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-text-primary border-border focus:ring-primary cursor-pointer accent-primary hover:scale-110 transition-all"
            />
            <Text variant='body' className="text-sm text-text-primary">{option.label}</Text>
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
    <Label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-primary border-border rounded focus:ring-primary cursor-pointer accent-primary hover:scale-110 transition-all"
      />
      <Text className="text-sm font-medium">{label}</Text>
    </Label>
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
  // Calculer la position du tooltip en pourcentage
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm text-text-primary font-semibold">{label}</Label>
      </div>
      <div className="relative pt-6 pb-2">
        {/* Tooltip qui suit le curseur */}
        {showValue && (
          <div 
            className="absolute -top-1 transform -translate-x-1/2 transition-all duration-100"
            style={{ left: `${percentage}%` }}
          >
            <div className="bg-primary text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
              {value}
            </div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary mx-auto"></div>
          </div>
        )}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>
      <div className="flex justify-between text-xs text-placeholder mt-1">
        <Text variant='small'>{min}</Text>
        <Text variant='small'>{max}</Text>
      </div>
    </div>
  )
}

FilterPopover.Radio = FilterRadio
FilterPopover.Checkbox = FilterCheckbox
FilterPopover.Separator = FilterSeparator
FilterPopover.Range = FilterRange

export default FilterPopover
