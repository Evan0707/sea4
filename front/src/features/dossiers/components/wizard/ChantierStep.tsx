
import type { UseFormReturn } from 'react-hook-form';
import Input from '@/shared/components/ui/Input';
import DateInput from '@/shared/components/ui/DateInput';
import Select from '@/shared/components/ui/Select';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { H3, Text } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';
import type { ChantierFormData } from '@/shared/utils/validators';
import { useEtapes, useMaitresOeuvre, useModeles } from '@/features/dossiers/hooks/useDossierData';

interface ChantierStepProps {
  form: UseFormReturn<ChantierFormData>;
}

export const ChantierStep = ({ form }: ChantierStepProps) => {
  const { register, formState: { errors }, setValue, watch } = form;

  const { data: maitresOeuvre = [] } = useMaitresOeuvre();
  const { data: modeles = [] } = useModeles();

  const selectedModeleId = watch('noModele');
  const { data: etapesModele = [], isLoading: loadingEtapes } = useEtapes(selectedModeleId ?? null);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informations chantier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Localisation */}
        <div className="space-y-4">
          <H3 className="text-sm font-bold uppercase tracking-wider text-placeholder">Localisation</H3>
          <div className="space-y-4">
            <AddressAutocomplete
              label="Adresse du chantier"
              value={watch('adresseChantier') || ''}
              onChange={(value) => setValue('adresseChantier', value)}
              onAddressSelect={(address) => {
                setValue('adresseChantier', address.label);
                setValue('cpChantier', address.postcode);
                setValue('villeChantier', address.city);
                if (address.coordinates) {
                  setValue('longitude', address.coordinates[0]);
                  setValue('latitude', address.coordinates[1]);
                }
              }}
              error={errors.adresseChantier?.message}
              info
              message="Lieu précis de l'intervention. Utilisé pour la géolocalisation et le suivi du chantier."
              placeholder="456 avenue du Bâtiment"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input
                label="Code postal"
                type="text"
                name="cpChantier"
                register={register('cpChantier')}
                error={errors.cpChantier?.message}
                placeholder="75000"
                required
              />
               <Input
                label="Ville"
                type="text"
                name="villeChantier"
                register={register('villeChantier')}
                error={errors.villeChantier?.message}
                placeholder="Paris"
                required
              />
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-border/60" />

        {/* Détails du projet */}
        <div className="space-y-4">
          <H3 className="text-sm font-bold uppercase tracking-wider text-placeholder">Détails du projet</H3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput
              label="Date de création"
              name="dateCreation"
              register={register('dateCreation')}
              error={errors.dateCreation?.message}
              required
            />
            <Select
              label="Statut initial"
              name="statutChantier"
              options={[
                { value: 'À compléter', label: 'À compléter' },
                { value: 'À venir', label: 'À venir' },
                { value: 'En chantier', label: 'En chantier' },
              ]}
              register={register('statutChantier')}
              error={errors.statutChantier?.message}
              required
              info
              message="Le statut permet de suivre l'avancement global du dossier."
            />
            <Select
              label="Maître d'œuvre"
              name="noMOE"
              options={[
                { value: '', label: 'Aucun' },
                ...maitresOeuvre.map((moe) => ({
                  value: String(moe.noMOE),
                  label: `${moe.prenomMOE} ${moe.nomMOE}`,
                })),
              ]}
              register={register('noMOE', {
                setValueAs: (v) => (v ? parseInt(v) : undefined),
              })}
              onChange={(value) => {
                const numValue = value ? parseInt(value) : undefined;
                setValue('noMOE', numValue);
              }}
              error={errors.noMOE?.message}
            />
            <Select
              label="Modèle de construction"
              name="noModele"
              options={[
                { value: '', label: 'Aucun' },
                ...modeles.map((modele) => ({
                  value: String(modele.noModele),
                  label: modele.nomModele,
                })),
              ]}
              register={register('noModele', {
                setValueAs: (v) => (v ? parseInt(v) : undefined),
              })}
              onChange={(value) => {
                const numValue = value ? parseInt(value) : undefined;
                setValue('noModele', numValue);
              }}
              error={errors.noModele?.message}
            />
          </div>
        </div>

        {/* Étapes du modèle */}
        {selectedModeleId && (
          <>
            <div className="border-t border-border/60" />
            <div className="space-y-4">
              <H3 className="text-sm font-bold uppercase tracking-wider text-placeholder">Étapes du modèle</H3>
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-border/60" />
                
                {loadingEtapes ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-border" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  ))
                ) : etapesModele.length > 0 ? (
                  etapesModele.map((etape, i) => (
                    <div key={etape.noEtape} className="relative group">
                      <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2 border-primary bg-bg-primary group-hover:bg-primary transition-colors" />
                      <div className="p-3 bg-bg-secondary/30 rounded-lg border border-border/40 transition-all">
                        <Text className="font-medium text-sm">
                          <span className="text-primary mr-2 italic font-serif">{i + 1}.</span> 
                          {etape.nomEtape}
                        </Text>
                      </div>
                    </div>
                  ))
                ) : (
                  <Text className="text-text-secondary text-sm italic">Aucune étape définie pour ce modèle</Text>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
