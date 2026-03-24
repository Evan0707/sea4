
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import apiClient from '@/shared/api/client';
import Input from '@/shared/components/ui/Input';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';
import Button from '@/shared/components/ui/Button';
import EtapeMultiSelect from '@/shared/components/ui/EtapeMultiSelect';
import { useToast } from '@/shared/hooks/useToast';
import { usePageHeader } from '@/shared/context/LayoutContext';
import { artisanSchema, type ArtisanFormData } from '@/shared/utils/validators';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { H1, Text } from '@/shared/components/ui/Typography';


interface Etape { noEtape: number; nomEtape: string }

const NewArtisanPage = () => {
  usePageHeader('Nouveau Artisan');
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [etapes, setEtapes] = useState<Etape[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ArtisanFormData>({
    resolver: zodResolver(artisanSchema),
    defaultValues: {
      nomArtisan: '',
      prenomArtisan: '',
      emailArtisan: '',
      telArtisan: '',
      adresseArtisan: '',
      cpArtisan: '',
      villeArtisan: '',
    }
  });

  const adresseArtisan = watch('adresseArtisan');

  const onSubmit = async (data: ArtisanFormData) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        nomArtisan: data.nomArtisan,
        prenomArtisan: data.prenomArtisan || undefined,
        emailArtisan: data.emailArtisan || undefined,
        telArtisan: data.telArtisan || undefined,
        adresseArtisan: data.adresseArtisan || undefined,
        cpArtisan: data.cpArtisan || undefined,
        villeArtisan: data.villeArtisan || undefined,
      };
      if (etapes.length) payload.etapes = etapes;

      await apiClient.post('/artisan', payload);
      addToast('Artisan créé avec succès', 'success');
      navigate(-1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la création';
      addToast(message, 'error');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col max-w-4xl mx-auto w-full overflow-y-auto">
      <div className="mb-6">
        <H1 className="mb-2">Nouveau Artisan</H1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Nom"
                name="nomArtisan"
                register={register('nomArtisan')}
                error={errors.nomArtisan?.message}
                required
              />
              <Input
                type="text"
                label="Prénom"
                name="prenomArtisan"
                register={register('prenomArtisan')}
                error={errors.prenomArtisan?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="email"
                label="Email"
                name="emailArtisan"
                placeholder="contact@artisan.com"
                register={register('emailArtisan')}
                error={errors.emailArtisan?.message}
              />
              <Input
                type="tel"
                label="Téléphone"
                name="telArtisan"
                placeholder="06 12 34 56 78"
                register={register('telArtisan')}
                error={errors.telArtisan?.message}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Text variant="caption" className="font-semibold text-text-primary uppercase tracking-wider">Localisation</Text>
                <div className="h-px flex-1 bg-border" />
              </div>

                <AddressAutocomplete
                  label="Adresse"
                  value={adresseArtisan}
                  onChange={(value) => setValue('adresseArtisan', value)}
                  onAddressSelect={(address) => {
                    setValue('adresseArtisan', address.label);
                    setValue('cpArtisan', address.postcode);
                    setValue('villeArtisan', address.city);
                  }}
                  info
                  message="Commencez à taper l'adresse pour voir les suggestions de localisation précise."
                  placeholder="123 rue de la Paix"
                  required
                />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Code postal"
                  name="cpArtisan"
                  register={register('cpArtisan')}
                  error={errors.cpArtisan?.message}
                  required
                />
                <Input
                  type="text"
                  label="Ville"
                  name="villeArtisan"
                  register={register('villeArtisan')}
                  error={errors.villeArtisan?.message}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Text variant="caption" className="font-semibold text-text-primary uppercase tracking-wider">Qualifications</Text>
                <div className="h-px flex-1 bg-border" />
              </div>
              <EtapeMultiSelect 
                label="Domaines d'intervention"
                value={etapes} 
                onChange={(items) => setEtapes(items)} 
                info
                message="Sélectionnez les étapes ou corps de métier sur lesquels cet artisan intervient par défaut."
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button
                variant="Secondary"
                type="button"
                size="md"
                onClick={() => navigate(-1)}
              >
                Annuler
              </Button>
              <Button
                variant="Primary"
                type="submit"
                size="md"
                loading={isSubmitting}
              >
                Créer l'artisan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewArtisanPage;
