import React from 'react';
import { cn } from '@/shared/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-bg-secondary  text-text-secondary border-border',
        success: 'bg-green-500/8   text-green-700    border-green-500/20',
        warning: 'bg-orange-500/8  text-orange-700   border-orange-500/20',
        danger:  'bg-red/8         text-red           border-red/20',
        info:    'bg-primary/8     text-primary       border-primary/20',
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
  /** Show animated dot indicator (default: true) */
  dot?: boolean;
}


// Helper function to guess variant from status text if not provided
const getVariantFromStatus = (status: string): StatusVariant => {
    const s = status.toLowerCase();
  if (s.includes('terminé') || s.includes('validé') || s.includes('complété') || s.includes('réglé')) return 'success';
  if (s.includes('cours') || s.includes('chantier')) return 'info';
  if (s.includes('retard') || s.includes('erreur') || s.includes('annulé')) return 'danger';
  if (s.includes('venir') || s.includes('démarrage') || s.includes('attente')) return 'warning';
  return 'default';
};

const isPulsingStatus = (status: string): boolean => {
  const s = status.toLowerCase();
  return s.includes('cours') || s.includes('chantier')

};

const dotColor: Record<StatusVariant, string> = {
  default: 'bg-text-secondary/60',
  success: 'bg-green-500',
  warning: 'bg-orange-500',
  danger:  'bg-red',
  info:    'bg-primary',
}



export const StatusBadge: React.FC<StatusBadgeProps> = ({status,variant,className = '',dot = true,}) => {
    const finalVariant = variant || getVariantFromStatus(status);
  const pulse = isPulsingStatus(status);

  return (
    <span className={cn(badgeVariants({ variant: finalVariant }), className)}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-70', dotColor[finalVariant])} />
          )}
          <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', dotColor[finalVariant])} />
        </span>
      )}
      {status}
    </span>
  );
}