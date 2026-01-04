import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import type { Utilisateur } from '../types';

interface Filters {
 search?: string;
 role?: string;
}

export const useUsers = (filters: Filters = {}) => {
 const { data: users = [], isLoading: loading, error } = useQuery({
  queryKey: ['users', filters],
  queryFn: async () => {
   const response = await apiClient.get<Utilisateur[]>('/users', {
    params: {
     search: filters.search,
     role: filters.role
    }
   });
   return response.data;
  },
 });

 return { users, loading, error };
};

export const useUser = (id: string | undefined) => {
 return useQuery({
  queryKey: ['user', id],
  queryFn: async () => {
   if (!id) return null;
   const response = await apiClient.get<Utilisateur>(`/users/${id}`);
   return response.data;
  },
  enabled: !!id,
 });
};
