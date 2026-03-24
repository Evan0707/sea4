import { useState, useEffect, useCallback } from 'react';
import { X, Check, DangerTriangle } from '@mynaui/icons-react';
import Button from '@/shared/components/ui/Button';
import SearchBar from '@/shared/components/ui/SearchBar';
import DateInput from '@/shared/components/ui/DateInput';
import { Text, H2 } from '@/shared/components/ui/Typography';
import type { Artisan } from '../types';
import apiClient from '@/shared/api/client';
import { addDays, parseISO, format } from 'date-fns';

interface AvailabilitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (artisan: Artisan, startDate: string, endDate: string) => void;
  etape: {
    noEtape: number;
    nomEtape: string;
    dateDebutTheorique: string | null;
    nbJours?: number;
  };
  currentArtisanId?: number;
}

export const AvailabilitySelector = ({ isOpen, onClose, onSelect, etape, currentArtisanId }: AvailabilitySelectorProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { dateDebutTheorique, nbJours = 0 } = etape;

  // Gestion des dates
  useEffect(() => {
    if (isOpen && dateDebutTheorique) {
      setStartDate(dateDebutTheorique);
      if (nbJours > 0) {
        const start = parseISO(dateDebutTheorique);
        const end = addDays(start, nbJours);
        setEndDate(format(end, 'yyyy-MM-dd'));
      } else {
        setEndDate(dateDebutTheorique);
      }
    }
  }, [isOpen, dateDebutTheorique, nbJours]);

  // Recherche des artisans disponibles
  const searchAvailableArtisans = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/artisans/available', {
        params: {
          start: startDate,
          end: endDate,
          etape_id: etape.noEtape
        }
      });
      setArtisans(response.data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la recherche des artisans disponibles.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, etape.noEtape]);

  // Gestion de la recherche des artisans disponibles
  useEffect(() => {
    if (isOpen && startDate && endDate) {
      searchAvailableArtisans();
    }
  }, [isOpen, startDate, endDate, searchAvailableArtisans]);

  if (!isOpen) return null;

  const filteredArtisans = artisans.filter(artisan => {
    const searchLower = searchTerm.toLowerCase();
    return (
      artisan.nomArtisan.toLowerCase().includes(searchLower) ||
      artisan.prenomArtisan.toLowerCase().includes(searchLower) ||
      artisan.villeArtisan.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-bg-primary rounded-xl border border-border sm:max-w-[600px] w-full max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <H2 className="text-xl">Assigner un artisan pour "{etape.nomEtape}"</H2>
          <button onClick={onClose} className="text-placeholder hover:text-text-primary transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 border-b border-border bg-bg-secondary/50">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <DateInput
                name="startDate"
                label="Début prévu"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <DateInput
                name="endDate"
                label="Fin prévue"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Filtrer les artisans par nom ou ville..."
            width="w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] p-5">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
              <DangerTriangle className="w-6 h-6" />
              <Text>{error}</Text>
            </div>
          ) : artisans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-placeholder text-center max-w-sm mx-auto">
              <Text>Aucun artisan disponible trouvé pour cette période.</Text>
              <Text className="text-sm mt-2">Cela signifie que tous les artisans qualifiés sont soit en congés, soit déjà affectés à d'autres chantiers qui chevauchent ces dates.</Text>
            </div>
          ) : filteredArtisans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-placeholder">
              <Text>Aucun artisan ne correspond à votre recherche.</Text>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredArtisans.map(artisan => (
                <div
                  key={artisan.noArtisan}
                  onClick={() => onSelect(artisan, startDate, endDate)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-bg-secondary flex items-center justify-between ${currentArtisanId === artisan.noArtisan ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                >
                  <div>
                    <Text className="font-semibold">{artisan.nomArtisan} {artisan.prenomArtisan}</Text>
                    <Text className="text-xs text-placeholder">
                      {artisan.villeArtisan}
                      {artisan.telArtisan ? ` • ${artisan.telArtisan}` : ''}
                      {artisan.emailArtisan ? ` • ${artisan.emailArtisan}` : ''}
                    </Text>
                  </div>
                  {currentArtisanId === artisan.noArtisan && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-border bg-bg-secondary rounded-b-xl flex justify-end">
          <Button variant="Secondary" onClick={onClose}>Annuler</Button>
        </div>
      </div>
    </div>
  );
};
