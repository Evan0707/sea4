import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import type { Artisan, UserFilters } from '../types';
import { useToast } from '@/shared/hooks/useToast';

export const useArtisans = (filters: UserFilters) => {
 const toast = useToast();
 // appels requetes
 const queryClient = useQueryClient();
 const queryKey = ['artisans', filters];

 const { data: artisans = [], isLoading: loading, isError, refetch: fetchArtisans } = useQuery({
  queryKey,
  queryFn: async () => {
   const response = await apiClient.get('/artisan', {
    params: {
     search: filters.search,
     sortOrder: filters.sortOrder,
    },
   });

   // nettoyage des données
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const cleanArtisans = response.data.map((a: any) => ({
    noArtisan: a.noArtisan,
    // nettoyage des clés
    nomArtisan: a['"nomArtisan"'] ?? a.nomArtisan,
    prenomArtisan: a['"prenomArtisan"'] ?? a.prenomArtisan,
    adresseArtisan: a['"adresseArtisan"'] ?? a.adresseArtisan,
    cpArtisan: a['"cpArtisan"'] ?? a.cpArtisan,
    villeArtisan: a['"villeArtisan"'] ?? a.villeArtisan,
    etapes: a.etapes ?? [],
   }));
   return cleanArtisans as Artisan[];
  },
 });

 // supprimer un artisan
 const deleteMutation = useMutation({
  mutationFn: async (noArtisan: number) => {
   await apiClient.delete(`/artisan/${noArtisan}/delete`);
  },
  onSuccess: () => {
   toast.addToast('Artisan supprimé avec succès', 'success');
   queryClient.invalidateQueries({ queryKey: ['artisans'] });
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError: (error: any) => {
   console.error('Erreur suppression artisan', error);
   if (error.response?.status === 400) {
    if (error.response.data?.noChantier) {
     const chantierIds = error.response.data.noChantier.join(', ');
     toast.addToast(`${error.response.data.message}\nChantiers concernés : ${chantierIds}`, 'error');
    } else {
     toast.addToast(error.response.data.message, 'error');
    }
   } else {
    toast.addToast('Erreur lors de la suppression de l\'artisan', 'error');
   }
  },
 });

 // supprimer un artisan
 const deleteArtisan = async (noArtisan: number) => {
  await deleteMutation.mutateAsync(noArtisan);
 };

 return { artisans, loading, isError, fetchArtisans, deleteArtisan };
};

export const useArtisan = (id: string | undefined) => {
 return useQuery({
  queryKey: ['artisan', id],
  queryFn: async () => {
   if (!id) return null;
   const response = await apiClient.get<Artisan>(`/artisan/${id}`);
   return response.data;
  },
  enabled: !!id,
 });
};

export const useArtisanPlanning = (id: string | undefined) => {
 return useQuery({
  queryKey: ['artisan-planning', id],
  queryFn: async () => {
   if (!id) return null;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const response = await apiClient.get<any>(`/artisan/${id}/planning`);
   return response.data;
  },
  enabled: !!id,
 });
};
