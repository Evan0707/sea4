/**
 * Types pour la création d'un nouveau dossier (Client + Chantier)
 */

// ============================================
// Formulaire Client
// ============================================

export interface ClientFormData {
  nomClient: string;
  prenomClient: string;
  adresseClient?: string;
  cpClient?: string;
  villeClient?: string;
}

export interface Client extends ClientFormData {
  noClient: number;
}

// ============================================
// Formulaire Chantier
// ============================================

export interface ChantierFormData {
  adresseChantier?: string;
  cpChantier?: string;
  villeChantier?: string;
  dateCreation: Date;
  statutChantier: 'À compléter' | 'À venir' | 'En chantier' | 'Terminé';
  noMOE?: number; // Maître d'œuvre (optionnel)
  noModele?: number; // Modèle (optionnel)
}

export interface Chantier extends Omit<ChantierFormData, 'dateCreation'> {
  noChantier: number;
  noClient: number;
  dateCreation: string; // Format ISO depuis l'API
}

// ============================================
// Formulaire complet Dossier
// ============================================

export interface DossierFormData {
  client: ClientFormData;
  chantier: ChantierFormData;
}

export interface DossierResponse {
  client: Client;
  chantier: Chantier;
}

// ============================================
// Maître d'œuvre
// ============================================

export interface MaitreOeuvre {
  noMOE: number;
  nomMOE: string;
  prenomMOE: string;
  noUtilisateur: number;
}

// ============================================
// Modèle
// ============================================

export interface Modele {
  noModele: number;
  nomModele: string;
  descriptionModele?: string;
}

// ============================================
// Étape
// ============================================

export interface Etape {
  noEtape: number;
  nomEtape: string;
  reservable: boolean;
}

export interface EtapeModele extends Etape {
  montantFacture?: number;
  coutSousTraitant?: number;
  nbJoursRealisation?: number;
}
