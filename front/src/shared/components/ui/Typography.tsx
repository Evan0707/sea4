import { type ReactNode } from 'react'
import { tokens } from '@/shared/styles/tokens'

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
type TextVariant = 'body' | 'small' | 'caption' | 'lead'
type TextAlign = 'left' | 'center' | 'right' | 'justify'
type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'

interface BaseTypographyProps {
  children: ReactNode
  className?: string
  align?: TextAlign
  weight?: TextWeight
  color?: string
  onClick?: () => void
}

interface HeadingProps extends BaseTypographyProps {
  level?: HeadingLevel
}

// Composant Heading (H1-H6)
export const Heading = ({
  level = 1,
  children,
  className = '',
  align = 'left',
  weight,
  color = tokens.colors.black,
  onClick,
}: HeadingProps) => {
  const baseStyles = `font-bold text-${align}`
  
  const sizes = {
    1: 'text-4xl leading-tight',     // 36px
    2: 'text-3xl leading-tight',     // 30px
    3: 'text-2xl leading-snug',      // 24px
    4: 'text-xl leading-snug',       // 20px
    5: 'text-lg leading-normal',     // 18px
    6: 'text-base leading-normal',   // 16px
  }
  
  const weights = {
    1: weight || 'extrabold',
    2: weight || 'bold',
    3: weight || 'bold',
    4: weight || 'semibold',
    5: weight || 'semibold',
    6: weight || 'medium',
  }
  
  const weightClass = `font-${weights[level]}`
  const sizeClass = sizes[level]
  
  const classNames = `${baseStyles} ${sizeClass} ${weightClass} ${className}`
  const style = { color }
  const props = { className: classNames, style, onClick }
  
  switch (level) {
    case 1:
      return <h1 {...props}>{children}</h1>
    case 2:
      return <h2 {...props}>{children}</h2>
    case 3:
      return <h3 {...props}>{children}</h3>
    case 4:
      return <h4 {...props}>{children}</h4>
    case 5:
      return <h5 {...props}>{children}</h5>
    case 6:
      return <h6 {...props}>{children}</h6>
    default:
      return <h1 {...props}>{children}</h1>
  }
}

// Composants individuels pour faciliter l'utilisation
export const H1 = (props: Omit<HeadingProps, 'level'>) => <Heading level={1} {...props} />
export const H2 = (props: Omit<HeadingProps, 'level'>) => <Heading level={2} {...props} />
export const H3 = (props: Omit<HeadingProps, 'level'>) => <Heading level={3} {...props} />
export const H4 = (props: Omit<HeadingProps, 'level'>) => <Heading level={4} {...props} />
export const H5 = (props: Omit<HeadingProps, 'level'>) => <Heading level={5} {...props} />
export const H6 = (props: Omit<HeadingProps, 'level'>) => <Heading level={6} {...props} />

// Composant Text
interface TextProps extends BaseTypographyProps {
  variant?: TextVariant
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  as?: 'p' | 'span' | 'div' | 'label'
}

export const Text = ({
  variant = 'body',
  children,
  className = '',
  align = 'left',
  weight = 'normal',
  color = tokens.colors.gray[900],
  italic = false,
  underline = false,
  strikethrough = false,
  as: Component = 'p',
}: TextProps) => {
  const variants = {
    lead: 'text-xl leading-relaxed',      // 20px
    body: 'text-base leading-normal',     // 16px
    small: 'text-sm leading-normal',      // 14px
    caption: 'text-xs leading-normal',    // 12px
  }
  
  const styles = [
    variants[variant],
    `text-${align}`,
    `font-${weight}`,
    italic && 'italic',
    underline && 'underline',
    strikethrough && 'line-through',
    className,
  ].filter(Boolean).join(' ')
  
  return (
    <Component className={styles} style={{ color }}>
      {children}
    </Component>
  )
}

// Composant Label
interface LabelProps extends BaseTypographyProps {
  htmlFor?: string
  required?: boolean
}

export const Label = ({
  children,
  className = '',
  weight = 'medium',
  color = tokens.colors.gray[700],
  htmlFor,
  required = false,
}: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-${weight} ${className}`}
      style={{ color }}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

// Composant Link
interface LinkProps extends BaseTypographyProps {
  href?: string
  onClick?: () => void
  underline?: boolean
  external?: boolean
}

export const Link = ({
  children,
  className = '',
  weight = 'medium',
  color = tokens.colors.primary,
  href,
  onClick,
  underline = true,
  external = false,
}: LinkProps) => {
  const styles = [
    'text-base',
    `font-${weight}`,
    underline && 'underline',
    'hover:opacity-80',
    'transition-opacity',
    'cursor-pointer',
    className,
  ].filter(Boolean).join(' ')
  
  const externalProps = external ? {
    target: '_blank',
    rel: 'noopener noreferrer',
  } : {}
  
  if (href) {
    return (
      <a 
        href={href} 
        className={styles} 
        style={{ color }}
        {...externalProps}
      >
        {children}
      </a>
    )
  }
  
  return (
    <button
      onClick={onClick}
      className={styles}
      style={{ color }}
      type="button"
    >
      {children}
    </button>
  )
}
