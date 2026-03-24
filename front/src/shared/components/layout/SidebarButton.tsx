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
        'group relative flex items-center rounded-[var(--radius)] px-2.5 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        collapsed ? 'justify-center' : 'justify-start gap-3',
        active
          ? 'text-text-primary font-semibold'
          : 'text-text-secondary hover:bg-border/30 hover:text-text-primary',
        className
      )}
    >
      {/* Active Background */}
      {active && (
        <div
          className="absolute inset-0 rounded-[var(--radius)] bg-bg-primary border-[1px] border-b-[1.5px] border-text-secondary/30"
        />
      )}

      <span className={cn(
        'relative z-10 w-5 h-5 shrink-0 flex items-center justify-center',
        active ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary',
      )}>
        {icon}
      </span>

      {!collapsed && (
        <span className="relative z-10 truncate">{label}</span>
      )}
    </Link>
  );
};

export default SidebarButton;
