import { Link } from 'react-router-dom';
import React from 'react';

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
      className={`px-3 flex overflow-hidden justify-start items-center py-2 rounded-[6px] transition-colors ${
        active
          ? 'bg-border/45 text-text-primary text-[14px] font-medium'
          : 'text-text-secondary font-medium text-[14px] hover:bg-border/30 border-transparent'
      } ${className}`}
      onClick={onClick}
    >
      <span className={collapsed ? 'mx-auto' : 'mr-3'}>{icon}</span>
      {!collapsed && <span className={`whitespace-nowrap ${active && 'font-bold'}`}>{label}</span>}
    </Link>
  );
};

export default SidebarButton;
