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
  const { data: maitresOeuvre = [], isLoading: loadingMoe, isError: errorMoe } = useMaitresOeuvre();
  const { data: modeles = [], isLoading: loadingModeles, isError: errorModeles } = useModeles();

  if (loadingMoe || loadingModeles) {
    return (
      <div className="p-4 md:p-8 rounded-lg border border-border bg-bg-secondary animate-pulse h-64 flex flex-col justify-center items-center">
        <div className="text-placeholder">Chargement du récapitulatif...</div>
      </div>
    );
  }

  if (errorMoe || errorModeles) {
    return (
      <div className="p-4 md:p-8 rounded-lg border border-red-200 bg-red-50 text-red-600">
        <H2 className="mb-2 text-red-600">Erreur</H2>
        <p>Impossible de charger les données nécessaires au récapitulatif. Veuillez réessayer.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 rounded-lg border border-border bg-bg-secondary">
      <H2 className="mb-6">Récapitulatif</H2>
      <div className="space-y-6">
        <div>
          <H3 className="mb-3" color="#3B82F6">
            Informations client
          </H3>
          <div className="bg-bg-primary p-4 rounded-lg space-y-2">
            <p>
              <span className="font-bold text-text-primary">Nom:</span>
                <span className=" text-text-primary"> {clientData.nomClient}</span>
            </p>
            <p>
              <span className="font-bold text-text-primary">Prénom:</span>{' '}
                <span className=" text-text-primary"> {clientData.prenomClient}</span>
            </p>
            {clientData.adresseClient && (
              <p>
                <span className="font-bold text-text-primary">Adresse:</span>{' '}
                  <span className=" text-text-primary"> {clientData.adresseClient}</span>
              </p>
            )}
            {clientData.cpClient && clientData.villeClient && (
              <p>
                <span className="font-bold text-text-primary">Ville:</span>{' '}
                  <span className=" text-text-primary"> {clientData.cpClient} {clientData.villeClient}</span>
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
          <div className="bg-bg-primary p-4 rounded-lg space-y-2">
            {chantierData.adresseChantier && (
                <p>
                    <span className="font-bold text-text-primary">Adresse:</span>{' '}
                    <span className=" text-text-primary"> {clientData.adresseClient}</span>
                </p>
            )}
            {chantierData.cpChantier && chantierData.villeChantier && (
                <p>
                    <span className="font-bold text-text-primary">Ville:</span>{' '}
                    <span className=" text-text-primary"> {clientData.cpClient} {clientData.villeClient}</span>
                </p>
            )}
            <p>
              <span className="font-bold text-text-primary">Date de création:</span>{' '}
                <span className=" text-text-primary"> {new Date(chantierData.dateCreation).toLocaleDateString('fr-FR')}</span>
            </p>
            <p>
              <span className="font-bold text-text-primary">Statut:</span>{' '}
                <span className=" text-text-primary">{chantierData.statutChantier}</span>
            </p>
            {chantierData.noMOE && (
              <p>
                <span className="font-bold text-text-primary">Maître d'œuvre:</span>{' '}
                  <span className=" text-text-primary">
                {
                  maitresOeuvre.find((moe) => String(moe.noMOE) == String(chantierData.noMOE))
                    ?.prenomMOE
                }{' '}
                {
                  maitresOeuvre.find((moe) => String(moe.noMOE) == String(chantierData.noMOE))
                    ?.nomMOE
                }
                </span>
              </p>
            )}
            {chantierData.noModele && (
              <p>
                <span className="font-bold text-text-primary">Modèle:</span>{' '}
                  <span className="text-text-primary">
                {
                  modeles.find((m) => m.noModele === chantierData.noModele)
                    ?.nomModele
                }
                </span>
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
