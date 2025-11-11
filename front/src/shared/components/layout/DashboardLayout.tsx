import { useNavigate } from 'react-router-dom';
import type { User } from '@/shared/types/auth';
import { useAuth } from '@/features/auth/context/AuthContext';
import { NAV_ITEMS } from '@/shared/config/navigation';
import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';


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
        <div className="p-0 relative z-0">
            {children}
        </div>
      </div>
    </div>
  );
};