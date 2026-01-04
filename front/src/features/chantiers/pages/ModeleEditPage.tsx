import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/shared/hooks/useToast';
import { usePageHeader } from '@/shared/context/LayoutContext';
import { useModele, useCreateModele, useUpdateModele } from '../../dossiers/hooks/useDossierData';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Textarea from '@/shared/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Grid } from '@mynaui/icons-react';
import { ArrowLeft, Save } from '@mynaui/icons-react';
import Skeleton from '@/shared/components/ui/Skeleton';
import EtapeMultiSelect from '@/shared/components/ui/EtapeMultiSelect';
import { Text } from '@/shared/components/ui/Typography';

const modeleSchema = z.object({
 nomModele: z.string().min(1, 'Le nom est requis'),
 descriptionModele: z.string().optional(),
 prixDeBase: z.number().min(0, 'Le prix doit être positif').optional(),
 etapes: z.array(z.object({
  noEtape: z.number(),
  nomEtape: z.string(),
  reservable: z.boolean().optional(),
 })).optional()
});

type ModeleFormData = z.infer<typeof modeleSchema>;

export const ModeleEditPage = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { addToast } = useToast();
 const isEditMode = !!id;

 const { data: modele, isLoading, isError } = useModele(id);
 const { mutateAsync: createModele, isPending: isCreating } = useCreateModele();
 const { mutateAsync: updateModele, isPending: isUpdating } = useUpdateModele();

 const form = useForm<ModeleFormData>({
  resolver: zodResolver(modeleSchema),
  defaultValues: {
   nomModele: '',
   descriptionModele: '',
   prixDeBase: 0,
   etapes: []
  }
 });

 useEffect(() => {
  if (modele) {
   form.reset({
    nomModele: modele.nomModele,
    descriptionModele: modele.descriptionModele || '',
    prixDeBase: 0,
    etapes: modele.etapes || []
   });
  }
 }, [modele, form.reset]);

 const onSubmit = useCallback(async (data: ModeleFormData) => {
  try {
   const payload = {
    ...data,
    etapes: (data.etapes || []).map(e => ({ noEtape: e.noEtape, nomEtape: e.nomEtape }))
   };
   if (isEditMode && id) {
    await updateModele({
     id: parseInt(id),
     data: {
      nomModele: payload.nomModele,
      descriptionModele: payload.descriptionModele,
      etapes: payload.etapes
     }
    });
    addToast('Modèle mis à jour avec succès', 'success');
   } else {
    await createModele({
     nomModele: payload.nomModele,
     descriptionModele: payload.descriptionModele,
     etapes: payload.etapes
    });
    addToast('Modèle créé avec succès', 'success');
   }
   navigate('/admin/modeles');
  } catch (error) {
   addToast('Une erreur est survenue', 'error');
  }
 }, [isEditMode, id, updateModele, createModele, navigate, addToast]);

 const { isDirty } = form.formState;

 const headerActions = useMemo(() => (
  <div className="flex gap-2">
   <Button variant="Secondary" onClick={() => navigate('/admin/modeles')} icon={ArrowLeft}>
    Annuler
   </Button>
   <Button
    variant="Primary"
    icon={Save}
    onClick={form.handleSubmit(onSubmit)}
    loading={isCreating || isUpdating}
    disabled={!isDirty}
   >
    Enregistrer
   </Button>
  </div>
 ), [navigate, form.handleSubmit, onSubmit, isCreating, isUpdating, isDirty]);

 usePageHeader(
  isEditMode ? 'Modifier le Modèle' : 'Nouveau Modèle',
  headerActions,
  isEditMode ? `Modification du modèle #${id}` : 'Création d\'un nouveau modèle de maison'
 );

 if (isEditMode && isLoading) {
  return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
 }

 if (isEditMode && isError) {
  return (
   <div className="p-8 flex flex-col items-center justify-center">
    <Text className="text-red-500 mb-4">Impossible de charger le modèle. Veuillez réessayer.</Text>
    <Button variant="Secondary" onClick={() => navigate('/admin/modeles')} icon={ArrowLeft}>Retour</Button>
   </div>
  );
 }

 return (
  <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
   <Card>
    <CardHeader className="border-b border-border">
     <div className="flex items-center gap-3">
      <div className="p-3 bg-primary/10 rounded-xl">
       <Grid className="w-6 h-6 text-primary" />
      </div>
      <div>
       <CardTitle>{isEditMode ? modele?.nomModele || 'Modèle' : 'Nouveau Modèle'}</CardTitle>
       <CardDescription>
        {isEditMode ? 'Modifiez les informations du modèle' : 'Créez un nouveau modèle de maison'}
       </CardDescription>
      </div>
     </div>
    </CardHeader>
    <CardContent className="space-y-8 pt-6">
     {/* Section: Informations générales */}
     <div className="space-y-4">
      <Text className="font-semibold text-text-primary flex items-center gap-2">
       <span className="w-2 h-2 bg-primary rounded-full"></span>
       Informations générales
      </Text>
      <div className="pl-4 space-y-4">
       <Input
        type="text"
        name="nomModele"
        label="Nom du modèle"
        placeholder="Ex: T3 Standard, Villa Premium..."
        register={form.register('nomModele')}
        error={form.formState.errors.nomModele?.message}
        required
       />
       <Textarea
        name="descriptionModele"
        label="Description"
        placeholder="Décrivez les caractéristiques principales de ce modèle..."
        register={form.register('descriptionModele')}
        error={form.formState.errors.descriptionModele?.message}
       />
      </div>
     </div>

     {/* Section: Étapes de construction */}
     <div className="space-y-4">
      <Text className="font-semibold text-text-primary flex items-center gap-2">
       <span className="w-2 h-2 bg-primary rounded-full"></span>
       Étapes de construction
      </Text>
      <div className="pl-4">
       <EtapeMultiSelect
        value={form.watch('etapes') || []}
        onChange={(etapes) => {
         const sorted = [...etapes].sort((a, b) => a.noEtape - b.noEtape);
         form.setValue('etapes', sorted, { shouldDirty: true });
        }}
        label="Sélectionner les étapes"
        disabled={isEditMode}
        info={isEditMode ? "Les étapes ne peuvent pas être modifiées après création" : undefined}
       />
       {!isEditMode && (
        <Text className="text-sm text-placeholder mt-2">
         Les étapes seront associées dans l'ordre de leur numéro.
        </Text>
       )}
      </div>
     </div>
    </CardContent>
   </Card>
  </div>
 );
};
