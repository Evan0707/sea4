import { useState, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from '@mynaui/icons-react';
import Button from '@/shared/components/ui/Button';
import { H3, Text } from '@/shared/components/ui/Typography';
import Input from '@/shared/components/ui/Input';

interface Etape {
 noEtapeChantier: number;
 nomEtape: string;
 coutSousTraitant?: string;
 artisan: {
  noArtisan: number;
  nom: string;
  prenom: string;
 } | null;
}

interface FactureArtisanCreationModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSubmit: (data: { montant: number; date: string; artisanId: number; etapeId: number; nbJoursTravail?: number }) => Promise<void>;
 etapes: Etape[];
 loading?: boolean;
}

export const FactureArtisanCreationModal = ({
 isOpen,
 onClose,
 onSubmit,
 etapes,
 loading = false
}: FactureArtisanCreationModalProps) => {
 const [montant, setMontant] = useState('');
 const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
 const [nbJoursTravail, setNbJoursTravail] = useState('');
 const [selectedEtapeId, setSelectedEtapeId] = useState<string>('');

 // Filtrer les etapes qui ont un artisan assigne
 const availableEtapes = useMemo(() => {
  return etapes.filter(e => e.artisan !== null);
 }, [etapes]);

 // Fonction pour soumettre le formulaire
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedEtapeId || !montant) return;

  const etape = availableEtapes.find(e => e.noEtapeChantier === parseInt(selectedEtapeId));
  if (!etape || !etape.artisan) return;

  await onSubmit({
   montant: parseFloat(montant),
   date,
   artisanId: etape.artisan.noArtisan,
   etapeId: etape.noEtapeChantier,
   nbJoursTravail: nbJoursTravail ? parseInt(nbJoursTravail) : undefined,
  });

  // Reset le formulaire
  setMontant('');
  setNbJoursTravail('');
  setSelectedEtapeId('');
 };

 return (
  <Dialog open={isOpen} onClose={onClose} className="relative z-50">
   <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

   <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
     <div className="flex justify-between items-center mb-6">
      <Dialog.Title as={H3}>Enregistrer une facture artisan</Dialog.Title>
      <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
       <X className="w-5 h-5 text-gray-500" />
      </button>
     </div>

     <form onSubmit={handleSubmit} className="space-y-4">
      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">
        Étape & Artisan concerné
       </label>
       <select
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        value={selectedEtapeId}
        onChange={(e) => {
         const newId = e.target.value;
         setSelectedEtapeId(newId);
         // Prefill montant from coutSousTraitant
         if (newId) {
          const etape = availableEtapes.find(et => et.noEtapeChantier === parseInt(newId));
          if (etape?.coutSousTraitant) {
           setMontant(etape.coutSousTraitant);
          }
         }
        }}
        required
       >
        <option value="">Sélectionner une étape</option>
        {availableEtapes.map((etape) => (
         <option key={etape.noEtapeChantier} value={etape.noEtapeChantier}>
          {etape.nomEtape} - {etape.artisan?.nom} {etape.artisan?.prenom}
         </option>
        ))}
       </select>
       {availableEtapes.length === 0 && (
        <Text className="text-xs text-orange-500 mt-1">
         Aucune étape avec un artisan assigné pour ce chantier.
        </Text>
       )}
      </div>

      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">
        Date de la facture
       </label>
       <Input
        name="date"
        type="date"
        value={date}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
        required
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">
        Montant facturé (€)
       </label>
       <Input
        name="montant"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={montant}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMontant(e.target.value)}
        required
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">
        Nombre réel de jours travaillés
       </label>
       <Input
        name="nbJoursTravail"
        type="number"
        min="1"
        placeholder="ex: 8"
        value={nbJoursTravail}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNbJoursTravail(e.target.value)}
        required
       />
      </div>

      <div className="flex justify-end gap-3 mt-6">
       <Button variant="Secondary" onClick={onClose} type="button">
        Annuler
       </Button>
       <Button
        variant="Primary"
        type="submit"
        loading={loading}
        disabled={!selectedEtapeId || !montant || !nbJoursTravail}
       >
        Enregistrer
       </Button>
      </div>
     </form>
    </Dialog.Panel>
   </div>
  </Dialog>
 );
};
