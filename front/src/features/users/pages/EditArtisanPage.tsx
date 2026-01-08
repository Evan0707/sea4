import { useState, useEffect } from 'react';
import Skeleton from '@/shared/components/ui/Skeleton';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/shared/api/client';
import Input from '@/shared/components/ui/Input';
import { usePageHeader } from '@/shared/context/LayoutContext';
import { Text } from '@/shared/components/ui/Typography';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';
import Button from '@/shared/components/ui/Button';
import EtapeMultiSelect from '@/shared/components/ui/EtapeMultiSelect';
import { useToast } from '@/shared/hooks/useToast';

interface ArtisanPayload {
  nomArtisan?: string;
  prenomArtisan?: string;
  emailArtisan?: string;
  telArtisan?: string;
  adresseArtisan?: string;
  cpArtisan?: string;
  villeArtisan?: string;
  etapes?: { noEtape: number; nomEtape: string }[];
}

const EditArtisanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [artisan, setArtisan] = useState<ArtisanPayload>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Set global header
  usePageHeader(
    "Modifier l'Artisan",
    null,
    `Édition des informations de ${artisan.prenomArtisan || '...'} ${artisan.nomArtisan || '...'}`
  );

  // Gestion de la récupération des informations de l'artisan
  useEffect(() => {
    const fetch = async () => {
      if (!id || isNaN(Number(id))) {
        toast.addToast('Identifiant invalide', 'error');
        navigate('/admin/artisans');
        return;
      }
      try {
        const res = await apiClient.get(`/artisan/${id}`);
        setArtisan({
          nomArtisan: res.data.nomArtisan,
          prenomArtisan: res.data.prenomArtisan,
          emailArtisan: res.data.emailArtisan,
          telArtisan: res.data.telArtisan,
          adresseArtisan: res.data.adresseArtisan,
          cpArtisan: res.data.cpArtisan,
          villeArtisan: res.data.villeArtisan,
          etapes: res.data.etapes || [],
        });
      } catch (e) {
        console.error('Erreur fetch artisan', e);
        toast.addToast('Impossible de récupérer les informations de l\'artisan', 'error');
        navigate('/admin/artisans');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate, toast]);

  const handleChange = (
    field: keyof ArtisanPayload,
    value: string | { noEtape: number; nomEtape: string }[]
  ) => {
    setArtisan(prev => ({ ...prev, [field]: value }));
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!id || isNaN(Number(id))) return;

      await apiClient.put(`/artisan/${id}/edit`, artisan);
      toast.addToast('Artisan mis à jour avec succès', 'success');
      navigate('/admin/artisans');
    } catch (err: any) {
      console.error('Erreur update', err);
      toast.addToast(err.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 h-screen flex flex-col">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex-1 overflow-y-auto max-w-3xl w-full mx-auto">
          <div className="bg-bg-secondary rounded-lg border border-border p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            {/* Skeletons continued... simplified for brevity if needed but I'll include enough to match */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto max-w-3xl w-full mx-auto">
        <form onSubmit={handleSubmit} className="bg-bg-secondary rounded-lg border border-border p-4 md:p-6 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type='text'
              label='Nom'
              name='nomArtisan'
              value={artisan.nomArtisan || ''}
              onChange={(e) => handleChange('nomArtisan', e.target.value)}
            />
            <Input
              type='text'
              label='Prénom'
              name='prenomArtisan'
              value={artisan.prenomArtisan || ''}
              onChange={(e) => handleChange('prenomArtisan', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type='email'
              label='Email'
              name='emailArtisan'
              value={artisan.emailArtisan || ''}
              onChange={(e) => handleChange('emailArtisan', e.target.value)}
              placeholder="contact@artisan.com"
            />
            <Input
              type='tel'
              label='Téléphone'
              name='telArtisan'
              value={artisan.telArtisan || ''}
              onChange={(e) => handleChange('telArtisan', e.target.value)}
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="space-y-4">
            <Text className="font-semibold text-lg border-b border-border pb-2">Coordonnées</Text>
            <div>
              <AddressAutocomplete
                label="Adresse"
                value={artisan.adresseArtisan || ''}
                onChange={(value) => handleChange('adresseArtisan', value)}
                onAddressSelect={(address) => {
                  handleChange('adresseArtisan', address.label);
                  handleChange('cpArtisan', address.postcode);
                  handleChange('villeArtisan', address.city);
                }}
                info="Commencez à taper l'adresse pour voir les suggestions"
                placeholder="123 rue de la Paix"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type='text'
                label='Code postal'
                name='cpArtisan'
                value={artisan.cpArtisan || ''}
                onChange={(e) => handleChange('cpArtisan', e.target.value)}
              />
              <Input
                type='text'
                label='Ville'
                name='villeArtisan'
                value={artisan.villeArtisan || ''}
                onChange={(e) => handleChange('villeArtisan', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Text className="font-semibold text-lg border-b border-border pb-2">Qualifications</Text>
            <EtapeMultiSelect
              value={artisan.etapes || []}
              onChange={(etapes) => handleChange('etapes', etapes)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="Secondary" onClick={() => navigate('/admin/artisans')}>Annuler</Button>
            <Button type='submit' variant="Primary" loading={saving}>Enregistrer les modifications</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArtisanPage;
