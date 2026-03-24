import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Check } from '@mynaui/icons-react';
import { H1, Text } from '@/shared/components/ui/Typography';
import Button from '@/shared/components/ui/Button';
import EtapeItem from '../components/EtapeItem';
import { useToast } from '@/shared/hooks/useToast';
import Skeleton from '@/shared/components/ui/Skeleton';
import type { DossierResponse, Etape } from '@/shared/types/dossier';
import { AvailabilitySelector } from '@/features/users/components/AvailabilitySelector';
import type { Artisan } from '@/features/users/types';
import apiClient from '@/shared/api/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { useDossier, useDossierEtapes } from '../hooks/useDossiers';
import { Tabs } from '@/shared/components/ui/Tabs';
import { Calendar, User } from '@mynaui/icons-react';
import { useArtisans } from '@/features/users/hooks/useArtisans';
import { useAuth } from '@/features/auth/context/AuthContext';

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
  const { user } = useAuth();

  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  const basePath = isAdmin ? '/admin' : '/maitre-doeuvre';

  const { data: dossierData, isLoading: loadingDossier } = useDossier(id);
  const { data: etapesData = [], isLoading: loadingEtapes } = useDossierEtapes(id);
  const { artisans: artisansList, loading: loadingArtisans } = useArtisans({}); // Fetch all artisans

  const [etapes, setEtapes] = useState<EtapeState[]>([]);

  // sync etapes state quand data loads
  useEffect(() => {
    if (etapesData.length > 0) {
      // Sort etapes par noEtape 
       
      const sortedEtapes = [...etapesData].sort((a: any, b: any) => {
        const idA = a.noEtape || a.noEtapeChantier || a.id;
        const idB = b.noEtape || b.noEtapeChantier || b.id;
        return idA - idB;
      });

      let currentDate = dossierData?.chantier?.dateCreation
        ? new Date(dossierData.chantier.dateCreation)
        : new Date();


      const etapesState = sortedEtapes.map((e: any) => {

 

        const startDate = new Date(currentDate);

        const duration = e.nbJours || 0;

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
  }, [etapesData, dossierData]);

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
  // Calculer les totaux
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

  // Enregistrer les étapes
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

  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Enregistrer le brouillon
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await saveEtapes();


      await apiClient.put(`/dossiers/${id}`, {
        chantier: { statutChantier: 'À compléter' }
      });

      addToast('Brouillon sauvegardé', 'success');

      navigate(`${basePath}/dossiers`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      addToast('Erreur lors de la sauvegarde du brouillon', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  }

  const [isValidating, setIsValidating] = useState(false);

  // Compléter le dossier
  const handleComplete = async () => {
    setErrors(new Set());
    setIsValidating(true);
    try {
      // 1. Vérifier les champs obligatoires
      const etapesIncompletes = etapes.filter(e => (!e.reservee && !e.artisanId) || !e.dateTheorique);
      if (etapesIncompletes.length > 0) {
        addToast(`${etapesIncompletes.length} étape(s) n'ont pas d'artisan ou de date théorique`, 'error');
        const newErrors = new Set<number>();
        etapesIncompletes.forEach(e => newErrors.add(e.noEtape));
        setErrors(newErrors);
        return;
      }

      // 2. Vérifier l'ordre chronologique
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


      await saveEtapes();

      await apiClient.put(`/dossiers/${id}`, {
        chantier: { statutChantier: 'À venir' }
      });

      addToast('Dossier validé et passé à "À venir"', 'success');
      navigate(`${basePath}/dossiers`);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      addToast('Erreur lors de la validation du dossier', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-[1500px] mx-auto">
        <H1 className="mb-6">Compléter le dossier</H1>
        <div className="flex gap-2 border-b border-border/60 pb-2 mb-6">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-10 w-32 rounded-t-lg" />)}
        </div>
        <Card className="mb-6 overflow-hidden" padding="none">
          <CardHeader className="p-6 pb-4"><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-5 w-40" /></div>
                  <Skeleton className="h-4 w-32 ml-7" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-40 rounded-[var(--radius-sm)]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="p-10 h-full flex flex-col items-center justify-center">
        <div className="bg-red/5 border border-red/20 rounded-[var(--radius-lg)] p-6 text-center max-w-md">
          <Text className="text-lg font-bold text-red mb-2">Dossier introuvable</Text>
          <Text className="text-sm text-text-secondary mb-4">Impossible de charger ce dossier.</Text>
          <Button variant="Secondary" onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </div>
    );
  }

  const { coutTheorique, total } = computeTotals();

  return (
    <div className="p-4 max-w-[1500px] mx-auto">

      <H1>Compléter le dossier</H1>


      <Tabs
        tabs={[
          { id: 'traitement', label: 'Traitement', icon: <Calendar className="w-4 h-4" /> },
          { id: 'infos', label: 'Informations', icon: <User className="w-4 h-4" /> }
        ]}
        defaultTab="traitement"
      >
        {(activeTab) => (
          <>
            {activeTab === 'traitement' && (
              /* Étapes */
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
            )}

            {activeTab === 'infos' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client info */}
                <Card className="mb-6 h-fit">
                  <CardHeader>
                    <CardTitle className="text-xl">Informations client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
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
                <Card className="mb-6 h-fit">
                  <CardHeader>
                    <CardTitle className="text-xl">Informations chantier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
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
              </div>
            )}
          </>
        )}
      </Tabs>

      {/* Totals */}
      <div className="mt-6 border-t border-border pt-4 flex justify-between items-center gap-8">
        <div className="flex gap-2 justify-start items-start">
          <Button variant="Secondary" onClick={() => navigate(-1)}>Annuler</Button>
          <Button variant="Secondary" icon={Save} onClick={handleSaveDraft} loading={isSavingDraft}>Sauvegarder (brouillon)</Button>
          <Button variant="Primary" icon={Check} onClick={handleComplete} loading={isValidating}>Valider le dossier</Button>
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
