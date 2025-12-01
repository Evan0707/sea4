import UtilisateurItem from '../components/UtilisateurItem';
import Input from '@/shared/components/ui/Input';
import { H1, Text } from '@/shared/components/ui/Typography';
import { Search, ArrowDown, ArrowUp } from '@mynaui/icons-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '@/shared/components/ui/Button';

interface Utilisateur {
  noUtilisateur: number;
  login: string;
  nom?: string | null;
  prenom?: string | null;
  role?: 'admin' | 'commercial' | 'maitre_oeuvre' | string | null;
}

export const UtilisateursListPage = () => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUtilisateurs();
  }, [sortOrder, debouncedSearch]);

  const fetchUtilisateurs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/utilisateurs', {
        params: {
          search: debouncedSearch,
          sortOrder,
        },
      });
      setUtilisateurs(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = async (noUtilisateur: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`http://localhost:8000/api/utilisateur/${noUtilisateur}/delete`);
        fetchUtilisateurs();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      }
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <H1 className="mb-6">Utilisateurs</H1>

      <div className='flex flex-row justify-between items-center'>
        <Input
        name='search'
        width='w-[350px]'
        className='mb-5'
        type='text'
        leftIcon={<Search className='text-placeholder' />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher par login..."
      />
      <Button variant='Primary' onClick={() => navigate('/admin/utilisateurs/new')}>Nouveau</Button>
      </div>

      {/* Frame container */}
      <div className="bg-bg-secondary rounded-lg border border-border overflow-hidden flex flex-col flex-1">

        <div className="flex items-center justify-between py-3 pl-5 pr-15 border-b border-border flex-shrink-0 bg-bg-secondary">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSort}
              className="w-[200px] flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Text className="font-semibold text-sm">Login</Text>
              {sortOrder === 'asc' ? <ArrowUp strokeWidth={2} className="w-4 h-4 text-placeholder" /> : <ArrowDown strokeWidth={2} className="w-4 h-4 text-placeholder" />}
            </button>
            <Text className="w-[300px] font-semibold text-sm">Nom</Text>
          </div>
          <Text className="w-[200px] font-semibold text-sm">Rôle</Text>
        </div>

        {/* Liste des utilisateurs */}
        <div className="divide-y relative divide-border bg-bg-primary overflow-y-auto flex-1">
          {loading ? (
            <>
              <UtilisateurItem loading={true} login='load' nom='load' prenom='load' role='admin' />
              <UtilisateurItem loading={true} login='load' nom='load' prenom='load' role='admin' />
              <UtilisateurItem loading={true} login='load' nom='load' prenom='load' role='admin' />
              <UtilisateurItem loading={true} login='load' nom='load' prenom='load' role='admin' />
              <UtilisateurItem loading={true} login='load' nom='load' prenom='load' role='admin' />
            </>
          ) : utilisateurs.length > 0 ? utilisateurs.map((utilisateur) => (
            <UtilisateurItem
              key={utilisateur.noUtilisateur}
              {...utilisateur}
              onEdit={() => console.log('Éditer utilisateur', utilisateur.noUtilisateur)}
              onDelete={() => handleDelete(utilisateur.noUtilisateur)}
            />
          )) : (
            <div className="flex items-center justify-center h-full">
              <Text variant='body' color='text-placeholder'>Aucun utilisateur trouvé</Text>
            </div>
          )}
        </div>

        {/* Nombre de résultats */}
        <div className="py-2 px-5 border-t border-border bg-bg-secondary flex-shrink-0">
          <Text className="text-sm text-placeholder">
            {utilisateurs.length} résultat{utilisateurs.length > 1 ? 's' : ''}
          </Text>
        </div>
      </div>
    </div>
  );
};