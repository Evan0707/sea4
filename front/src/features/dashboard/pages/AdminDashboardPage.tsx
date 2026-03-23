import { useNavigate } from 'react-router-dom';
import { Text } from '@/shared/components/ui/Typography';
import { usePageHeader } from '@/shared/context/LayoutContext';
import Skeleton from '@/shared/components/ui/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { UsersGroup, Tool, Folder, CheckCircle, ClockCircle, UserSquare, ArrowRight } from '@mynaui/icons-react';
import Button from '@/shared/components/ui/Button';
import { useAdminStats } from '../hooks/useDashboardStats';
import { MonochromeBarChart } from '@/components/ui/monochrome-bar-chart';
import { RoundedPieChart } from '@/components/ui/rounded-pie-chart';

import { MiniSparkline } from '@/components/ui/mini-sparkline';
import { StatCard } from '@/shared/components/dashboard/StatCard';
import { RoleBadge } from '@/shared/components/ui/RoleBadge';

// RoleBadge now imported from shared UI components

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: loading, isError } = useAdminStats();

  usePageHeader('Tableau de bord', undefined, "Vue d'ensemble de l'activité.");

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="flex items-start gap-3 h-full" padding="none">
              <CardContent className="p-5 flex items-start gap-4 w-full">
                <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 mt-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><Skeleton className="h-6 w-48 mb-2" /><Skeleton className="h-4 w-64" /></CardHeader>
            <CardContent className="h-[250px] flex items-end justify-around gap-2 pb-4 mt-6">
              {[...Array(8)].map((_, i) => <div key={i} className="w-full bg-border rounded-t-sm animate-pulse" style={{ height: `${Math.random() * 80 + 20}%` }} />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-48" /></CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center mt-6">
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader><Skeleton className="h-6 w-64 mb-2" /><Skeleton className="h-4 w-96" /></CardHeader>
            <CardContent className="space-y-4 mt-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
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

  const usersPieData = [
    { value: stats.utilisateurs.admins, label: 'Admins', color: '#f87171' }, // Red-400
    { value: stats.utilisateurs.commerciaux, label: 'Commerciaux', color: '#fbbf24' }, // Amber-400
    { value: stats.utilisateurs.moe, label: 'MOE', color: 'var(--primary)' },
  ].filter(d => d.value > 0);

  const chantiersPieData = [
    { value: stats.chantiers.aCompleter, label: 'À compléter', color: '#94a3b8' },
    { value: stats.chantiers.aVenir, label: 'À venir', color: '#fbbf24' }, // Amber-400
    { value: stats.chantiers.enCours, label: 'En chantier', color: 'var(--primary)' },
    { value: stats.chantiers.termines, label: 'Terminés', color: '#22c55e' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <StatCard icon={UsersGroup} title="Utilisateurs" value={stats.utilisateurs.total} subtitle={`${stats.utilisateurs.moe} MOE actifs`} trendColor="text-primary" />
        <StatCard icon={Tool} title="Artisans" value={stats.utilisateurs.artisans} subtitle="Partenaires" trendColor="text-purple-500" />
        <StatCard icon={Folder} title="Chantiers" value={stats.chantiers.total} subtitle={`${stats.chantiers.aCompleter} à compléter`} trendColor="text-blue-400" />
        <StatCard icon={ClockCircle} title="En cours" value={stats.chantiers.enCours} subtitle="Chantiers actifs" trendColor="text-primary" />
        <StatCard icon={CheckCircle} title="Terminés" value={stats.chantiers.termines} subtitle="Chantiers livrés" trendColor="text-green-500" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Bar chart — Chantiers par mois (span 2) */}
        <div className="lg:col-span-2 h-[400px]">
          <MonochromeBarChart
            data={stats.charts.chantiersByMonth}
            labels={stats.charts.monthLabels}
            title="Chantiers par mois"
            dataName="chantiers"
            classNameFill="fill-primary"
            emptyMessage="Aucun chantier créé"
          />
        </div>

        {/* Pie chart — Chantiers par statut */}
        <RoundedPieChart data={chantiersPieData} title="Chantiers par statut" emptyMessage="Aucun chantier" />

        {/* Pie chart — Utilisateurs par rôle */}
        <RoundedPieChart data={usersPieData} title="Utilisateurs par rôle" emptyMessage="Aucun utilisateur" />

        {/* Utilisateurs récents (span 2) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-placeholder">Utilisateurs récents</CardTitle>
            <Button variant="Link" onClick={() => navigate('/admin/utilisateurs')} iconRight={ArrowRight}>
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="group relative p-4 bg-bg-primary rounded-[var(--radius-lg)] border border-border/60 hover:border-text-primary/20 hover:shadow-sm cursor-pointer transition-all duration-300 overflow-hidden flex flex-col justify-between"
                    onClick={() => navigate(`/admin/utilisateurs/${u.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/utilisateurs/${u.id}`)}
                  >

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <UserSquare className="w-6 h-6" />
                        <div className="space-y-1 pr-2">
                          <Text className="font-semibold text-sm text-text-primary transition-colors">
                            {u.prenom && u.nom ? `${u.prenom} ${u.nom}` : u.login}
                          </Text>
                          <Text className="text-xs text-text-secondary">{u.login}</Text>
                        </div>
                      </div>
                      <div className="shrink-0 ml-2">
                        <RoleBadge role={u.role} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <Text className="text-[11px] text-placeholder font-medium tracking-wide uppercase">
                        ID: {u.id}
                      </Text>
                      <ArrowRight className="w-4 h-4 text-text-primary opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <Text className="text-placeholder">Aucun utilisateur</Text>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
