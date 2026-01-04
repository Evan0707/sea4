import { useState } from 'react';
import { useChantier } from '../hooks/useChantiers';
import { useParams, useNavigate } from 'react-router-dom';
import { H2, Text } from '@/shared/components/ui/Typography';
import Button from '@/shared/components/ui/Button';
import Status from '@/shared/components/ui/Status';
import Skeleton from '@/shared/components/ui/Skeleton';
import { Bank, Pin, ChevronDown, ChevronUp } from '@mynaui/icons-react';
import { ArrowLeft, User, Calendar, CheckCircle } from '@mynaui/icons-react';
import { formatDate } from '@/shared/utils/dateFormatter';

import type { ChantierDetail } from '../types';

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

export const AdminChantierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Cast to ChantierDetail to ensure types, using admin endpoint
  const { data: chantierData, isLoading: loading } = useChantier(id, { endpoint: '/admin/chantiers' });
  const chantier = chantierData as ChantierDetail | undefined | null;

  const [expandedEtapes, setExpandedEtapes] = useState<Set<number>>(new Set());

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
  const etapesTerminees = chantier.etapes.filter(e => e.statut === 'Terminée' || e.reservee).length;
  const etapesTotal = chantier.etapes.length;
  const progression = etapesTotal > 0 ? Math.round((etapesTerminees / etapesTotal) * 100) : 0;

  // Trier les étapes : En cours en haut, À venir au milieu, Terminées en bas
  const sortedEtapes = [...chantier.etapes].sort((a, b) => {
    const order: Record<string, number> = { 'En cours': 0, 'À venir': 1, 'Terminée': 2 };
    return (order[a.statut] ?? 1) - (order[b.statut] ?? 1);
  });

  return (
    <div className="p-8">
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        classname="flex items-center gap-2 text-placeholder hover:text-primary transition-colors mb-6 pl-0 bg-transparent border-none shadow-none hover:bg-transparent"
      >
        <ArrowLeft className="w-4 h-4" />
        <Text>Retour aux chantiers</Text>
      </Button>

      {/* Barre de progression */}
      {chantier.statut === 'En chantier' && (
        <div className="bg-bg-secondary rounded-lg border border-border p-4 mb-6">
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
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="bg-bg-secondary rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <H2 className="text-lg">Client</H2>
          </div>
          {chantier.client ? (
            <div className="space-y-3">
              <Text className="font-semibold text-lg">
                {chantier.client.nom} {chantier.client.prenom}
              </Text>
              <div className="flex items-center gap-2 text-placeholder">
                <Pin className="w-4 h-4" />
                <Text className="text-sm">
                  {chantier.client.adresse}, {chantier.client.cp} {chantier.client.ville}
                </Text>
              </div>
            </div>
          ) : (
            <Text className="text-placeholder">Aucun client associé</Text>
          )}
        </div>

        {/* Étapes */}
        <div className="lg:col-span-2 bg-bg-secondary rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <H2 className="text-lg">Étapes du chantier</H2>
          </div>
          {chantier.etapes.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {sortedEtapes.map((etape) => {
                const isCompleted = etape.statut === 'Terminée';
                const hasReducSuppl = etape.reductionSupplementaire && parseFloat(etape.reductionSupplementaire) !== 0;
                const reducSuppl = parseFloat(etape.reductionSupplementaire || '0');
                const isExpanded = expandedEtapes.has(etape.noEtapeChantier);

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
                              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-600">
                                Réservée
                              </span>
                            )}
                            {hasReducSuppl && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${reducSuppl > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
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
                            {etape.artisan && (
                              <Text className="text-xs text-placeholder">
                                Artisan: {etape.artisan.nom} {etape.artisan.prenom}
                              </Text>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {etape.montantTheorique && (
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
                        <Status label={getStatusVariant(etape.statut)} />
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
        </div>

        {/* Appels de fond */}
        <div className="lg:col-span-3 bg-bg-secondary rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bank className="w-5 h-5 text-primary" />
              <H2 className="text-lg">Appels de fond</H2>
            </div>
            <div className="flex items-center gap-4">
              <Text className="text-sm text-placeholder">
                Total: <span className="font-semibold text-text-primary">{totalAppels.toLocaleString('fr-FR')} €</span>
              </Text>
              <Text className="text-sm text-placeholder">
                Réglé: <span className="font-semibold text-green-600">{totalRegle.toLocaleString('fr-FR')} €</span>
              </Text>
            </div>
          </div>
          {chantier.appels.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-text-primary font-semibold">N°</th>
                    <th className="text-left py-2 px-3 text-text-primary font-semibold">Date appel</th>
                    <th className="text-right py-2 px-3 text-text-primary font-semibold">Montant</th>
                    <th className="text-left py-2 px-3 text-text-primary font-semibold">Date règlement</th>
                    <th className="text-right py-2 px-3 text-text-primary font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {chantier.appels.map((appel, index) => (
                    <tr key={appel.noAppel} className="border-b border-border/50">
                      <td className="py-2 px-3 text-text-primary">
                        {index === 0 ? 'Initial (20%)' : index === 1 ? 'Couverture (50%)' : `Solde`}
                      </td>
                      <td className="py-2 px-3 text-text-primary">{formatDate(appel.dateAppel)}</td>
                      <td className="py-2 px-3 text-right font-mono text-text-primary">
                        {parseFloat(appel.montant || '0').toLocaleString('fr-FR')} €
                      </td>
                      <td className="py-2 px-3 text-text-primary">
                        {appel.dateReglement ? formatDate(appel.dateReglement) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {appel.dateReglement ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-600">
                            Réglé
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-600">
                            En attente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Text className="text-placeholder">Aucun appel de fond</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
