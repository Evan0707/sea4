import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { NAV_ITEMS } from '@/shared/config/navigation';
import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';
import { AnimatePresence, motion } from 'framer-motion';


interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

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
        <div className="flex-1 overflow-hidden p-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="h-full overflow-auto"
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
