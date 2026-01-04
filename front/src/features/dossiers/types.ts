export interface Dossier {
 noChantier: number;
 nom: string;
 prenom: string;
 address: string;
 cp: string;
 ville: string;
 start: string;
 status: 'À venir' | 'Terminé' | 'Complété' | 'En chantier' | 'À compléter';
}

export interface DossierFilters {
 search?: string;
 sortOrder?: 'asc' | 'desc';
}
