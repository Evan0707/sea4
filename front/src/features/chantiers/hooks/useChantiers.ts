import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import type { Chantier, Projet } from '../types';
import { useToast } from '@/shared/hooks/useToast';

interface Filters {
 search?: string;
 sortOrder?: 'asc' | 'desc';
}

interface UseChantiersOptions {
 endpoint?: string;
 filters?: Filters;
}

export const useChantiers = ({ endpoint = '/chantiers', filters = {} }: UseChantiersOptions = {}) => {
 const queryClient = useQueryClient();
 const { addToast } = useToast();

 const { data: chantiers = [], isLoading: loading, error, refetch } = useQuery({
  queryKey: ['chantiers', endpoint, filters],
  queryFn: async () => {
   const response = await apiClient.get<(Chantier | Projet)[]>(endpoint, {
    params: {
     search: filters.search,
    }
   });

   // Client-side sorting if needed (since API might not sort)
   let data = response.data;
   if (filters.sortOrder) {
    data = [...data].sort((a, b) => {
     // Handle different field names (dateCreation vs start)
     const dateA = new Date((a as any).dateCreation || (a as any).start).getTime();
     const dateB = new Date((b as any).dateCreation || (b as any).start).getTime();
     return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
   }
   return data as any;
  },
 });

 // Mutation pour supprimer un chantier
 const deleteMutation = useMutation({
  mutationFn: async (id: number) => {
   await apiClient.delete(`/chantiers/${id}`);
  },
  onSuccess: () => {
   addToast('Chantier supprimé avec succès', 'success');
   queryClient.invalidateQueries({ queryKey: ['chantiers'] });
  },
  onError: (error: any) => {
   const msg = error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la suppression du chantier';
   addToast(msg, 'error');
  },
 });

 // Fonction pour supprimer un chantier
 const deleteChantier = async (id: number) => {
  await deleteMutation.mutateAsync(id);
 };

 return { chantiers, loading, error, refetch, deleteChantier };
};

// Fonction pour recuperer un chantier
export const useChantier = (id: string | undefined, options: { endpoint?: string } = {}) => {
 return useQuery({
  queryKey: ['chantier', id, options.endpoint],
  queryFn: async () => {
   if (!id) return null;
   const url = options.endpoint ? `${options.endpoint}/${id}` : `/chantiers/${id}`;
   const response = await apiClient.get<any>(url);
   return response.data;
  },
  enabled: !!id,
 });
};
