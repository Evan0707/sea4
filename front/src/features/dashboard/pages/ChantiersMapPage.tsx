
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLayout } from '@/shared/context/LayoutContext';
import Map from '@/shared/components/ui/Map';
import apiClient from '@/shared/api/client';
import { useToast } from '@/shared/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Text } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';
import Button from '@/shared/components/ui/Button';
import { Grid } from '@mynaui/icons-react';


export const ChantiersMapPage = () => {
 const navigate = useNavigate();
 const { setHeader } = useLayout();
 const { addToast } = useToast();
 const [loading, setLoading] = useState(true);
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const [markers, setMarkers] = useState<any[]>([]);
 const [stats, setStats] = useState({ total: 0, mapped: 0 });

 // Memoize actions to avoid infinite loop
 const actions = useMemo(() => (
  <div className='flex gap-2'>
   <Button variant="Secondary" icon={Grid} onClick={() => navigate('/admin/chantiers')}>
    Voir la liste
   </Button>
  </div>
 ), [navigate]);

 useEffect(() => {
  setHeader({
   title: 'Carte des Chantiers',
   description: 'Visualisation géographique des chantiers en cours et à venir.',
   actions: actions,
  });
 }, [setHeader, actions]);

 useEffect(() => {
  const fetchChantiers = async () => {
   try {

    const response = await apiClient.get('/chantiers');
    const data = response.data;

    const getStatusColor = (status: string) => {
     switch (status) {
      case 'À compléter': return '#9CA3AF'; // Gray
      case 'À venir': return '#F59E0B'; // Amber
      case 'En chantier': return '#3B82F6'; // Blue
      case 'Terminé': return '#10B981'; // Green
      default: return '#6B7280';
     }
    };

    const validMarkers = data
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     .filter((c: any) => c.latitude && c.longitude)
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     .map((c: any) => ({
      id: c.noChantier,
      latitude: c.latitude,
      longitude: c.longitude,
      title: `${c.nom} ${c.prenom}`,
      description: `${c.address}, ${c.cp} ${c.ville} - ${c.status}`,
      link: `/admin/dossiers/${c.noChantier}`,
      color: getStatusColor(c.status)
     }));

    setMarkers(validMarkers);
    setStats({
     total: data.length,
     mapped: validMarkers.length,
    });
   } catch (error) {
    console.error('Error fetching chantiers map:', error);
    addToast('Erreur lors du chargement de la carte', 'error');
   } finally {
    setLoading(false);
   }
  };

  fetchChantiers();
 }, [addToast]);

 return (
  <div className="p-6 mx-auto space-y-4">

   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <Card>
     <CardHeader className="pb-1">
      <CardTitle className="text-4xl">{stats.total}</CardTitle>
     </CardHeader>
     <CardContent>
      <Text variant='small' className="text-text-secondary">Total Chantiers</Text>
     </CardContent>
    </Card>
    <Card>
     <CardHeader className="pb-1">
      <CardTitle className="text-4xl">{stats.mapped}</CardTitle>
     </CardHeader>
     <CardContent>
      <Text variant='small' className="text-text-secondary">Géolocalisés</Text>
     </CardContent>
    </Card>
    <Card>
     <CardHeader className="pb-1">
      <CardTitle className="text-4xl">{((stats.mapped / (stats.total || 1)) * 100).toFixed(0)}%</CardTitle>
     </CardHeader>
     <CardContent>
      <Text variant='small' className="text-text-secondary">Couverture</Text>
     </CardContent>
    </Card>
   </div>

   <Card className="h-[550px] flex flex-col overflow-hidden">
    <CardContent className="p-0 flex-1 relative bg-bg-secondary/20">
     {loading ? (
      <div className="w-full h-full relative overflow-hidden bg-bg-secondary/30">
       <Skeleton className="absolute inset-0 opacity-50" />
       {[...Array(5)].map((_, i) => (
        <div key={i} className="absolute w-8 h-8 bg-border rounded-full flex items-center justify-center animate-pulse shadow-sm" style={{ top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%` }}>
         <div className="w-3 h-3 bg-bg-secondary rounded-full" />
        </div>
       ))}
      </div>
     ) : (
      <>
       {/* Legend */}
       <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex items-center gap-2">
         <div className="w-3 h-3 rounded-full bg-[#9CA3AF]"></div>
         <span className="text-sm text-text-secondary">À compléter</span>
        </div>
        <div className="flex items-center gap-2">
         <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
         <span className="text-sm text-text-secondary">À venir</span>
        </div>
        <div className="flex items-center gap-2">
         <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
         <span className="text-sm text-text-secondary">En chantier</span>
        </div>
        <div className="flex items-center gap-2">
         <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
         <span className="text-sm text-text-secondary">Terminé</span>
        </div>
       </div>
       <Map
        markers={markers}
        height="93%"
        zoom={8}
       />
      </>
     )}
    </CardContent>
   </Card>
  </div>
 );
};
