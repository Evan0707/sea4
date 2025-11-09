import { Link, useLocation } from 'react-router-dom'
import type { User } from '@/shared/types/auth'
import Button from '@/shared/components/ui/Button'
import { Logout, SidebarSolid, SidebarAltSolid } from '@mynaui/icons-react'
import type { NavItem } from '@/shared/config/navigation'
import Logo from '@/shared/assets/Logo.svg'
import { useState, useEffect } from 'react'

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
    <aside className={`$${''} ${collapsed ? 'w-20' : 'w-64'} bg-[#FAFBFE] relative flex flex-col border-r-1 border-border text-white p-3 transition-all duration-300 overflow-hidden`}> 
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
        {!collapsed && <h2 className="text-2xl font-bold text-black">Bati'Parti</h2>}
      </div>
      <nav>
        <ul className="space-y-2 mt-22">
          {filtered.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`px-4 flex overflow-hidden justify-start items-center py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-[#E4EEFE] border-1 border-[#C3DCFE] text-primary font-bold'
                    : 'text-placeholder hover:bg-[#E4EEFE]'
                }`}
              >
                <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{item.icon}</span>
                {!collapsed && item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-6">
        {collapsed ? (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center py-2 rounded-lg text-red-600 hover:bg-red-50"
            aria-label="Déconnexion"
            title="Déconnexion"
          >
            <Logout size={24} />
          </button>
        ) : (
          <Button variant="Destructive" classname="w-full justify-start px-3 overflow-hidden" onClick={onLogout}>
            <Logout size={24} />
            Déconnexion
          </Button>
        )}
      </div>
    </aside>
  )
}
