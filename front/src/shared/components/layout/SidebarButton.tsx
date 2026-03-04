import { Link } from 'react-router-dom';
import React from 'react';
import { cn } from '@/shared/lib/utils';

interface SidebarButtonProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SidebarButton: React.FC<SidebarButtonProps> = ({
  to,
  icon,
  label,
  collapsed = false,
  active = false,
  className = '',
  onClick,
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center overflow-hidden rounded-[var(--radius)] px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        collapsed ? 'justify-center' : 'justify-start gap-3',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-text-secondary hover:bg-border/30 hover:text-text-primary',
        className
      )}
    >
      <span className="w-5 h-5 shrink-0 flex items-center justify-center">{icon}</span>
      {!collapsed && (
        <span className={cn('whitespace-nowrap', active && 'font-semibold')}>{label}</span>
      )}
    </Link>
  );
};

export default SidebarButton;
