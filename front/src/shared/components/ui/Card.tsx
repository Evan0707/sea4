import type { ReactNode } from 'react';

// ============================================
// Main Card Component
// ============================================

interface CardProps {
 children: ReactNode;
 className?: string;
 variant?: 'default' | 'highlight' | 'ghost';
 padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({
 children,
 className = '',
 variant = 'default',
 padding = 'md',
}: CardProps) => {
 const variants = {
  default: 'bg-bg-secondary border border-border',
  highlight: 'bg-gradient-to-br from-bg-primary to-bg-secondary/30 border border-border',
  ghost: 'bg-transparent border-none',
 };

 const paddings = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
 };

 const styles = `rounded-[var(--radius-lg)] shadow-sm ${variants[variant]} ${paddings[padding]} ${className}`;

 return <div className={styles}>{children}</div>;
};

// ============================================
// Sub-Components
// ============================================

export const CardHeader = ({
 children,
 className = '',
}: {
 children: ReactNode;
 className?: string;
}) => <div className={`flex flex-col space-y-1.5 mb-6 ${className}`}>{children}</div>;

export const CardTitle = ({
 children,
 className = '',
 as: Component = 'h3',
}: {
 children: ReactNode;
 className?: string;
 as?: 'h1' | 'h2' | 'h3' | 'h4';
}) => (
 <Component className={`text-2xl font-semibold leading-none tracking-tight text-text-primary ${className}`}>
  {children}
 </Component>
);

export const CardDescription = ({
 children,
 className = '',
}: {
 children: ReactNode;
 className?: string;
}) => <p className={`text-sm text-text-secondary ${className}`}>{children}</p>;

export const CardContent = ({
 children,
 className = '',
}: {
 children: ReactNode;
 className?: string;
}) => <div className={className}>{children}</div>;

export const CardFooter = ({
 children,
 className = '',
}: {
 children: ReactNode;
 className?: string;
}) => <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
