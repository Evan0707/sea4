import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Check } from '@mynaui/icons-react';
import { H1, Text } from '@/shared/components/ui/Typography';
import Button from '@/shared/components/ui/Button';
import EtapeItem from '../components/EtapeItem';
import { useToast } from '@/shared/hooks/useToast';
import Skeleton from '@/shared/components/ui/Skeleton';
import type { DossierResponse, Etape } from '@/shared/types/dossier';
import { AvailabilitySelector } from '../../users/components/AvailabilitySelector';
import type { Artisan } from '../../users/types';
import apiClient from '@/shared/api/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { useDossier, useDossierEtapes } from '../hooks/useDossiers';
import { useArtisans } from '../../users/hooks/useArtisans';

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
  nbJours?: number;
}

const CompleteDossierPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: dossierData, isLoading: loadingDossier } = useDossier(id);
  const { data: etapesData = [], isLoading: loadingEtapes } = useDossierEtapes(id);
  const { artisans: artisansList, loading: loadingArtisans } = useArtisans({}); // Fetch all artisans

  const [etapes, setEtapes] = useState<EtapeState[]>([]);

  // Effect to sync etapes state when data loads
  useEffect(() => {
    if (etapesData.length > 0) {
      // Sort etapes by noEtape just in case
      const sortedEtapes = [...etapesData].sort((a: any, b: any) => {
        const idA = a.noEtape || a.noEtapeChantier || a.id;
        const idB = b.noEtape || b.noEtapeChantier || b.id;
        return idA - idB;
      });

      let currentDate = dossierData?.chantier?.dateCreation
        ? new Date(dossierData.chantier.dateCreation)
        : new Date();

      const etapesState = sortedEtapes.map((e: any) => {
        // Force calculation to fix "all same dates" issue
        // We assume the desired state is a perfect chain based on duration
        const startDate = new Date(currentDate);

        const duration = e.nbJours || 0;

        // Prepare date for next step
        const nextDate = new Date(startDate);
        nextDate.setDate(nextDate.getDate() + duration);
        currentDate = nextDate;

        return {
          noEtape: e.noEtape || e.noEtapeChantier || e.id,
          nomEtape: e.nomEtape || e.nom || 'Étape',
          reservable: !!e.reservable,
          artisanId: e.noArtisan || null,
          dateTheorique: startDate.toISOString().split('T')[0],
          montantTheorique: e.montantTheoriqueFacture ?? e.montantFacture ?? 0,
          reservee: e.reservee ?? false,
          openSupp: false,
          supplement: e.reducSuppl && parseFloat(e.reducSuppl) > 0 ? parseFloat(e.reducSuppl) : null,
          reduction: e.reducSuppl && parseFloat(e.reducSuppl) < 0 ? Math.abs(parseFloat(e.reducSuppl)) : null,
          supplementDesc: e.descriptionReducSuppl || null,
          nbJours: duration,
        } as EtapeState;
      });
      setEtapes(etapesState);
    }
  }, [etapesData, dossierData]); // Add dossierData dependency

  const dossier = dossierData as DossierResponse | undefined;
  const artisans = artisansList as Array<{ noArtisan: number; nomArtisan: string; prenomArtisan?: string }>; // Cast to match local interface if needed
  const loading = loadingDossier || loadingEtapes || loadingArtisans;

  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [selectedEtapeForAssignment, setSelectedEtapeForAssignment] = useState<EtapeState | null>(null);

  const updateEtape = (noEtape: number, patch: Partial<EtapeState>) => {
    setEtapes((prev) => prev.map((e) => e.noEtape === noEtape ? { ...e, ...patch } : e));
  };

  const handleOpenAvailability = (etape: EtapeState) => {
    setSelectedEtapeForAssignment(etape);
    setSelectionModalOpen(true);
  };

  const handleSelectArtisan = (artisan: Artisan, startDate: string, endDate: string) => {
    if (selectedEtapeForAssignment) {
      const updates: Partial<EtapeState> = { artisanId: artisan.noArtisan };

      if (startDate) {
        updates.dateTheorique = startDate;
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


        updates.nbJours = diffDays === 0 ? (selectedEtapeForAssignment.nbJours || 0) : diffDays;
      }

      updateEtape(selectedEtapeForAssignment.noEtape, updates);
      setSelectionModalOpen(false);
      setSelectedEtapeForAssignment(null);
    }
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

  const [errors, setErrors] = useState<Set<number>>(new Set());

  const saveEtapes = async () => {
    // Préparer les données pour l'API
    const etapesPayload = etapes.map((e) => ({
      noEtape: e.noEtape,
      artisanId: e.artisanId ?? null,
      dateTheorique: e.dateTheorique ?? null,
      montantTheorique: e.montantTheorique ?? 0,
      reservee: e.reservee ?? false,
      supplement: e.supplement ?? null,
      reduction: e.reduction ?? null,
      supplementDesc: e.supplementDesc ?? null,
      nbJours: e.nbJours ?? null,
    }));

    await apiClient.put(`/chantiers/${id}/etapes`, {
      etapes: etapesPayload,
    });
  };

  const handleSaveDraft = async () => {
    try {
      await saveEtapes();
      addToast('Brouillon sauvegardé', 'success');
      // On ne quitte pas la page forcément, ou on peut navigate(-1) si voulu. 
      // Le client demande "possibilité de ne pas tout compléter", implicitement pour y revenir.
      // On peut rester sur la page ou sortir. Restons sur la page pour l'instant ou retour?
      // "mais ducoup passe pas à a venir" -> implicite : on garde l'état courant.
      navigate('/commercial/dossiers');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      addToast('Erreur lors de la sauvegarde du brouillon', 'error');
    }
  }

  const handleComplete = async () => {
    setErrors(new Set());
    try {
      // 1. Check for missing required fields
      const etapesIncompletes = etapes.filter(e => !e.artisanId || !e.dateTheorique);
      if (etapesIncompletes.length > 0) {
        addToast(`${etapesIncompletes.length} étape(s) n'ont pas d'artisan ou de date théorique`, 'error');
        const newErrors = new Set<number>();
        etapesIncompletes.forEach(e => newErrors.add(e.noEtape));
        setErrors(newErrors);
        return;
      }

      // 2. Validate Chronological Order
      const sequenceErrors = new Set<number>();
      for (let i = 1; i < etapes.length; i++) {
        const current = etapes[i];
        const previous = etapes[i - 1];

        if (current.dateTheorique && previous.dateTheorique) {
          const prevDate = new Date(previous.dateTheorique);
          const currDate = new Date(current.dateTheorique);

          if (currDate < prevDate) {
            sequenceErrors.add(current.noEtape);
            addToast(`L'étape "${current.nomEtape}" ne peut pas commencer avant l'étape "${previous.nomEtape}"`, 'error');
          }
        }
      }

      if (sequenceErrors.size > 0) {
        setErrors(sequenceErrors);
        return;
      }

      // Save steps first
      await saveEtapes();

      // Update status to 'À venir' explicitly
      await apiClient.put(`/dossiers/${id}`, {
        chantier: { statutChantier: 'À venir' }
      });

      addToast('Dossier validé et passé à "À venir"', 'success');
      navigate('/commercial/dossiers');
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      addToast('Erreur lors de la validation du dossier', 'error');
    }
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Informations client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Text className="font-medium">Nom</Text>
              <Text>{dossier.client.nomClient}</Text>
            </div>
            <div>
              <Text className="font-medium">Prénom</Text>
              <Text>{dossier.client.prenomClient}</Text>
            </div>
            <div>
              <Text className="font-medium">Adresse</Text>
              <Text className="text-placeholder">{dossier.client.adresseClient ?? '—'}</Text>
              <Text className="text-placeholder">{dossier.client.cpClient ?? ''} {dossier.client.villeClient ?? ''}</Text>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chantier info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Informations chantier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
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
        </CardContent>
      </Card>

      {/* Étapes */}
      <Card className="mb-6 overflow-hidden" padding="none">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-xl">Étapes à compléter</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y relative divide-border bg-bg-primary overflow-y-auto max-h-[60vh]">
            {etapes.length === 0 && (
              <div className="p-6">
                <Text className="text-placeholder">Aucune étape trouvée pour ce dossier.</Text>
              </div>
            )}

            {etapes.map((e) => (
              <EtapeItem
                key={e.noEtape}
                e={e}
                artisans={artisans}
                onChange={updateEtape}
                onOpenAvailability={handleOpenAvailability}
                hasError={errors.has(e.noEtape)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="mt-6 border-t border-border pt-4 flex justify-between items-center gap-8">
        <div className="flex gap-2 justify-start items-start">
          <Button variant="Secondary" onClick={() => navigate(-1)}>Annuler</Button>
          <Button variant="Secondary" icon={Save} onClick={handleSaveDraft}>Sauvegarder (brouillon)</Button>
          <Button variant="Primary" icon={Check} onClick={handleComplete}>Valider le dossier</Button>
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

      {selectionModalOpen && selectedEtapeForAssignment && (
        <AvailabilitySelector
          isOpen={selectionModalOpen}
          onClose={() => setSelectionModalOpen(false)}
          onSelect={handleSelectArtisan}
          etape={{
            noEtape: selectedEtapeForAssignment.noEtape,
            nomEtape: selectedEtapeForAssignment.nomEtape,
            dateDebutTheorique: selectedEtapeForAssignment.dateTheorique || null,
            nbJours: selectedEtapeForAssignment.nbJours || 0
          }}
          currentArtisanId={selectedEtapeForAssignment.artisanId || undefined}
        />
      )}
    </div>
  );
};


export default CompleteDossierPage;
