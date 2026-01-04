import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import type { AdminStats } from '../types';

interface CommercialStats {
 general: {
  totalDossiers: number;
  dossiersACompleter: number;
  dossiersAVenir: number;
  dossiersEnChantier: number;
  dossiersTermines: number;
 };
 charts: {
  monthLabels: string[];
  dossiersByMonth: number[];
 };
 recentDossiers: {
  noChantier: number;
  client: string;
  ville: string;
  statut: string;
  dateCreation: string;
 }[];
}

interface MoeStats {
 general: {
  totalChantiers: number;
  chantiersEnCours: number;
  chantiersTermines: number;
  chantiersAVenir: number;
  chantiersACompleter: number;
 };
 financier: {
  totalMontant: number;
  totalRegle: number;
  totalEnAttente: number;
 };
 etapes: {
  total: number;
  terminees: number;
  enCours: number;
  aVenir: number;
 };
 charts: {
  monthLabels: string[];
  chantiersByMonth: number[];
  revenueByMonth: number[];
 };
 recentChantiers: {
  noChantier: number;
  client: string;
  ville: string;
  statut: string;
  dateCreation: string;
 }[];
}

export const useAdminStats = () => {
 return useQuery({
  queryKey: ['admin-stats'],
  queryFn: async () => {
   const response = await apiClient.get<AdminStats>('/admin/stats');
   return response.data;
  },
 });
};

export const useCommercialStats = () => {
 return useQuery({
  queryKey: ['commercial-stats'],
  queryFn: async () => {
   const response = await apiClient.get<CommercialStats>('/commercial/stats');
   return response.data;
  },
 });
};

export const useMoeStats = () => {
 return useQuery({
  queryKey: ['moe-stats'],
  queryFn: async () => {
   const response = await apiClient.get<MoeStats>('/mes-chantiers/stats');
   return response.data;
  },
 });
};
