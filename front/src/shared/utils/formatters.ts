export const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'ROLE_ADMIN': 'Administrateur',
    'ROLE_MAITRE_OEUVRE': "Maître d'oeuvre",
    'ROLE_COMMERCIAL': 'Commercial'
  }
  return roleMap[role] || role
}