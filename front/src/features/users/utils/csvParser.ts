import type { CsvArtisan } from '../components/CsvImportPopup';

export const parseCSV = (text: string): CsvArtisan[] => {
 const lines = text.split(/\r?\n/).filter(line => line.trim());
 if (lines.length < 2) return [];

 const headerLine = lines[0].toLowerCase();
 const separator = headerLine.includes(';') ? ';' : headerLine.includes(',') ? ',' : '\t';
 const headers = headerLine.split(separator).map(h => h.trim().replace(/"/g, ''));

 const findHeader = (possibleNames: string[]): number => {
  return headers.findIndex(h => possibleNames.some(name => h.includes(name)));
 };

 const nomIdx = findHeader(['nom', 'name', 'lastname']);
 const prenomIdx = findHeader(['prenom', 'prénom', 'firstname']);
 const adresseIdx = findHeader(['adresse', 'address', 'rue']);
 const cpIdx = findHeader(['cp', 'code postal', 'postal', 'zip']);
 const villeIdx = findHeader(['ville', 'city']);
 const emailIdx = findHeader(['email', 'mail', 'e-mail']);
 const telIdx = findHeader(['tel', 'tél', 'phone', 'mobile']);
 const qualIdx = findHeader(['qualification', 'etape', 'métier', 'metier', 'skill']);

 const artisans: CsvArtisan[] = [];

 for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(separator).map(v => v.trim().replace(/"/g, ''));
  if (values.length < 2) continue;

  artisans.push({
   nom: nomIdx >= 0 ? values[nomIdx] || '' : '',
   prenom: prenomIdx >= 0 ? values[prenomIdx] || '' : '',
   adresse: adresseIdx >= 0 ? values[adresseIdx] || '' : '',
   cp: cpIdx >= 0 ? values[cpIdx] || '' : '',
   ville: villeIdx >= 0 ? values[villeIdx] || '' : '',
   email: emailIdx >= 0 ? values[emailIdx] || '' : '',
   tel: telIdx >= 0 ? values[telIdx] || '' : '',
   qualifications: qualIdx >= 0 ? values[qualIdx] || '' : '',
  });
 }

 return artisans;
};
