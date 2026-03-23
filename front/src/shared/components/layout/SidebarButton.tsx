import { Link } from 'react-router-dom';
import React from 'react';
import { cn } from '@/shared/lib/utils';
import { motion } from 'framer-motion';

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
        'group relative flex items-center rounded-[var(--radius)] px-2.5 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        collapsed ? 'justify-center' : 'justify-start gap-3',
        active
          ? 'text-primary font-semibold'
          : 'text-text-secondary hover:bg-border/30 hover:text-text-primary',
        className
      )}
    >
      {/* Active Background Animation (Framer Motion) */}
      {active && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0 rounded-[var(--radius)] bg-primary/10"
          initial={false}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {/* Active left-border accent */}
      {active && !collapsed && (
        <motion.span
          layoutId="sidebar-active-border"
          className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r-full bg-primary z-10"
          initial={false}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      <span className={cn(
        'relative z-10 w-5 h-5 shrink-0 flex items-center justify-center transition-transform duration-150',
        active ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary',
        !active && 'group-hover:scale-105',
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
