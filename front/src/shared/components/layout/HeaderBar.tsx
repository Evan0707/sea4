import type { User } from '@/shared/types/auth'
import { formatRole } from '@/shared/utils/formatters'
import profile from '@/shared/assets/Profile.png'
import { Text } from '../ui/Typography'

interface HeaderBarProps {
  user: User | null
}

export function HeaderBar({ user }: HeaderBarProps) {

  return (
    <header className="absolute right-10 top-6 z-[0] flex items-center">
      <div>
        <Text className="text-lg font-bold">{user?.username}</Text>
        <Text variant='small'>{user?.roles?.[0] && formatRole(user.roles[0])}</Text>
      </div>
      <img src={profile} className="ml-4" width={45} alt="" />
    </header>
  )
}
