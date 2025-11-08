import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { User } from '../types/auth';
import type { ReactElement } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Logout,
  File,
  Plus,
  Grid,
  Users,
  Tool
} from '@mynaui/icons-react';
import Button from './Button';
import profile from "../assets/Profile.png";

interface NavItem {
  label: string;
  path: string;
  roles: string[];
  icon: ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  // Commercial Links
  { label: 'Accueil', path: '/commercial', roles: ['ROLE_COMMERCIAL'], icon: <Home size={20} /> },
  { label: 'Dossiers', path: '/commercial/dossiers', roles: ['ROLE_COMMERCIAL'], icon: <File size={20} /> },
  { label: 'Nouveau Dossier', path: '/commercial/nouveau-dossier', roles: ['ROLE_COMMERCIAL'], icon: <Plus size={20} /> },

  // Maitre d'oeuvre Links
  { label: 'Accueil', path: '/maitre-doeuvre', roles: ['ROLE_MAITRE_DOEUVRE'], icon: <Home size={20} /> },
  { label: 'Mes Dossiers', path: '/maitre-doeuvre/dossiers', roles: ['ROLE_MAITRE_DOEUVRE'], icon: <File size={20} /> },
  { label: 'Mes Projets', path: '/maitre-doeuvre/projets', roles: ['ROLE_MAITRE_DOEUVRE'], icon: <Grid size={20} /> },

  // Admin Links
  { label: 'Accueil', path: '/admin', roles: ['ROLE_ADMIN'], icon: <Home size={20} /> },
  { label: 'Dossiers', path: '/admin/dossiers', roles: ['ROLE_ADMIN'], icon: <File size={20} /> },
  { label: 'Projets', path: '/admin/projets', roles: ['ROLE_ADMIN'], icon: <Grid size={20} /> },
  { label: 'Utilisateurs', path: '/admin/utilisateurs', roles: ['ROLE_ADMIN'], icon: <Users size={20} /> },
  { label: 'Artisans', path: '/admin/artisans', roles: ['ROLE_ADMIN'], icon: <Tool size={20} /> },
];

interface DashboardLayoutProps {
  user: User | null;
  children: React.ReactNode;
}

export const DashboardLayout = ({ user, children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = NAV_ITEMS.filter(item => 
    user?.roles?.some(userRole => item.roles.includes(userRole))
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#FAFBFE] flex flex-col border-r-1 border-border text-white p-3">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black">Bati'Parti</h2>
        </div>
        <nav>
          <ul className="space-y-2">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block px-4 flex items-center py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-[#E4EEFE] border-1 border-[#C3DCFE] text-primary'
                      : 'text-placeholder hover:bg-[#E4EEFE]'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-6">
          <Button variant='Destructive' classname='w-full justify-start px-3' onClick={handleLogout}>
            <Logout size={24}/>
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        <header className='absolute right-10 top-6 flex items-center'>
          <div>
            <p className='text-lg font-bold'>{user?.username}</p>
            <p className='text-placeholder text-sm'>{user?.roles[0]}</p>
          </div>
          <img src={profile} className='ml-4' width={45} alt="" />
        </header>
        <div className="p-0">{children}</div>
      </div>
    </div>
  );
};