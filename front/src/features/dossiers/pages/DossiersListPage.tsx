import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataList, type Column } from '@/shared/components/ui/DataList';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import SearchBar from '@/shared/components/ui/SearchBar';
import Button from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Typography';
import { Eye, Download, Trash } from '@mynaui/icons-react';
import Popover from '@/shared/components/ui/Popover';
import { useDossiers } from '../hooks/useDossiers';
import type { Dossier } from '../types';
import { exportToCSV, type CsvColumn } from '@/shared/utils/csvExporter';
import { formatDate } from '@/shared/utils/dateFormatter';
import { usePageHeader } from '@/shared/context/LayoutContext';
import ConfirmModal from '@/shared/components/ui/ConfirmModal';
import { useAuth } from '@/features/auth/context/AuthContext';

export const DossiersListPage = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dossiersToDelete, setDossiersToDelete] = useState<number[]>([]);

  const { dossiers, loading, error, deleteDossier, refetch } = useDossiers({
    search: debouncedSearch,
    sortOrder,
  });

  const confirmDelete = async () => {
    if (dossiersToDelete.length > 0) {
      await Promise.all(dossiersToDelete.map(id => deleteDossier(id)));
      setDossiersToDelete([]);
    }
  };

  // Gestion du debouncing de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleExport = useCallback(() => {
    const exportColumns: CsvColumn<Dossier>[] = [
      { key: 'nom', header: 'Nom' },
      { key: 'prenom', header: 'Prénom' },
      { key: 'address', header: 'Adresse' },
      { key: 'cp', header: 'Code Postal' },
      { key: 'ville', header: 'Ville' },
      { key: 'start', header: 'Date début', formatter: (val) => formatDate(val) },
      { key: 'status', header: 'Statut' },
    ];
    exportToCSV(dossiers, exportColumns, 'dossiers');
  }, [dossiers]);

  const navigate = useNavigate();

  // Configuration des actions du header
  const headerActions = useMemo(() => (
    <Button variant="Secondary" icon={Download} onClick={handleExport}>
      Exporter CSV
    </Button>
  ), [handleExport]);

  usePageHeader(
    'Dossiers',
    headerActions,
    'Gérez les dossiers clients et suivez leur avancement.'
  );

  const { user } = useAuth();
  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  const isCommercial = user?.roles.includes('ROLE_COMMERCIAL');

  let basePath = '/maitre-doeuvre';
  if (isAdmin) basePath = '/admin';
  if (isCommercial) basePath = '/commercial';

  // Configuration des colonnes
  const columns: Column<Dossier>[] = [
    {
      key: 'nom',
      header: 'Nom Prénom',

      width: 'flex-1 md:w-[200px] md:flex-none',
      render: (d) => (
        <Text className="font-semibold text-sm">
          {d.nom} {d.prenom}
        </Text>
      ),
    },
    {
      key: 'address',
      header: 'Adresse',
      width: 'hidden md:block flex-1',
      render: (d) => (
        <div>
          <Text className="text-sm font-semibold">{d.address}</Text>
          <Text className="text-xs text-placeholder">
            {d.cp} {d.ville}
          </Text>
        </div>
      ),
    },
    {
      key: 'start',
      header: 'Date début',
      width: 'hidden md:flex w-[150px]',
      sortable: true,
      render: (d) => (
        <Text className="text-sm">
          {formatDate(d.start)}
        </Text>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      width: 'hidden md:flex w-[150px]',
      align: 'right',
      render: (d) => <StatusBadge status={d.status} />,
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
              onClick={() => {
                if (isCommercial) {
                  navigate(`/commercial/dossiers/${d.noChantier}/edit`);
                } else {
                  navigate(`${basePath}/chantiers/${d.noChantier}`);
                }
              }}
              icon={Eye}
            >
              Voir détails
            </Popover.Item>
            {(d.status === 'À compléter' || d.status === 'À venir') && !isCommercial && (
              <Popover.Item
                onClick={() => navigate(`${basePath}/dossiers/${d.noChantier}/completer`)}
                icon={Eye}
              >
                Compléter
              </Popover.Item>
            )}
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
    },
  ];

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">

      <div className="mb-5 flex items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher par nom, prénom ou ville..."
        />

      </div>

      <DataList
        data={dossiers}
        columns={columns}
        loading={loading}
        isError={!!error}
        errorTitle="Erreur de chargement"
        errorDescription="Impossible de récupérer la liste des dossiers."
        sortColumn="start"
        sortDirection={sortOrder}
        onSort={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        keyExtractor={(item) => item.noChantier}
        onRowClick={(item) => {
          if (isCommercial) {
            navigate(`/commercial/dossiers/${item.noChantier}/edit`);
          } else {
            navigate(`${basePath}/chantiers/${item.noChantier}`);
          }
        }}
        emptyMessage="Aucun dossier trouvé"
        selectable={true}
        onDeleteSelected={(keys) => setDossiersToDelete(keys as number[])}
        onRefresh={refetch}
      />

      <ConfirmModal
        isOpen={dossiersToDelete.length > 0}
        onClose={() => setDossiersToDelete([])}
        onConfirm={confirmDelete}
        title={dossiersToDelete.length > 1 ? "Supprimer les dossiers" : "Supprimer le dossier"}
        message={dossiersToDelete.length > 1
          ? `Êtes-vous sûr de vouloir supprimer ces ${dossiersToDelete.length} dossiers ? Cette action est irréversible.`
          : "Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible."}
        confirmText="Supprimer"
      />
    </div>
  );
};