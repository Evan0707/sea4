import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import type { MaitreOeuvre, Modele, EtapeModele } from '@/shared/types/dossier';

// Fonction pour recuperer les maitres d'oeuvre
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

// Fonction pour recuperer les modeles
export const useModeles = () => {
 return useQuery({
  queryKey: ['modeles'],
  queryFn: async () => {
   const response = await apiClient.get<Modele[]>('/modeles');
   return response.data;
  },
 });
};

// Fonction pour recuperer les etapes d'un modele
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

// Fonction pour recuperer un modele
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

// Fonction pour creer un modele
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

// Fonction pour mettre a jour un modele
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
