import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

// ============================================
// Main Card Component
// ============================================

interface CardProps {
 children: ReactNode;
 className?: string;
 variant?: 'default' | 'highlight' | 'glass' | 'ghost';
 padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({
 children,
 className = '',
 variant = 'default',
 padding = 'md',
}: CardProps) => {
 const variants = {
  default: 'bg-bg-primary border border-border shadow-sm',
  highlight: 'bg-gradient-to-br from-bg-primary to-bg-secondary/60 border border-border shadow-sm',
  glass: 'bg-bg-secondary/50 backdrop-blur-md border border-border/50 shadow-md',
  ghost: 'bg-transparent border-none shadow-none',
 };

 const paddings = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
 };

 return (
  <div className={cn('rounded-[var(--radius-lg)]', variants[variant], paddings[padding], className)}>
   {children}
  </div>
 );
};

// ============================================
// Sub-Components
// ============================================

export const CardHeader = ({
  children,
  className = '',
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1.5 mb-6', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({
  children,
  className = '',
  as: Component = 'h3',
  ...props
}: {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
} & React.HTMLAttributes<HTMLHeadingElement>) => (
  <Component 
    className={cn('text-lg font-semibold leading-none tracking-tight text-text-primary', className)}
    {...props}
  >
    {children}
  </Component>
);

export const CardDescription = ({
  children,
  className = '',
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-text-secondary', className)} {...props}>{children}</p>
);

export const CardContent = ({
  children,
  className = '',
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
 children,
 className = '',
}: {
 children: ReactNode;
 className?: string;
}) => (
 <div className={cn('flex items-center pt-4 mt-4 border-t border-border/60', className)}>
  {children}
 </div>
);
