import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  // Base
  'inline-flex items-center justify-center gap-2 font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  {
    variants: {
      variant: {
        Primary:
          'bg-primary text-white border border-primary hover:bg-primary-dark active:bg-primary-dark shadow-sm',
        Secondary:
          'bg-bg-primary text-text-primary border border-border hover:bg-bg-secondary active:bg-bg-tertiary shadow-sm',
        Destructive:
          'bg-red/8 text-red border border-red/20 hover:bg-red/15 active:bg-red/20',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-[var(--radius-sm)] min-w-[72px]',
        md: 'h-9 px-4 text-sm rounded-[var(--radius)] min-w-[100px]',
        lg: 'h-11 px-6 text-sm rounded-[var(--radius-lg)] min-w-[130px]',
      },
    },
    defaultVariants: {
      variant: 'Primary',
      size: 'sm',
    },
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: ReactNode
  classname?: string
  onClick?: () => void
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  icon?: React.ElementType
}

const Spinner = () => (
  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
)

const Button = ({
  children,
  variant,
  classname,
  onClick,
  loading = false,
  type = 'button',
  disabled = false,
  size,
  icon: Icon,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={loading ? undefined : onClick}
      disabled={loading || disabled}
      aria-busy={loading}
      className={cn(buttonVariants({ variant, size }), classname)}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {Icon && <Icon className="w-[16px] h-[16px] shrink-0" />}
          {children}
        </>
      )}
    </button>
  )
}

export default Button