import { useNavigate } from 'react-router-dom';
import { Text } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Tool, Bank, TrendingUp, CheckCircle, ArrowRight } from '@mynaui/icons-react';
import { MapPin } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import { useMoeStats } from '../hooks/useDashboardStats';
import { MonochromeBarChart } from '@/components/ui/monochrome-bar-chart';
import { RoundedPieChart } from '@/components/ui/rounded-pie-chart';
import { usePageHeader } from '@/shared/context/LayoutContext';

import { MiniSparkline } from '@/components/ui/mini-sparkline';
import { StatCard } from '@/shared/components/dashboard/StatCard';

export const MoeDashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: loading, isError } = useMoeStats();

  usePageHeader('Tableau de bord', undefined, "Vue d'ensemble de vos chantiers et performances.");

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="flex items-start gap-3 h-full" padding="none">
              <CardContent className="p-5 flex items-start gap-4 w-full">
                <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 mt-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-48 mb-2" /><Skeleton className="h-4 w-64" /></CardHeader>
            <CardContent className="h-[250px] flex items-end justify-around gap-2 pb-4 mt-6">
              {[...Array(7)].map((_, i) => <Skeleton key={i} className="w-full rounded-t-sm" style={{ height: `${Math.random() * 80 + 20}%` }} />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-48" /></CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center mt-6">
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><Skeleton className="h-6 w-64 mb-2" /><Skeleton className="h-4 w-96" /></CardHeader>
            <CardContent className="space-y-4 mt-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-40 mb-2" /><Skeleton className="h-4 w-56" /></CardHeader>
            <CardContent className="space-y-4 mt-6">
              {[...Array(4)].map((_, i) => <div key={i} className="flex gap-4"><Skeleton className="h-10 w-10 rounded-full shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-2/3" /></div></div>)}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <div className="bg-red/5 border border-red/20 rounded-[var(--radius-lg)] text-red p-6 text-center">
          <Text className="text-lg font-bold mb-2">Impossible de charger le tableau de bord</Text>
          <Text className="text-sm">Une erreur est survenue lors de la récupération de vos statistiques.</Text>
        </div>
      </div>
    );
  }

  const pieData = [
    { value: stats.general.chantiersEnCours, label: 'En cours', color: '#6366f1' },
    { value: stats.general.chantiersTermines, label: 'Terminés', color: '#22c55e' },
    { value: stats.general.chantiersAVenir, label: 'À venir', color: '#f59e0b' },
    { value: stats.general.chantiersACompleter, label: 'À compléter', color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Tool} title="Chantiers totaux" value={stats.general.totalChantiers} subtitle={`${stats.general.chantiersEnCours} en cours`} trendColor="text-slate-400" />
        <StatCard icon={CheckCircle} title="Chantiers terminés" value={stats.general.chantiersTermines} subtitle={`${stats.etapes.terminees} étapes terminées`} trendColor="text-green-500" />
        <StatCard icon={Bank} title="Revenus encaissés" value={`${stats.financier.totalRegle.toLocaleString('fr-FR')} €`} subtitle={`${stats.financier.totalEnAttente.toLocaleString('fr-FR')} € en attente`} trendColor="text-blue-500" />
        <StatCard icon={TrendingUp} title="Montant total" value={`${stats.financier.totalMontant.toLocaleString('fr-FR')} €`} subtitle="Valeur des chantiers" trendColor="text-indigo-400" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <RoundedPieChart data={pieData} title="Répartition des chantiers" emptyMessage="Aucun chantier en cours" />
        <div className="h-[400px]">
          <MonochromeBarChart 
            data={stats.charts.chantiersByMonth} 
            labels={stats.charts.monthLabels}
            title="Chantiers par mois"
            dataName="chantiers"
            emptyMessage="Aucun chantier créé"
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[400px]">
          <MonochromeBarChart 
            data={stats.charts.revenueByMonth} 
            labels={stats.charts.monthLabels}
            title="Revenus mensuels"
            dataName="revenus"
            classNameFill="fill-green-500"
            emptyMessage="Aucun revenu enregistré"
          />
        </div>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-placeholder">Chantiers récents</CardTitle>
            <Button variant="Link" onClick={() => navigate('/maitre-doeuvre/chantiers')} iconRight={ArrowRight}>
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentChantiers.length > 0 ? (
              <div className="space-y-3">
                {stats.recentChantiers.map((ch) => (
                  <div
                    key={ch.noChantier}
                    className="group relative p-4 bg-bg-primary rounded-[var(--radius-lg)] border border-border/60 hover:border-primary/20 hover:shadow-md cursor-pointer transition-all duration-300 overflow-hidden flex flex-col justify-between"
                    onClick={() => navigate(`/maitre-doeuvre/chantiers/${ch.noChantier}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/maitre-doeuvre/chantiers/${ch.noChantier}`)}
                  >
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1 pr-2">
                        <Text className="font-semibold text-sm text-text-primary group-hover:text-primary transition-colors">
                          {ch.client}
                        </Text>
                        <div className="flex items-center text-xs text-text-secondary gap-1.5">
                          <MapPin className="w-3.5 h-3.5 opacity-70" />
                          <span>{ch.ville || 'Non spécifiée'}</span>
                        </div>
                      </div>
                      <StatusBadge status={ch.statut} />
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <Text className="text-[11px] text-placeholder font-medium tracking-wide uppercase">
                        N° {ch.noChantier}
                      </Text>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <Text className="text-placeholder">Aucun chantier</Text>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
