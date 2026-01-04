import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { NAV_ITEMS } from '@/shared/config/navigation';
import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';


interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar handles desktop + mobile internally */}
      <Sidebar user={user} items={NAV_ITEMS} onLogout={handleLogout} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-bg-primary h-full overflow-hidden">
        <HeaderBar user={user} onMenu={() => setMobileOpen(true)} />
        <div className="flex-1 overflow-auto p-0 relative">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};