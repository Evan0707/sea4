import ArtisanItem from '../components/ArtisanItem';
import Input from '@/shared/components/ui/Input';
import { H1, Text } from '@/shared/components/ui/Typography';
import { Search, ArrowDown, ArrowUp, X } from '@mynaui/icons-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/useToast';
import Button from '@/shared/components/ui/Button';

interface CsvArtisan {
  nom: string;
  prenom: string;
  adresse: string;
  cp: string;
  ville: string;
  qualifications: string;
}

const parseCSV = (text: string): CsvArtisan[] => {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headerLine = lines[0].toLowerCase();
  const separator = headerLine.includes(';') ? ';' : headerLine.includes(',') ? ',' : '\t';
  const headers = headerLine.split(separator).map(h => h.trim().replace(/"/g, ''));
  
  const findHeader = (possibleNames: string[]): number => {
    return headers.findIndex(h => possibleNames.some(name => h.includes(name)));
  };
  
  const nomIdx = findHeader(['nom', 'name', 'lastname']);
  const prenomIdx = findHeader(['prenom', 'prénom', 'firstname']);
  const adresseIdx = findHeader(['adresse', 'address', 'rue']);
  const cpIdx = findHeader(['cp', 'code postal', 'postal', 'zip']);
  const villeIdx = findHeader(['ville', 'city']);
  const qualIdx = findHeader(['qualification', 'etape', 'métier', 'metier', 'skill']);
  
  const artisans: CsvArtisan[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim().replace(/"/g, ''));
    if (values.length < 2) continue;
    
    artisans.push({
      nom: nomIdx >= 0 ? values[nomIdx] || '' : '',
      prenom: prenomIdx >= 0 ? values[prenomIdx] || '' : '',
      adresse: adresseIdx >= 0 ? values[adresseIdx] || '' : '',
      cp: cpIdx >= 0 ? values[cpIdx] || '' : '',
      ville: villeIdx >= 0 ? values[villeIdx] || '' : '',
      qualifications: qualIdx >= 0 ? values[qualIdx] || '' : '',
    });
  }
  
  return artisans;
};

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
  const [isDragging, setIsDragging] = useState(false);
  const [csvArtisans, setCsvArtisans] = useState<CsvArtisan[]>([]);
  const [showCsvPopup, setShowCsvPopup] = useState(false);
  const dragCounter = useRef(0);

  const navigate = useNavigate();

  const toast = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.csv')) {
      toast.addToast('Veuillez déposer un fichier CSV', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          toast.addToast('Aucun artisan trouvé dans le fichier', 'error');
          return;
        }
        setCsvArtisans(parsed);
        setShowCsvPopup(true);
      } catch {
        toast.addToast('Erreur lors de la lecture du fichier', 'error');
      }
    };
    reader.readAsText(file);
  }, [toast]);

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
    <div 
      className="p-8 h-screen flex flex-col relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div 
          className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg z-50 flex items-center justify-center pointer-events-none"
        >
          <Text className="text-xl font-semibold text-primary">Déposez votre fichier CSV ici</Text>
        </div>
      )}

      {showCsvPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-primary rounded-xl border border-border max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <H1 className="text-xl">Import d'artisans</H1>
                <Text className="text-sm text-placeholder mt-1">{csvArtisans.length} artisan{csvArtisans.length > 1 ? 's' : ''} trouvé{csvArtisans.length > 1 ? 's' : ''} dans le fichier</Text>
              </div>
              <button onClick={() => setShowCsvPopup(false)} className="text-placeholder hover:text-primary transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto flex-1">
              <div className="divide-y divide-border">
                {csvArtisans.map((artisan, idx) => (
                  <div key={idx} className="p-4 hover:bg-bg-secondary transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Text className="font-semibold text-base">
                            {artisan.nom || 'Sans nom'} {artisan.prenom}
                          </Text>
                        </div>
                        <Text className="text-sm text-placeholder">
                          {[artisan.adresse, artisan.cp, artisan.ville].filter(Boolean).join(', ') || 'Adresse non renseignée'}
                        </Text>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-w-[300px] justify-end">
                        {artisan.qualifications ? (
                          artisan.qualifications.split(/[,;]/).map((qual, qIdx) => (
                            <span 
                              key={qIdx} 
                              className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                            >
                              {qual.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="px-2.5 py-1 text-xs rounded-full bg-bg-secondary text-placeholder">
                            Aucune qualification
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center gap-3 p-5 border-t border-border bg-bg-secondary rounded-b-xl">
              <Text className="text-sm text-placeholder">
                Les artisans seront ajoutés à la liste existante
              </Text>
              <div className="flex gap-3">
                <Button variant='Secondary' onClick={() => setShowCsvPopup(false)}>Annuler</Button>
                <Button variant='Primary' onClick={() => setShowCsvPopup(false)}>Importer {csvArtisans.length} artisan{csvArtisans.length > 1 ? 's' : ''}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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