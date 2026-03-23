import { useState, useMemo } from 'react';
import { useArtisan, useArtisanPlanning } from '../hooks/useArtisans';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageHeader } from '@/shared/context/LayoutContext';
import Button from '@/shared/components/ui/Button';
import { Pencil, ArrowLeft, Envelope, Telephone, Location, X, Calendar, Briefcase, DangerTriangle } from '@mynaui/icons-react';
import { H1, Text, H3 } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';
import apiClient from '@/shared/api/client';
import CalendarComponent, { type CalendarEvent } from '@/shared/components/ui/CalendarComponent';
import { useToast } from '@/shared/hooks/useToast';
import Input from '@/shared/components/ui/Input';
import { format, isWithinInterval, parseISO, isAfter, startOfToday } from 'date-fns';
import DateInput from '@/shared/components/ui/DateInput';
import CopyToClipboard from '@/shared/components/ui/CopyToClipboard';
import { Card } from '@/shared/components/ui/Card';
import ConfirmModal from '@/shared/components/ui/ConfirmModal';
import { Avatar } from '@/shared/components/ui/Avatar';



const ArtisanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: artisan, isLoading: loadingArtisan, isError: artisanError } = useArtisan(id);
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

  const fullName = artisan
    ? `${artisan.nomArtisan ?? ''}${artisan.prenomArtisan ? ' ' + artisan.prenomArtisan : ''}`.trim()
    : '';

  // Stats
  const today = startOfToday();
  const upcomingMissions = planning.assignments.filter((e: CalendarEvent) => isAfter(parseISO(e.end), today)).length;
  const upcomingUnavailabilities = planning.unavailability.filter((e: CalendarEvent) => isAfter(parseISO(e.end), today)).length;
  const qualificationsCount = artisan?.etapes?.length ?? 0;

  // Configuration des actions du header
  const headerActions = useMemo(() => (
    <div className="flex items-center gap-2">
      <Button variant="Secondary" onClick={() => navigate('/admin/artisans')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
    </div>
  ), [navigate]);

  // Update page header with artisan name once loaded
  usePageHeader(
    artisan ? fullName || 'Détails Artisan' : 'Détails Artisan',
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
      <div className="p-8 max-w-[1600px] mx-auto space-y-6">
        <Card variant="highlight" className="flex flex-col md:flex-row gap-6 items-start">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-bg-primary shrink-0" />
          <div className="flex-1 space-y-3 pt-1 w-full">
            <Skeleton className="h-8 w-64 rounded-[var(--radius-sm)]" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-20 rounded-[var(--radius-sm)]" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 mt-4">
              <div className="flex gap-2"><Skeleton className="h-8 w-8 rounded-lg shrink-0" /><Skeleton className="h-8 w-full" /></div>
              <div className="flex gap-2"><Skeleton className="h-8 w-8 rounded-lg shrink-0" /><Skeleton className="h-8 w-full" /></div>
              <div className="flex gap-2"><Skeleton className="h-8 w-8 rounded-lg shrink-0" /><Skeleton className="h-8 w-full" /></div>
            </div>
          </div>
          <Skeleton className="h-10 w-28 rounded-[var(--radius)] shrink-0" />
        </Card>
        <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex items-center gap-4 py-4">
              <Skeleton className="h-10 w-10 rounded-[var(--radius-lg)] shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            </Card>
          ))}
        </div>
        <Card className="h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-[500px] w-full" />
        </Card>
      </div>
    );
  }

  if (artisanError || (!loadingArtisan && !artisan)) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <div className="bg-red/5 border border-red/20 rounded-[var(--radius-lg)] p-6 text-center max-w-md">
          <Text className="text-lg font-bold text-red mb-2">Artisan introuvable</Text>
          <Text className="text-sm text-text-secondary mb-4">
            {artisanError ? 'Une erreur est survenue lors du chargement.' : "Cet artisan n'existe pas ou a été supprimé."}
          </Text>
          <Button variant="Secondary" icon={ArrowLeft} onClick={() => navigate('/admin/artisans')}>
            Retour aux artisans
          </Button>
        </div>
      </div>
    );
  }

  if (!artisan) return null;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6 relative">
      {/* Constraint Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-primary p-6 rounded-[var(--radius-lg)] w-full max-w-md border border-border animate-in zoom-in-95 duration-200 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <H3 className="text-lg font-bold">Ajouter une contrainte</H3>
              <Button variant="Ghost" size="icon" onClick={() => setModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-5">
              {/* Type selector */}
              <div className="flex bg-bg-secondary/50 p-1 rounded-[var(--radius-lg)] border border-border">
                <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-all text-sm font-medium ${constraintType === 'indisponibilite' ? 'bg-bg-tertiary text-primary shadow-sm ring-1 ring-border/5' : 'text-text-secondary hover:text-text-primary'}`}>
                  <input
                    type="radio"
                    name="type"
                    checked={constraintType === 'indisponibilite'}
                    onChange={() => setConstraintType('indisponibilite')}
                    className="hidden"
                  />
                  Indisponibilité
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-all text-sm font-medium ${constraintType === 'chantier_externe' ? 'bg-bg-tertiary text-primary shadow-sm ring-1 ring-border/5' : 'text-text-secondary hover:text-text-primary'}`}>
                  <input
                    type="radio"
                    name="type"
                    checked={constraintType === 'chantier_externe'}
                    onChange={() => setConstraintType('chantier_externe')}
                    className="hidden"
                  />
                  Chantier Externe
                </label>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <DateInput
                  name="startDate"
                  label="Début"
                  value={selectedStartDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setSelectedStartDate(newStart);
                    if (selectedEndDate && newStart > selectedEndDate) {
                      setSelectedEndDate(newStart);
                    }
                  }}
                  max={selectedEndDate}
                />
                <DateInput
                  name="endDate"
                  label="Fin"
                  value={selectedEndDate}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    setSelectedEndDate(newEnd);
                    if (selectedStartDate && newEnd < selectedStartDate) {
                      setSelectedStartDate(newEnd);
                    }
                  }}
                  min={selectedStartDate}
                />
              </div>

              {constraintType === 'indisponibilite' && (
                <Input
                  placeholder="Ex: Congés, Maladie..."
                  name="motif"
                  label="Motif (optionnel)"
                  type="text"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                />
              )}

              <div className="flex justify-end gap-3 pt-1">
                <Button variant="Secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button variant="Primary" onClick={handleSaveConstraint}>Enregistrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <Card variant="highlight" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-5">
            <Avatar
              size="xl"
              fallback={fullName}
              className="border-4 border-bg-primary ring-1 ring-border shrink-0"
            />
            <div className="flex flex-col gap-3 min-w-0">
              <div>
                <H1 className="font-bold text-text-primary leading-tight">
                  {fullName || 'Artisan'}
                </H1>
                {artisan.etapes && artisan.etapes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {artisan.etapes.map(e => (
                      <span key={e.noEtape} className="px-2 py-0.5 bg-bg-secondary border border-border rounded text-xs text-text-secondary whitespace-nowrap">
                        {e.nomEtape}
                      </span>
                    ))}
                  </div>
                ) : (
                  <Text className="text-xs text-text-secondary mt-1.5">Aucune qualification renseignée</Text>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2.5 mt-1">
                {/* Adresse */}
                {artisan.adresseArtisan ? (
                  <div className="flex items-center gap-2.5 text-text-secondary group hover:text-primary transition-colors">
                    <div className="p-1.5 bg-bg-secondary rounded-lg border border-border transition-colors shrink-0">
                      <Location className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Text className="truncate text-sm">{artisan.adresseArtisan}, {artisan.cpArtisan} {artisan.villeArtisan}</Text>
                      <CopyToClipboard text={`${artisan.adresseArtisan}, ${artisan.cpArtisan} ${artisan.villeArtisan}`} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-text-secondary/40">
                    <div className="p-1.5 bg-bg-secondary rounded-lg border border-border shrink-0">
                      <Location className="h-3.5 w-3.5" />
                    </div>
                    <Text className="text-sm italic">Adresse non renseignée</Text>
                  </div>
                )}

                {/* Téléphone */}
                {artisan.telArtisan ? (
                  <div className="flex items-center gap-2.5 text-text-secondary group hover:text-primary transition-colors">
                    <div className="p-1.5 bg-bg-secondary rounded-lg border border-border transition-colors shrink-0">
                      <Telephone className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Text className="text-sm">{artisan.telArtisan}</Text>
                      <CopyToClipboard text={artisan.telArtisan} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-text-secondary/40">
                    <div className="p-1.5 bg-bg-secondary rounded-lg border border-border shrink-0">
                      <Telephone className="h-3.5 w-3.5" />
                    </div>
                    <Text className="text-sm italic">Téléphone non renseigné</Text>
                  </div>
                )}

                {/* Email */}
                {artisan.emailArtisan ? (
                  <div className="flex items-center gap-2.5 text-text-secondary group hover:text-primary transition-colors">
                    <div className="p-1.5 bg-bg-secondary rounded-lg border border-border transition-colors shrink-0">
                      <Envelope className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Text className="text-sm truncate">{artisan.emailArtisan}</Text>
                      <CopyToClipboard text={artisan.emailArtisan} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-text-secondary/40">
                    <div className="p-1.5 bg-bg-secondary rounded-lg border border-border shrink-0">
                      <Envelope className="h-3.5 w-3.5" />
                    </div>
                    <Text className="text-sm italic">Email non renseigné</Text>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start shrink-0">
            <Button
              variant="Primary"
              onClick={() => navigate(`/admin/artisans/${id}/edit`)}
              icon={Pencil}
              size="sm"
            >
              Modifier
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats ribbon */}
      <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
        <Card className="flex items-center gap-4 py-4">
          <Briefcase className="h-6 w-6 text-text-primary" />
          <div>
            <Text className="text-2xl font-bold text-text-primary leading-none">{qualificationsCount}</Text>
            <Text className="text-xs text-text-secondary mt-0.5">Qualification{qualificationsCount !== 1 ? 's' : ''}</Text>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-4">
          <Calendar className="h-6 w-6 text-text-primary" />
          <div>
            <Text className="text-2xl font-bold text-text-primary leading-none">{upcomingMissions}</Text>
            <Text className="text-xs text-text-secondary mt-0.5">Mission{upcomingMissions !== 1 ? 's' : ''} à venir</Text>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-4">
          <DangerTriangle className={`h-6 w-6 text-text-primary`} />
          <div>
            <Text className={`text-2xl font-bold leading-none ${upcomingUnavailabilities > 0 ? 'text-red' : 'text-text-primary'}`}>{upcomingUnavailabilities}</Text>
            <Text className="text-xs text-text-secondary mt-0.5">Indisponibilité{upcomingUnavailabilities !== 1 ? 's' : ''} à venir</Text>
          </div>
        </Card>
      </div>

      {/* Planning Section */}
      <Card className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="flex items-center justify-between">
          <H3 className="font-semibold">Planning</H3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/10 border border-primary rounded-sm"></div>
              <span className="text-text-secondary">Chantiers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red/10 border border-red rounded-sm"></div>
              <span className="text-text-secondary">Indisponibilités</span>
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
      </Card>

      <ConfirmModal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={confirmDeleteEvent}
        title="Supprimer l'indisponibilité"
        message="Confirmer la suppression de cette indisponibilité ?"
        confirmText="Supprimer"
      />
    </div>
  );
};

export default ArtisanDetailsPage;
