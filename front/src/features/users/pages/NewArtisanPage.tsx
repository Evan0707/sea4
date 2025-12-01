import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '@/shared/components/ui/Input';
import { H1 } from '@/shared/components/ui/Typography';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';
import Button from '@/shared/components/ui/Button';
import EtapeMultiSelect from '@/shared/components/ui/EtapeMultiSelect';

interface Etape { noEtape: number; nomEtape: string }

const NewArtisanPage = () => {
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [cp, setCp] = useState('');
  const [ville, setVille] = useState('');
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        nomArtisan: nom,
        prenomArtisan: prenom,
        adresseArtisan: adresse,
        cpArtisan: cp,
        villeArtisan: ville,
      };
      if (etapes.length) payload.etapes = etapes;

      await axios.post('http://localhost:8000/api/artisan', payload);
      alert('Artisan créé');
      navigate(-1);
    } catch (err: any) {
      console.error('Erreur create artisan', err);
      alert(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <H1 className="mb-6">Nouveau Artisan</H1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <Input type='text' label='Nom' name='nomArtisan' value={nom} onChange={(e) => setNom(e.target.value)} />
        <Input type='text' label='Prénom' name='prenomArtisan' value={prenom} onChange={(e) => setPrenom(e.target.value)} />

        <AddressAutocomplete
          label="Adresse"
          value={adresse}
          onChange={(value) => setAdresse(value)}
          onAddressSelect={(address) => {
            setAdresse(address.label);
            setCp(address.postcode);
            setVille(address.city);
          }}
          info="Commencez à taper l'adresse pour voir les suggestions"
          placeholder="123 rue de la Paix"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input type='text' label='Code postal' name='cpArtisan' value={cp} onChange={(e) => setCp(e.target.value)} />
          <Input type='text' label='Ville' name='villeArtisan' value={ville} onChange={(e) => setVille(e.target.value)} />
        </div>

        <EtapeMultiSelect value={etapes} onChange={(items) => setEtapes(items)} />

        <div className="flex gap-3">
          <Button type="button" variant="Secondary" onClick={() => navigate(-1)}>Annuler</Button>
          <Button type='submit' variant="Primary" loading={saving}>Créer</Button>
        </div>
      </form>
    </div>
  );
};

export default NewArtisanPage;
