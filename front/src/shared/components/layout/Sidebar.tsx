import { Link, useLocation } from 'react-router-dom'
import type { User } from '@/shared/types/auth'
import Button from '@/shared/components/ui/Button'
import { Logout, SidebarSolid, SidebarAltSolid, CogFour } from '@mynaui/icons-react'
import type { NavItem } from '@/shared/config/navigation'
import Logo from '@/shared/assets/Logo.svg'
import { useState, useEffect } from 'react'
import ConfirmPopover from '../ui/ConfirmPopover'
import { H2 } from '../ui/Typography'

interface SidebarProps {
  user: User | null
  items: NavItem[]
  onLogout: () => void
}

export function Sidebar({ user, items, onLogout }: SidebarProps) {
  const location = useLocation()
  const filtered = items.filter(item => user?.roles?.some(r => item.roles.includes(r)))

    const [collapsed, setCollapsed] = useState(
        () => localStorage.getItem('sidebar:collapsed') === '1'
    )

    useEffect(() => {
        localStorage.setItem('sidebar:collapsed', collapsed ? '1' : '0')
    }, [collapsed])

  // Déterminer le chemin settings basé sur le rôle
  const getSettingsPath = () => {
    if (user?.roles?.includes('ROLE_ADMIN')) return '/admin/settings'
    if (user?.roles?.includes('ROLE_MAITRE_DOEUVRE')) return '/maitre-doeuvre/settings'
    if (user?.roles?.includes('ROLE_COMMERCIAL')) return '/commercial/settings'
    return '/settings'
  }

  const settingsPath = getSettingsPath()


  // Keyboard shortcut: Ctrl/Cmd + B pour toggle sidebar 
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const modifier = isMac ? e.metaKey : e.ctrlKey
      if (modifier && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault()
        setCollapsed(v => !v)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-bg-secondary h-screen sticky top-0 flex flex-col border-r-1 border-border text-white p-3 transition-all duration-300 overflow-y-auto`}> 
      <button
        type="button"
        onClick={() => setCollapsed(v => !v)}
        className="text-placeholder absolute right-7 top-3"
        aria-label={collapsed ? 'Étendre la barre latérale' : 'Réduire la barre latérale'}
        aria-keyshortcuts="Ctrl+B Meta+B"
        title={`${collapsed ? 'Étendre' : 'Réduire'} (Ctrl/Cmd+B)`}
      >
        {collapsed ? <SidebarAltSolid /> : <SidebarSolid />}
      </button>
      <div className={`mb-8 absolute left-5 flex items-center mt-8 ${collapsed ? 'justify-center' : ''}`}>
        <img src={Logo} width={35} className={collapsed ? '' : 'mr-3'} />
        {!collapsed && <H2 className='text-xl ml-3' weight='bold'>Bati'Parti</H2>}
      </div>
      <nav>
        <ul className="space-y-1 mt-22">
          {filtered.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`px-3 flex overflow-hidden justify-start items-center py-[12px] rounded-[6px] transition-colors border-1 ${
                  location.pathname === item.path
                    ? 'bg-primary/10 border-primary text-text-primary text-[14px] font-medium'
                    : 'text-text-secondary font-medium text-[14px] hover:bg-primary/5 border-transparent'
                }`}
              >
                <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{item.icon}</span>
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-6">
        <Link
          to={settingsPath}
          className={`px-3 flex overflow-hidden justify-start items-center py-[12px] rounded-[6px] mb-2 transition-colors border-1 ${
            location.pathname === settingsPath
              ? 'bg-primary/10 border-primary text-text-primary text-[14px] font-medium'
              : 'text-text-secondary font-medium text-[14px] hover:bg-primary/5 border-transparent'
          }`}
        >
          <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}><CogFour className='text-text-white'/></span>
          {!collapsed && <span className="whitespace-nowrap">Paramètre</span>}
        </Link>

        {collapsed ? (
          <ConfirmPopover
            title="Déconnexion"
            message="Voulez-vous vraiment vous déconnecter de votre session ?"
            onConfirm={onLogout}
            confirmText="Se déconnecter"
            cancelText="Annuler"
          >
            <button
              className="w-full flex items-center justify-center py-2 rounded-lg text-red-600 hover:bg-red-50"
              aria-label="Déconnexion"
              title="Déconnexion"
            >
              <Logout size={24} />
            </button>
          </ConfirmPopover>
        ) : (
          <ConfirmPopover
            title="Déconnexion"
            message="Voulez-vous vraiment vous déconnecter de votre session ?"
            onConfirm={onLogout}
            confirmText="Se déconnecter"
            cancelText="Annuler"
          >
            <Button variant="Destructive" classname="w-full justify-start px-3 overflow-hidden">
              <Logout size={24} />
              Déconnexion
            </Button>
          </ConfirmPopover>
        )}
      </div>
    </aside>
  )
}
