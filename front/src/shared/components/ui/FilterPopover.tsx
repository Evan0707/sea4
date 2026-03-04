import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/utils'
import Button from './Button'
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
      ) setIsOpen(false)
    }
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
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
      setPosition({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX })
    }
    setIsOpen(!isOpen)
  }

  return (
    <>
      <div ref={buttonRef} onClick={handleToggle}>{trigger}</div>

      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={{ position: 'absolute', top: `${position.top}px`, left: `${position.left}px` }}
          className="z-[99999] bg-bg-primary rounded-[var(--radius-lg)] shadow-md border border-border p-4 min-w-[300px] animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <H3 className="mb-4">Filtres</H3>
          <div className="space-y-4">{children}</div>
          <div className="border-t border-border mt-4 pt-4 flex gap-3 justify-end">
            <Button variant="Secondary" size="sm" onClick={onReset}>{resetText}</Button>
            <Button variant="Primary" size="sm" onClick={() => { onApply?.(); setIsOpen(false) }}>{applyText}</Button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Radio ──────────────────────────────────────────────────────────────────
interface FilterRadioProps {
  label: string
  name: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

const FilterRadio = ({ label, name, options, value, onChange }: FilterRadioProps) => (
  <div>
    <Label className="block font-semibold mb-2">{label}</Label>
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2.5 cursor-pointer group">
          {/* Custom radio */}
          <div className="relative shrink-0">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="peer sr-only"
            />
            <div className={cn(
              'w-4 h-4 rounded-full border transition-colors',
              'flex items-center justify-center',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-1',
              value === option.value
                ? 'border-primary bg-primary'
                : 'border-border bg-bg-primary group-hover:border-primary/60'
            )}>
              {value === option.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
          </div>
          <Text variant="small" className="text-text-primary">{option.label}</Text>
        </label>
      ))}
    </div>
  </div>
)

// ── Checkbox ───────────────────────────────────────────────────────────────
interface FilterCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const FilterCheckbox = ({ label, checked, onChange }: FilterCheckboxProps) => (
  <label className="flex items-center gap-2.5 cursor-pointer group">
    <div className="relative shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <div className={cn(
        'w-4 h-4 rounded-[4px] border transition-colors flex items-center justify-center bg-bg-primary',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-1',
        checked
          ? 'border-primary bg-primary'
          : 'border-border group-hover:border-primary/60'
      )}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white stroke-current" viewBox="0 0 10 10" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1.5,5 4,7.5 8.5,2" />
          </svg>
        )}
      </div>
    </div>
    <Text variant="small" className="text-text-primary">{label}</Text>
  </label>
)

// ── Separator ──────────────────────────────────────────────────────────────
const FilterSeparator = () => <div className="border-t border-border my-2" />

// ── Range ──────────────────────────────────────────────────────────────────
interface FilterRangeProps {
  label: string
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  step?: number
  showValue?: boolean
}

const FilterRange = ({ label, min, max, value, onChange, step = 1, showValue = true }: FilterRangeProps) => {
  const percentage = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-text-primary font-semibold">{label}</Label>
      </div>
      <div className="relative pt-6 pb-2">
        {showValue && (
          <div
            className="absolute -top-1 -translate-x-1/2 transition-all duration-100"
            style={{ left: `${percentage}%` }}
          >
            <div className="bg-primary text-white px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap">{value}</div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary mx-auto" />
          </div>
        )}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-primary/15 rounded-full appearance-none cursor-pointer accent-primary"
        />
      </div>
      <div className="flex justify-between">
        <Text variant="caption" className="text-placeholder">{min}</Text>
        <Text variant="caption" className="text-placeholder">{max}</Text>
      </div>
    </div>
  )
}

FilterPopover.Radio = FilterRadio
FilterPopover.Checkbox = FilterCheckbox
FilterPopover.Separator = FilterSeparator
FilterPopover.Range = FilterRange

export default FilterPopover
