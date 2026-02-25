import CsvImportPopup, { type CsvArtisan } from '../components/CsvImportPopup';
import { usePageHeader } from '@/shared/context/LayoutContext';
import SearchBar from '@/shared/components/ui/SearchBar';
import { DataList, type Column } from '@/shared/components/ui/DataList';
import Button from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Typography';
import { Pencil, Trash, Download } from '@mynaui/icons-react';
import Popover from '@/shared/components/ui/Popover';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

  // Custom hook usage
  const { artisans, loading, deleteArtisan, fetchArtisans } = useArtisans({
    search: debouncedSearch,
    sortOrder
  });

  // CSV Drag n Drop state
  const [isDragging, setIsDragging] = useState(false);
  const [csvArtisans, setCsvArtisans] = useState<CsvArtisan[]>([]);
  const [showCsvPopup, setShowCsvPopup] = useState(false);
  const dragCounter = useRef(0);

  const confirmDelete = async () => {
    if (artisanToDelete) {
      try {
        await deleteArtisan(artisanToDelete);
      } catch (e) {
        toast.addToast('Erreur lors de la suppression', 'error');
      }
      setArtisanToDelete(null);
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
      <Button variant='Secondary' onClick={handleExport} size='md' icon={Download}>
        Exporter CSV
      </Button>
      <Button variant='Secondary' onClick={() => fileInputRef.current?.click()} size='md'>
        Importer CSV
      </Button>
      <Button variant='Primary' onClick={() => navigate('/admin/artisans/new')} size='md'>
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

  // Gestionnaires Drag & Drop
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    // Reset value to allow selecting same file again
    e.target.value = '';
  };

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
      {isDragging && (
        <div
          className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg z-50 flex items-center justify-center"
        >
          <Text className="text-xl font-semibold text-primary">Déposez votre fichier CSV ici</Text>
        </div>
      )}

      {showCsvPopup && (
        <CsvImportPopup
          artisans={csvArtisans}
          onClose={() => setShowCsvPopup(false)}
          onConfirm={async (artisansToImport) => {
            try {
              // Note: direct api usage here might be moved to hook if specific action exists
              const response = await apiClient.post('/artisan/import', {
                artisans: artisansToImport
              });
              toast.addToast(response.data.message, 'success');
              setShowCsvPopup(false);
              fetchArtisans();
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
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".csv"
          className="hidden"
        />
      </div>

      <DataList
        data={artisans}
        columns={columns}
        loading={loading}
        sortColumn="nomArtisan"
        sortDirection={sortOrder}
        onSort={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        keyExtractor={(item) => item.noArtisan}
        onRowClick={(item) => navigate(`/admin/artisans/${item.noArtisan}`)}
        emptyMessage="Aucun artisan trouvé"
      />

      <ConfirmModal
        isOpen={!!artisanToDelete}
        onClose={() => setArtisanToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'artisan"
        message="Êtes-vous sûr de vouloir supprimer cet artisan ? Cette action est irréversible."
        confirmText="Supprimer"
      />
    </div>
  );
};