import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataList, type Column } from '@/shared/components/ui/DataList';
import Button from '@/shared/components/ui/Button';
import SearchBar from '@/shared/components/ui/SearchBar';
import { Text } from '@/shared/components/ui/Typography';
import { Trash, Download, Pencil } from '@mynaui/icons-react';
import Popover from '@/shared/components/ui/Popover';
import { Avatar } from '@/shared/components/ui/Avatar';
import { useUtilisateurs } from '../hooks/useUtilisateurs';
import type { Utilisateur } from '../types';
import { exportToCSV, type CsvColumn } from '@/shared/utils/csvExporter';
import { usePageHeader } from '@/shared/context/LayoutContext';
import ConfirmModal from '@/shared/components/ui/ConfirmModal';
import { RoleBadge } from '@/shared/components/ui/RoleBadge';

// RoleBadge now imported from shared UI components

export const UtilisateursListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [usersToDelete, setUsersToDelete] = useState<number[]>([]);

  // Utilisation du hook personnalisé pour récupérer les utilisateurs
  const { utilisateurs, loading, deleteUtilisateur, error, fetchUtilisateurs } = useUtilisateurs({
    search: debouncedSearch,
    sortOrder,
  });

  // Recherche avec tampon (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);


  // Fonction de confirmation de suppression
  const confirmDelete = async () => {
    if (usersToDelete.length > 0) {
      await Promise.all(usersToDelete.map(id => deleteUtilisateur(id)));
      setUsersToDelete([]);
    }
  };

  // Fonction de gestion de l'export CSV
  const handleExport = useCallback(() => {
    const exportColumns: CsvColumn<Utilisateur>[] = [
      { key: 'login', header: 'Login' },
      { key: 'nom', header: 'Nom' },
      { key: 'prenom', header: 'Prénom' },
      { key: 'role', header: 'Rôle' },
    ];
    exportToCSV(utilisateurs, exportColumns, 'utilisateurs');
  }, [utilisateurs]);

  // Configuration des actions dans le header
  const headerActions = useMemo(() => (
    <div className="flex items-center gap-2">
      <Button variant="Secondary" onClick={handleExport} icon={Download}>
        Exporter CSV
      </Button>
      <Button variant='Primary' onClick={() => navigate('/admin/utilisateurs/new')} icon={Pencil}>
        Nouveau
      </Button>
    </div>
  ), [handleExport, navigate]);

  // Configuration de l'en-tête
  usePageHeader(
    'Utilisateurs',
    headerActions,
    "Gérez les comptes utilisateurs de l'application."
  );

  const columns: Column<Utilisateur>[] = [
    {
      key: 'login',
      header: 'Login',
      sortable: true,
      width: 'w-[220px]',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar
            size="sm"
            fallback={u.prenom && u.nom ? `${u.prenom} ${u.nom}` : u.login}
            className="shrink-0"
          />
          <Text className="font-semibold text-sm">{u.login}</Text>
        </div>
      )
    },
    {
      key: 'nom',
      header: 'Nom complet',
      width: 'flex-1',
      render: (u) => (
        <Text className="text-sm text-text-secondary">
          {(u.nom || '') && (u.prenom || '') ? `${u.prenom} ${u.nom}` : '—'}
        </Text>
      )
    },
    {
      key: 'role',
      header: 'Rôle',
      width: 'hidden md:flex w-[160px]',
      render: (u) => <RoleBadge role={u.role ?? ''} />
    },
    {
      key: 'actions',
      header: '',
      width: 'w-[50px]',
      align: 'right',
      render: (u) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Popover>
            <Popover.Item
              onClick={() => navigate(`/admin/utilisateurs/${u.noUtilisateur}/edit`)}
              icon={Pencil}
            >
              Modifier
            </Popover.Item>
            <Popover.Item
              variant="destructive"
              onClick={() => setUsersToDelete([u.noUtilisateur])}
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
        placeholder="Rechercher par login..."
        className="mb-5"
      />

      <DataList
        data={utilisateurs}
        columns={columns}
        loading={loading}
        isError={!!error}
        errorTitle="Erreur de chargement"
        errorDescription="Impossible de récupérer la liste des utilisateurs."
        sortColumn="login"
        sortDirection={sortOrder}
        onSort={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        keyExtractor={(item) => item.noUtilisateur}
        onRowClick={(item) => navigate(`/admin/utilisateurs/${item.noUtilisateur}`)}
        emptyMessage="Aucun utilisateur trouvé"
        selectable={true}
        onDeleteSelected={(keys) => setUsersToDelete(keys as number[])}
        onRefresh={fetchUtilisateurs}
      />

      <ConfirmModal
        isOpen={usersToDelete.length > 0}
        onClose={() => setUsersToDelete([])}
        onConfirm={confirmDelete}
        title={usersToDelete.length > 1 ? "Supprimer les utilisateurs" : "Supprimer l'utilisateur"}
        message={usersToDelete.length > 1
          ? `Êtes-vous sûr de vouloir supprimer ces ${usersToDelete.length} utilisateurs ? Cette action est irréversible.`
          : "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."}
        confirmText="Supprimer"
      />
    </div>
  );
};