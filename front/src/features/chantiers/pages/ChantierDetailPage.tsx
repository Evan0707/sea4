import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { H1, H2, Text } from '@/shared/components/ui/Typography';
import Button from '@/shared/components/ui/Button';
import { usePageHeader } from '@/shared/context/LayoutContext';
import Status from '@/shared/components/ui/Status';
import Skeleton from '@/shared/components/ui/Skeleton';
import { Bank, Pin, ChevronDown, ChevronUp, Edit, Download } from '@mynaui/icons-react';
import { ArrowLeft, User, Calendar, Play, Check, CheckCircle } from '@mynaui/icons-react';
import { formatDate } from '@/shared/utils/dateFormatter';
import { useToast } from '@/shared/hooks/useToast';
import { AvailabilitySelector } from '../../users/components/AvailabilitySelector';
import type { Artisan } from '../../users/types';
import CopyToClipboard from '@/shared/components/ui/CopyToClipboard';
import { Card } from '@/shared/components/ui/Card';
import { Table } from '@/shared/components/ui/Table';
import { DevisCreationModal } from '../components/DevisCreationModal';
import { FactureArtisanCreationModal } from '../components/FactureArtisanCreationModal';

import { Tabs } from '@/shared/components/ui/Tabs';
import { useChantier } from '../hooks/useChantiers';
import type { ChantierDetail, Etape } from '../types';

const getStatusVariant = (statut: string): 'À venir' | 'Terminé' | 'Complété' | 'En chantier' => {
  switch (statut) {
    case 'Terminé':
    case 'Terminée':
      return 'Terminé';
    case 'En cours':
      return 'En chantier';
    case 'À venir':
      return 'À venir';
    default:
      return 'À venir';
  }
};

