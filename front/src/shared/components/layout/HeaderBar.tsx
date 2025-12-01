import { useEffect, useState } from 'react'
import type { User } from '@/shared/types/auth'
import { formatRole } from '@/shared/utils/formatters'
import profile from '@/shared/assets/Profile.png'
import { Text } from '../ui/Typography'
import { Menu } from '@mynaui/icons-react'

interface HeaderBarProps {
  user: User | null
  onMenu?: () => void
}

export function HeaderBar({ user, onMenu }: HeaderBarProps) {
  const displayName = (user as any)?.nom || (user as any)?.prenom ? `${(user as any)?.nom ?? ''}${(user as any)?.prenom ? ' ' + (user as any).prenom : ''}` : user?.username

  return (
    <header className="relative z-[10] flex items-center justify-between  sm:justify-end sm:w-full">
      <div className='absolute top-0 pr-10 pt-8 right-0'>
        <button
          onClick={() => onMenu?.()}
          className="lg:hidden p-2 rounded-md hover:bg-bg-secondary"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6 text-text-primary" />
        </button>
        <div className="hidden items-center lg:flex sm:hidden  gap-3">

          <div>
            <Text className="text-lg font-bold">{displayName}</Text>
            <Text variant='small'>{user?.roles?.[0] && formatRole(user.roles[0])}</Text>
          </div>
          <img src={profile} className="ml-4" width={45} alt="" />
        </div>
      </div>
    </header>
  )
}
