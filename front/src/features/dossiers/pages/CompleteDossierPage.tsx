import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { H1, H2, H3, Text } from '@/shared/components/ui/Typography';
import Button from '@/shared/components/ui/Button';
import EtapeItem from '../components/EtapeItem';
import { useToast } from '@/shared/hooks/useToast';
import Skeleton from '@/shared/components/ui/Skeleton';
import type { DossierResponse, Etape } from '@/shared/types/dossier';

interface EtapeState extends Etape {
  // valeurs d'édition locales
  artisanId?: number | null;
  dateTheorique?: string | null; // ISO date
  montantTheorique?: number | null;
  reservee?: boolean;
  openSupp?: boolean;
  supplement?: number | null;
  reduction?: number | null;
  supplementDesc?: string | null;
}

const CompleteDossierPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState<DossierResponse | null>(null);
  const [etapes, setEtapes] = useState<EtapeState[]>([]);
  const [artisans, setArtisans] = useState<Array<{ noArtisan: number; nomArtisan: string; prenomArtisan?: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dRes, artisansRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/dossiers/${id}`),
          axios.get('http://localhost:8000/api/artisans'),
        ]);

        setDossier(dRes.data);

        let etapesData: any[] = [];
        try {
          const etRes = await axios.get(`http://localhost:8000/api/dossiers/${id}/etapes`);
          etapesData = etRes.data;
        } catch (e) {
     
          try {
            const etRes2 = await axios.get(`http://localhost:8000/api/chantier/${id}/etape-chantiers`);
            etapesData = etRes2.data;
          } catch (e2) {

            etapesData = [];
          }
        }

        const etapesState = etapesData.map((e: any) => ({
          noEtape: e.noEtape || e.noEtapeChantier || e.id,
          nomEtape: e.nomEtape || e.nom || 'Étape',
          reservable: !!e.reservable,
          artisanId: e.noArtisan || null,
          dateTheorique: e.dateDebutTheorique || null,
          montantTheorique: e.montantTheoriqueFacture ?? e.montantFacture ?? 0,
          reservee: e.reservee ?? false,
          openSupp: false,
          supplement: null,
          reduction: null,
          supplementDesc: null,
        } as EtapeState));

        setEtapes(etapesState);

        setArtisans(artisansRes.data || []);
      } catch (error) {
        console.error(error);
        addToast('Erreur lors du chargement du dossier', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, addToast]);

  const updateEtape = (noEtape: number, patch: Partial<EtapeState>) => {
    setEtapes((prev) => prev.map((e) => e.noEtape === noEtape ? { ...e, ...patch } : e));
  };

  const computeTotals = () => {
    let coutTheorique = 0;
    let total = 0;
    etapes.forEach((e) => {
      const base = e.montantTheorique ?? 0;
      const supp = e.supplement ?? 0;
      const reduc = e.reduction ?? 0;
      coutTheorique += base;
      total += base + (supp || 0) - (reduc || 0);
    });
    return { coutTheorique, total };
  };

  const handleSubmit = async () => {

    console.log('Submitting completion for dossier', id, { etapes });
    addToast('Changements enregistrés localement (simulateur)', 'success');

    // If you have a backend endpoint, you can POST here. Example:
    // await axios.post(`/api/dossiers/${id}/complete`, { etapes }, { headers: { Authorization: `Bearer ${user?.token}` } })
  };

  if (loading) {
    return (
      <div className="p-10 max-w-[1200px] mx-auto">
        <H1>Compléter le dossier</H1>
        <Skeleton className="h-[120px] w-full rounded-lg my-6" />
        <Skeleton className="h-[200px] w-full rounded-lg my-6" />
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="p-10 max-w-[1200px] mx-auto">
        <H1>Compléter le dossier</H1>
        <Text>Impossible de charger le dossier.</Text>
      </div>
    );
  }

  const { coutTheorique, total } = computeTotals();

  return (
    <div className="p-10 max-w-[1500px] mx-auto">

        <H1>Compléter le dossier</H1>
 

      {/* Client info */}
      <div className="p-6 rounded-lg mb-0 flex flex-row">
        <H3 className="mb-3 w-70">Informations client</H3>
        <div className="grid grid-cols-3 gap-4 flex-1 pl-10">
          <div>
            <Text className="font-medium">Nom</Text>
            <Text>{dossier.client.nomClient}</Text>
          </div>
          <div>
            <Text className="font-medium">Prénom</Text>
            <Text>{dossier.client.prenomClient}</Text>
          </div>
          <div >
            <Text className="font-medium">Adresse</Text>
            <Text className="text-placeholder">{dossier.client.adresseClient ?? '—'}</Text>
            <Text className="text-placeholder">{dossier.client.cpClient ?? ''} {dossier.client.villeClient ?? ''}</Text>
          </div>
        </div>
      </div>

      {/* Chantier info */}
      <div className="p-6 pt-0 rounded-lg mb-0 flex flex-row">
        <H3 className="mb-3 w-70">Informations chantier</H3>
        <div className="grid grid-cols-3 gap-4 flex-1 pl-10">
          <div>
            <Text className="font-medium">Adresse</Text>
            <Text>{dossier.chantier.adresseChantier ?? '—'} {dossier.chantier.cpChantier ?? ''} {dossier.chantier.villeChantier ?? ''}</Text>
          </div>
          <div>
            <Text className="font-medium">Date création</Text>
            <Text>{dossier.chantier.dateCreation}</Text>
          </div>
          <div>
            <Text className="font-medium">Maître d'œuvre</Text>
            <Text className="text-placeholder">—</Text>
          </div>
        </div>
      </div>

      {/* Étapes */}
      <div className="bg-bg-secondary rounded-lg border border-border mb-6 overflow-hidden">
        <H3 className="mb-0 p-3">Étapes à compléter</H3>
        <div className="divide-y relative divide-border bg-bg-primary overflow-y-auto max-h-[60vh]">
          {etapes.length === 0 && (
            <div className="p-6">
              <Text className="text-placeholder">Aucune étape trouvée pour ce dossier.</Text>
            </div>
          )}

          {etapes.map((e) => (
            <EtapeItem key={e.noEtape} e={e} artisans={artisans} onChange={updateEtape} />
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 border-t border-border pt-4 flex justify-between items-center gap-8">
        <div className="flex gap-2 justify-start items-start">
          <Button variant="Secondary" onClick={() => navigate(-1)}>Retour</Button>
          <Button variant="Primary" onClick={handleSubmit}>Enregistrer</Button>
        </div>
        <div className='flex flex-row items-center'>
          <div className="text-right text-text-primary">
            <Text className="text-sm">Coût théorique</Text>
            <div className="font-mono text-lg">€ {coutTheorique.toFixed(2)}</div>
          </div>
          <div className="text-right text-text-primary">
            <Text className="text-sm">Total</Text>
            <div className="font-mono text-lg">€ {total.toFixed(2)}</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompleteDossierPage;
