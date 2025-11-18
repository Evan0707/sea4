import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/useToast';
import { useAuth } from '@/features/auth/context/AuthContext';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import DateInput from '@/shared/components/ui/DateInput';
import Select from '@/shared/components/ui/Select';
import Checkbox from '@/shared/components/ui/Checkbox';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';
import { H1, H2, H3, Text } from '@/shared/components/ui/Typography';
import { clientFormSchema, chantierFormSchema, type ClientFormData, type ChantierFormData } from '@/shared/utils/validators';
import type { MaitreOeuvre, Modele, EtapeModele } from '@/shared/types/dossier';
import axios from 'axios';

export const NouveauDossierPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Données des listes déroulantes
  const [maitresOeuvre, setMaitresOeuvre] = useState<MaitreOeuvre[]>([]);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [etapesModele, setEtapesModele] = useState<EtapeModele[]>([]);
  const [selectedModeleId, setSelectedModeleId] = useState<number | null>(null);
  const [etapesReservees, setEtapesReservees] = useState<Set<number>>(new Set());

  // Form pour Client (étape 1)
  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      nomClient: '',
      prenomClient: '',
      adresseClient: '',
      cpClient: '',
      villeClient: '',
    },
  });

  // Form pour Chantier (étape 2)
  const chantierForm = useForm<ChantierFormData>({
    resolver: zodResolver(chantierFormSchema),
    defaultValues: {
      adresseChantier: '',
      cpChantier: '',
      villeChantier: '',
      dateCreation: new Date(),
      statutChantier: 'À compléter',
      noMOE: undefined,
      noModele: undefined,
    },
  });

  // Charger les MOE et Modèles au montage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moeResponse, modelesResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/maitres-oeuvre'),
          axios.get('http://localhost:8000/api/modeles'),
        ]);
        setMaitresOeuvre(moeResponse.data);
        setModeles(modelesResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        addToast('Erreur lors du chargement des données', 'error');
      }
    };
    fetchData();
  }, [addToast]);

  // Charger les étapes quand un modèle est sélectionné
  useEffect(() => {
    if (selectedModeleId) {
      const fetchEtapes = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/modeles/${selectedModeleId}/etapes`);
          setEtapesModele(response.data);
        } catch (error) {
          console.error('Erreur lors du chargement des étapes:', error);
          addToast('Erreur lors du chargement des étapes', 'error');
        }
      };
      fetchEtapes();
    } else {
      setEtapesModele([]);
    }
  }, [selectedModeleId, addToast]);

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await clientForm.trigger();
      if (isValid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const isValid = await chantierForm.trigger();
      if (isValid) {
        setCurrentStep(3);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const clientData = clientForm.getValues();
    const chantierData = chantierForm.getValues();

    setIsSubmitting(true);
    try {
      await axios.post(
        'http://localhost:8000/api/dossiers',
        {
          client: {
            ...clientData,
            cpClient: clientData.cpClient || null,
            adresseClient: clientData.adresseClient || null,
            villeClient: clientData.villeClient || null,
          },
          chantier: {
            ...chantierData,
            cpChantier: chantierData.cpChantier || null,
            adresseChantier: chantierData.adresseChantier || null,
            villeChantier: chantierData.villeChantier || null,
            dateCreation: chantierData.dateCreation.toISOString().split('T')[0],
            etapesReservees: Array.from(etapesReservees),
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      addToast('Dossier créé avec succès', 'success');
      navigate('/commercial/dossiers');
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de la création du dossier', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEtapeReservation = (noEtape: number) => {
    setEtapesReservees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noEtape)) {
        newSet.delete(noEtape);
      } else {
        newSet.add(noEtape);
      }
      return newSet;
    });
  };

  const clientData = clientForm.watch();
  const chantierData = chantierForm.watch();

  return (
    <div className="p-10 max-w-[1500px] mx-auto">
      <H1 className="mb-8">Créer un nouveau dossier</H1>

      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-1 rounded-full mx-1 transition-colors transition-300 ${
                step <= currentStep ? 'bg-primary' : 'bg-primary/20'
              }`}
            />
          ))}
        </div>
        <Text variant="small" align="center" className="text-placeholder">
          Étape {currentStep}/3
        </Text>
      </div>

      {/* Étape 1: Informations client */}
      {currentStep === 1 && (
        <div className="bg-white p-8 rounded-xl shadow w-full">
          <H2 className="mb-6">Informations client</H2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nom *"
                type="text"
                name="nomClient"
                register={clientForm.register('nomClient')}
                error={clientForm.formState.errors.nomClient?.message}
                placeholder="Dupont"
                info={true}
                message="Nom de famille du client (obligatoire)"
              />
              <Input
                label="Prénom *"
                type="text"
                name="prenomClient"
                register={clientForm.register('prenomClient')}
                error={clientForm.formState.errors.prenomClient?.message}
                placeholder="Jean"
                info={true}
                message="Prénom du client (obligatoire)"
              />
            </div>
            <AddressAutocomplete
              label="Adresse"
              value={clientForm.watch('adresseClient') || ''}
              onChange={(value) => clientForm.setValue('adresseClient', value)}
              onAddressSelect={(address) => {
                clientForm.setValue('adresseClient', address.label);
                clientForm.setValue('cpClient', address.postcode);
                clientForm.setValue('villeClient', address.city);
              }}
              error={clientForm.formState.errors.adresseClient?.message}
              info="Commencez à taper l'adresse pour voir les suggestions"
              placeholder="123 rue de la Paix"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Code postal"
                type="text"
                name="cpClient"
                register={clientForm.register('cpClient')}
                error={clientForm.formState.errors.cpClient?.message}
                placeholder="75000"
                info={true}
                message="Code postal à 5 chiffres"
              />
              <Input
                label="Ville"
                type="text"
                name="villeClient"
                register={clientForm.register('villeClient')}
                error={clientForm.formState.errors.villeClient?.message}
                placeholder="Paris"
              />
            </div>
          </form>
        </div>
      )}

      {/* Étape 2: Informations chantier */}
      {currentStep === 2 && (
        <div className="bg-white p-8 rounded-lg shadow">
          <H2 className="mb-6">Informations chantier</H2>
          <form className="space-y-4">
            <AddressAutocomplete
              label="Adresse du chantier"
              value={chantierForm.watch('adresseChantier') || ''}
              onChange={(value) => chantierForm.setValue('adresseChantier', value)}
              onAddressSelect={(address) => {
                chantierForm.setValue('adresseChantier', address.label);
                chantierForm.setValue('cpChantier', address.postcode);
                chantierForm.setValue('villeChantier', address.city);
              }}
              error={chantierForm.formState.errors.adresseChantier?.message}
              info="Commencez à taper l'adresse du chantier"
              placeholder="456 avenue du Bâtiment"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Code postal"
                type="text"
                name="cpChantier"
                register={chantierForm.register('cpChantier')}
                error={chantierForm.formState.errors.cpChantier?.message}
                placeholder="75000"
                info={true}
                message="Code postal du chantier (5 chiffres)"
              />
              <Input
                label="Ville"
                type="text"
                name="villeChantier"
                register={chantierForm.register('villeChantier')}
                error={chantierForm.formState.errors.villeChantier?.message}
                placeholder="Paris"
              />
            </div>
            <DateInput
              label="Date de création"
              name="dateCreation"
              register={chantierForm.register('dateCreation', {
                setValueAs: (v) => (v ? new Date(v) : new Date()),
              })}
              error={chantierForm.formState.errors.dateCreation?.message}
              info={true}
              message="Date de début du chantier"
            />
            <div>
              <Select
                label="Maître d'œuvre"
                name="noMOE"
                options={[
                  { value: '', label: 'Aucun' },
                  ...maitresOeuvre.map((moe) => ({
                    value: String(moe.noMOE),
                    label: `${moe.prenomMOE} ${moe.nomMOE}`,
                  })),
                ]}
                register={chantierForm.register('noMOE', {
                  setValueAs: (v) => (v ? parseInt(v) : undefined),
                })}
                error={chantierForm.formState.errors.noMOE?.message}
              />
            </div>
            <div>
              <Select
                label="Modèle"
                name="noModele"
                options={[
                  { value: '', label: 'Aucun' },
                  ...modeles.map((modele) => ({
                    value: String(modele.noModele),
                    label: modele.nomModele,
                  })),
                ]}
                register={chantierForm.register('noModele', {
                  setValueAs: (v) => (v ? parseInt(v) : undefined),
                })}
                onChange={(value) => {
                  const numValue = value ? parseInt(value) : null;
                  setSelectedModeleId(numValue);
                  if (numValue !== null) {
                    chantierForm.setValue('noModele', numValue);
                  }
                  setEtapesReservees(new Set());
                }}
                error={chantierForm.formState.errors.noModele?.message}
              />
            </div>

            {/* Affichage des étapes si un modèle est sélectionné */}
            {selectedModeleId && etapesModele.length > 0 && (
              <div className="mt-6">
                <H3 className="mb-3">
                  Étapes du modèle
                </H3>
                <div className="space-y-2">
                  {etapesModele.map((etape) => (
                    <div
                      key={etape.noEtape}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{etape.nomEtape}</p>
                      </div>
                      {etape.reservable && (
                        <Checkbox
                          name={`etape-${etape.noEtape}`}
                          label="Réserver"
                          checked={etapesReservees.has(etape.noEtape)}
                          onChange={() => toggleEtapeReservation(etape.noEtape)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Étape 3: Récapitulatif */}
      {currentStep === 3 && (
        <div className="bg-white p-8 rounded-lg shadow">
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
                onClick={() => setCurrentStep(1)}
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
                  {chantierData.dateCreation.toLocaleDateString('fr-FR')}
                </p>
                <p>
                  <span className="font-medium">Statut:</span>{' '}
                  {chantierData.statutChantier}
                </p>
                {chantierData.noMOE && (
                  <p>
                    <span className="font-medium">Maître d'œuvre:</span>{' '}
                    {
                      maitresOeuvre.find((moe) => String(moe.noMOE) === chantierData.noMOE)
                        ?.prenomMOE
                    }{' '}
                    {
                      maitresOeuvre.find((moe) => String(moe.noMOE) === chantierData.noMOE)
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
                {etapesReservees.size > 0 && (
                  <div>
                    <span className="font-medium">Étapes réservées:</span>
                    <ul className="list-disc list-inside ml-4">
                      {Array.from(etapesReservees).map((noEtape) => (
                        <li key={noEtape}>
                          {
                            etapesModele.find((e) => e.noEtape === noEtape)
                              ?.nomEtape
                          }
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-primary text-sm mt-2 hover:underline"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        <div>
          {currentStep > 1 && (
            <Button variant="Secondary" onClick={handlePrevious} classname="px-8">
              Précédent
            </Button>
          )}
        </div>
        <div className="flex gap-4">
          <Button
            variant="Secondary"
            onClick={() => navigate('/commercial/dossiers')}
            classname="px-8"
          >
            Annuler
          </Button>
          {currentStep < 3 ? (
            <Button variant="Primary" onClick={handleNext} classname="px-8">
              Suivant
            </Button>
          ) : (
            <Button
              variant="Primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              classname="px-8"
            >
              Créer le dossier
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};