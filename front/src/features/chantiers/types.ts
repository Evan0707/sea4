export interface Chantier {
 noChantier: number;
 nom: string;
 prenom: string;
 address: string;
 cp: string;
 ville: string;
 start: string;
 status: 'À venir' | 'Terminé' | 'Complété' | 'En chantier' | 'À compléter';
}

export interface ChantierFilters {
 search?: string;
 sortOrder?: 'asc' | 'desc';
}

export interface Client {
 noClient: number;
 nom: string;
 prenom: string;
 adresse: string;
 cp: string;
 ville: string;
}

export interface Etape {
 noEtapeChantier: number;
 noEtape: number;
 nomEtape: string;
 statut: string;
 montantTheorique: string;
 dateDebutTheorique: string;
 dateDebut: string;
 dateFin: string;
 reservee: boolean;
 reductionSupplementaire: string;
 nbJours?: number;
 coutSousTraitant?: string;
 artisan: {
  noArtisan: number;
  nom: string;
  prenom: string;
 } | null;
}

export interface Appel {
 noAppel: number;
 dateAppel: string;
 montant: string;
 dateReglement: string | null;
}

export interface Devis {
 noDevis: number;
 dateEmission: string;
 montant: string;
 statut: string;
 remarques: string;
}

export interface Facture {
 noFacture: number;
 dateEmission: string;
 montant: string;
 statut: string;
 remarques: string;
 artisan?: string;
}

export interface ChantierDetail {
 noChantier: number;
 adresse: string;
 cp: string;
 ville: string;
 dateCreation: string;
 statut: string;
 client: Client | null;
 etapes: Etape[];
 appels: Appel[];
 devis?: Devis[];
 factures?: Facture[];
}

export interface Projet {
 noChantier: number;
 adresse: string;
 cp: string;
 ville: string;
 dateCreation: string;
 statut: string;
 client?: {
  nom: string;
  prenom: string;
 };
}
