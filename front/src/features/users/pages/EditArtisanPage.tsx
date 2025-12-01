import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '@/shared/components/ui/Input';
import { H1, Text } from '@/shared/components/ui/Typography';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';
import Button from '@/shared/components/ui/Button';
import EtapeMultiSelect from '@/shared/components/ui/EtapeMultiSelect';

interface ArtisanPayload {
  nomArtisan?: string;
  prenomArtisan?: string;
  adresseArtisan?: string;
  cpArtisan?: string;
  villeArtisan?: string;
  etapes?: { noEtape: number; nomEtape: string }[];
}

const EditArtisanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState<ArtisanPayload>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id || isNaN(Number(id))) {
        alert('Identifiant invalide');
        navigate(-1);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:8000/api/artisan/${id}`);
        // API returns keys without extra quotes in the show action
        setArtisan({
          nomArtisan: res.data.nomArtisan,
          prenomArtisan: res.data.prenomArtisan,
          adresseArtisan: res.data.adresseArtisan,
          cpArtisan: res.data.cpArtisan,
          villeArtisan: res.data.villeArtisan,
            etapes: res.data.etapes || [],
        });
      } catch (e) {
        console.error('Erreur fetch artisan', e);
        alert('Impossible de récupérer l\'artisan');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleChange = (
    field: keyof ArtisanPayload,
    value: string | { noEtape: number; nomEtape: string }[]
  ) => {
    setArtisan(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Backend expects keys like nomArtisan, prenomArtisan, etc.
      if (!id || isNaN(Number(id))) {
        alert('Identifiant invalide');
        return;
      }
      await axios.put(`http://localhost:8000/api/artisan/${id}/edit`, artisan);
      alert('Artisan mis à jour');
      // go back to list
      navigate(-1);
    } catch (err: any) {
      console.error('Erreur update', err);
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8"><Text>Chargement...</Text></div>;
  }

  return (
    <div className="p-8">
      <H1 className="mb-6">Modifier Artisan</H1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>

          <Input type='text' label='Nom' name='nomArtisan' value={artisan.nomArtisan || ''} onChange={(e) => handleChange('nomArtisan', e.target.value)} />
        </div>

        <div>
          <Input type='text' label='Prénom' name='prenomArtisan' value={artisan.prenomArtisan || ''} onChange={(e) => handleChange('prenomArtisan', e.target.value)} />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input type='text' label='Code postal' name='cpArtisan' value={artisan.cpArtisan || ''} onChange={(e) => handleChange('cpArtisan', e.target.value)} />
          </div>
          <div>
            <Input type='text' label='Ville' name='villeArtisan' value={artisan.villeArtisan || ''} onChange={(e) => handleChange('villeArtisan', e.target.value)} />
          </div>
        </div>

        <EtapeMultiSelect
          value={artisan.etapes || []}
          onChange={(etapes) => handleChange('etapes', etapes)}
        />

        <div className="flex gap-3">
          <Button type="button" variant="Secondary" onClick={() => navigate(-1)}>Annuler</Button>
          <Button type='submit' variant="Primary" loading={saving}>Enregistrer</Button>
        </div>
      </form>
    </div>
  );
};

export default EditArtisanPage;
