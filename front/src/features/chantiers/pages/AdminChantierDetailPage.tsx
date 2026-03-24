import { useState } from 'react';
import { useChantier } from '../hooks/useChantiers';
import { useParams, useNavigate } from 'react-router-dom';
import { H2, Text } from '@/shared/components/ui/Typography';
import Button from '@/shared/components/ui/Button';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Card } from '@/shared/components/ui/Card';
import Skeleton from '@/shared/components/ui/Skeleton';
import { Bank, Pin, ChevronDown, ChevronUp, TrendingUp } from '@mynaui/icons-react';
import { ArrowLeft, User, Calendar, CheckCircle } from '@mynaui/icons-react';
import { formatDate } from '@/shared/utils/dateFormatter';
import { Tabs } from '@/shared/components/ui/Tabs';
import type { ChantierDetail } from '../types';
import { AnalyseCoutsPanel } from '../components/AnalyseCoutsPanel';

export const AdminChantierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: chantierData, isLoading: loading, isError } = useChantier(id, { endpoint: '/admin/chantiers' });
  const chantier = chantierData as ChantierDetail | undefined | null;

  const [expandedEtapes, setExpandedEtapes] = useState<Set<number>>(new Set());

  const toggleEtapeExpanded = (etapeId: number) => {
    setExpandedEtapes(prev => {
      const next = new Set(prev);
      if (next.has(etapeId)) {
        next.delete(etapeId);
      } else {
        next.add(etapeId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Skeleton className="h-10 w-64 mb-3" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
        <Card className="mb-6 h-24 flex flex-col justify-center px-6">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </Card>
        <div className="flex gap-2 border-b border-border/60 pb-2 mb-6">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-10 w-40 rounded-t-lg" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="h-48">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
          </Card>
          <Card className="lg:col-span-2 h-96">
            <Skeleton className="h-6 w-48 mb-6" />
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />)}
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <Text className="text-red font-medium mb-4">Impossible de charger les détails du chantier.</Text>
        <Button variant="Secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }

  if (!chantier) {
    return (
      <div className="p-8">
        <Text className="text-placeholder mb-4">Chantier non trouvé</Text>
        <Button variant="Secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }

  const totalAppels = chantier.appels.reduce((acc, a) => acc + parseFloat(a.montant || '0'), 0);
  const totalRegle = chantier.appels.filter(a => a.dateReglement).reduce((acc, a) => acc + parseFloat(a.montant || '0'), 0);
  const etapesTerminees = chantier.etapes.filter(e => e.statut === 'Terminée' || e.reservee).length;
  const etapesTotal = chantier.etapes.length;
  const progression = etapesTotal > 0 ? Math.round((etapesTerminees / etapesTotal) * 100) : 0;

  const sortedEtapes = [...chantier.etapes].sort((a, b) => {
    const order: Record<string, number> = { 'En cours': 0, 'À venir': 1, 'Terminée': 2 };
    return (order[a.statut] ?? 1) - (order[b.statut] ?? 1);
  });

  const th = 'py-2.5 px-3 text-xs font-semibold uppercase tracking-wide text-text-secondary text-left';

  return (
    <div className="p-8">
      {/* Back button */}
      <Button variant="Ghost" icon={ArrowLeft} onClick={() => navigate(-1)} className="mb-6">
        Retour aux chantiers
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <H2 className="text-2xl font-bold text-text-primary">Chantier #{chantier.noChantier}</H2>
            <StatusBadge status={chantier.statut} />
          </div>
          <div className="flex items-center gap-1.5 text-placeholder text-sm">
            <Pin className="w-3.5 h-3.5 shrink-0" />
            {chantier.adresse}, {chantier.cp} {chantier.ville}
          </div>
        </div>
      </div>

      {/* Progression — shown when 'En cours' from backend */}
      {chantier.statut === 'En cours' && (
        <Card className="mb-6" padding="sm">
          <div className="flex items-center justify-between mb-2">
            <Text className="text-sm font-medium">Progression</Text>
            <Text className="text-sm font-bold text-primary">{progression}%</Text>
          </div>
          <div className="w-full bg-border/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progression}%` }}
            />
          </div>
          <Text className="text-xs text-placeholder mt-1.5">
            {etapesTerminees} / {etapesTotal} étapes terminées
          </Text>
        </Card>
      )}

      <Tabs
        tabs={[
          { id: 'suivi', label: 'Suivi de chantier', icon: <Calendar className="w-4 h-4" /> },
          { id: 'analyse', label: 'Analyse des coûts', icon: <TrendingUp className="w-4 h-4" /> },
        ]}
        defaultTab="suivi"
      >
        {(activeTab) => (
          <>
            {activeTab === 'suivi' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Client */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <H2 className="text-base font-semibold">Client</H2>
                  </div>
                  {chantier.client ? (
                    <div className="space-y-2">
                      <Text className="font-semibold">
                        {chantier.client.nom} {chantier.client.prenom}
                      </Text>
                      <div className="flex items-start gap-1.5 text-placeholder">
                        <Pin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <Text className="text-sm">
                          {chantier.client.adresse}, {chantier.client.cp} {chantier.client.ville}
                        </Text>
                      </div>
                    </div>
                  ) : (
                    <Text className="text-placeholder text-sm">Aucun client associé</Text>
                  )}
                </Card>

                {/* Étapes */}
                <Card className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <H2 className="text-base font-semibold">Étapes du chantier</H2>
                    <span className="ml-auto text-xs text-placeholder px-2 py-0.5 rounded-full bg-bg-secondary border border-border">
                      {chantier.etapes.length} étape{chantier.etapes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {chantier.etapes.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {sortedEtapes.map((etape) => {
                        const isCompleted = etape.statut === 'Terminée';
                        const isActive = etape.statut === 'En cours';
                        const hasReducSuppl = etape.reductionSupplementaire && parseFloat(etape.reductionSupplementaire) !== 0;
                        const reducSuppl = parseFloat(etape.reductionSupplementaire || '0');
                        const isExpanded = expandedEtapes.has(etape.noEtapeChantier);

                        return (
                          <div
                            key={etape.noEtapeChantier}
                            className={`rounded-[var(--radius)] border transition-all ${isCompleted ? 'bg-green-500/5 border-green-500/20'
                                : isActive ? 'bg-primary/5 border-primary/20'
                                  : 'bg-bg-primary border-border'
                              }`}
                          >
                            <div className="flex items-center justify-between p-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                ) : isActive ? (
                                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Text className={`font-medium text-sm ${isCompleted ? 'text-green-700' : ''}`}>
                                      {etape.nomEtape}
                                    </Text>
                                    {etape.reservee && (
                                      <span className="px-1.5 py-0.5 text-xs rounded bg-orange-500/10 text-orange-700 border border-orange-200">
                                        Réservée
                                      </span>
                                    )}
                                    {hasReducSuppl && (
                                      <span className={`px-1.5 py-0.5 text-xs rounded font-mono ${reducSuppl > 0 ? 'bg-green-500/8 text-green-700 border border-green-200' : 'bg-red/8 text-red border border-red/20'}`}>
                                        {reducSuppl > 0 ? '+' : ''}{reducSuppl.toLocaleString('fr-FR')} €
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                                    {etape.dateDebut && (
                                      <Text className="text-xs text-placeholder">Débuté: {formatDate(etape.dateDebut)}</Text>
                                    )}
                                    {etape.dateFin && (
                                      <Text className="text-xs text-green-600">Terminé: {formatDate(etape.dateFin)}</Text>
                                    )}
                                    {!etape.dateDebut && etape.dateDebutTheorique && (
                                      <Text className="text-xs text-placeholder">Prévu: {formatDate(etape.dateDebutTheorique)}</Text>
                                    )}
                                    {etape.artisan && (
                                      <Text
                                        className="text-xs text-placeholder hover:text-primary cursor-pointer transition-colors"
                                        onClick={() => navigate(`/admin/artisans/${etape.artisan?.noArtisan}`)}
                                      >
                                        {etape.artisan.nom} {etape.artisan.prenom}
                                      </Text>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                {etape.montantTheorique && !etape.reservee && (
                                  <Text className="font-mono text-sm text-text-secondary">
                                    {parseFloat(etape.montantTheorique).toLocaleString('fr-FR')} €
                                  </Text>
                                )}
                                {hasReducSuppl && (
                                  <Button variant="Ghost" size="icon" onClick={() => toggleEtapeExpanded(etape.noEtapeChantier)}>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-placeholder" /> : <ChevronDown className="w-4 h-4 text-placeholder" />}
                                  </Button>
                                )}
                                <StatusBadge status={etape.statut} dot={false} />
                              </div>
                            </div>
                            {hasReducSuppl && isExpanded && (
                              <div className="px-4 pb-3 pt-2 ml-7 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                  <Text className="text-xs text-placeholder">{reducSuppl > 0 ? 'Supplément' : 'Réduction'}</Text>
                                  <Text className={`font-mono text-sm ${reducSuppl > 0 ? 'text-green-600' : 'text-red'}`}>
                                    {reducSuppl > 0 ? '+' : ''}{reducSuppl.toLocaleString('fr-FR')} €
                                  </Text>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Text className="text-placeholder text-sm">Aucune étape définie</Text>
                  )}
                </Card>

                {/* Appels de fond */}
                <Card className="lg:col-span-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Bank className="w-4 h-4 text-primary" />
                      </div>
                      <H2 className="text-base font-semibold">Appels de fond</H2>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-placeholder">
                        Total: <span className="font-semibold text-text-primary font-mono">{totalAppels.toLocaleString('fr-FR')} €</span>
                      </span>
                      <span className="text-placeholder">
                        Réglé: <span className="font-semibold text-green-600 font-mono">{totalRegle.toLocaleString('fr-FR')} €</span>
                      </span>
                    </div>
                  </div>
                  {chantier.appels.length > 0 ? (
                    <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-bg-secondary/70 border-b border-border">
                            <th className={th}>N°</th>
                            <th className={th}>Date appel</th>
                            <th className={`${th} text-right`}>Montant</th>
                            <th className={th}>Date règlement</th>
                            <th className={`${th} text-right`}>Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {chantier.appels.map((appel, index) => (
                            <tr key={appel.noAppel} className="hover:bg-bg-secondary/40 transition-colors">
                              <td className="py-2.5 px-3 text-text-primary">
                                {index === 0 ? 'Initial (20%)' : index === 1 ? 'Couverture (50%)' : 'Solde'}
                              </td>
                              <td className="py-2.5 px-3">{formatDate(appel.dateAppel)}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-medium">
                                {parseFloat(appel.montant || '0').toLocaleString('fr-FR')} €
                              </td>
                              <td className="py-2.5 px-3 text-text-secondary text-sm">
                                {appel.dateReglement ? formatDate(appel.dateReglement) : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <StatusBadge
                                  status={appel.dateReglement ? 'Réglé' : 'En attente'}
                                  dot={false}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Text className="text-placeholder text-sm">Aucun appel de fond</Text>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'analyse' && (
              <AnalyseCoutsPanel
                chantierId={id!}
                noChantier={chantier.noChantier}
                canEdit={true}
              />
            )}
          </>
        )}
      </Tabs>
    </div>
  );
};
