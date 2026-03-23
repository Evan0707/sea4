import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageHeader } from '@/shared/context/LayoutContext';
import { DataList, type Column } from '@/shared/components/ui/DataList';
import SearchBar from '@/shared/components/ui/SearchBar';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Text } from '@/shared/components/ui/Typography';
import { formatDate } from '@/shared/utils/dateFormatter';
import { Eye } from '@mynaui/icons-react';
import { useChantiers } from '../hooks/useChantiers';
import type { Projet } from '../types';

export const ProjetsListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  usePageHeader('Tous les projets', undefined, 'Consultez la liste de tous les projets.');

  const { chantiers: projets, loading, error } = useChantiers({
    filters: {
      search: debouncedSearch,
      sortOrder
    }
  });

  // Gestion du debouncing de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Configuration des colonnes
  const columns: Column<Projet>[] = [
    {
      key: 'noChantier',
      header: 'N°',
      width: 'w-20',
      render: (p) => <Text className="font-mono">#{p.noChantier}</Text>
    },
    {
      key: 'client',
      header: 'Client',
      render: (p) => (
        <Text className="font-medium">
          {p.client ? `${p.client.nom} ${p.client.prenom}` : 'Non assigné'}
        </Text>
      )
    },
    {
      key: 'adresse',
      header: 'Lieu',
      render: (p) => (
        <Text className="text-sm text-placeholder truncate">
          {p.adresse}, {p.ville}
        </Text>
      )
    },
    {
      key: 'dateCreation',
      header: 'Date',
      render: (p) => <Text className="text-sm">{formatDate(p.dateCreation)}</Text>
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (p) => <StatusBadge status={p.statut} />
    },
    {
      key: 'actions',
      header: '',
      width: 'w-10',
      align: 'right',
      render: (p) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/chantiers/${p.noChantier}`);
          }}
          className="p-2 hover:bg-bg-secondary rounded-full transition-colors text-placeholder hover:text-primary"
        >
          <Eye className="w-5 h-5" />
        </button>
      )
    }
  ];

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un projet..."
          width="w-full md:w-[350px]"
        />
      </div>

      <DataList
        data={projets as Projet[]}
        columns={columns}
        loading={loading}
        isError={!!error}
        errorTitle="Erreur de chargement"
        errorDescription="Impossible de récupérer la liste des projets."
        sortColumn="dateCreation"
        sortDirection={sortOrder}
        onSort={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        keyExtractor={(item) => item.noChantier}
        onRowClick={(item) => navigate(`/chantiers/${item.noChantier}`)}
        emptyMessage="Aucun projet trouvé"
      />
    </div>
  );
};