export const ChantierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  // Cast the result to ChantierDetail to fix Property does not exist errors
  const { data: chantierData, isLoading: loading, refetch } = useChantier(id, { endpoint: '/mes-chantiers' });
  const chantier = chantierData as ChantierDetail | undefined | null;

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedEtapes, setExpandedEtapes] = useState<Set<number>>(new Set());

  // Selection Modal State
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [selectedEtapeForAssignment, setSelectedEtapeForAssignment] = useState<Etape | null>(null);

  // Devis Modal State
  const [devisModalOpen, setDevisModalOpen] = useState(false);

  // Mettre en place le header
  const headerActions = useMemo(() => (
    <div className="flex items-center gap-2">
      <Button variant="Secondary" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
    </div>
  ), [navigate]);

  usePageHeader(
    'Détail du chantier',
    headerActions
  );

  // Toggle etape etendue
  const toggleEtapeExpanded = (etapeId: number) => {
    setExpandedEtapes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(etapeId)) {
        newSet.delete(etapeId);
      } else {
        newSet.add(etapeId);
      }
      return newSet;
    });
  };

  const emettreAppelInitial = async () => {
    setActionLoading('appel-initial');
    try {
      const res = await axios.post(`http://localhost:8000/api/mes-chantiers/${id}/emettre-appel-initial`);
      addToast(res.data.message, 'success');
      refetch();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Erreur', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const demarrerChantier = async () => {
    setActionLoading('demarrer');
    try {
      const res = await axios.post(`http://localhost:8000/api/mes-chantiers/${id}/demarrer`);
      addToast(res.data.message, 'success');
      refetch();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Erreur', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const terminerChantier = async () => {
    setActionLoading('terminer');
    try {
      const res = await axios.post(`http://localhost:8000/api/mes-chantiers/${id}/terminer`);
      addToast(res.data.message, 'success');
      refetch();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Erreur', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const demarrerEtape = async (etapeId: number) => {
    setActionLoading(`etape-demarrer-${etapeId}`);
    try {
      const res = await axios.post(`http://localhost:8000/api/mes-chantiers/${id}/etapes/${etapeId}/demarrer`);
      addToast(res.data.message, 'success');
      await refetch();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Erreur', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const terminerEtape = async (etapeId: number) => {
    setActionLoading(`etape-terminer-${etapeId}`);
    try {
      const res = await axios.post(`http://localhost:8000/api/mes-chantiers/${id}/etapes/${etapeId}/terminer`);
      addToast(res.data.message, 'success');
      await refetch();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Erreur', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const reglerAppel = async (appelId: number) => {
    setActionLoading(`appel-${appelId}`);
    try {
      const res = await axios.post(`http://localhost:8000/api/mes-chantiers/${id}/appels/${appelId}/regler`);
      addToast(res.data.message, 'success');
      refetch();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Erreur', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openAssignmentModal = (etape: Etape) => {
    setSelectedEtapeForAssignment(etape);
    setSelectionModalOpen(true);
  };

  // Assigner un artisan
  const handleAssignArtisan = async (artisan: Artisan) => {
    if (!selectedEtapeForAssignment || !chantier) return;

    try {
      await axios.put(`http://localhost:8000/api/chantiers/${id}/etapes`, {
        etapes: [{
          noEtape: selectedEtapeForAssignment.noEtape,
          artisanId: artisan.noArtisan
        }]
      });
      addToast(`Artisan ${artisan.nomArtisan} assigné avec succès`, 'success');
      setSelectionModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || "Erreur lors de l'assignation", 'error');
    }

  };

  const handleDownloadPdf = async (devisId: number) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/devis/${devisId}/pdf`, {
        responseType: 'blob'
      });
      // Créer une URL pour le Blob et l'ouvrir dans un nouvel onglet
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF', error);
      addToast('Erreur lors du téléchargement du PDF', 'error');
    }
  };

  const handleCreateDevis = async (data: { remarques: string }) => {
    setActionLoading('create-devis');
    try {
      await axios.post(`http://localhost:8000/api/mes-chantiers/${id}/devis`, data);
      addToast('Devis créé avec succès', 'success');
      setDevisModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || "Erreur lors de la création du devis", 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Facture Modal State
  const [factureModalOpen, setFactureModalOpen] = useState(false);

  const handleCreateFactureArtisan = async (data: { montant: number; date: string; artisanId: number; etapeId: number }) => {
    setActionLoading('create-facture');
    try {
      await axios.post(`http://localhost:8000/api/mes-chantiers/${id}/factures-artisans`, data);
      addToast('Facture enregistrée avec succès', 'success');
      setFactureModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || "Erreur lors de l'enregistrement de la facture", 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="w-48 h-8 mb-6" />
        <Skeleton className="w-full h-40 mb-6" />
        <Skeleton className="w-full h-60" />
      </div>
    );
  }

  if (!chantier) {
    return (
      <div className="p-8">
        <Text>Chantier non trouvé</Text>
        <Button variant="Secondary" onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }

  const totalAppels = chantier.appels.reduce((acc, a) => acc + parseFloat(a.montant || '0'), 0);
  const totalRegle = chantier.appels.filter(a => a.dateReglement).reduce((acc, a) => acc + parseFloat(a.montant || '0'), 0);
  const etapesTerminees = chantier.etapes.filter(e => e.statut === 'Terminée').length;
  const etapesTotal = chantier.etapes.length;
  const progression = etapesTotal > 0 ? Math.round((etapesTerminees / etapesTotal) * 100) : 0;

  const canEmitInitialAppel = chantier.statut === 'À venir' && chantier.appels.length === 0;
  const canStartChantier = chantier.statut === 'À venir' && chantier.appels.length > 0 && chantier.appels[0]?.dateReglement;
  const canFinishChantier = chantier.statut === 'En chantier' && etapesTerminees === etapesTotal;

  // Trier les étapes : En cours en haut, À venir au milieu, Terminées en bas
  const sortedEtapes = [...chantier.etapes].sort((a, b) => {
    const order: Record<string, number> = { 'En cours': 0, 'À venir': 1, 'Terminée': 2 };
    return (order[a.statut] ?? 1) - (order[b.statut] ?? 1);
  });

  // Vérifier si une étape est en cours
  const isAnyEtapeInProgress = chantier.etapes.some(e => e.statut === 'En cours');

  return (
    <div className="p-8">
      {/* Header avec actions */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <H1>Chantier #{chantier.noChantier}</H1>
            <Status label={getStatusVariant(chantier.statut)} />
          </div>
          <div className="flex items-center gap-2">
            <Text className="text-placeholder">
              {chantier.adresse}, {chantier.cp} {chantier.ville}
            </Text>
            <CopyToClipboard text={`${chantier.adresse}, ${chantier.cp} ${chantier.ville}`} />
          </div>
        </div>
        <div className="flex gap-2">
          {canEmitInitialAppel && (
            <Button
              variant="Primary"
              onClick={emettreAppelInitial}
              loading={actionLoading === 'appel-initial'}
            >
              Émettre appel initial (20%)
            </Button>
          )}
          {canStartChantier && (
            <Button
              variant="Primary"
              onClick={demarrerChantier}
              loading={actionLoading === 'demarrer'}
            >
              <Play className="w-4 h-4 mr-2" />
              Démarrer le chantier
            </Button>
          )}
          {canFinishChantier && (
            <Button
              variant="Primary"
              onClick={terminerChantier}
              loading={actionLoading === 'terminer'}
            >
              <Check className="w-4 h-4 mr-2" />
              Terminer le chantier
            </Button>
          )}
        </div>
      </div>

      {/* Barre de progression */}
      {chantier.statut === 'En chantier' && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Text className="font-medium">Progression du chantier</Text>
            <Text className="font-semibold text-primary">{progression}%</Text>
          </div>
          <div className="w-full bg-border rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progression}%` }}
            />
          </div>
          <Text className="text-xs text-placeholder mt-2">
            {etapesTerminees} / {etapesTotal} étapes terminées
          </Text>
        </Card>
      )}

      <Tabs
        tabs={[
          { id: 'planning', label: 'Suivi de chantier', icon: <Calendar className="w-4 h-4" /> },
          { id: 'finances', label: 'Documents & Finances', icon: <Bank className="w-4 h-4" /> },
          { id: 'infos', label: 'Informations', icon: <User className="w-4 h-4" /> }
        ]}
        defaultTab="planning"
      >
        {(activeTab) => (
          <>
            {activeTab === 'planning' && (
              <div className="space-y-6">
                {/* Étapes */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    <H2 className="text-lg">Étapes du chantier</H2>
                  </div>
                  {chantier.etapes.length > 0 ? (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                      {sortedEtapes.map((etape) => {
                        const canStart = chantier.statut === 'En chantier' && etape.statut === 'À venir';
                        const canFinish = etape.statut === 'En cours';
                        const isCompleted = etape.statut === 'Terminée';
                        const hasReducSuppl = etape.reductionSupplementaire && parseFloat(etape.reductionSupplementaire) !== 0;
                        const reducSuppl = parseFloat(etape.reductionSupplementaire || '0');
                        const isExpanded = expandedEtapes.has(etape.noEtapeChantier);

                        // Trouver l'index original pour vérifier l'étape précédente
                        const originalIndex = chantier.etapes.findIndex(e => e.noEtapeChantier === etape.noEtapeChantier);
                        const previousEtape = originalIndex > 0 ? chantier.etapes[originalIndex - 1] : null;
                        const previousCompleted = !previousEtape || previousEtape.statut === 'Terminée';

                        return (
                          <div
                            key={etape.noEtapeChantier}
                            className={`rounded-lg border transition-all ${isCompleted
                              ? 'bg-green-500/5 border-green-500/20'
                              : etape.statut === 'En cours'
                                ? 'bg-primary/5 border-primary/20'
                                : 'bg-bg-primary border-border'
                              }`}
                          >
                            <div className="flex items-center justify-between p-3">
                              <div className="flex items-center gap-3 flex-1">
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : etape.statut === 'En cours' ? (
                                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-border" />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Text className={`font-medium ${isCompleted ? 'text-green-600' : ''}`}>
                                      {etape.nomEtape}
                                    </Text>
                                    {etape.reservee && (
                                      <span className="px-2 py-0.5 text-xs rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
                                        Réservée
                                      </span>
                                    )}
                                    {hasReducSuppl && (
                                      <span className={`px-2 py-0.5 text-xs rounded border ${reducSuppl > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        {reducSuppl > 0 ? '+' : ''}{reducSuppl.toLocaleString('fr-FR')} €
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 mt-1">
                                    {etape.dateDebut && (
                                      <Text className="text-xs text-placeholder">
                                        Débuté: {formatDate(etape.dateDebut)}
                                      </Text>
                                    )}
                                    {etape.dateFin && (
                                      <Text className="text-xs text-green-600">
                                        Terminé: {formatDate(etape.dateFin)}
                                      </Text>
                                    )}
                                    {!etape.dateDebut && etape.dateDebutTheorique && (
                                      <Text className="text-xs text-placeholder">
                                        Prévu: {formatDate(etape.dateDebutTheorique)}
                                      </Text>
                                    )}
                                    {/* Gestion de l'affichage de l'artisan + bouton Assigner */}
                                    <div className="flex items-center gap-2">
                                      <Text className="text-xs text-placeholder" onClick={() => { navigate(`/artisans/${etape?.artisan?.noArtisan}`, { replace: true }) }}>
                                        Artisan: {etape.artisan ? `${etape.artisan.nom} ${etape.artisan.prenom}` : 'Non assigné'}
                                      </Text>
                                      {chantier.statut !== 'Terminé' && !isCompleted && (
                                        <button
                                          onClick={() => openAssignmentModal(etape)}
                                          className="p-1 hover:bg-bg-secondary rounded-full transition-colors group"
                                          title="Changer/Assigner l'artisan"
                                        >
                                          <Edit className="w-3 h-3 text-placeholder group-hover:text-primary" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {etape.montantTheorique && !etape.reservee && (
                                  <Text className="font-mono text-sm">
                                    {parseFloat(etape.montantTheorique).toLocaleString('fr-FR')} €
                                  </Text>
                                )}
                                {hasReducSuppl && (
                                  <button
                                    onClick={() => toggleEtapeExpanded(etape.noEtapeChantier)}
                                    className="p-1 hover:bg-bg-secondary rounded transition-colors"
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                )}
                                {canStart && previousCompleted && !isAnyEtapeInProgress && (
                                  <Button
                                    variant="Primary"
                                    size="sm"
                                    onClick={() => demarrerEtape(etape.noEtapeChantier)}
                                    loading={actionLoading === `etape-demarrer-${etape.noEtapeChantier}`}
                                  >
                                    Démarrer
                                  </Button>
                                )}
                                {canFinish && (
                                  <Button
                                    variant="Primary"
                                    size="sm"
                                    onClick={() => terminerEtape(etape.noEtapeChantier)}
                                    loading={actionLoading === `etape-terminer-${etape.noEtapeChantier}`}
                                  >
                                    Terminer
                                  </Button>
                                )}
                                {!canStart && !canFinish && (
                                  <Status label={getStatusVariant(etape.statut)} />
                                )}
                              </div>
                            </div>
                            {/* Zone collapsable pour réduc/supplément */}
                            {hasReducSuppl && isExpanded && (
                              <div className="px-3 pb-3 pt-0 ml-8 border-t border-border/50 mt-2">
                                <div className="pt-2">
                                  <Text className="text-xs text-placeholder mb-1">
                                    {reducSuppl > 0 ? 'Supplément' : 'Réduction'}
                                  </Text>
                                  <div className="flex items-center justify-between">
                                    <Text className={`font-mono text-sm ${reducSuppl > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                      {reducSuppl > 0 ? '+' : ''}{reducSuppl.toLocaleString('fr-FR')} €
                                    </Text>
                                    <Text className="text-xs text-placeholder">
                                      Montant final: {(parseFloat(etape.montantTheorique || '0') + reducSuppl).toLocaleString('fr-FR')} €
                                    </Text>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Text className="text-placeholder">Aucune étape définie</Text>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'finances' && (
              <div className="space-y-6">
                {/* Appels de fond */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bank className="w-5 h-5 text-primary" />
                      <div className="flex flex-col">
                        <H2 className="text-lg">Appels de fond (Recettes)</H2>
                        <Text className="text-xs text-placeholder">Paiements reçus du client</Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-bg-secondary px-4 py-2 rounded-lg">
                      <Text className="text-sm text-placeholder">
                        Total: <span className="font-semibold text-text-primary">{totalAppels.toLocaleString('fr-FR')} €</span>
                      </Text>
                      <div className="h-4 w-[1px] bg-border" />
                      <Text className="text-sm text-placeholder">
                        Réglé: <span className="font-semibold text-green-600">{totalRegle.toLocaleString('fr-FR')} €</span>
                      </Text>
                    </div>
                  </div>
                  {chantier.appels.length > 0 ? (
                    <Table
                      data={chantier.appels}
                      keyExtractor={(item) => item.noAppel}
                      columns={[
                        {
                          header: 'N°',
                          render: (appel) => {
                            const index = chantier.appels.indexOf(appel);
                            return index === 0 ? 'Initial (20%)' : index === 1 ? 'Couverture (50%)' : 'Solde';
                          }
                        },
                        {
                          header: 'Date appel',
                          render: (appel) => formatDate(appel.dateAppel)
                        },
                        {
                          header: 'Montant',
                          align: 'right',
                          render: (appel) => (
                            <span className="font-mono">
                              {parseFloat(appel.montant || '0').toLocaleString('fr-FR')} €
                            </span>
                          )
                        },
                        {
                          header: 'Date règlement',
                          render: (appel) => appel.dateReglement ? formatDate(appel.dateReglement) : '-'
                        },
                        {
                          header: 'Action',
                          align: 'right',
                          render: (appel) => (
                            appel.dateReglement ? (
                              <span className="px-2 py-1 text-xs rounded bg-green-500/10 text-green-600 border border-green-500/20">
                                Réglé
                              </span>
                            ) : (
                              <Button
                                variant="Secondary"
                                size="sm"
                                onClick={() => reglerAppel(appel.noAppel)}
                                loading={actionLoading === `appel-${appel.noAppel}`}
                              >
                                Marquer réglé
                              </Button>
                            )
                          )
                        }
                      ]}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <Text className="text-placeholder mb-4">Aucun appel de fond</Text>
                      {canEmitInitialAppel && (
                        <Button
                          variant="Primary"
                          onClick={emettreAppelInitial}
                          loading={actionLoading === 'appel-initial'}
                        >
                          Émettre l'appel initial (20%)
                        </Button>
                      )}
                    </div>
                  )}
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Devis */}
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <H2 className="text-lg">Devis Client</H2>
                      </div>
                    </div>
                    {chantier.devis && chantier.devis.length > 0 ? (
                      <Table
                        data={chantier.devis}
                        keyExtractor={(item) => item.noDevis}
                        columns={[
                          { header: 'Date', render: (d) => formatDate(d.dateEmission) },
                          { header: 'Montant', align: 'right', render: (d) => <span className="font-mono">{parseFloat(d.montant).toLocaleString('fr-FR')} €</span> },
                          { header: 'Statut', render: (d) => <Status label={d.statut === 'Validé' ? 'Terminé' : d.statut === 'En attente' ? 'À venir' : 'En chantier'} /> },
                          {
                            header: 'Action',
                            align: 'right',
                            render: (d) => (
                              <Button
                                variant="Secondary"
                                size="sm"
                                icon={Download}
                                onClick={() => handleDownloadPdf(d.noDevis)}
                              >
                                PDF
                              </Button>
                            )
                          }
                        ]}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <Text className="text-placeholder">Aucun devis émis</Text>
                        <Button variant="Primary" onClick={() => setDevisModalOpen(true)} classname="mt-4">
                          Créer un devis
                        </Button>
                      </div>
                    )}
                  </Card>

                  {/* Factures (Artisans) */}
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <H2 className="text-lg">Factures Artisans (Dépenses)</H2>
                      </div>
                      <Button variant="Secondary" size="sm" onClick={() => setFactureModalOpen(true)}>
                        + Enregistrer
                      </Button>
                    </div>
                    {chantier.factures && chantier.factures.length > 0 ? (
                      <Table
                        data={chantier.factures}
                        keyExtractor={(item) => item.noFacture}
                        columns={[
                          { header: 'Date', render: (f) => formatDate(f.dateEmission) },
                          { header: 'Artisan', render: (f) => <span className="font-medium text-text-primary">{f.artisan || 'N/A'}</span> },
                          { header: 'Montant', align: 'right', render: (f) => <span className="font-mono">{parseFloat(f.montant).toLocaleString('fr-FR')} €</span> },
                          { header: 'Statut', render: (f) => <Status label={f.statut === 'Réglée' ? 'Terminé' : 'À venir'} /> },
                          {
                            header: 'Action',
                            align: 'right',
                            render: (f) => (
                              <Button
                                variant="Secondary"
                                size="sm"
                                icon={Download}
                                onClick={async () => {
                                  try {
                                    const response = await axios.get(`http://localhost:8000/api/factures-artisans/${f.noFacture}/pdf`, {
                                      responseType: 'blob'
                                    });
                                    const file = new Blob([response.data], { type: 'application/pdf' });
                                    const fileURL = URL.createObjectURL(file);
                                    window.open(fileURL, '_blank');
                                  } catch (error) {
                                    console.error('Erreur PDF facture', error);
                                    addToast('Erreur lors du téléchargement du PDF', 'error');
                                  }
                                }}
                              >
                                PDF
                              </Button>
                            )
                          }
                        ]}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <Text className="text-placeholder">Aucune facture enregistrée</Text>
                        <Button variant="Primary" onClick={() => setFactureModalOpen(true)} classname="mt-4">
                          Enregistrer une facture
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'infos' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-fit">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <H2 className="text-lg">Client</H2>
                  </div>
                  {chantier.client ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Text className="font-semibold text-lg">
                          {chantier.client.nom} {chantier.client.prenom}
                        </Text>
                        <CopyToClipboard text={`${chantier.client.nom} ${chantier.client.prenom}`} />
                      </div>
                      <div className="flex items-center gap-2 text-placeholder">
                        <Pin className="w-4 h-4" />
                        <div className="flex items-center gap-2">
                          <Text className="text-sm">
                            {chantier.client.adresse}, {chantier.client.cp} {chantier.client.ville}
                          </Text>
                          <CopyToClipboard text={`${chantier.client.adresse}, ${chantier.client.cp} ${chantier.client.ville}`} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Text className="text-placeholder">Aucun client associé</Text>
                  )}
                </Card>

                <Card className="h-fit">
                  <div className="flex items-center gap-2 mb-4">
                    <Pin className="w-5 h-5 text-primary" />
                    <H2 className="text-lg">Localisation Chantier</H2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Text className="font-semibold text-lg">
                        {chantier.adresse}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2 text-placeholder">
                      <Text className="text-sm">
                        {chantier.cp} {chantier.ville}
                      </Text>
                      <CopyToClipboard text={`${chantier.adresse}, ${chantier.cp} ${chantier.ville}`} />
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </Tabs>

      {/* Modale d'assignation artisan */}
      {selectedEtapeForAssignment && (
        <AvailabilitySelector
          isOpen={selectionModalOpen}
          onClose={() => setSelectionModalOpen(false)}
          onSelect={handleAssignArtisan}
          etape={selectedEtapeForAssignment}
          currentArtisanId={selectedEtapeForAssignment.artisan?.noArtisan}
        />
      )}

      {/* Modale de création de devis */}
      <DevisCreationModal
        isOpen={devisModalOpen}
        onClose={() => setDevisModalOpen(false)}
        onSubmit={handleCreateDevis}
        loading={actionLoading === 'create-devis'}
      />

      {/* Modale de création de facture artisan */}
      <FactureArtisanCreationModal
        isOpen={factureModalOpen}
        onClose={() => setFactureModalOpen(false)}
        onSubmit={handleCreateFactureArtisan}
        etapes={chantier.etapes}
        loading={actionLoading === 'create-facture'}
      />
    </div>
  );
};

