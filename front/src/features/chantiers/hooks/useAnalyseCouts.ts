import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/client';
import { useToast } from '@/shared/hooks/useToast';
import type { EtapeAnalyse, FactureArtisanFormData } from '../types';

export const useAnalyseCouts = (chantierId: string | undefined) => {
  return useQuery<EtapeAnalyse[]>({
    queryKey: ['analyse-couts', chantierId],
    queryFn: async () => {
      if (!chantierId) return [];
      const response = await apiClient.get<EtapeAnalyse[]>(`/chantiers/${chantierId}/analyse-couts`);
      return response.data;
    },
    enabled: !!chantierId,
  });
};

export const useCreateFacture = (chantierId: string | undefined) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({
      etapeId,
      data,
    }: {
      etapeId: number;
      data: FactureArtisanFormData;
    }) => {
      const response = await apiClient.post(
        `/chantiers/${chantierId}/etapes/${etapeId}/factures`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      addToast('Facture enregistrée avec succès', 'success');
      queryClient.invalidateQueries({ queryKey: ['analyse-couts', chantierId] });
      queryClient.invalidateQueries({ queryKey: ['chantier', chantierId] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || 'Erreur lors de l\'enregistrement de la facture';
      addToast(msg, 'error');
    },
  });
};

export const useDeleteFacture = (chantierId: string | undefined) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (factureId: number) => {
      await apiClient.delete(`/factures/${factureId}`);
    },
    onSuccess: () => {
      addToast('Facture supprimée', 'success');
      queryClient.invalidateQueries({ queryKey: ['analyse-couts', chantierId] });
      queryClient.invalidateQueries({ queryKey: ['chantier', chantierId] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Erreur lors de la suppression';
      addToast(msg, 'error');
    },
  });
};
