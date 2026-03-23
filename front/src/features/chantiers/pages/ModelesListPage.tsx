import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataList, type Column } from '@/shared/components/ui/DataList';
import Button from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Typography';
import { Plus, Pencil, Trash, Grid, Download } from '@mynaui/icons-react';
import Popover from '@/shared/components/ui/Popover';
import { useModeles, useDeleteModele } from '../../dossiers/hooks/useDossierData';
import type { Modele } from '@/shared/types/dossier';
import { useToast } from '@/shared/hooks/useToast';
import ConfirmModal from '@/shared/components/ui/ConfirmModal';
import { usePageHeader } from '@/shared/context/LayoutContext';
import { exportToCSV, type CsvColumn } from '@/shared/utils/csvExporter';

export const ModelesListPage = () => {
 const navigate = useNavigate();
 const { addToast } = useToast();
 const [modelToDelete, setModelToDelete] = useState<number | null>(null);

 const { data: modeles = [], isLoading } = useModeles();
 const deleteMutation = useDeleteModele();

 // Gestion de l'edition
 const handleEdit = (id: number) => {
  navigate(`/admin/modeles/${id}/edit`);
 };

 // Gestion de la suppression
 const handleDelete = async () => {
  if (modelToDelete) {
   try {
    await deleteMutation.mutateAsync(modelToDelete);
    addToast('Modèle supprimé avec succès', 'success');
   } catch (error: any) {
    addToast(error.response?.data?.message || 'Erreur lors de la suppression du modèle', 'error');
   }
   setModelToDelete(null);
  }
 };

 // Exportation model csv
 const handleExport = useCallback(() =>{
    const exportColumns: CsvColumn<Modele>[] = [
        { key: 'noModele', header: 'Numero Modele'},
        { key: 'nomModele', header: 'Nom Modele'},
        { key: 'descriptionModele', header: 'Description Modele'},
    ];
    exportToCSV(modeles as Modele[], exportColumns, 'modeles')
 }, [modeles])

 // Mettre en place les actions du header
 const headerActions = useMemo(() => (
    <div className='flex gap-2'>
    <Button variant="Secondary" icon={Download} onClick={handleExport}>
        Exporter CSV
      </Button>

  <Button
   variant="Primary"
   icon={Plus}
   onClick={() => navigate('/admin/modeles/new')}
  >
   Nouveau Modèle
  </Button>
  </div>
 ), [handleExport, navigate]);

 usePageHeader(
  'Modèles de Maisons',
  headerActions,
  'Gérez les modèles de maisons disponibles.'
 );

 const columns: Column<Modele>[] = [
  {
   key: 'nomModele',
   header: 'Nom',
   width: 'flex-1',
   sortable: true,
   render: (m) => (
    <div className="flex items-center gap-3">
     <div className="p-2 bg-primary/10 rounded-lg text-primary">
      <Grid className="w-5 h-5" />
     </div>
     <div>
      <Text className="font-semibold">{m.nomModele}</Text>
     </div>
    </div>
   )
  },
  {
   key: 'descriptionModele',
   header: 'Description',
   width: 'flex-[2] hidden md:flex',
   render: (m) => (
    <Text className="text-sm text-placeholder truncate max-w-[400px]">
     {m.descriptionModele || 'Aucune description'}
    </Text>
   )
  },
  {
   key: 'actions',
   header: '',
   width: 'w-[50px]',
   align: 'right',
   render: (m) => (
    <div onClick={(e) => e.stopPropagation()}>
     <Popover>
      <Popover.Item
       onClick={() => handleEdit(m.noModele)}
       icon={Pencil}
      >
       Modifier
      </Popover.Item>
      <Popover.Item
       variant="destructive"
       onClick={() => setModelToDelete(m.noModele)}
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
   <DataList
    data={modeles}
    columns={columns}
    loading={isLoading}
    keyExtractor={(item) => item.noModele}
    onRowClick={(item) => handleEdit(item.noModele)}
    emptyMessage="Aucun modèle trouvé"
   />

   <ConfirmModal
    isOpen={!!modelToDelete}
    onClose={() => setModelToDelete(null)}
    onConfirm={handleDelete}
    title="Supprimer le modèle"
    message="Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action est irréversible."
    confirmText="Supprimer"
   />
  </div>
 );
};
