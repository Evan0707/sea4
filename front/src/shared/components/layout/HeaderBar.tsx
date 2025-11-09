import type { User } from '@/shared/types/auth'
import profile from '@/shared/assets/Profile.png'

interface HeaderBarProps {
  user: User | null
}

export function HeaderBar({ user }: HeaderBarProps) {
  return (
    <header className="absolute right-10 top-6 flex items-center">
      <div>
        <p className="text-lg font-bold">{user?.username}</p>
        <p className="text-placeholder text-sm">{user?.roles?.[0]}</p>
      </div>
      <img src={profile} className="ml-4" width={45} alt="" />
    </header>
  )
}
