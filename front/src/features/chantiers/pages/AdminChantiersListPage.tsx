import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataList, type Column } from '@/shared/components/ui/DataList';
import SearchBar from '@/shared/components/ui/SearchBar';
import Button from '@/shared/components/ui/Button';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import Popover from '@/shared/components/ui/Popover';
import { Text } from '@/shared/components/ui/Typography';
import { Eye, Trash, Download, Map } from '@mynaui/icons-react';
import { useChantiers } from '../hooks/useChantiers';
import type { Chantier } from '../types';
import { formatDate } from '@/shared/utils/dateFormatter';
import { exportToCSV, type CsvColumn } from '@/shared/utils/csvExporter';
import { usePageHeader } from '@/shared/context/LayoutContext';

import ConfirmModal from '@/shared/components/ui/ConfirmModal';

export const AdminChantiersListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [chantiersToDelete, setChantiersToDelete] = useState<number[]>([]);

  const { chantiers, loading, deleteChantier, error } = useChantiers({
    endpoint: '/admin/chantiers',
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

  // supprimer un chantier
  const confirmDelete = async () => {
    if (chantiersToDelete.length > 0) {
      await Promise.all(chantiersToDelete.map(id => deleteChantier(id)));
      setChantiersToDelete([]);
    }
  };

  // exporter les chantiers
  const handleExport = useCallback(() => {
    const exportColumns: CsvColumn<Chantier>[] = [
      { key: 'nom', header: 'Nom Client' },
      { key: 'prenom', header: 'Prénom Client' },
      { key: 'address', header: 'Adresse' },
      { key: 'ville', header: 'Ville' },
      { key: 'start', header: 'Date début', formatter: (val) => formatDate(val) },
      { key: 'status', header: 'Statut' },
    ];
    exportToCSV(chantiers as Chantier[], exportColumns, 'chantiers');
  }, [chantiers]);

  // actions en-tête
  const headerActions = useMemo(() => (
    <div className='flex gap-2'>
      <Button variant="Secondary" icon={Download} onClick={handleExport}>
        Exporter CSV
      </Button>
      <Button variant="Primary" icon={Map} onClick={() => navigate('/admin/chantiers/map')}>
        Voir la carte
      </Button>
    </div>
  ), [navigate, handleExport]);

  // en-tête de la page
  usePageHeader(
    'Tous les Chantiers',
    headerActions,
    "Vue d'ensemble et gestion des chantiers."
  );

  // colonnes de la liste
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
        <Text className="text-sm  font-mono tabular-nums">
          {formatDate(c.start)}
        </Text>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      width: 'w-[150px]',
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
              onClick={() => navigate(`/admin/chantiers/${c.noChantier}`)}
              icon={Eye}
            >
              Voir détails
            </Popover.Item>
            <Popover.Item
              variant="destructive"
              onClick={() => setChantiersToDelete([c.noChantier])}
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
    <div className="p-4 md:p-8 h-full flex flex-col">
      {/* PageHeader moved to Layout */}

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechercher par nom, prénom ou ville..."
        width="w-full md:w-[350px]"
        className="mb-5"
      />

      <DataList
        data={chantiers as Chantier[]}
        columns={columns}
        loading={loading}
        isError={!!error}
        errorTitle="Erreur de chargement"
        errorDescription="Impossible de récupérer la liste des chantiers."
        sortColumn="start"
        sortDirection={sortOrder}
        onSort={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        keyExtractor={(item) => item.noChantier}
        onRowClick={(item) => navigate(`/admin/chantiers/${item.noChantier}`)}
        emptyMessage="Aucun chantier trouvé"
        selectable={true}
        onDeleteSelected={(keys) => setChantiersToDelete(keys as number[])}
      />

      <ConfirmModal
        isOpen={chantiersToDelete.length > 0}
        onClose={() => setChantiersToDelete([])}
        onConfirm={confirmDelete}
        title={chantiersToDelete.length > 1 ? "Supprimer les chantiers" : "Supprimer le chantier"}
        message={chantiersToDelete.length > 1
          ? `Êtes-vous sûr de vouloir supprimer ces ${chantiersToDelete.length} chantiers ? Cette action est irréversible.`
          : "Êtes-vous sûr de vouloir supprimer ce chantier ? Cette action est irréversible."}
        confirmText="Supprimer"
      />
    </div>
  );
};
