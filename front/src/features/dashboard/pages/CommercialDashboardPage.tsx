import { useNavigate } from 'react-router-dom';
import { Text } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Folder, FileCheck, ClockCircle, CheckCircle, ArrowRight } from '@mynaui/icons-react';
import { MapPin } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import { useCommercialStats } from '../hooks/useDashboardStats';
import { MonochromeBarChart } from '@/components/ui/monochrome-bar-chart';
import { RoundedPieChart } from '@/components/ui/rounded-pie-chart';
import { usePageHeader } from '@/shared/context/LayoutContext';

import { MiniSparkline } from '@/components/ui/mini-sparkline';
import { StatCard } from '@/shared/components/dashboard/StatCard';

export const CommercialDashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: loading, isError } = useCommercialStats();

  usePageHeader('Tableau de bord', undefined, "Vue d'ensemble de vos dossiers clients.");

  if (loading) {
    return (
      <div className="p-6">
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
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="w-full rounded-t-sm" style={{ height: `${Math.random() * 80 + 20}%` }} />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-48" /></CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center mt-6">
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </CardContent>
          </Card>
        </div>
        <Card className="h-64">
          <CardHeader><Skeleton className="h-6 w-64 mb-2" /><Skeleton className="h-4 w-96" /></CardHeader>
          <CardContent className="space-y-4 mt-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center">
        <div className="bg-red/5 border border-red/20 rounded-[var(--radius-lg)] text-red p-6 text-center">
          <Text className="text-lg font-bold mb-2">Impossible de charger le tableau de bord</Text>
          <Text className="text-sm">Une erreur est survenue lors de la récupération de vos statistiques.</Text>
        </div>
      </div>
    );
  }

  const pieData = [
    { value: stats.general.dossiersACompleter, label: 'À compléter', color: '#94a3b8' },
    { value: stats.general.dossiersAVenir, label: 'À venir', color: '#f59e0b' },
    { value: stats.general.dossiersEnChantier, label: 'En chantier', color: '#6366f1' },
    { value: stats.general.dossiersTermines, label: 'Terminés', color: '#22c55e' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Folder} title="Dossiers totaux" value={stats.general.totalDossiers} subtitle={`${stats.general.dossiersACompleter} à compléter`} trendColor="text-slate-400" />
        <StatCard icon={ClockCircle} title="À venir" value={stats.general.dossiersAVenir} subtitle="Prêts à démarrer" trendColor="text-orange-400" />
        <StatCard icon={FileCheck} title="En chantier" value={stats.general.dossiersEnChantier} subtitle="En cours de réalisation" trendColor="text-indigo-400" />
        <StatCard icon={CheckCircle} title="Terminés" value={stats.general.dossiersTermines} subtitle="Chantiers livrés" trendColor="text-green-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <RoundedPieChart data={pieData} />
        <MonochromeBarChart data={stats.charts.dossiersByMonth} labels={stats.charts.monthLabels} />
      </div>

      {/* Dossiers récents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-placeholder">Dossiers récents</CardTitle>
          <Button variant="Link" onClick={() => navigate('/commercial/dossiers')} iconRight={ArrowRight}>
            Voir tout
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentDossiers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.recentDossiers.map((d) => (
                <div
                  key={d.noChantier}
                  className="group relative p-5 bg-bg-primary rounded-[var(--radius-lg)] border border-border/60 hover:border-primary/20 hover:shadow-md cursor-pointer transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  onClick={() => navigate(`/commercial/dossiers/${d.noChantier}/edit`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/commercial/dossiers/${d.noChantier}/edit`)}
                >
                  
                  <div className="flex items-start justify-between mb-5">
                    <div className="space-y-1.5 pr-2">
                      <Text className="font-semibold text-sm text-text-primary group-hover:text-primary transition-colors">
                        {d.client}
                      </Text>
                      <div className="flex items-center text-xs text-text-secondary gap-1.5">
                        <MapPin className="w-3.5 h-3.5 opacity-70" />
                        <span>{d.ville || 'Non spécifiée'}</span>
                      </div>
                    </div>
                    <StatusBadge status={d.statut} />
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <Text className="text-[11px] text-placeholder font-medium tracking-wide uppercase">
                      Le {new Date(d.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <Text className="text-placeholder">Aucun dossier</Text>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
