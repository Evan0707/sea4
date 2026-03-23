import type { User } from '@/shared/types/auth'
import { formatRole } from '@/shared/utils/formatters'
import { Text } from '../ui/Typography'
import { Menu } from '@mynaui/icons-react'
import { Avatar } from '../ui/Avatar'
import { useLayout } from '@/shared/context/LayoutContext'
import { Breadcrumbs } from '../ui/Breadcrumbs'
import { useToast } from '@/shared/hooks/useToast'

interface HeaderBarProps {
  user: User | null
  onMenu?: () => void
}

export function HeaderBar({ user, onMenu }: HeaderBarProps) {
  const { actions } = useLayout();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = user as any;
  const displayName = u?.nom || u?.prenom ? `${u?.prenom ?? ''}${u?.nom ? ' ' + u.nom : ''}` : user?.username
  const { addToast } = useToast();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between w-full bg-bg-primary/95 backdrop-blur-md px-8 py-3 border-b border-border/50 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onMenu?.()}
          className="lg:hidden p-2 rounded-md hover:bg-bg-secondary shrink-0"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6 text-text-primary" />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-4">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

      </div>
    </header>
  )
}
