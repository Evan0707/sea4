import React from 'react';
import { cn } from '@/shared/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
 'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
 {
  variants: {
   variant: {
    default: 'bg-bg-secondary text-text-secondary border-border',
    success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/50',
    warning: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/50',
    danger: 'bg-red/8 text-red border-red/20',
    info: 'bg-primary/8 text-primary border-primary/20',
   },
  },
  defaultVariants: {
   variant: 'default',
  },
 }
);

type StatusVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
 status: string;
 className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
 default: 'bg-bg-primary text-text-primary border-gray-500',
 success: 'bg-bg-primary text-green-500 border-green-500',
 warning: 'bg-bg-primary text-blue-500 border-blue-500',
 danger: 'bg-bg-primary text-red-600 border-red-500',
 info: 'bg-bg-primary text-blue-500 border-blue-500',
};

// Helper function to guess variant from status text if not provided
const getVariantFromStatus = (status: string): StatusVariant => {
 const s = status.toLowerCase();
 if (s.includes('terminé') || s.includes('validé') || s.includes('complété')) return 'success';
 if (s.includes('cours') || s.includes('attente')) return 'info';
 if (s.includes('retard') || s.includes('erreur') || s.includes('annulé')) return 'danger';
 if (s.includes('venir') || s.includes('démarrage')) return 'warning';
 return 'default';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
 status,
 variant,
 className = '',
}) => {
 const finalVariant = variant || getVariantFromStatus(status);

 return (
  <span className={cn(badgeVariants({ variant: finalVariant }), className)}>
   {status}
  </span>
 );
};
