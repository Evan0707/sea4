import { useLocation } from 'react-router-dom'
import SidebarButton from './SidebarButton'
import type { User } from '@/shared/types/auth'
import Button from '@/shared/components/ui/Button'
import { Logout, ChevronLeft, ChevronRight, CogFour } from '@mynaui/icons-react'
import type { NavItem } from '@/shared/config/navigation'
import Logo from '@/shared/assets/Logo.svg'
import { useState, useEffect } from 'react'
import ConfirmPopover from '../ui/ConfirmPopover'
import { H2 } from '../ui/Typography'

interface SidebarProps {
  user: User | null
  items: NavItem[]
  onLogout: () => void
  // mobile props
  mobileOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ user, items, onLogout, mobileOpen = false, onClose }: SidebarProps) {
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
    if (user?.roles?.includes('ROLE_MAITRE_OEUVRE')) return '/maitre-doeuvre/settings'
    if (user?.roles?.includes('ROLE_COMMERCIAL')) return '/commercial/settings'
    return '/settings'
  }

  const settingsPath = getSettingsPath()

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
    <>
      {/* Desktop sidebar (md+) */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} hidden lg:flex bg-bg-secondary h-screen sticky top-0 flex-col border-r border-border text-white p-3 transition-all duration-300 overflow-y-auto overflow-x-hidden`}>
        <div className={`mb-8 absolute flex items-center w-full mt-2 ${collapsed ? 'justify-center left-0' : 'left-5'}`}>
          <img src={Logo} width={35} className={collapsed ? '' : 'mr-3'} />
          {!collapsed && <H2 className='text-xl ml-3' weight='bold'>Bati'Parti</H2>}
          <button
            type="button"
            onClick={() => setCollapsed(v => !v)}
            className={`text-placeholder absolute top-[50%] translate-y-[-50%] transition-all duration-300 ${collapsed ? 'left-0 right-0 h-full top-0 bottom-0' : 'right-10'}`}
            aria-label={collapsed ? 'Étendre la barre latérale' : 'Réduire la barre latérale'}
            aria-keyshortcuts="Ctrl+B Meta+B"
            title={`${collapsed ? 'Étendre' : 'Réduire'} (Ctrl/Cmd+B)`}
          >
            {collapsed ? <ChevronRight strokeWidth={2} className='opacity-0' /> : <ChevronLeft strokeWidth={2} />}
          </button>
        </div>
        <nav>
          <ul className="space-y-1 mt-22">
            {filtered.map(item => (
              <li key={item.path}>
                <SidebarButton
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                  collapsed={collapsed}
                  active={
                    item.path === location.pathname ||
                    (location.pathname.startsWith(item.path) &&
                      !['/admin', '/commercial', '/maitre-doeuvre'].includes(item.path))
                  }
                />
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-6">
          <SidebarButton
            to={settingsPath}
            icon={<CogFour className='text-text-white' />}
            label="Paramètre"
            collapsed={collapsed}
            active={location.pathname === settingsPath}
            className="mb-2"
          />

          {collapsed ? (
            <ConfirmPopover
              title="Déconnexion"
              message="Voulez-vous vraiment vous déconnecter de votre session ?"
              onConfirm={onLogout}
              confirmText="Se déconnecter"
              cancelText="Annuler"
            >
              <button
                className="w-full flex items-center justify-center py-2 rounded-[var(--radius)] text-red hover:bg-red/8 transition-colors"
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

      {/* Mobile overlay sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? 'block' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        {/* backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => onClose?.()}
        />
        <aside className={`absolute left-0 top-0 bottom-0 w-64 bg-bg-secondary p-3 transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-8 flex items-center">
            <img src={Logo} width={35} className="mr-3" />
            <H2 className='text-xl ml-3' weight='bold'>Bati'Parti</H2>
            <button className="ml-auto p-2" onClick={() => onClose?.()} aria-label="Fermer le menu">✕</button>
          </div>
          <nav>
            <ul className="space-y-1 mt-2">
              {filtered.map(item => (
                <li key={item.path}>
                  <SidebarButton
                    to={item.path}
                    icon={item.icon}
                    label={item.label}
                    collapsed={false}
                    active={
                      item.path === location.pathname ||
                      (location.pathname.startsWith(item.path) &&
                        !['/admin', '/commercial', '/maitre-doeuvre'].includes(item.path))
                    }
                    onClick={() => onClose?.()}
                  />
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto pt-6">
            <SidebarButton
              to={settingsPath}
              icon={<CogFour className='text-text-white' />}
              label="Paramètre"
              collapsed={false}
              active={location.pathname === settingsPath}
              className="mb-2"
              onClick={() => onClose?.()}
            />
            <div className="mt-4">
              <ConfirmPopover
                title="Déconnexion"
                message="Voulez-vous vraiment vous déconnecter de votre session ?"
                onConfirm={() => { onClose?.(); onLogout(); }}
                confirmText="Se déconnecter"
                cancelText="Annuler"
              >
                <Button variant="Destructive" icon={Logout} >
                  Déconnexion
                </Button>
              </ConfirmPopover>
            </div>
          </div>
        </aside >
      </div >
    </>
  )
}
