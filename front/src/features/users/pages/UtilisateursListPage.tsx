import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataList, type Column } from '@/shared/components/ui/DataList';
import Button from '@/shared/components/ui/Button';
import SearchBar from '@/shared/components/ui/SearchBar';
import { Text } from '@/shared/components/ui/Typography';
import { Trash, Download, Pencil } from '@mynaui/icons-react';
import Popover from '@/shared/components/ui/Popover';
import { useUtilisateurs } from '../hooks/useUtilisateurs';
import type { Utilisateur } from '../types';
import { exportToCSV, type CsvColumn } from '@/shared/utils/csvExporter';
import { usePageHeader } from '@/shared/context/LayoutContext';
import ConfirmModal from '@/shared/components/ui/ConfirmModal';

export const UtilisateursListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Utilisation du hook personnalisé pour récupérer les utilisateurs
  const { utilisateurs, loading, deleteUtilisateur } = useUtilisateurs({
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
    if (userToDelete) {
      await deleteUtilisateur(userToDelete);
      setUserToDelete(null);
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
  }, [utilisateurs]) ;

  // Configuration des actions dans le header
  const headerActions = useMemo(() => (
    <div className="flex items-center gap-2">
      <Button variant="Secondary" onClick={handleExport} icon={Download}>
        Exporter CSV
      </Button>
      <Button variant='Primary' onClick={() => navigate('/admin/utilisateurs/new')}>
        Nouveau
      </Button>
    </div>
  ), []);

  // Configuration de l'en-tête
  usePageHeader(
    'Utilisateurs',
    headerActions,
    "Gérez les comptes utilisateurs de l'application."
  );

  // Configuration des colonnes
  const columns: Column<Utilisateur>[] = [
    {
      key: 'login',
      // ...
      header: 'Login',
      sortable: true,
      width: 'w-[200px]',
      render: (u) => (
        <div className="flex items-center gap-2">
          {/* Avatar placeholder or icon could go here */}
          <Text className="font-semibold text-sm">{u.login}</Text>
        </div>
      )
    },
    {
      key: 'nom',
      header: 'Nom',
      width: 'flex-1',
      render: (u) => (
        <Text className="text-sm">{(u.nom || '') + ' ' + (u.prenom || '')}</Text>
      )
    },
    {
      key: 'role',
      header: 'Rôle',
      width: 'hidden md:flex w-[200px]',
      render: (u) => (
        <span className="px-2 py-0.5 bg-bg-secondary border border-border rounded text-xs text-text-secondary whitespace-nowrap capitalize">
          {u.role ? u.role.replace('_', ' ') : 'N/A'}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      width: 'w-[50px]',
      align: 'right',
      render: (u) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Popover>
            {/* Edit could be added here if edit page exists/is required */}
            <Popover.Item
              onClick={() => navigate(`/admin/utilisateurs/${u.noUtilisateur}/edit`)}
              icon={Pencil}
            >
              Modifier
            </Popover.Item>
            <Popover.Item
              variant="destructive"
              onClick={() => setUserToDelete(u.noUtilisateur)}
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
        sortColumn="login"
        sortDirection={sortOrder}
        onSort={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        keyExtractor={(item) => item.noUtilisateur}
        onRowClick={(item) => navigate(`/admin/utilisateurs/${item.noUtilisateur}`)}
        emptyMessage="Aucun utilisateur trouvé"
      />

      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'utilisateur"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
        confirmText="Supprimer"
      />
    </div>
  );
};