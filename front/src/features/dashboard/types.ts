export interface AdminStats {
 utilisateurs: {
  total: number;
  admins: number;
  commerciaux: number;
  moe: number;
  artisans: number;
 };
 chantiers: {
  total: number;
  aCompleter: number;
  aVenir: number;
  enCours: number;
  termines: number;
 };
 charts: {
  monthLabels: string[];
  chantiersByMonth: number[];
 };
 recentUsers: {
  id: number;
  login: string;
  nom: string | null;
  prenom: string | null;
  role: string;
 }[];
}
