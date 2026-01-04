import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import type { MaitreOeuvre, Modele, EtapeModele } from '@/shared/types/dossier';

export const useMaitresOeuvre = () => {
 return useQuery({
  queryKey: ['maitres-oeuvre'],
  queryFn: async () => {
   const response = await apiClient.get<MaitreOeuvre[]>('/maitres-oeuvre');
   return response.data;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
 });
};

export const useModeles = () => {
 return useQuery({
  queryKey: ['modeles'],
  queryFn: async () => {
   const response = await apiClient.get<Modele[]>('/modeles');
   return response.data;
  },
  // staleTime: 1000 * 60 * 60, // 1 hour (models change rarely) - Commented out for easier testing
 });
};

export const useEtapes = (modeleId: number | null) => {
 return useQuery({
  queryKey: ['etapes', modeleId],
  queryFn: async () => {
   if (!modeleId) return [];
   const response = await apiClient.get<EtapeModele[]>(`/modeles/${modeleId}/etapes`);
   return response.data;
  },
  enabled: !!modeleId,
  staleTime: 1000 * 60 * 10, // 10 minutes
 });
};

export const useModele = (id: string | undefined) => {
 return useQuery({
  queryKey: ['modeles', id],
  queryFn: async () => {
   if (!id) return null;
   const response = await apiClient.get<Modele>(`/modeles/${id}`);
   return response.data;
  },
  enabled: !!id,
 });
};

export const useCreateModele = () => {
 const queryClient = useQueryClient();
 return useMutation({
  mutationFn: async (data: Omit<Modele, 'noModele'>) => {
   const response = await apiClient.post<Modele>('/modeles', data);
   return response.data;
  },
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['modeles'] });
  },
 });
};

export const useUpdateModele = () => {
 const queryClient = useQueryClient();
 return useMutation({
  mutationFn: async ({ id, data }: { id: number; data: Partial<Modele> }) => {
   const response = await apiClient.put<Modele>(`/modeles/${id}`, data);
   return response.data;
  },
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['modeles'] });
  },
 });
};

export const useDeleteModele = () => {
 const queryClient = useQueryClient();
 return useMutation({
  mutationFn: async (id: number) => {
   await apiClient.delete(`/modeles/${id}`);
  },
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['modeles'] });
  },
 });
};
