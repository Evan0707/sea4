import type { UseFormReturn } from 'react-hook-form';
import Input from '@/shared/components/ui/Input';
import DateInput from '@/shared/components/ui/DateInput';
import Select from '@/shared/components/ui/Select';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { H3, Text } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';
import type { ChantierFormData } from '@/shared/utils/validators';
import { useEtapes, useMaitresOeuvre, useModeles } from '../../hooks/useDossierData';

interface ChantierStepProps {
  form: UseFormReturn<ChantierFormData>;
}

export const ChantierStep = ({ form }: ChantierStepProps) => {
  // Destructuration des props
  const { register, formState: { errors }, setValue, watch } = form;

  const { data: maitresOeuvre = [] } = useMaitresOeuvre();
  const { data: modeles = [] } = useModeles();

  // Recuperation de l'id du modele selectionne
  const selectedModeleId = watch('noModele');
  const { data: etapesModele = [], isLoading: loadingEtapes } = useEtapes(selectedModeleId ?? null);

  return (

    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informations chantier</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
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
            info="Commencez à taper l'adresse du chantier"
            placeholder="456 avenue du Bâtiment"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Code postal"
              type="text"
              name="cpChantier"
              register={register('cpChantier')}
              error={errors.cpChantier?.message}
              placeholder="75000"
              info={true}
              message="Code postal du chantier (5 chiffres)"
            />
            <Input
              label="Ville"
              type="text"
              name="villeChantier"
              register={register('villeChantier')}
              error={errors.villeChantier?.message}
              placeholder="Paris"
            />
          </div>
          <DateInput
            label="Date de création"
            name="dateCreation"
            register={register('dateCreation')}
            error={errors.dateCreation?.message}
            info={true}
            message="Date de début du chantier"
          // min={new Date().toISOString().split('T')[0]}
          />
          <div>
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
              error={errors.noMOE?.message}
            />
          </div>
          <div>
            <Select
              label="Modèle"
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

          {/* Affichage des étapes si un modèle est sélectionné */}
          {selectedModeleId && (
            <div className="mt-6">
              <H3 className="mb-3">
                Étapes du modèle
              </H3>
              <div className="space-y-2">
                {loadingEtapes ? (
                  <>
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </>
                ) : etapesModele.length > 0 ? (
                  etapesModele.map((etape, i) => (
                    <div
                      key={etape.noEtape}
                      className="p-3 bg-bg-primary text-text-primary rounded-lg"
                    >
                      <p className="font-medium">{i + 1} - {etape.nomEtape}</p>
                    </div>
                  ))
                ) : (
                  <Text className="text-text-secondary text-sm">Aucune étape trouvée pour ce modèle</Text>
                )}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
