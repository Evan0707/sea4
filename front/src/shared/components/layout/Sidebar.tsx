import { useLocation } from 'react-router-dom'
import SidebarButton from './SidebarButton'
import type { User, UserProfile } from '@/shared/types/auth'
import { Logout, CogFour, ChevronLeft, ChevronRight } from '@mynaui/icons-react'
import type { NavItem } from '@/shared/config/navigation'
import Logo from '@/shared/assets/Logo.svg'
import { useState, useEffect } from 'react'
import ConfirmPopover from '../ui/ConfirmPopover'
import { Avatar } from '../ui/Avatar'
import { formatRole } from '@/shared/utils/formatters'
import { cn } from '@/shared/lib/utils'

interface SidebarProps {
  user: User | UserProfile | null
  items: NavItem[]
  onLogout: () => void
  mobileOpen?: boolean
  onClose?: () => void
}

function SidebarContent({
  user,
  items,
  onLogout,
  collapsed = false,
  onClose,
  onToggleCollapse,
}: SidebarProps & { collapsed?: boolean; onToggleCollapse?: () => void }) {
  const location = useLocation()
  const filtered = items.filter(item => user?.roles?.some(r => item.roles.includes(r)))

  const getSettingsPath = () => {
    if (user?.roles?.includes('ROLE_ADMIN')) return '/admin/settings'
    if (user?.roles?.includes('ROLE_MAITRE_OEUVRE')) return '/maitre-doeuvre/settings'
    if (user?.roles?.includes('ROLE_COMMERCIAL')) return '/commercial/settings'
    return '/settings'
  }
  const settingsPath = getSettingsPath()

  const userProfile = user as UserProfile | null;
  const displayName = userProfile?.prenom || userProfile?.nom
    ? `${userProfile?.prenom ?? ''} ${userProfile?.nom ?? ''}`.trim()
    : userProfile?.username ?? ''

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Logo / Brand ──────────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-2.5 px-3 py-4 border-b border-border/60',
        collapsed && 'justify-center'
      )}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ">
          <img src={Logo} width={20} className="" alt="Logo" />
        </div>
        {!collapsed && (
          <span className="font-bold text-base text-text-primary tracking-tight">Bati'Parti</span>
        )}
        {onToggleCollapse && !collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="ml-auto p-1 rounded-md text-placeholder hover:bg-bg-tertiary hover:text-text-primary transition-colors"
            aria-label="Réduire la barre latérale"
            title="Réduire (Ctrl/Cmd+B)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {onToggleCollapse && collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-placeholder hover:bg-bg-tertiary hover:text-text-primary transition-colors"
            aria-label="Étendre la barre latérale"
            title="Étendre (Ctrl/Cmd+B)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        <ul className="space-y-0.5">
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
                onClick={() => onClose?.()}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Bottom section ────────────────────────────────────── */}
      <div className="border-t border-border/60 px-2 py-3 space-y-0.5">
        <SidebarButton
          to={settingsPath}
          icon={<CogFour className="w-5 h-5" />}
          label="Paramètres"
          collapsed={collapsed}
          active={location.pathname === settingsPath}
          onClick={() => onClose?.()}
        />

        <ConfirmPopover
          title="Déconnexion"
          message="Voulez-vous vraiment vous déconnecter ?"
          onConfirm={() => { onClose?.(); onLogout(); }}
          confirmText="Se déconnecter"
          cancelText="Annuler"
        >
          <button
            className={cn(
              'w-full flex items-center rounded-[var(--radius)] px-2.5 py-2 text-sm font-medium transition-all duration-150',
              'text-red/80 hover:bg-red/8 hover:text-red',
              collapsed ? 'justify-center' : 'gap-3'
            )}
            title={collapsed ? 'Déconnexion' : undefined}
          >
            <Logout className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </ConfirmPopover>
      </div>

      {/* ── User profile ──────────────────────────────────────── */}
      {!collapsed && user && (
        <div className="border-t border-border/60 px-3 py-3">
          <div className="flex items-center gap-2.5 py-1.5 px-1 rounded-[var(--radius)] hover:bg-bg-tertiary transition-colors cursor-default">
            <Avatar
              size="sm"
              fallback={displayName}
              className="shrink-0 ring-1 ring-border/40"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-placeholder truncate leading-tight mt-0.5">
                {user?.roles?.[0] ? formatRole(user.roles[0]) : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed: show avatar only */}
      {collapsed && user && (
        <div className="border-t border-border/60 px-2 py-3 flex justify-center">
          <Avatar
            size="sm"
            fallback={displayName}
            className="ring-1 ring-border/40"
            title={displayName}
          />
        </div>
      )}
    </div>
  )
}

export function Sidebar({ user, items, onLogout, mobileOpen = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar:collapsed') === '1'
  )

  useEffect(() => {
    localStorage.setItem('sidebar:collapsed', collapsed ? '1' : '0')
  }, [collapsed])

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
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-bg-secondary h-screen sticky top-0 border-r border-border transition-all duration-300 overflow-hidden',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}>
        <SidebarContent
          user={user}
          items={items}
          onLogout={onLogout}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(v => !v)}
        />
      </aside>

      {/* Mobile overlay */}
      <div
        className={cn('lg:hidden fixed inset-0 z-50', !mobileOpen && 'pointer-events-none')}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => onClose?.()}
        />
        <aside className={cn(
          'absolute left-0 top-0 bottom-0 w-[220px] bg-bg-secondary border-r border-border transform transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <SidebarContent
            user={user}
            items={items}
            onLogout={onLogout}
            collapsed={false}
            onClose={onClose}
          />
        </aside>
      </div>
    </>
  )
}
