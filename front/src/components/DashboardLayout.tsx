import { useNavigate } from 'react-router-dom';
import type { User } from '../types/auth';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS } from '../config/navigation';
import { Sidebar } from './layout/Sidebar';
import { HeaderBar } from './layout/HeaderBar';


interface DashboardLayoutProps {
  user: User | null;
  children: React.ReactNode;
}

export const DashboardLayout = ({ user, children }: DashboardLayoutProps) => {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} items={NAV_ITEMS} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 bg-white">
        <HeaderBar user={user} />
        <div className="p-0 relative">
            {children}
        </div>
      </div>
    </div>
  );
};