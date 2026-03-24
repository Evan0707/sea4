
import type { UseFormReturn } from 'react-hook-form';
import Input from '@/shared/components/ui/Input';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import type { ClientFormData } from '@/shared/utils/validators';
import { H3 } from '@/shared/components/ui/Typography';

interface ClientStepProps {
  form: UseFormReturn<ClientFormData>;
}

export const ClientStep = ({ form }: ClientStepProps) => {
  const { register, formState: { errors }, setValue, watch } = form;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informations client</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Identité */}
        <div className="space-y-4">
          <H3 className="text-sm font-bold uppercase tracking-wider text-placeholder">Identité</H3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom"
              type="text"
              name="nomClient"
              register={register('nomClient')}
              error={errors.nomClient?.message}
              placeholder="Ex: Dupont"
              required
            />
            <Input
              label="Prénom"
              type="text"
              name="prenomClient"
              register={register('prenomClient')}
              error={errors.prenomClient?.message}
              placeholder="Ex: Jean"
              required
            />
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-border/60" />

        {/* Coordonnées */}
        <div className="space-y-4">
          <H3 className="text-sm font-bold uppercase tracking-wider text-placeholder">Coordonnées</H3>
          <div className="space-y-4">
            <AddressAutocomplete
              label="Adresse de résidence"
              value={watch('adresseClient') || ''}
              onChange={(value) => setValue('adresseClient', value)}
              onAddressSelect={(address) => {
                setValue('adresseClient', address.label);
                setValue('cpClient', address.postcode);
                setValue('villeClient', address.city);
              }}
              error={errors.adresseClient?.message}
              info
              message="Utilisé pour la facturation et le contrat"
              placeholder="123 rue de la Paix"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Code postal"
                type="text"
                name="cpClient"
                register={register('cpClient')}
                error={errors.cpClient?.message}
                placeholder="75000"
                required
              />
              <Input
                label="Ville"
                type="text"
                name="villeClient"
                register={register('villeClient')}
                error={errors.villeClient?.message}
                placeholder="Paris"
                required
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
