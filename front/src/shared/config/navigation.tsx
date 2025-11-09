import type { ReactElement } from 'react'
import { Home, File, Plus, Grid, Users, Tool } from '@mynaui/icons-react'

export interface NavItem {
  label: string
  path: string
  roles: string[]
  icon: ReactElement
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Accueil', path: '/commercial', roles: ['ROLE_COMMERCIAL'], icon: <Home size={22} /> },
  { label: 'Dossiers', path: '/commercial/dossiers', roles: ['ROLE_COMMERCIAL'], icon: <File size={22} /> },
  { label: 'Nouveau Dossier', path: '/commercial/nouveau-dossier', roles: ['ROLE_COMMERCIAL'], icon: <Plus size={22} /> },
  { label: 'Accueil', path: '/maitre-doeuvre', roles: ['ROLE_MAITRE_DOEUVRE'], icon: <Home size={22} /> },
  { label: 'Mes Dossiers', path: '/maitre-doeuvre/dossiers', roles: ['ROLE_MAITRE_DOEUVRE'], icon: <File size={22} /> },
  { label: 'Mes Projets', path: '/maitre-doeuvre/projets', roles: ['ROLE_MAITRE_DOEUVRE'], icon: <Grid size={22} /> },
  { label: 'Accueil', path: '/admin', roles: ['ROLE_ADMIN'], icon: <Home size={22} /> },
  { label: 'Dossiers', path: '/admin/dossiers', roles: ['ROLE_ADMIN'], icon: <File size={22} /> },
  { label: 'Projets', path: '/admin/projets', roles: ['ROLE_ADMIN'], icon: <Grid size={22} /> },
  { label: 'Utilisateurs', path: '/admin/utilisateurs', roles: ['ROLE_ADMIN'], icon: <Users size={22} /> },
  { label: 'Artisans', path: '/admin/artisans', roles: ['ROLE_ADMIN'], icon: <Tool size={22} /> }
]