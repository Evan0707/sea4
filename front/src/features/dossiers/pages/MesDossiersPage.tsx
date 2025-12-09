import DossierItem from '../components/DossierItem';
import Input from '@/shared/components/ui/Input';
import { H1, Text } from '@/shared/components/ui/Typography';
import { Search, ArrowDown, ArrowUp } from '@mynaui/icons-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/shared/hooks/useToast';

interface Dossier {
  noChantier: number;
  nom: string;
  prenom: string;
  address: string;
  cp: string;
  ville: string;
  start: string;
  status: 'À venir' | 'Terminé' | 'Complété' | 'En chantier' | 'À compléter';
}

export const MesDossiersPage = () => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchDossiers();
  }, [sortOrder, debouncedSearch]);

  const fetchDossiers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/mes-dossiers', {
        params: {
          search: debouncedSearch,
          sortOrder,
        },
      });
      setDossiers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = async (noChantier: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chantier ?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/chantiers/${noChantier}`);
      addToast('Chantier supprimé avec succès', 'success');
      fetchDossiers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addToast('Erreur lors de la suppression du chantier', 'error');
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <H1 className="mb-6">Mes dossiers</H1>

      <Input
        name='search'
        width='w-full'
        className='mb-5 md:w-[350px] w-full'
        type='text'
        leftIcon={<Search className='text-placeholder' />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher par nom, prénom ou ville..."
      />

      {/* Frame container */}
      <div className="bg-bg-secondary rounded-lg border border-border  overflow-hidden flex flex-col flex-1">

        <div className="flex items-center justify-between py-3 pl-5 pr-15 border-b border-border shrink-0 bg-bg-secondary">
          <Text className="w-[150px] font-semibold text-sm">Nom Prénom</Text>
          <Text className="w-[300px] font-semibold text-sm">Adresse</Text>
          <button
            onClick={toggleSort}
            className="w-[100px] flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Text className="font-semibold text-sm">Date début</Text>
            {sortOrder === 'asc' ? <ArrowUp strokeWidth={2} className="w-4 h-4 text-placeholder" /> : <ArrowDown strokeWidth={2} className="w-4 h-4 text-placeholder" />}
          </button>
          <Text className="w-[120px] font-semibold text-right text-sm">Statut</Text>
        </div>

        {/* Liste des dossiers */}
        <div className="divide-y relative  divide-border bg-bg-primary overflow-y-auto flex-1">
          {loading ? (
            <>
              <DossierItem loading={true} nom='load' prenom='load' address='load' cp='load' ville='load' start='load' status='Complété' />
              <DossierItem loading={true} nom='load' prenom='load' address='load' cp='load' ville='load' start='load' status='Complété' />
              <DossierItem loading={true} nom='load' prenom='load' address='load' cp='load' ville='load' start='load' status='Complété' />
              <DossierItem loading={true} nom='load' prenom='load' address='load' cp='load' ville='load' start='load' status='Complété' />
              <DossierItem loading={true} nom='load' prenom='load' address='load' cp='load' ville='load' start='load' status='Complété' />
            </>
          ) : dossiers.length > 0 ? dossiers.map((dossier) => (
            <DossierItem
              key={dossier.noChantier}
              {...dossier}
              onEdit={() => navigate(`/maitre-doeuvre/chantiers/${dossier.noChantier}/completer`)}
              onDelete={() => handleDelete(dossier.noChantier)}
            />
          )) : (
            <div className="flex items-center justify-center h-full">
              <Text variant='body' color='text-placeholder'>Aucun dossier trouvé</Text>
            </div>
          )}
        </div>

        {/* Nombre de résultats */}
        <div className="py-2 px-5 border-t border-border bg-bg-secondary shrink-0">
          <Text className="text-sm text-placeholder">
            {dossiers.length} résultat{dossiers.length > 1 ? 's' : ''}
          </Text>
        </div>
      </div>
    </div>
  );
};
