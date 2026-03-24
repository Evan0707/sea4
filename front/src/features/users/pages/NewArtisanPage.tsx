import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/shared/api/client';
import Input from '@/shared/components/ui/Input';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';
import Button from '@/shared/components/ui/Button';
import EtapeMultiSelect from '@/shared/components/ui/EtapeMultiSelect';
import { useToast } from '@/shared/hooks/useToast';

import { usePageHeader } from '@/shared/context/LayoutContext';

interface Etape { noEtape: number; nomEtape: string }

const NewArtisanPage = () => {
  usePageHeader('Nouveau Artisan');
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [cp, setCp] = useState('');
  const [ville, setVille] = useState('');
  const [mdp, setMDP] = useState('');
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [saving, setSaving] = useState(false);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        nomArtisan: nom,
        prenomArtisan: prenom,
        emailArtisan: email,
        telArtisan: telephone,
        adresseArtisan: adresse,
        cpArtisan: cp,
        villeArtisan: ville,
        mdpArtisan: mdp,
      };
      if (etapes.length) payload.etapes = etapes;

      await apiClient.post('/artisan', payload);
      addToast('Artisan créé avec succès', 'success');
      navigate(-1);
    } catch (err: any) {
      console.error('Erreur create artisan', err);
      const message = err.response?.data?.message || 'Erreur lors de la création';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4 bg-bg-secondary p-4 md:p-6 rounded-lg border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type='text' label='Nom' name='nomArtisan' value={nom} onChange={(e) => setNom(e.target.value)} required />
            <Input type='text' label='Prénom' name='prenomArtisan' value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type='email' label='Email' name='emailArtisan' value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@artisan.com" />
            <Input type='tel' label='Téléphone' name='telArtisan' value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="06 12 34 56 78" />
          </div>

          <AddressAutocomplete
            label="Adresse"
            value={adresse}
            onChange={(value) => setAdresse(value)}
            onAddressSelect={(address) => {
              setAdresse(address.label);
              setCp(address.postcode);
              setVille(address.city);
            }}
            info={true}
            message="Commencez à taper l'adresse pour voir les suggestions"
            placeholder="123 rue de la Paix"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type='text' label='Code postal' name='cpArtisan' value={cp} onChange={(e) => setCp(e.target.value)} />
            <Input type='text' label='Ville' name='villeArtisan' value={ville} onChange={(e) => setVille(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4">
              <Input type='password' label='Mot de passe' name='mot_de_passe' value={mdp} onChange={(e) => setMDP(e.target.value)} />
          </div>

          <EtapeMultiSelect value={etapes} onChange={(items) => setEtapes(items)} />

          <div className="flex gap-3">
            <Button type="button" variant="Secondary" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type='submit' variant="Primary" loading={saving}>Créer</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewArtisanPage;
