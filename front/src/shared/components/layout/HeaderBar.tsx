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
    <header className="sticky top-0 z-20 flex items-center justify-between w-full bg-bg-primary/95 backdrop-blur-md px-8 py-2 border-b border-border/50 transition-all duration-300">
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

        <div className="flex items-center gap-2">
          {/* <NotificationDropdown /> */}

          <div onClick={() => addToast('Notification', 'error')} className="hidden lg:flex items-center gap-3 pl-4 border-l border-border/50 ml-2">
            <div className="flex items-center gap-3 py-1.5 px-3 rounded-full hover:bg-bg-secondary/50 border border-transparent hover:border-border/50 transition-all cursor-pointer group">
              <div className="text-right hidden xl:block">
                <Text className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">{displayName}</Text>
                <Text variant='caption' className="text-muted-foreground">{user?.roles?.[0] && formatRole(user.roles[0])}</Text>
              </div>
              <Avatar size="sm" fallback={displayName as string} src={u?.avatar} className="border border-border/20 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
