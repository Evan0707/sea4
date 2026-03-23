
import { Text } from '@/shared/components/ui/Typography';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import type { ClientFormData, ChantierFormData } from '@/shared/utils/validators';
import { useMaitresOeuvre, useModeles } from '@/features/dossiers/hooks/useDossierData';
import { PencilSolid } from '@mynaui/icons-react';
import Button from '@/shared/components/ui/Button';
import Skeleton from '@/shared/components/ui/Skeleton';

interface RecapStepProps {
  clientData: ClientFormData;
  chantierData: ChantierFormData;
  onEditStep: (step: number) => void;
}

export const RecapStep = ({ clientData, chantierData, onEditStep }: RecapStepProps) => {
  const { data: maitresOeuvre = [], isLoading: loadingMoe } = useMaitresOeuvre();
  const { data: modeles = [], isLoading: loadingModeles } = useModeles();

  if (loadingMoe || loadingModeles) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Chargement du récapitulatif...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const DataField = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="flex flex-col p-3 rounded-lg bg-bg-secondary/40 border border-border/40">
      <Text variant="small" className="text-placeholder uppercase tracking-wider font-bold mb-1" style={{ fontSize: '10px' }}>
        {label}
      </Text>
      <Text className="font-medium truncate">{value || 'Non renseigné'}</Text>
    </div>
  );

  const selectedMOE = maitresOeuvre.find((moe) => String(moe.noMOE) === String(chantierData.noMOE));
  const selectedModele = modeles.find((m) => m.noModele === chantierData.noModele);

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Récapitulatif - Client</CardTitle>
          <Button variant="Secondary" size="sm" icon={PencilSolid} onClick={() => onEditStep(1)}>
            Modifier
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DataField label="Nom" value={clientData.nomClient} />
            <DataField label="Prénom" value={clientData.prenomClient} />
            <div className="md:col-span-2">
              <DataField
                label="Adresse de résidence"
                value={clientData.adresseClient ? `${clientData.adresseClient}, ${clientData.cpClient} ${clientData.villeClient}` : 'Non renseignée'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Récapitulatif - Projet</CardTitle>
          <Button variant="Secondary" size="sm" icon={PencilSolid} onClick={() => onEditStep(2)}>
            Modifier
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <DataField
                label="Adresse du chantier"
                value={chantierData.adresseChantier ? `${chantierData.adresseChantier}, ${chantierData.cpChantier} ${chantierData.villeChantier}` : 'Non renseignée'}
              />
            </div>
            <DataField label="Date de création" value={new Date(chantierData.dateCreation).toLocaleDateString('fr-FR')} />
            <DataField label="Statut" value={chantierData.statutChantier} />
            <DataField label="Maître d'œuvre" value={selectedMOE ? `${selectedMOE.prenomMOE} ${selectedMOE.nomMOE}` : 'Aucun'} />
            <DataField label="Modèle" value={selectedModele ? selectedModele.nomModele : 'Aucun'} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
