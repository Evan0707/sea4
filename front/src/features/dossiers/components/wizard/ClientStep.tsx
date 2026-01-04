import type { UseFormReturn } from 'react-hook-form';
import Input from '@/shared/components/ui/Input';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import type { ClientFormData } from '@/shared/utils/validators';

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
   <CardContent>
    <form className="space-y-4">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
       label="Nom *"
       type="text"
       name="nomClient"
       register={register('nomClient')}
       error={errors.nomClient?.message}
       placeholder="Dupont"
       info={true}
       message="Nom de famille du client (obligatoire)"
      />
      <Input
       label="Prénom *"
       type="text"
       name="prenomClient"
       register={register('prenomClient')}
       error={errors.prenomClient?.message}
       placeholder="Jean"
       info={true}
       message="Prénom du client (obligatoire)"
      />
     </div>
     <AddressAutocomplete
      label="Adresse"
      value={watch('adresseClient') || ''}
      onChange={(value) => setValue('adresseClient', value)}
      onAddressSelect={(address) => {
       setValue('adresseClient', address.label);
       setValue('cpClient', address.postcode);
       setValue('villeClient', address.city);
      }}
      error={errors.adresseClient?.message}
      info="Commencez à taper l'adresse pour voir les suggestions"
      placeholder="123 rue de la Paix"
     />
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
       label="Code postal"
       type="text"
       name="cpClient"
       register={register('cpClient')}
       error={errors.cpClient?.message}
       placeholder="75000"
       info={true}
       message="Code postal à 5 chiffres"
      />
      <Input
       label="Ville"
       type="text"
       name="villeClient"
       register={register('villeClient')}
       error={errors.villeClient?.message}
       placeholder="Paris"
      />
     </div>
    </form>
   </CardContent>
  </Card>
 );
};
