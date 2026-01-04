import { useNavigate } from 'react-router-dom';
import { H1, Text } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';
import Status from '@/shared/components/ui/Status';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Tool, Bank, TrendingUp, CheckCircle } from '@mynaui/icons-react';
import { useMoeStats } from '../hooks/useDashboardStats';

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = 'primary'
}: {
  icon: any;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'primary' | 'green' | 'orange' | 'blue';
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-600',
    orange: 'bg-orange-500/10 text-orange-600',
    blue: 'bg-blue-500/10 text-blue-600',
  };

  return (
    <Card className="flex items-start gap-4 h-full" padding="none">
      <CardContent className="p-5 flex items-start gap-4 w-full">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <Text className="text-sm text-placeholder">{title}</Text>
          <Text className="text-2xl font-bold mt-1">{value}</Text>
          {subtitle && <Text className="text-xs text-placeholder mt-1">{subtitle}</Text>}
        </div>
      </CardContent>
    </Card>
  );
};

// Simple Bar Chart component
const SimpleBarChart = ({ data, labels, maxHeight = 200 }: { data: number[]; labels: string[]; maxHeight?: number }) => {
  const maxValue = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-2 h-full" style={{ height: maxHeight }}>
      {data.map((value, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-primary rounded-t transition-all duration-500 min-h-[4px]"
            style={{ height: `${(value / maxValue) * (maxHeight - 40)}px` }}
          />
          <Text className="text-[10px] text-placeholder truncate w-full text-center">
            {labels[i]?.slice(0, 3)}
          </Text>
        </div>
      ))}
    </div>
  );
};

// Simple Pie Chart component
const SimplePieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) return <Text className="text-placeholder text-center py-8">Aucune donnée</Text>;

  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {data.map((d, i) => {
          const angle = (d.value / total) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;

          const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = 50 + 40 * Math.cos((startAngle + angle - 90) * Math.PI / 180);
          const y2 = 50 + 40 * Math.sin((startAngle + angle - 90) * Math.PI / 180);

          const largeArc = angle > 180 ? 1 : 0;

          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={d.color}
              className="transition-all duration-300 hover:opacity-80"
            />
          );
        })}
        <circle cx="50" cy="50" r="20" className="fill-bg-secondary" />
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            <Text className="text-sm">{d.label}: {d.value}</Text>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MoeDashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: loading } = useMoeStats();

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="w-64 h-10 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <Text>Erreur lors du chargement du tableau de bord</Text>
      </div>
    );
  }

  const pieData = [
    { value: stats.general.chantiersEnCours, label: 'En cours', color: '#6366f1' },
    { value: stats.general.chantiersTermines, label: 'Terminés', color: '#22c55e' },
    { value: stats.general.chantiersAVenir, label: 'À venir', color: '#f59e0b' },
    { value: stats.general.chantiersACompleter, label: 'À compléter', color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const getStatusVariant = (statut: string): 'À venir' | 'Terminé' | 'En chantier' | 'À compléter' => {
    switch (statut) {
      case 'Terminé': return 'Terminé';
      case 'En chantier': return 'En chantier';
      case 'À venir': return 'À venir';
      default: return 'À compléter';
    }
  };

  return (
    <div className="p-8">
      <H1 className="mb-2">Tableau de bord</H1>
      <Text className="text-placeholder mb-8">Vue d'ensemble de vos chantiers et performances</Text>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Tool}
          title="Chantiers totaux"
          value={stats.general.totalChantiers}
          subtitle={`${stats.general.chantiersEnCours} en cours`}
          color="primary"
        />
        <StatCard
          icon={CheckCircle}
          title="Chantiers terminés"
          value={stats.general.chantiersTermines}
          subtitle={`${stats.etapes.terminees} étapes terminées`}
          color="green"
        />
        <StatCard
          icon={Bank}
          title="Revenus encaissés"
          value={`${stats.financier.totalRegle.toLocaleString('fr-FR')} €`}
          subtitle={`${stats.financier.totalEnAttente.toLocaleString('fr-FR')} € en attente`}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          title="Montant total"
          value={`${stats.financier.totalMontant.toLocaleString('fr-FR')} €`}
          subtitle="Valeur des chantiers"
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Répartition des chantiers */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Répartition des chantiers</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={pieData} />
          </CardContent>
        </Card>

        {/* Nouveaux chantiers par mois */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Chantiers par mois</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.charts.chantiersByMonth.some(v => v > 0) ? (
              <SimpleBarChart
                data={stats.charts.chantiersByMonth}
                labels={stats.charts.monthLabels}
                maxHeight={200}
              />
            ) : (
              <div className="h-48 flex items-center justify-center">
                <Text className="text-placeholder">Aucun chantier créé</Text>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenus par mois */}
        <Card className="lg:col-span-2 h-full">
          <CardHeader>
            <CardTitle className="text-lg">Revenus mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.charts.revenueByMonth.some(v => v > 0) ? (
              <SimpleBarChart
                data={stats.charts.revenueByMonth}
                labels={stats.charts.monthLabels}
                maxHeight={220}
              />
            ) : (
              <div className="h-56 flex items-center justify-center">
                <Text className="text-placeholder">Aucun revenu enregistré</Text>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chantiers récents */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Chantiers récents</CardTitle>
            <button
              onClick={() => navigate('/maitre-doeuvre/chantiers')}
              className="text-xs text-primary hover:underline"
            >
              Voir tout
            </button>
          </CardHeader>
          <CardContent>
            {stats.recentChantiers.length > 0 ? (
              <div className="space-y-3">
                {stats.recentChantiers.map((ch) => (
                  <div
                    key={ch.noChantier}
                    onClick={() => navigate(`/maitre-doeuvre/chantiers/${ch.noChantier}`)}
                    className="p-3 bg-bg-primary rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Text className="font-medium text-sm">{ch.client}</Text>
                      <Status label={getStatusVariant(ch.statut)} />
                    </div>
                    <Text className="text-xs text-placeholder">{ch.ville}</Text>
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
