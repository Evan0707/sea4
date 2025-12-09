import ArtisanItem from '../components/ArtisanItem';
import Input from '@/shared/components/ui/Input';
import { H1, Text } from '@/shared/components/ui/Typography';
import { Search, ArrowDown, ArrowUp } from '@mynaui/icons-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/useToast';
import Button from '@/shared/components/ui/Button';

interface Artisan {
  adresseArtisan: string;
  cpArtisan: string;
  nomArtisan: string;
  prenomArtisan: string;
  villeArtisan: string;
  noArtisan: number;
  etapes?: { noEtape: number; nomEtape: string }[];
}

export const ArtisansListPage = () => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const toast = useToast();

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchArtisans();
  }, [sortOrder, debouncedSearch]);

  const fetchArtisans = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/artisan', {
        params: {
          search: debouncedSearch,
          sortOrder,
        },
      });

      // Correction des clés avec guillemets doubles
      const cleanArtisans = response.data.map((a: any) => ({
        noArtisan: a.noArtisan,
        nomArtisan: a['"nomArtisan"'] ?? a.nomArtisan,
        prenomArtisan: a['"prenomArtisan"'] ?? a.prenomArtisan,
        adresseArtisan: a['"adresseArtisan"'] ?? a.adresseArtisan,
        cpArtisan: a['"cpArtisan"'] ?? a.cpArtisan,
        villeArtisan: a['"villeArtisan"'] ?? a.villeArtisan,
        etapes: a.etapes ?? [],
      }));
      setArtisans(cleanArtisans);
      
    } catch (error) {
      toast.addToast('Erreur lors du chargement des artisans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = async (noArtisan: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artisan ?')) {
      try {
        const data = await axios.delete(`http://localhost:8000/api/artisan/${noArtisan}/delete`);
        fetchArtisans();

        console.log(data);
        
     
      } catch (error: any) {
        if (error.response?.status === 400) {
          if (error.response.data?.noChantier) {
            const chantierIds = error.response.data.noChantier.join(', ');
            toast.addToast(`${error.response.data.message}\nChantiers concernés : ${chantierIds}`, 'error');
          } else {
            toast.addToast(error.response.data.message, 'error');
          }
        } else {
          toast.addToast('Erreur lors de la suppression de l\'artisan', 'error');
          // const detailedError = error.response?.data?.error ? `\nDétails: ${error.response.data.error}` : '';
        }
      }
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      
        <H1 className="mb-6">Artisans</H1>


      <div className='flex flex-row justify-between items-center'>
        <Input
          name='search'
          width='w-[350px]'
          className='mb-5'
          type='text'
          leftIcon={<Search className='text-placeholder' />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom ou ville..."
        />
        <Button variant='Primary' onClick={() => navigate('/admin/artisans/new')}>
            Nouveau
          </Button>
      </div>

      {/* Frame container */}
      <div className="bg-bg-secondary rounded-lg border border-border overflow-hidden flex flex-col flex-1">

        <div className="flex items-center justify-between py-3 pl-5 pr-15 border-b border-border shrink-0 bg-bg-secondary">
          <button
            onClick={toggleSort}
            className="w-[200px] flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Text className="font-semibold text-sm">Nom Prénom</Text>
            {sortOrder === 'asc' ? <ArrowUp strokeWidth={2} className="w-4 h-4 text-placeholder" /> : <ArrowDown strokeWidth={2} className="w-4 h-4 text-placeholder" />}
          </button>
          <Text className="w-[400px] font-semibold text-sm">Adresse</Text>
        </div>

        {/* Liste des artisans */}
        <div className="divide-y relative divide-border bg-bg-primary overflow-y-auto flex-1">
          {loading ? (
            <>
              <ArtisanItem loading={true} />
              <ArtisanItem loading={true} />
              <ArtisanItem loading={true} />
              <ArtisanItem loading={true} />
              <ArtisanItem loading={true} />
            </>
          ) : artisans.length > 0 ? artisans.map((artisan) => (
            <ArtisanItem
              key={artisan.noArtisan}
              {...artisan}
              onEdit={() => navigate(`/admin/artisans/${artisan.noArtisan}/edit`)}
              onDelete={() => handleDelete(artisan.noArtisan)}
            />
          )) : (
            <div className="flex items-center justify-center h-full">
              <Text variant='body' color='text-placeholder'>Aucun artisan trouvé</Text>
            </div>
          )}
        </div>

        {/* Nombre de résultats */}
        <div className="py-2 px-5 border-t border-border bg-bg-secondary shrink-0">
          <Text className="text-sm text-placeholder">
            {artisans.length} résultat{artisans.length > 1 ? 's' : ''}
          </Text>
        </div>
      </div>
    </div>
  );
};