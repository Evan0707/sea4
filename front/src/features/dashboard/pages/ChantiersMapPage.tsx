
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
    // Fetch list of dossiers (chantiers)
    // We might need a specific endpoint or just use the list endpoint and filter client-side if needed.
    // Assuming /api/dossier returns chantiers with lat/long as updated in controller.
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
     .filter((c: any) => c.latitude && c.longitude)
     .map((c: any) => ({
      id: c.noChantier,
      latitude: c.latitude,
      longitude: c.longitude,
      title: `${c.nom} ${c.prenom}`,
      description: `${c.address}, ${c.cp} ${c.ville} - ${c.status}`,
      link: `/commercial/dossiers/${c.noChantier}`,
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
  <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-6">

   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card>
     <CardHeader className="pb-2">
      <CardTitle className="text-4xl">{stats.total}</CardTitle>
     </CardHeader>
     <CardContent>
      <Text className="text-text-secondary">Total Chantiers</Text>
     </CardContent>
    </Card>
    <Card>
     <CardHeader className="pb-2">
      <CardTitle className="text-4xl">{stats.mapped}</CardTitle>
     </CardHeader>
     <CardContent>
      <Text className="text-text-secondary">Géolocalisés</Text>
     </CardContent>
    </Card>
    <Card>
     <CardHeader className="pb-2">
      <CardTitle className="text-4xl">{((stats.mapped / (stats.total || 1)) * 100).toFixed(0)}%</CardTitle>
     </CardHeader>
     <CardContent>
      <Text className="text-text-secondary">Couverture</Text>
     </CardContent>
    </Card>
   </div>

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

   <Card className="h-[600px] flex flex-col overflow-hidden">
    <CardContent className="p-0 flex-1">
     {loading ? (
      <Skeleton className="w-full h-full" />
     ) : (
      <Map
       markers={markers}
       height="100%"
       zoom={8} // Adjust zoom to fit region better
      />
     )}
    </CardContent>
   </Card>
  </div>
 );
};
