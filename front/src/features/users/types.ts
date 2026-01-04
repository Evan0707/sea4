export interface Artisan {
 noArtisan: number;
 nomArtisan: string;
 prenomArtisan: string;
 adresseArtisan: string;
 cpArtisan: string;
 villeArtisan: string;
 emailArtisan?: string;
 telArtisan?: string;
 actif?: boolean;
 etapes?: { noEtape: number; nomEtape: string }[];
}

export interface Utilisateur {
 noUtilisateur: number;
 login: string;
 nom?: string | null;
 prenom?: string | null;
 role?: 'admin' | 'commercial' | 'maitre_oeuvre' | string | null;
}

export interface UserFilters {
 search?: string;
 sortOrder?: 'asc' | 'desc';
}
