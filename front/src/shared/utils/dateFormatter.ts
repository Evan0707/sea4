/**
 * Utilitaire pour formater les dates selon les préférences utilisateur
 */

export type DateFormat = 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';

/**
 * Récupère le format de date sauvegardé dans localStorage
 */
export const getDateFormat = (): DateFormat => {
  const saved = localStorage.getItem('dateFormat');
  return (saved as DateFormat) || 'dd/MM/yyyy';
};

/**
 * Formate une date selon le format utilisateur
 * @param dateString - Date au format 'yyyy-MM-dd' (format BD)
 * @returns Date formatée selon les préférences
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const format = getDateFormat();
  const [year, month, day] = dateString.split('-');
  
  switch (format) {
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'MM/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'yyyy-MM-dd':
      return dateString;
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Formate un objet Date selon le format utilisateur
 * @param date - Objet Date
 * @returns Date formatée selon les préférences
 */
export const formatDateObject = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const isoString = `${year}-${month}-${day}`;
  return formatDate(isoString);
};
