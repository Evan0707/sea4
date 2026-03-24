import { useState, type FormEvent, type ReactNode, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { H2, H3, Text } from '@/shared/components/ui/Typography';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Skeleton from '@/shared/components/ui/Skeleton';
import ConfirmModal from '@/shared/components/ui/ConfirmModal';
import { Card } from '@/shared/components/ui/Card';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import {TrendingUp, Trash, Plus, Calendar, Euro, Users, CreditCard, X, Search, Info } from '@mynaui/icons-react';
import { formatDate } from '@/shared/utils/dateFormatter';
import { useAnalyseCouts, useCreateFacture, useDeleteFacture } from '../hooks/useAnalyseCouts';
import { EcartTable } from './EcartTable';
import type { EtapeAnalyse } from '../types';
import { cn } from '@/shared/lib/utils';
import Tooltip from '@/shared/components/ui/Tooltip';

interface AnalyseCoutsPanelProps {
  chantierId: string;
  noChantier: number;
  canEdit?: boolean;
}

interface InlineFactureFormState {
  dateFacture: string;
  montantFacture: string;
  nbJoursTravail: string;
  dateReglFacture: string;
}

const initialFormState: InlineFactureFormState = {
  dateFacture: new Date().toISOString().split('T')[0],
  montantFacture: '',
  nbJoursTravail: '',
  dateReglFacture: '',
};

const Label = ({ children, required }: { children: ReactNode; required?: boolean }) => (
  <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
    {children}
    {required && <span className="text-red ml-1">*</span>}
  </label>
);

export const AnalyseCoutsPanel = ({ chantierId, noChantier, canEdit = true }: AnalyseCoutsPanelProps) => {
  const { data: etapes = [], isLoading, isError } = useAnalyseCouts(chantierId);
  const createFacture = useCreateFacture(chantierId);
  const deleteFacture = useDeleteFacture(chantierId);

  const [selectedEtape, setSelectedEtape] = useState<EtapeAnalyse | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formState, setFormState] = useState<InlineFactureFormState>(initialFormState);
  const [factureToDelete, setFactureToDelete] = useState<number | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [showOnlyUnfavorable, setShowOnlyUnfavorable] = useState(false);

  // Filtrage des étapes
  const filteredEtapes = etapes.filter(e => {
    const matchesQuery = e.nomEtape.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (e.artisan?.nom?.toLowerCase().includes(filterQuery.toLowerCase()) ?? false);
    const matchesVariance = showOnlyUnfavorable ? parseFloat(e.ecartMontant) > 0 || (e.ecartJours ?? 0) > 0 : true;
    return matchesQuery && matchesVariance;
  });

  const handleSelectEtape = (etape: EtapeAnalyse) => {
    if (selectedEtape?.noEtapeChantier === etape.noEtapeChantier) {
      setSelectedEtape(null);
      setShowAddForm(false);
    } else {
      setSelectedEtape(etape);
      setShowAddForm(false);
      setFormState(initialFormState);
    }
  };

  const handleOpenAddForm = () => {
    setFormState(initialFormState);
    setShowAddForm(true);
  };

  const handleSubmitFacture = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEtape) return;

    await createFacture.mutateAsync({
      etapeId: selectedEtape.noEtapeChantier,
      data: {
        artisanId: selectedEtape.artisan?.noArtisan ?? 0,
        dateFacture: formState.dateFacture,
        montantFacture: parseFloat(formState.montantFacture),
        nbJoursTravail: parseInt(formState.nbJoursTravail),
        dateReglFacture: formState.dateReglFacture || undefined,
      },
    });

    setShowAddForm(false);
    setFormState(initialFormState);
  };

  const handleDeleteFacture = (factureId: number) => {
    setFactureToDelete(factureId);
  };

  const confirmDeleteFacture = async () => {
    if (factureToDelete === null) return;
    await deleteFacture.mutateAsync(factureToDelete);
    setFactureToDelete(null);
  };

  /* ── Loading ─────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-3">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
        <Card variant="glass" padding="none">
          <div className="p-6 border-b border-border/40"><Skeleton className="h-8 w-64" /></div>
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────────── */
  if (isError) {
    return (
      <Card variant="glass" className="border-red/20 bg-red/5">
        <div className="flex flex-col items-center py-8 text-center">
          <div className="p-4 rounded-full bg-red/10 mb-4">
            <TrendingUp className="w-8 h-8 text-red" />
          </div>
          <H2 className="text-lg font-bold text-red">Erreur de chargement</H2>
          <Text className="text-sm text-placeholder mt-2">Impossible de récupérer l'analyse des coûts.</Text>
        </div>
      </Card>
    );
  }

  /* ── Empty ───────────────────────────────────────────────────── */
  if (etapes.length === 0) {
    return (
      <Card variant="glass" className="border-dashed border-border/60">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-bg-secondary/50 border border-border/40 flex items-center justify-center mb-6 shadow-sm">
            <TrendingUp className="w-10 h-10 text-placeholder opacity-40" />
          </div>
          <H2 className="text-xl font-bold text-text-primary mb-2">Aucune étape disponible</H2>
          <Text className="text-sm text-placeholder max-w-xs mx-auto">
            Les étapes et l'analyse de rentabilité apparaîtront ici une fois le chantier configuré.
          </Text>
        </div>
      </Card>
    );
  }

  const currentSelectedEtape = selectedEtape
    ? etapes.find(e => e.noEtapeChantier === selectedEtape.noEtapeChantier) ?? null
    : null;

  const metrics = currentSelectedEtape ? [
    { label: 'Théorique', value: currentSelectedEtape.montantTheorique ? `${parseFloat(currentSelectedEtape.montantTheorique).toLocaleString('fr-FR')} €` : '—', icon: Euro, tooltip: 'Budget initial prévu pour cette étape.' },
    { label: 'Délai prévu', value: currentSelectedEtape.nbJoursPrevu != null ? `${currentSelectedEtape.nbJoursPrevu} jours` : '—', icon: Calendar, tooltip: 'Temps de travail initialement estimé.' },
    { label: 'Artisan', value: currentSelectedEtape.artisan ? `${currentSelectedEtape.artisan.nom} ${currentSelectedEtape.artisan.prenom}` : 'Non assigné', icon: Users, tooltip: 'Prestataire responsable de cette étape.' },
    { label: 'Nb Factures', value: String(currentSelectedEtape.factures.length), icon: CreditCard, tooltip: 'Nombre total de factures enregistrées pour cette étape.' },
  ] : [];

  return (
    <>
      <div className="space-y-8 pb-12">

        {/* ── Legend ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold uppercase tracking-wider px-2">
          <div className="flex items-center gap-2 group transition-opacity hover:opacity-100 opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-green-600">Favorable</span>
          </div>
          <div className="flex items-center gap-2 group transition-opacity hover:opacity-100 opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-red" />
            <span className="text-red">Défavorable</span>
          </div>
          {canEdit && (
            <Text variant='caption' className="ml-auto text-placeholder italic">
              Cliquez sur une ligne pour gérer les factures
            </Text>
          )}
        </div>

        {/* ── Tableau des écarts ──────────────────────────────────── */}
        <Card variant="glass" padding="none" className="overflow-hidden border-border/20 shadow-lg transition-all duration-500">
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 border-b border-border/20 bg-bg-secondary/5 gap-4">
            <div className="flex items-center gap-4 mr-auto">
              <div>
                <H2 className="text-lg font-bold tracking-tight text-text-primary">Analyse de Rentabilité</H2>
                <Text className="text-[10px] text-placeholder font-medium mt-0.5 uppercase tracking-widest leading-none">Chantier #{noChantier} • Rapport</Text>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-68">
                <Input
                  name="etape-filter"
                  type="text"
                  placeholder="Rechercher une étape..."
                  value={filterQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-placeholder" />}
                />
              </div>
              <button
                onClick={() => setShowOnlyUnfavorable(!showOnlyUnfavorable)}
                className={cn(
                  "flex items-center gap-2 px-3 h-9 rounded-lg border text-[10px] font-bold uppercase transition-all",
                  showOnlyUnfavorable
                    ? "bg-red/10 border-red text-red shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                    : "bg-bg-secondary border-border/40 text-placeholder opacity-80"
                )}
              >
                Écarts Défavorables
              </button>
            </div>
          </div>
          <div className="p-0">
            <EcartTable
              etapes={filteredEtapes}
              onSelectEtape={handleSelectEtape}
              selectedEtapeId={currentSelectedEtape?.noEtapeChantier ?? null}
            />
          </div>
        </Card>

        {/* ── Détail étape sélectionnée ────────────────────────────── */}
        <AnimatePresence mode="wait">
          {currentSelectedEtape && (
            <motion.div
              key={currentSelectedEtape.noEtapeChantier}
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 30 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <Card variant="glass" className="border-border/30 shadow-2xl relative overflow-hidden ring-1 ring-primary/5">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none scale-150 rotate-12">
                  <TrendingUp className="w-48 h-48" />
                </div>

                {/* Header étape */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div>
                      <H3 className="text-lg font-bold text-text-primary tracking-tight leading-tight">{currentSelectedEtape.nomEtape}</H3>
                      <Text className="text-xs text-placeholder font-semibold uppercase tracking-widest mt-1 opacity-50">Prestations & factures</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {canEdit && !showAddForm && (
                      <Button variant="Primary" size="sm" icon={Plus} onClick={handleOpenAddForm}>
                        Ajouter une facture
                      </Button>
                    )}
                    <Button
                      variant="Secondary"
                      size="icon"
                      onClick={() => { setSelectedEtape(null); setShowAddForm(false); }}
                      className="rounded-2xl border-border/40 hover:bg-bg-secondary"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Métriques de référence */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {metrics.map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="p-4 rounded-xl bg-bg-secondary/20 border border-border/20 flex flex-row justify-between backdrop-blur-xl shadow-sm group transition-all duration-300"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Text variant='caption'>{m.label}</Text>
                          {m.tooltip && (
                            <Tooltip content={m.tooltip} position="top">
                              <Info className="w-2.5 h-2.5 text-placeholder opacity-30 cursor-help" />
                            </Tooltip>
                          )}
                        </div>
                        <Text className="font-bold text-text-primary text-sm tracking-tight">{m.value}</Text>
                      </div>
                      <div className="text-text-secondary opacity-30">
                        <m.icon className="w-4 h-4" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Formulaire d'ajout de facture */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleSubmitFacture}
                      className="mb-10 p-6 rounded-3xl border border-primary/30 bg-primary/4 shadow-inner relative overflow-hidden"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-primary text-white shadow-md">
                          <Plus className="w-4 h-4" />
                        </div>
                        <H3 className="text-lg font-bold text-primary">Nouvelle facture artisan</H3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <Label required>Date facture</Label>
                          <Input
                            name="dateFacture"
                            type="date"
                            className="bg-bg-primary/50 border-border/40 focus:border-primary rounded-xl h-11"
                            value={formState.dateFacture}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setFormState(s => ({ ...s, dateFacture: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label required>Montant HT (€)</Label>
                          <Input
                            name="montantFacture"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            className="bg-bg-primary/50 border-border/40 focus:border-primary rounded-xl h-11 font-mono"
                            value={formState.montantFacture}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setFormState(s => ({ ...s, montantFacture: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label required>Jours réels</Label>
                          <Input
                            name="nbJoursTravail"
                            type="number"
                            min="1"
                            placeholder="ex: 8"
                            className="bg-bg-primary/50 border-border/40 focus:border-primary rounded-xl h-11 font-mono"
                            value={formState.nbJoursTravail}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setFormState(s => ({ ...s, nbJoursTravail: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Date règlement</Label>
                          <Input
                            name="dateReglFacture"
                            type="date"
                            className="bg-bg-primary/50 border-border/40 focus:border-primary rounded-xl h-11"
                            value={formState.dateReglFacture}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setFormState(s => ({ ...s, dateReglFacture: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-8">
                        <Button
                          variant="Secondary"
                          size="sm"
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="rounded-xl px-6 h-11 border-border/40"
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="Primary"
                          size="sm"
                          type="submit"
                          loading={createFacture.isPending}
                          disabled={!formState.dateFacture || !formState.montantFacture || !formState.nbJoursTravail}
                          className="rounded-xl px-10 h-11 shadow-lg shadow-primary/20"
                        >
                          Enregistrer la facture
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Liste des factures */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <H3 className="text-sm font-bold uppercase tracking-widest text-text-secondary opacity-60">Historique des factures</H3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bg-secondary/50 text-placeholder border border-border/50">
                      {currentSelectedEtape.factures.length} Total
                    </span>
                  </div>

                  {currentSelectedEtape.factures.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border border-border/30 bg-bg-primary/20 backdrop-blur-md transition-all">
                      <table className="w-full text-sm border-spacing-0 border-collapse">
                        <thead>
                          <tr className="bg-bg-secondary/30 border-b border-border/30">
                            {['Date', 'Artisan', 'Montant HT', 'Jours', 'Paiement', 'Statut', ''].map((h, i) => (
                              <th key={i} className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-placeholder text-left last:text-right">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {currentSelectedEtape.factures.map((facture) => (
                            <motion.tr
                              key={facture.noFacture}
                              layout
                              className="hover:bg-primary/3 transition-colors group"
                            >
                              <td className="py-3 px-5 font-semibold text-text-primary">{formatDate(facture.dateFacture)}</td>
                              <td className="py-3 px-5 text-text-secondary font-medium text-xs">
                                {facture.artisan ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-600 font-bold border border-indigo-500/20">
                                      {facture.artisan.nom.charAt(0)}
                                    </div>
                                    <span>{facture.artisan.nom} {facture.artisan.prenom}</span>
                                  </div>
                                ) : '—'}
                              </td>
                              <td className="py-3 px-5 font-mono font-bold text-text-primary text-sm">
                                {parseFloat(facture.montantFacture).toLocaleString('fr-FR')} €
                              </td>
                              <td className="py-3 px-5 font-mono font-semibold text-text-secondary">
                                <span className="px-2 py-0.5 rounded-md bg-bg-secondary border border-border/40 text-[10px]">
                                  {facture.nbJoursTravail ?? '—'} j
                                </span>
                              </td>
                              <td className="py-3 px-5 text-text-secondary font-medium italic opacity-60 text-xs text-nowrap">
                                {facture.dateReglFacture ? formatDate(facture.dateReglFacture) : 'En attente'}
                              </td>
                              <td className="py-3 px-5">
                                <StatusBadge
                                  status={facture.dateReglFacture ? 'Payée' : 'À régler'}
                                  variant={facture.dateReglFacture ? 'success' : 'warning'}
                                  className="text-[9px] font-bold uppercase tracking-wider"
                                />
                              </td>
                              {canEdit && (
                                <td className="py-3 px-5 text-right">
                                  <button
                                    onClick={() => handleDeleteFacture(facture.noFacture)}
                                    disabled={deleteFacture.isPending}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-red/8 rounded-lg transition-all group/btn"
                                    title="Supprimer la facture"
                                  >
                                    <Trash className="w-3.5 h-3.5 text-placeholder group-hover/btn:text-red transition-colors" />
                                  </button>
                                </td>
                              )}
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center rounded-3xl border-2 border-dashed border-border/40 bg-bg-secondary/10"
                    >
                      <div className="p-4 rounded-2xl bg-bg-secondary/50 mb-4 items-center justify-center flex">
                        <CreditCard className="w-8 h-8 text-placeholder opacity-40" />
                      </div>
                      <Text className="text-placeholder font-bold text-sm mb-4">Aucune facture enregistrée</Text>
                      {canEdit && !showAddForm && (
                        <Button variant="Primary" size="md" icon={Plus} onClick={handleOpenAddForm}>
                          Enregistrer la première facture
                        </Button>
                      )}
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmModal
        isOpen={factureToDelete !== null}
        onClose={() => setFactureToDelete(null)}
        onConfirm={confirmDeleteFacture}
        title="Supprimer de la facture"
        message="Attention : cette action supprimera définitivement la facture et mettra à jour l'analyse de rentabilité."
        confirmText="Supprimer définitivement"

      />
    </>
  );
};
