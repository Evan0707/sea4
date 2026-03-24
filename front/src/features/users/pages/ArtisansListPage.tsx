import CsvImportPopup, { type CsvArtisan } from '../components/CsvImportPopup';
import { usePageHeader } from '@/shared/context/LayoutContext';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/shared/components/ui/SearchBar';
import { DataList, type Column } from '@/shared/components/ui/DataList';
import Button from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Typography';
import { Pencil, Trash, Download, Upload } from '@mynaui/icons-react';
import Popover from '@/shared/components/ui/Popover';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/useToast';
import { useArtisans } from '../hooks/useArtisans';
import type { Artisan } from '../types';
import apiClient from '@/shared/api/client';
import { exportToCSV, type CsvColumn } from '@/shared/utils/csvExporter';
import { parseCSV } from '../utils/csvParser';
import ConfirmModal from '@/shared/components/ui/ConfirmModal';

export const ArtisansListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [artisanToDelete, setArtisanToDelete] = useState<number | null>(null);
  const [keysToDelete, setKeysToDelete] = useState<number[]>([]);

  // Custom hook usage
  const { artisans, loading, isError, deleteArtisan, fetchArtisans } = useArtisans({
    search: debouncedSearch,
    sortOrder
  });

  // CSV Drag n Drop state
  const [isDragging, setIsDragging] = useState(false);
  const [csvArtisans, setCsvArtisans] = useState<CsvArtisan[]>([]);
  const [showCsvPopup, setShowCsvPopup] = useState(false);
  const dragCounter = useRef(0);

  const handleDeleteSelected = (keys: (string | number)[]) => {
    setKeysToDelete(keys.map(Number));
  };

  const confirmDelete = async () => {
    // Suppression unitaire (via Popover)
    if (artisanToDelete) {
      try {
        await deleteArtisan(artisanToDelete);
        toast.addToast('Artisan supprimé', 'success');
      } catch {
        toast.addToast('Erreur lors de la suppression', 'error');
      }
      setArtisanToDelete(null);
    }
    // Suppression multiple (via sélection)
    if (keysToDelete.length > 0) {
      try {
        const results = await Promise.allSettled(keysToDelete.map((id) => deleteArtisan(id)));
        const fulfilledCount = results.filter(r => r.status === 'fulfilled').length;
        const rejectedCount = results.filter(r => r.status === 'rejected').length;

        if (rejectedCount === 0) {
          toast.addToast(`${fulfilledCount} artisan${fulfilledCount > 1 ? 's supprimés' : ' supprimé'}`, 'success');
        } else if (fulfilledCount === 0) {
          toast.addToast('Erreur lors de la suppression', 'error');
        } else {
          toast.addToast(`${fulfilledCount} supprimé${fulfilledCount > 1 ? 's' : ''}, ${rejectedCount} erreur${rejectedCount > 1 ? 's' : ''}`, 'error');
        }
      } catch {
        toast.addToast('Erreur inattendue lors de la suppression', 'error');
      }
      setKeysToDelete([]);
    }
  };

  const handleExport = useCallback(() => {
    const exportColumns: CsvColumn<Artisan>[] = [
      { key: 'nomArtisan', header: 'Nom' },
      { key: 'prenomArtisan', header: 'Prénom' },
      { key: 'adresseArtisan', header: 'Adresse' },
      { key: 'cpArtisan', header: 'Code Postal' },
      { key: 'villeArtisan', header: 'Ville' },
    ];
    exportToCSV(artisans, exportColumns, 'artisans');
  }, [artisans]);

  const headerActions = useMemo(() => (
    <div className='flex flex-row items-center gap-2'>
      <Button variant='Secondary' onClick={handleExport} icon={Download}>
        Exporter
      </Button>
      <Button variant='Secondary' onClick={() => { setCsvArtisans([]); setShowCsvPopup(true); }} icon={Upload}>
        Importer
      </Button>
      <Button variant='Primary' onClick={() => navigate('/admin/artisans/new')} icon={Pencil}>
        Nouveau
      </Button>
    </div>
  ), [handleExport, navigate]);

  usePageHeader(
    'Artisans',
    headerActions
  );

  // Recherche avec tampon (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Gestionnaires Drag & Drop
  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.addToast('Veuillez déposer un fichier CSV', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          toast.addToast('Aucun artisan trouvé dans le fichier', 'error');
          return;
        }
        setCsvArtisans(parsed);
        setShowCsvPopup(true);
      } catch {
        toast.addToast('Erreur lors de la lecture du fichier', 'error');
      }
    };
    reader.readAsText(file);
  }, [toast]);

  // Gestionnaires Drag & Drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    processFile(files[0]);
  }, [processFile]);

  // Configuration des colonnes
  const columns: Column<Artisan>[] = [
    {
      key: 'nomArtisan',
      header: 'Nom Prénom',
      width: 'flex-1 md:w-[200px] md:flex-none',
      sortable: true,
      render: (a) => (
        <Text className="font-semibold text-sm">
          {a.nomArtisan} {a.prenomArtisan}
        </Text>
      )
    },
    {
      key: 'adresseArtisan',
      header: 'Adresse',
      width: 'hidden md:block flex-1',
      render: (a) => (
        <div>
          <Text className="text-sm font-semibold">{a.adresseArtisan}</Text>
          <Text className="text-xs text-placeholder">{a.cpArtisan} {a.villeArtisan}</Text>
        </div>
      )
    },
    {
      key: 'etapes',
      header: 'Compétences',
      width: 'hidden lg:block flex-1',
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.etapes && a.etapes.length > 0 ? (
            a.etapes.slice(0, 3).map((e) => (
              <span key={e.noEtape} className="px-2 py-0.5 bg-bg-secondary border border-border rounded text-xs text-text-secondary whitespace-nowrap">
                {e.nomEtape}
              </span>
            ))
          ) : (
            <span className="text-xs text-placeholder italic">Aucune</span>
          )}
          {a.etapes && a.etapes.length > 3 && (
            <span className="text-xs text-text-secondary self-center">+{a.etapes.length - 3}</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      width: 'w-[50px]',
      align: 'right',
      render: (a) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Popover>
            <Popover.Item
              onClick={() => navigate(`/admin/artisans/${a.noArtisan}/edit`)}
              icon={Pencil}
            >
              Modifier
            </Popover.Item>
            <Popover.Item
              variant="destructive"
              onClick={() => setArtisanToDelete(a.noArtisan)}
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
    <div
      className="p-4 md:p-4 h-full flex flex-col relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >

      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-primary/95 backdrop-blur-sm border-2 border-dashed border-border rounded-lg z-50 flex flex-col items-center justify-center p-4 transition-all"
          >
            <div className="relative flex items-center justify-center mb-10 w-32 h-24">
              {[...Array(3)].map((_, i) => {
                const angles = [-30, 0, 30];
                const xOffsets = [-40, 0, 40];
                const yOffsets = [-10, -25, -10];
                return (
                  <motion.img
                    key={i}
                    src="/CSV_ICON.svg"
                    alt="CSV File"
                    className="absolute w-20 h-20 object-contain z-0 drop-shadow-sm opacity-50"
                    initial={{ x: 0, y: 10, rotate: 0, opacity: 0, scale: 0.6 }}
                    animate={{ x: xOffsets[i], y: yOffsets[i], rotate: angles[i], opacity: 0.6, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.05 }}
                  />
                );
              })}
              <motion.img
                src="/EXCEL_ICON.svg"
                alt="Excel File"
                className="relative w-28 h-28 object-contain z-10 drop-shadow-xl"
                initial={{ y: 10, scale: 0.95 }}
                animate={{ y: 0, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </div>
            <Text className="text-2xl font-semibold text-primary mb-2 text-center">Déposez votre fichier CSV ici</Text>
            <Text className="text-sm text-text-secondary text-center">L'importation commencera encadrant les données correspondantes au document</Text>
          </motion.div>
        )}
      </AnimatePresence>

      {showCsvPopup && (
        <CsvImportPopup
          artisans={csvArtisans}
          onClose={() => setShowCsvPopup(false)}
          onFileSelect={processFile}
          onConfirm={async (artisansToImport) => {
            try {
              // Note: direct api usage here might be moved to hook if specific action exists
              const response = await apiClient.post('/artisan/import', {
                artisans: artisansToImport
              });
              toast.addToast(response.data.message, 'success');
              setShowCsvPopup(false);
              fetchArtisans();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
              toast.addToast(error.response?.data?.message || 'Erreur lors de l\'import', 'error');
            }
          }}
        />
      )}

      <div className="mb-5 flex items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher par nom, prénom ou ville..."
        />
      </div>

      <DataList
        data={artisans}
        columns={columns}
        loading={loading}
        isError={isError}
        errorTitle="Erreur de chargement"
        errorDescription="Impossible de récupérer la liste des artisans."
        errorAction={{ label: 'Réessayer', onClick: fetchArtisans }}
        sortColumn="nomArtisan"
        sortDirection={sortOrder}
        onSort={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        keyExtractor={(item) => item.noArtisan}
        onRowClick={(item) => navigate(`/admin/artisans/${item.noArtisan}`)}
        emptyMessage="Aucun artisan trouvé"
        selectable
        onDeleteSelected={handleDeleteSelected}
        deleteLabel="Supprimer la sélection"
        onRefresh={fetchArtisans}
      />

      <ConfirmModal
        isOpen={!!artisanToDelete || keysToDelete.length > 0}
        onClose={() => { setArtisanToDelete(null); setKeysToDelete([]); }}
        onConfirm={confirmDelete}
        title={keysToDelete.length > 1 ? `Supprimer ${keysToDelete.length} artisans` : "Supprimer l'artisan"}
        message={keysToDelete.length > 1
          ? `Êtes-vous sûr de vouloir supprimer ces ${keysToDelete.length} artisans ? Cette action est irréversible.`
          : "Êtes-vous sûr de vouloir supprimer cet artisan ? Cette action est irréversible."
        }
        confirmText="Supprimer"
      />
    </div>
  );
};