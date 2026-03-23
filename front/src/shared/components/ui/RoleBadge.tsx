import React from 'react';
import { cn } from '@/shared/lib/utils';

interface RoleBadgeProps {
  role: string | null | undefined;
  className?: string;
  showIcon?: boolean;
}

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  admin: { 
    label: 'Admin', 
    className: 'bg-red/8 text-red border-red/20' 
  },
  commercial: { 
    label: 'Commercial', 
    className: 'bg-orange-500/8 text-orange-700 border-orange-500/20' 
  },
  maitre_oeuvre: { 
    label: 'MOE', 
    className: 'bg-primary/8 text-primary border-primary/20' 
  },
  moe: { // Alias for maitre_oeuvre
    label: 'MOE', 
    className: 'bg-primary/8 text-primary border-primary/20' 
  }
};

/**
 * Standard badge for User Roles (Admin, Commercial, MOE).
 * Uses semantic colors and consistent border/background patterns.
 */
export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  // Normalize role string (remove ROLE_ prefix, lowercase)
  const key = role?.toLowerCase().replace('role_', '') ?? '';
  const config = ROLE_CONFIG[key];

  return (
    <span 
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border whitespace-nowrap transition-all duration-200',
        config?.className ?? 'bg-bg-secondary text-text-secondary border-border',
        className
      )}
    >
      {config?.label ?? role ?? '—'}
    </span>
  );
};

export default RoleBadge;
