import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import Button from '@/shared/components/ui/Button';
import { H2, Text } from '@/shared/components/ui/Typography';
import { Card } from '@/shared/components/ui/Card';

interface DevisCreationModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSubmit: (data: { remarques: string }) => Promise<void>;
 loading?: boolean;
}

export const DevisCreationModal = ({ isOpen, onClose, onSubmit, loading = false }: DevisCreationModalProps) => {
 const [remarques, setRemarques] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await onSubmit({ remarques });
  // Reset form on success
  setRemarques('');
 };

 return (
  <Dialog open={isOpen} onClose={onClose} className="relative z-50">
   <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

   <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="w-full max-w-md">
     <Card className="w-full">
      <H2 className="mb-4">Créer un nouveau devis</H2>
      <Text className="text-sm text-placeholder mb-4">
       Le montant sera calculé automatiquement basé sur le total des étapes du chantier.
      </Text>

      <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
         Remarques (Optionnel)
        </label>
        <textarea
         value={remarques}
         onChange={(e) => setRemarques(e.target.value)}
         className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
         placeholder="Détails, conditions particulières..."
        />
       </div>

       <div className="flex justify-end gap-3 mt-6">
        <Button variant="Secondary" onClick={onClose} type="button">
         Annuler
        </Button>
        <Button variant="Primary" type="submit" loading={loading}>
         Créer le devis
        </Button>
       </div>
      </form>
     </Card>
    </Dialog.Panel>
   </div>
  </Dialog>
 );
};
