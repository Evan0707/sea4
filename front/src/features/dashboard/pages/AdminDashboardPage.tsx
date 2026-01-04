import { useNavigate } from 'react-router-dom';
import { Text } from '@/shared/components/ui/Typography';
import { usePageHeader } from '@/shared/context/LayoutContext';
import Skeleton from '@/shared/components/ui/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { UsersGroup, Tool, Folder, CheckCircle, ClockCircle, UserSquare } from '@mynaui/icons-react';
import { useAdminStats } from '../hooks/useDashboardStats';

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
  color?: 'primary' | 'green' | 'orange' | 'blue' | 'purple';
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-600',
    orange: 'bg-orange-500/10 text-orange-600',
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
  };

  return (
    <Card className="h-full" padding="none">
      <CardContent className="flex items-start gap-4 p-5">
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



export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: loading } = useAdminStats();

  usePageHeader('Tableau de bord', undefined, 'Vue d\'ensemble de l\'activité.');

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

  const usersPieData = [
    { value: stats.utilisateurs.admins, label: 'Admins', color: '#ef4444' },
    { value: stats.utilisateurs.commerciaux, label: 'Commerciaux', color: '#f59e0b' },
    { value: stats.utilisateurs.moe, label: 'MOE', color: '#6366f1' },
  ].filter(d => d.value > 0);

  const chantiersPieData = [
    { value: stats.chantiers.aCompleter, label: 'À compléter', color: '#94a3b8' },
    { value: stats.chantiers.aVenir, label: 'À venir', color: '#f59e0b' },
    { value: stats.chantiers.enCours, label: 'En chantier', color: '#6366f1' },
    { value: stats.chantiers.termines, label: 'Terminés', color: '#22c55e' },
  ].filter(d => d.value > 0);

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-50 text-red-700 border-red-200',
      commercial: 'bg-orange-50 text-orange-700 border-orange-200',
      maitre_oeuvre: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    const labels: Record<string, string> = {
      admin: 'Admin',
      commercial: 'Commercial',
      maitre_oeuvre: 'MOE',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[role] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div className="p-8">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          icon={UsersGroup}
          title="Utilisateurs"
          value={stats.utilisateurs.total}
          subtitle={`${stats.utilisateurs.moe} MOE actifs`}
          color="primary"
        />
        <StatCard
          icon={Tool}
          title="Artisans"
          value={stats.utilisateurs.artisans}
          subtitle="Partenaires"
          color="purple"
        />
        <StatCard
          icon={Folder}
          title="Chantiers"
          value={stats.chantiers.total}
          subtitle={`${stats.chantiers.aCompleter} à compléter`}
          color="blue"
        />
        <StatCard
          icon={ClockCircle}
          title="En cours"
          value={stats.chantiers.enCours}
          subtitle="Chantiers actifs"
          color="orange"
        />
        <StatCard
          icon={CheckCircle}
          title="Terminés"
          value={stats.chantiers.termines}
          subtitle="Chantiers livrés"
          color="green"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chantiers par mois - Span 2 */}
        {/* Chantiers par mois - Span 2 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Chantiers par mois</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.charts.chantiersByMonth.some(v => v > 0) ? (
              <SimpleBarChart
                data={stats.charts.chantiersByMonth}
                labels={stats.charts.monthLabels}
                maxHeight={250}
              />
            ) : (
              <div className="h-48 flex items-center justify-center">
                <Text className="text-placeholder">Aucun chantier créé</Text>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chantiers par statut - Span 1 */}
        {/* Chantiers par statut - Span 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chantiers par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <SimplePieChart data={chantiersPieData} />
            </div>
          </CardContent>
        </Card>

        {/* Utilisateurs par rôle - Span 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Utilisateurs par rôle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <SimplePieChart data={usersPieData} />
            </div>
          </CardContent>
        </Card>

        {/* Utilisateurs récents - Span 2 */}
        {/* Utilisateurs récents - Span 2 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Utilisateurs récents</CardTitle>
            <button
              onClick={() => navigate('/admin/utilisateurs')}
              className="text-xs text-primary hover:underline"
            >
              Voir tout
            </button>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-bg-primary rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <Text className="font-medium truncate">
                          {u.prenom && u.nom ? `${u.prenom} ${u.nom}` : u.login}
                        </Text>
                        <Text className="text-xs text-placeholder truncate">{u.login}</Text>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      {getRoleBadge(u.role)}
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
