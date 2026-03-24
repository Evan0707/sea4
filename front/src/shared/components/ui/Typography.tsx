import { type ReactNode } from 'react'
import { tokens } from '@/shared/styles/tokens'
import { cn } from '@/shared/lib/utils'

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
type TextVariant = 'body' | 'small' | 'caption' | 'lead'
type TextAlign = 'left' | 'center' | 'right' | 'justify'
type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'

const alignMap: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
}

const weightMap: Record<TextWeight, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
}

interface BaseTypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode
  className?: string
  align?: TextAlign
  weight?: TextWeight
  color?: string
}

interface HeadingProps extends BaseTypographyProps {
  level?: HeadingLevel
}

const headingSizes: Record<HeadingLevel, string> = {
  1: 'text-4xl leading-tight',
  2: 'text-3xl leading-tight',
  3: 'text-2xl leading-snug',
  4: 'text-xl leading-snug',
  5: 'text-lg leading-normal',
  6: 'text-base leading-normal',
}

const headingDefaultWeights: Record<HeadingLevel, TextWeight> = {
  1: 'extrabold',
  2: 'bold',
  3: 'bold',
  4: 'semibold',
  5: 'semibold',
  6: 'medium',
}

export const Heading = ({
  level = 1,
  children,
  className = '',
  align = 'left',
  weight,
  ...props
}: HeadingProps) => {
  const resolvedWeight = weight || headingDefaultWeights[level]
  const Component = `h${level}` as const

  return (
    <Component
      className={cn(
        headingSizes[level],
        alignMap[align],
        weightMap[resolvedWeight],
        'text-text-primary',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
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

const textVariants: Record<TextVariant, string> = {
  lead: 'text-xl leading-relaxed',
  body: 'text-base leading-normal',
  small: 'text-sm leading-normal',
  caption: 'text-xs leading-normal',
}

const textDefaultColors: Record<TextVariant, string> = {
  lead: 'text-text-primary',
  body: 'text-text-primary',
  small: 'text-text-secondary',
  caption: 'text-text-secondary',
}

export const Text = ({
  variant = 'body',
  color,
  children,
  className = '',
  align = 'left',
  weight = 'normal',
  italic = false,
  underline = false,
  strikethrough = false,
  as: Component = 'p',
  ...props
}: TextProps) => {
  return (
    <Component
      className={cn(
        textVariants[variant],
        !color && textDefaultColors[variant],
        alignMap[align],
        weightMap[weight],
        italic && 'italic',
        underline && 'underline',
        strikethrough && 'line-through',
        className,
      )}
      style={color ? { color } : undefined}
      {...props}
    >
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
  htmlFor,
  required = false,
}: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('text-sm text-text-primary', weightMap[weight], className)}
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
  const styles = cn(
    'text-base',
    weightMap[weight],
    underline && 'underline',
    'hover:opacity-80 transition-opacity cursor-pointer',
    className,
  )
  
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
