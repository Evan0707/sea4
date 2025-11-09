export const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'ROLE_ADMIN': 'Administrateur',
    'ROLE_MANAGER': 'Responsable',
    'ROLE_USER': 'Utilisateur'
  }
  return roleMap[role] || role
}