import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import type { Utilisateur, UserFilters } from '../types';
import { useToast } from '@/shared/hooks/useToast';

export const useUtilisateurs = (filters: UserFilters) => {
 const toast = useToast();
 const queryClient = useQueryClient();
 const queryKey = ['utilisateurs', filters];

 const { data: utilisateurs = [], isLoading: loading, refetch: fetchUtilisateurs } = useQuery({
  queryKey,
  queryFn: async () => {
   const response = await apiClient.get<Utilisateur[]>('/utilisateurs', {
    params: {
     search: filters.search,
     sortOrder: filters.sortOrder,
    },
   });
   return response.data;
  },
 });

 const deleteMutation = useMutation({
  mutationFn: async (noUtilisateur: number) => {
   await apiClient.delete(`/utilisateur/${noUtilisateur}/delete`);
  },
  onSuccess: () => {
   toast.addToast('Utilisateur supprimé avec succès', 'success');
   queryClient.invalidateQueries({ queryKey: ['utilisateurs'] });
  },
  onError: (error: any) => {
   console.error('Erreur suppression utilisateur', error);
   const backendMessage = error.response?.data?.details || error.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur';
   toast.addToast(backendMessage, 'error');
  },
 });

 const deleteUtilisateur = async (noUtilisateur: number) => {
  await deleteMutation.mutateAsync(noUtilisateur);
 };

 return { utilisateurs, loading, fetchUtilisateurs, deleteUtilisateur };
};

export const useUtilisateur = (id: string | undefined) => {
 return useQuery({
  queryKey: ['utilisateur', id],
  queryFn: async () => {
   if (!id) return null;
   const response = await apiClient.get<Utilisateur>(`/admin/utilisateurs/${id}`);
   return response.data;
  },
  enabled: !!id,
 });
};
