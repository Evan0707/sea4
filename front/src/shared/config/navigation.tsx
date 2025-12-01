import type { ReactElement } from 'react'
import { Home, Plus, Grid, Users, Tool, Inbox } from '@mynaui/icons-react'

export interface NavItem {
  label: string
  path: string
  roles: string[]
  icon: ReactElement
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Accueil', path: '/commercial', roles: ['ROLE_COMMERCIAL'], icon: <Home strokeWidth={1.5} size={22} /> },
  { label: 'Dossiers', path: '/commercial/dossiers', roles: ['ROLE_COMMERCIAL'], icon: <Inbox strokeWidth={1.5} size={22} /> },
  { label: 'Nouveau Dossier', path: '/commercial/nouveau-dossier', roles: ['ROLE_COMMERCIAL'], icon: <Plus strokeWidth={1.5} size={22} /> },
  { label: 'Accueil', path: '/maitre-doeuvre', roles: ['ROLE_MAITRE_OEUVRE'], icon: <Home strokeWidth={1.5} size={22} /> },
  { label: 'Mes Dossiers', path: '/maitre-doeuvre/dossiers', roles: ['ROLE_MAITRE_OEUVRE'], icon: <Inbox strokeWidth={1.5} size={22} /> },
  { label: 'Mes Chantiers', path: '/maitre-doeuvre/chantiers', roles: ['ROLE_MAITRE_OEUVRE'], icon: <Grid strokeWidth={1.5} size={22} /> },
  { label: 'Accueil', path: '/admin', roles: ['ROLE_ADMIN'], icon: <Home strokeWidth={1.5} size={22} /> },
  { label: 'Dossiers', path: '/admin/dossiers', roles: ['ROLE_ADMIN'], icon: <Inbox strokeWidth={1.5} size={22} /> },
  { label: 'Chantiers', path: '/admin/chantiers', roles: ['ROLE_ADMIN'], icon: <Grid strokeWidth={1.5} size={22} /> },
  { label: 'Utilisateurs', path: '/admin/utilisateurs', roles: ['ROLE_ADMIN'], icon: <Users strokeWidth={1.5} size={22} /> },
  { label: 'Artisans', path: '/admin/artisans', roles: ['ROLE_ADMIN'], icon: <Tool strokeWidth={1.5} size={22} /> }
]