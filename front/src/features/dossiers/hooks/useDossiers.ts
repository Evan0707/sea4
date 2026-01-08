import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import type { Dossier, DossierFilters } from '../types';
import type { DossierResponse } from '@/shared/types/dossier';
import { useToast } from '@/shared/hooks/useToast';

// Fonction pour recuperer les dossiers
export const useDossiers = (filters: DossierFilters = {}) => {
 const queryClient = useQueryClient();
 const { addToast } = useToast();

 // Fonction pour recuperer les dossiers
 const { data: dossiers = [], isLoading: loading, error } = useQuery({
  queryKey: ['dossiers', filters],
  queryFn: async () => {
   const response = await apiClient.get<Dossier[]>('/dossier', {
    params: {
     search: filters.search,
     sortOrder: filters.sortOrder,
    },
   });
   return response.data;
  },
 });

 // Fonction pour supprimer un dossier
 const deleteMutation = useMutation({
  mutationFn: async (id: number) => {
   await apiClient.delete(`/chantiers/${id}`);
  },
  onSuccess: () => {
   addToast('Dossier supprimé avec succès', 'success');
   queryClient.invalidateQueries({ queryKey: ['dossiers'] });
  },
  onError: (error: any) => {
   const msg = error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la suppression du dossier';
   addToast(msg, 'error');
  },
 });

 const deleteDossier = async (id: number) => {
  await deleteMutation.mutateAsync(id);
 };

 return {
  dossiers,
  loading,
  error: error ? (error as Error).message : null,
  deleteDossier
 };
};

// Fonction pour recuperer un dossier
export const useDossier = (id: string | undefined) => {
 return useQuery({
  queryKey: ['dossier', id],
  queryFn: async () => {
   if (!id) return null;
   const response = await apiClient.get<DossierResponse>(`/dossiers/${id}`);
   return response.data;
  },
  enabled: !!id,
 });
};

// Fonction pour recuperer les etapes d'un dossier
export const useDossierEtapes = (id: string | undefined) => {
 return useQuery({
  queryKey: ['dossier-etapes', id],
  queryFn: async () => {
   if (!id) return [];
   try {
    const response = await apiClient.get<any[]>(`/dossiers/${id}/etapes`);
    return response.data;
   } catch (e) {
    try {
     const response = await apiClient.get<any[]>(`/chantier/${id}/etape-chantiers`);
     return response.data;
    } catch (e2) {
     return [];
    }
   }
  },
  enabled: !!id,
 });
};
