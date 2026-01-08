import { H2, H3 } from '@/shared/components/ui/Typography';
import type { ClientFormData, ChantierFormData } from '@/shared/utils/validators';
import { useMaitresOeuvre, useModeles } from '../../hooks/useDossierData';

interface RecapStepProps {
  clientData: ClientFormData;
  chantierData: ChantierFormData;
  onEditStep: (step: number) => void;
}

export const RecapStep = ({ clientData, chantierData, onEditStep }: RecapStepProps) => {
  // utilisation des hooks pour recuperer les maitres d'oeuvre et les modeles
  const { data: maitresOeuvre = [] } = useMaitresOeuvre();
  const { data: modeles = [] } = useModeles();

  return (
    <div className="p-4 md:p-8 rounded-lg border border-border bg-bg-secondary">
      <H2 className="mb-6">Récapitulatif</H2>
      <div className="space-y-6">
        <div>
          <H3 className="mb-3" color="#3B82F6">
            Informations client
          </H3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p>
              <span className="font-medium">Nom:</span> {clientData.nomClient}
            </p>
            <p>
              <span className="font-medium">Prénom:</span>{' '}
              {clientData.prenomClient}
            </p>
            {clientData.adresseClient && (
              <p>
                <span className="font-medium">Adresse:</span>{' '}
                {clientData.adresseClient}
              </p>
            )}
            {clientData.cpClient && clientData.villeClient && (
              <p>
                <span className="font-medium">Ville:</span>{' '}
                {clientData.cpClient} {clientData.villeClient}
              </p>
            )}
          </div>
          <button
            onClick={() => onEditStep(1)}
            className="text-primary text-sm mt-2 hover:underline"
          >
            Modifier
          </button>
        </div>

        <div>
          <H3 className="mb-3" color="#3B82F6">
            Informations chantier
          </H3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            {chantierData.adresseChantier && (
              <p>
                <span className="font-medium">Adresse:</span>{' '}
                {chantierData.adresseChantier}
              </p>
            )}
            {chantierData.cpChantier && chantierData.villeChantier && (
              <p>
                <span className="font-medium">Ville:</span>{' '}
                {chantierData.cpChantier} {chantierData.villeChantier}
              </p>
            )}
            <p>
              <span className="font-medium">Date de création:</span>{' '}
              {new Date(chantierData.dateCreation).toLocaleDateString('fr-FR')}
            </p>
            <p>
              <span className="font-medium">Statut:</span>{' '}
              {chantierData.statutChantier}
            </p>
            {chantierData.noMOE && (
              <p>
                <span className="font-medium">Maître d'œuvre:</span>{' '}
                {
                  maitresOeuvre.find((moe) => String(moe.noMOE) == String(chantierData.noMOE))
                    ?.prenomMOE
                }{' '}
                {
                  maitresOeuvre.find((moe) => String(moe.noMOE) == String(chantierData.noMOE))
                    ?.nomMOE
                }
              </p>
            )}
            {chantierData.noModele && (
              <p>
                <span className="font-medium">Modèle:</span>{' '}
                {
                  modeles.find((m) => m.noModele === chantierData.noModele)
                    ?.nomModele
                }
              </p>
            )}
          </div>
          <button
            onClick={() => onEditStep(2)}
            className="text-primary text-sm mt-2 hover:underline"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};
