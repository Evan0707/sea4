import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/shared/api/client';
import { usePageHeader } from '@/shared/context/LayoutContext';
import { DataList, type Column } from '@/shared/components/ui/DataList';
import SearchBar from '@/shared/components/ui/SearchBar';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Text } from '@/shared/components/ui/Typography';
import { Trash, Pencil } from '@mynaui/icons-react';
import Popover from '@/shared/components/ui/Popover';
import { formatDate } from '@/shared/utils/dateFormatter';
import { useToast } from '@/shared/hooks/useToast';

import type { Chantier } from '@/features/chantiers/types';

import ConfirmModal from '@/shared/components/ui/ConfirmModal';

import { useChantiers } from '@/features/chantiers/hooks/useChantiers';

export const MesDossiersPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dossiersToDelete, setDossiersToDelete] = useState<number[]>([]);

  usePageHeader('Mes dossiers', undefined, 'Gérez vos dossiers en cours.');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Utilisation du hook useChantiers avec endpoint /mes-dossiers
  const { chantiers: dossiers, loading, error, refetch: refetch } = useChantiers({
    endpoint: '/mes-dossiers',
    filters: {
      search: debouncedSearch,
      sortOrder
    }
  });

  // Gestion de la suppression
  const confirmDelete = async () => {
    if (dossiersToDelete.length === 0) return;

    try {
      await Promise.all(dossiersToDelete.map(id => apiClient.delete(`/chantiers/${id}`)));
      addToast(dossiersToDelete.length > 1 ? 'Chantiers supprimés avec succès' : 'Chantier supprimé avec succès', 'success');
      refetch();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addToast('Erreur lors de la suppression', 'error');
    }
    setDossiersToDelete([]);
  };

  // Configuration des colonnes
  const columns: Column<Chantier>[] = [
    {
      key: 'nom',
      header: 'Nom Prénom',
      width: 'flex-1 md:w-[200px] md:flex-none',
      render: (d) => (
        <Text className="font-semibold text-sm">
          {d.nom} {d.prenom}
        </Text>
      )
    },
    {
      key: 'address',
      header: 'Adresse',
      width: 'hidden md:block flex-1',
      render: (d) => (
        <Text className="text-sm text-placeholder truncate">
          {d.address}, {d.cp} {d.ville}
        </Text>
      )
    },
    {
      key: 'start',
      header: 'Date début',
      width: 'hidden md:flex w-[150px]',
      sortable: true,
      render: (d) => (
        <Text className="text-sm font-mono tabular-nums">
          {formatDate(d.start)}
        </Text>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      width: 'w-[120px]',
      align: 'right',
      render: (d) => <StatusBadge status={d.status} />
    },
    {
      key: 'actions',
      header: '',
      width: 'w-[50px]',
      align: 'right',
      render: (d) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Popover>
            <Popover.Item
              onClick={() => navigate(`/maitre-doeuvre/chantiers/${d.noChantier}/completer`)}
              icon={Pencil}
            >
              Modifier / Compléter
            </Popover.Item>
            <Popover.Item
              variant="destructive"
              onClick={() => setDossiersToDelete([d.noChantier])}
              icon={Trash}
            >
              Supprimer
            </Popover.Item>
          </Popover>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 md:p-4 h-full flex flex-col">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechercher par nom, prénom ou ville..."
        width="w-full md:w-[350px]"
        className="mb-5"
      />

      <DataList
        data={dossiers}
        columns={columns}
        loading={loading}
        isError={!!error}
        errorTitle="Erreur de chargement"
        errorDescription="Impossible de récupérer la liste des dossiers."
        errorAction={{ label: 'Réessayer', onClick: refetch }}
        sortColumn="start"
        sortDirection={sortOrder}
        onSort={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        keyExtractor={(item) => item.noChantier}
        onRowClick={(item) => navigate(`/maitre-doeuvre/chantiers/${item.noChantier}/completer`)}
        emptyMessage="Aucun dossier trouvé"
        selectable={true}
        onDeleteSelected={(keys) => setDossiersToDelete(keys as number[])}
      />

      <ConfirmModal
        isOpen={dossiersToDelete.length > 0}
        onClose={() => setDossiersToDelete([])}
        onConfirm={confirmDelete}
        title={dossiersToDelete.length > 1 ? "Supprimer les chantiers" : "Supprimer le chantier"}
        message={dossiersToDelete.length > 1
          ? `Êtes-vous sûr de vouloir supprimer ces ${dossiersToDelete.length} chantiers ? Cette action est irréversible.`
          : "Êtes-vous sûr de vouloir supprimer ce chantier ? Cette action est irréversible."}
        confirmText="Supprimer"
      />
    </div>
  );
};
