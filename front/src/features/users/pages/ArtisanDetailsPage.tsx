import { useState, useMemo } from 'react';
import { useArtisan, useArtisanPlanning } from '../hooks/useArtisans';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageHeader } from '@/shared/context/LayoutContext';
import Button from '@/shared/components/ui/Button';
import { Pencil, ArrowLeft, Envelope, Telephone, Location, X } from '@mynaui/icons-react';
import { H1, Text, H3 } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';
import apiClient from '@/shared/api/client';
import CalendarComponent, { type CalendarEvent } from '@/shared/components/ui/CalendarComponent';
import { useToast } from '@/shared/hooks/useToast';
import Input from '@/shared/components/ui/Input';
import { format, isWithinInterval, parseISO } from 'date-fns';
import DateInput from '@/shared/components/ui/DateInput';
import CopyToClipboard from '@/shared/components/ui/CopyToClipboard';
import { Card } from '@/shared/components/ui/Card';
import ConfirmModal from '@/shared/components/ui/ConfirmModal';



const ArtisanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const { addToast } = useToast();
  const toast = useToast();

  const { data: artisan, isLoading: loadingArtisan } = useArtisan(id);
  const { data: planningData, refetch: refreshPlanning } = useArtisanPlanning(id);
  const planning = planningData || { assignments: [], unavailability: [] };

  const loading = loadingArtisan;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [constraintType, setConstraintType] = useState<'indisponibilite' | 'chantier_externe'>('indisponibilite');
  const [motif, setMotif] = useState('');
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  // Configuration des actions du header
  const headerActions = useMemo(() => (
    <div className="flex items-center gap-2">
      <Button variant="Secondary" onClick={() => navigate('/admin/artisans')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
    </div>
  ), [navigate]);

  usePageHeader(
    'Détails Artisan',
    headerActions
  );

  // Gestion de la selection d'une date
  const handleDateClick = (date: Date) => {
    if (date.getDay() === 0) {
      toast.addToast("Impossible d'ajouter un événement le dimanche", "error");
      return;
    }

    const hasEvent = allEvents.some(event => {
      const start = parseISO(event.start);
      const end = parseISO(event.end);
      return isWithinInterval(date, { start, end });
    });

    if (hasEvent) {
      toast.addToast("Il y a déjà un événement sur cette date", "error");
      return;
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedStartDate(dateStr);
    setSelectedEndDate(dateStr);
    setConstraintType('indisponibilite');
    setMotif('');
    setModalOpen(true);
  };

  // Gestion de la sauvegarde d'une contrainte
  const handleSaveConstraint = async () => {
    if (!selectedStartDate || !selectedEndDate) return;

    // Validate dates
    if (new Date(selectedStartDate) > new Date(selectedEndDate)) {
      toast.addToast('La date de fin doit être après la date de début', 'error');
      return;
    }

    // Vérification de chevauchement
    const newStart = parseISO(selectedStartDate);
    const newEnd = parseISO(selectedEndDate);

    const hasOverlap = allEvents.some(event => {
      const evStart = parseISO(event.start);
      const evEnd = parseISO(event.end);

      // Vérification de chevauchement
      return (newStart <= evEnd && newEnd >= evStart);
    });

    if (hasOverlap) {
      toast.addToast("La période sélectionnée chevauche un événement existant", "error");
      return;
    }

    const finalMotif = constraintType === 'chantier_externe' ? 'Chantier Externe' : motif;

    try {
      await apiClient.post(`/artisan/${id}/unavailability`, {
        start: selectedStartDate,
        end: selectedEndDate,
        motif: finalMotif
      });
      toast.addToast('Indisponibilité ajoutée', 'success');
      setModalOpen(false);
      // Refresh data
      refreshPlanning();
    } catch (error) {
      console.error(error);
      toast.addToast("Erreur lors de l'ajout", 'error');
    }
  };

  // Gestion de la suppression d'une contrainte
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    const e = eventToDelete;

    const idStr = e.id.replace('indisp_', '');
    try {
      await apiClient.delete(`/artisan/unavailability/${idStr}`);
      toast.addToast('Indisponibilité supprimée', 'success');
      // Refresh data
      refreshPlanning();
    } catch (error) {
      console.error(error);
      toast.addToast("Erreur lors de la suppression", 'error');
    }
    setEventToDelete(null);
  };

  const allEvents = [...planning.assignments, ...planning.unavailability];

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex gap-6">
          <Skeleton className="h-64 flex-1 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!artisan) return null;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 relative">
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-primary p-6 rounded-xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <H3 className="text-xl font-bold">Ajouter une contrainte</H3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex bg-bg-secondary/50 p-1 rounded-lg border border-border">
                <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-all text-sm font-medium ${constraintType === 'indisponibilite' ? 'bg-white text-primary shadow-sm ring-1 ring-border/5' : 'text-text-secondary hover:text-text-primary'}`}>
                  <input
                    type="radio"
                    name="type"
                    checked={constraintType === 'indisponibilite'}
                    onChange={() => setConstraintType('indisponibilite')}
                    className="hidden"
                  />
                  <span>Indisponibilité</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-all text-sm font-medium ${constraintType === 'chantier_externe' ? 'bg-white text-primary shadow-sm ring-1 ring-border/5' : 'text-text-secondary hover:text-text-primary'}`}>
                  <input
                    type="radio"
                    name="type"
                    checked={constraintType === 'chantier_externe'}
                    onChange={() => setConstraintType('chantier_externe')}
                    className="hidden"
                  />
                  <span>Chantier Externe</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Début</Text>
                  <DateInput
                    name="startDate"
                    label="Début"
                    value={selectedStartDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setSelectedStartDate(newStart);
                      // If new start is after end, update end
                      if (selectedEndDate && newStart > selectedEndDate) {
                        setSelectedEndDate(newStart);
                      }
                    }}
                    max={selectedEndDate}
                  />
                </div>
                <div className="space-y-1.5">
                  <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Fin</Text>
                  <DateInput
                    name="endDate"
                    label="Fin"
                    value={selectedEndDate}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      setSelectedEndDate(newEnd);
                      // If new end is before start, update start
                      if (selectedStartDate && newEnd < selectedStartDate) {
                        setSelectedStartDate(newEnd);
                      }
                    }}
                    min={selectedStartDate}
                  />
                </div>
              </div>

              {constraintType === 'indisponibilite' && (
                <div className="space-y-1.5">
                  <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Motif</Text>
                  <Input
                    placeholder="Ex: Congés, Maladie..."
                    name="motif"
                    type="text"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="Secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button variant="Primary" onClick={handleSaveConstraint}>Enregistrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Info Card */}
      <Card variant="highlight" className="flex flex-col md:flex-row justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold border-4 border-bg-primary ring-1 ring-border">
              {artisan.nomArtisan.charAt(0)}{artisan.prenomArtisan.charAt(0)}
            </div>
            <div>
              <H1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">{artisan.nomArtisan} {artisan.prenomArtisan}</H1>
              <div className="flex flex-wrap gap-2 mt-2">
                {artisan.etapes?.map(e => (
                  <span key={e.noEtape} className="px-2 py-0.5 bg-bg-secondary border border-border rounded text-xs text-text-secondary whitespace-nowrap">
                    {e.nomEtape}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 mt-4">
            <div className="flex items-center gap-3 text-text-secondary group hover:text-primary transition-colors">
              <div className="p-2 bg-bg-secondary rounded-lg border border-border group-hover:border-primary/20 transition-colors">
                <Location className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <Text>{artisan.adresseArtisan}, {artisan.cpArtisan} {artisan.villeArtisan}</Text>
                <CopyToClipboard text={`${artisan.adresseArtisan}, ${artisan.cpArtisan} ${artisan.villeArtisan}`} />
              </div>
            </div>
            {artisan.telArtisan && (
              <div className="flex items-center gap-3 text-text-secondary group hover:text-primary transition-colors">
                <div className="p-2 bg-bg-secondary rounded-lg border border-border group-hover:border-primary/20 transition-colors">
                  <Telephone className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <Text>{artisan.telArtisan}</Text>
                  <CopyToClipboard text={artisan.telArtisan} />
                </div>
              </div>
            )}
            {artisan.emailArtisan && (
              <div className="flex items-center gap-3 text-text-secondary group hover:text-primary transition-colors">
                <div className="p-2 bg-bg-secondary rounded-lg border border-border group-hover:border-primary/20 transition-colors">
                  <Envelope className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <Text>{artisan.emailArtisan}</Text>
                  <CopyToClipboard text={artisan.emailArtisan} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start">
          <Button
            variant="Primary"
            onClick={() => navigate(`/admin/artisans/${id}/edit`)}
            icon={Pencil}
          >
            Modifier
          </Button>
        </div>
      </Card>

      {/* Calendar Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <H3>Planning</H3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-500 rounded-sm"></div>
              <span>Chantiers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-500 rounded-sm"></div>
              <span>Indisponibilités</span>
            </div>
          </div>
        </div>

        <CalendarComponent
          events={allEvents}
          onEventClick={(e) => {
            if (e.type === 'chantier' && e.details?.chantierId) {
              navigate(`/admin/chantiers/${e.details.chantierId}`);
            }
          }}
          onDeleteEvent={async (e) => {
            setEventToDelete(e);
          }}
          onDateClick={handleDateClick}
        />

        <ConfirmModal
          isOpen={!!eventToDelete}
          onClose={() => setEventToDelete(null)}
          onConfirm={confirmDeleteEvent}
          title="Supprimer l'indisponibilité"
          message="Confirmer la suppression de cette indisponibilité ?"
          confirmText="Supprimer"
        />
      </div>
    </div>
  );
};

export default ArtisanDetailsPage;
