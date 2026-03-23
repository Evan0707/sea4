import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  // Base
  'inline-flex items-center justify-center gap-2 font-semibold cursor-pointer transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        Primary:
          'bg-linear-to-b from-[#5b5cf6] to-[#4040f2] text-white border border-[#2b2ba1] shadow-[0_1px_1px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-[#6364f7] hover:to-[#4546f3] active:scale-[0.98] transition-all duration-200',
        Secondary:
          'bg-bg-primary text-text-primary border-border shadow-sm hover:bg-bg-secondary active:scale-[0.98] transition-all duration-200',
        Destructive:
          'bg-red/8 text-red border border-red/20 hover:bg-red/15 active:bg-red/20',
        Ghost:
          'bg-transparent text-text-secondary border border-transparent hover:bg-bg-secondary hover:text-text-primary active:bg-bg-tertiary',
        Link:
          'bg-transparent text-primary border-none hover:underline underline-offset-4 p-0 h-auto min-w-0 shadow-none active:scale-100',
      },
      size: {
        sm: 'h-8  px-3   text-xs  rounded-[var(--radius-sm)] min-w-[72px]',
        md: 'h-9  px-4   text-sm  rounded-[var(--radius)]    min-w-[100px]',
        lg: 'h-10 px-5   text-sm  rounded-[var(--radius-lg)] min-w-[130px]',
        icon: 'h-8  w-8    text-sm  rounded-[var(--radius-sm)] min-w-0 p-0',
      },
    },
    defaultVariants: {
      variant: 'Primary',
      size: 'sm',
    },
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children?: ReactNode
  className?: string
  onClick?: () => void
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  icon?: React.ElementType
  iconRight?: React.ElementType
}

const Spinner = () => (
  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
)

const Button = ({
  children,
  variant,
  className,
  onClick,
  loading = false,
  type = 'button',
  disabled = false,
  size,
  icon: IconLeft,
  iconRight: IconRight,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={loading ? undefined : onClick}
      disabled={loading || disabled}
      aria-busy={loading}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {IconLeft && <IconLeft className="w-[15px] h-[15px] shrink-0" />}
          {children}
          {IconRight && <IconRight className="w-[15px] h-[15px] shrink-0" />}
        </>
      )}
    </button>
  )
}

export default Button
export { buttonVariants }
