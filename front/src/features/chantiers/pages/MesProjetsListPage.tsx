import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageHeader } from '@/shared/context/LayoutContext';
import { DataList, type Column } from '@/shared/components/ui/DataList';
import SearchBar from '@/shared/components/ui/SearchBar';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Text } from '@/shared/components/ui/Typography';
import { Eye } from '@mynaui/icons-react';
import Popover from '@/shared/components/ui/Popover';
import { useChantiers } from '../hooks/useChantiers';
import type { Chantier } from '../types';
import { formatDate } from '@/shared/utils/dateFormatter';

export const MesProjetsListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  usePageHeader('Mes Chantiers', undefined, 'Suivi de vos projets en cours.');

  const { chantiers, loading, error } = useChantiers({
    endpoint: '/mes-chantiers',
    filters: {
      search: debouncedSearch,
      sortOrder
    }
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const columns: Column<Chantier>[] = [
    {
      key: 'nom',
      header: 'Client',
      width: 'flex-1 md:w-[200px] md:flex-none',
      render: (c) => (
        <Text className="font-medium text-sm">
          {c.nom} {c.prenom}
        </Text>
      )
    },
    {
      key: 'address',
      header: 'Adresse',
      width: 'hidden md:block flex-1',
      render: (c) => (
        <Text className="text-sm text-placeholder truncate">
          {c.address}, {c.cp} {c.ville}
        </Text>
      )
    },
    {
      key: 'start',
      header: 'Date début',
      width: 'hidden md:flex w-[200px]',
      sortable: true,
      render: (c) => (
        <Text className="text-sm font-mono tabular-nums">
          {formatDate(c.start)}
        </Text>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      width: 'w-[120px]',
      align: 'right',
      render: (c) => <StatusBadge status={c.status} />
    },
    {
      key: 'actions',
      header: '',
      width: 'w-[50px]',
      align: 'right',
      render: (c) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Popover>
            <Popover.Item
              onClick={() => navigate(`/maitre-doeuvre/chantiers/${c.noChantier}`)}
              icon={Eye}
            >
              Voir détails
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

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg text-red-600">
          <Text className="font-semibold mb-2">Erreur de chargement</Text>
          <Text className="text-sm">Impossible de récupérer la liste des chantiers.</Text>
        </div>
      ) : (
        <DataList
          data={chantiers}
          columns={columns}
          loading={loading}
          sortColumn="start"
          sortDirection={sortOrder}
          onSort={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          keyExtractor={(item) => item.noChantier}
          onRowClick={(item) => navigate(`/maitre-doeuvre/chantiers/${item.noChantier}`)}
          emptyMessage="Aucun chantier trouvé"
        />
      )}
    </div>
  );
};