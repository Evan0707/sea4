import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/shared/hooks/useToast';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import DateInput from '@/shared/components/ui/DateInput';
import Select from '@/shared/components/ui/Select';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';
import { H1, H3, Text } from '@/shared/components/ui/Typography';
import ConfirmPopover from '@/shared/components/ui/ConfirmPopover';
import Skeleton from '@/shared/components/ui/Skeleton';
import { clientFormSchema, chantierFormSchema, type ClientFormData, type ChantierFormData } from '@/shared/utils/validators';
import apiClient from '@/shared/api/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';

import { useDossier } from '../hooks/useDossiers';
import { useMaitresOeuvre, useModeles, useEtapes as useModelesEtapes } from '../hooks/useDossierData';

export const EditDossierPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { id } = useParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModeleId, setSelectedModeleId] = useState<number | null>(null);

  // Hooks
  const { data: maitresOeuvre = [], isLoading: loadingMOE } = useMaitresOeuvre();
  const { data: modeles = [], isLoading: loadingModeles } = useModeles();
  const { data: dossier, isLoading: loadingDossier } = useDossier(id);
  const { data: etapesModele = [], isLoading: loadingEtapes } = useModelesEtapes(selectedModeleId);

  const loading = loadingMOE || loadingModeles || loadingDossier;

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
      dateCreation: new Date().toISOString().split('T')[0],
      statutChantier: 'À compléter',
      noMOE: undefined,
      noModele: undefined,
    },
  });

  // Populate forms when dossier loads
  useEffect(() => {
    if (dossier) {
      clientForm.reset({
        nomClient: dossier.client.nomClient || '',
        prenomClient: dossier.client.prenomClient || '',
        adresseClient: dossier.client.adresseClient || '',
        cpClient: dossier.client.cpClient || '',
        villeClient: dossier.client.villeClient || '',
      });

      chantierForm.reset({
        adresseChantier: dossier.chantier.adresseChantier || '',
        cpChantier: dossier.chantier.cpChantier || '',
        villeChantier: dossier.chantier.villeChantier || '',
        dateCreation: dossier.chantier.dateCreation || new Date().toISOString().split('T')[0],
        statutChantier: dossier.chantier.statutChantier || 'À compléter',
        noMOE: dossier.chantier.noMOE ?? undefined,
        noModele: dossier.chantier.noModele ?? undefined,
      });

      if (dossier.chantier.noModele) {
        setSelectedModeleId(dossier.chantier.noModele);
      }
    }
  }, [dossier, clientForm, chantierForm]);

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
    setCurrentStep((prev: number) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const clientData = clientForm.getValues();
    const chantierData = chantierForm.getValues();
    setIsSubmitting(true);
    try {
      await apiClient.put(
        `/dossiers/${id}`,
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
            dateCreation: chantierData.dateCreation,
          },
        }
      );
      addToast('Dossier modifié avec succès', 'success');
      navigate('/commercial/dossiers');
    } catch {
      addToast('Erreur lors de la modification du dossier', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirm = () => {
    navigate('/commercial/dossiers');
  };

  const clientData = clientForm.watch();
  const chantierData = chantierForm.watch();

  if (loading) {
    return (
      <div className="p-4 md:p-10 pt-5 max-w-[1500px] w-full mx-auto">
        <H1 className="mb-8">Modifier le dossier</H1>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 pt-5 max-w-[1500px] w-full mx-auto">
      <H1 className="mb-8">Modifier le dossier</H1>
      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className="flex-1 h-1 rounded-full mx-1 bg-primary/20 overflow-hidden"
            >
              <div
                className={`h-full bg-primary transition-all duration-500 ease-out ${step < currentStep
                  ? 'w-full'
                  : step === currentStep
                    ? 'w-full animate-in slide-in-from-left'
                    : 'w-0'
                  }`}
              />
            </div>
          ))}
        </div>
        <Text variant="small" align="center" className="text-placeholder">
          Étape {currentStep}/3
        </Text>
      </div>
      {/* Étape 1: Informations client */}
      {currentStep === 1 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Informations client</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                info
                message="Commencez à taper l'adresse pour voir les suggestions"
                placeholder="123 rue de la Paix"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>
      )}
      {/* Étape 2: Informations chantier */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Informations chantier</CardTitle>
          </CardHeader>
          <CardContent>
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
                info
                message="Commencez à taper l'adresse du chantier"
                placeholder="456 avenue du Bâtiment"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                register={chantierForm.register('dateCreation')}
                error={chantierForm.formState.errors.dateCreation?.message}
                info={true}
                message="Date de début du chantier"
                min={new Date().toISOString().split('T')[0]}
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
                  }}
                  error={chantierForm.formState.errors.noModele?.message}
                />
              </div>
              {/* Affichage des étapes si un modèle est sélectionné */}
              {selectedModeleId && (
                <div className="mt-6">
                  <H3 className="mb-3">
                    Étapes du modèle
                  </H3>
                  <div className="space-y-2">
                    {loadingEtapes ? (
                      <>
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                      </>
                    ) : etapesModele.length > 0 ? (
                      etapesModele.map((etape, i) => (
                        <div
                          key={etape.noEtape}
                          className="p-3 bg-bg-primary text-text-primary rounded-lg"
                        >
                          <p className="font-medium">{i + 1} - {etape.nomEtape}</p>
                        </div>
                      ))
                    ) : (
                      <Text className="text-text-secondary text-sm">Aucune étape trouvée pour ce modèle</Text>
                    )}
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}
      {/* Étape 3: Récapitulatif */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <H3 className="mb-3" color="#3B82F6">
                  Informations client
                </H3>
                <div className="bg-bg-secondary p-4 rounded-[var(--radius-lg)] space-y-2">
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
                <Button variant="Link" onClick={() => setCurrentStep(1)}>
                  Modifier
                </Button>
              </div>
              <div>
                <H3 className="mb-3" color="#3B82F6">
                  Informations chantier
                </H3>
                <div className="bg-bg-secondary p-4 rounded-[var(--radius-lg)] space-y-2">
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
                        maitresOeuvre.find((moe) => moe.noMOE === chantierData.noMOE)
                          ?.prenomMOE
                      }{' '}
                      {
                        maitresOeuvre.find((moe) => moe.noMOE === chantierData.noMOE)
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
                <Button variant="Link" onClick={() => setCurrentStep(2)}>
                  Modifier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        <div>
          {currentStep > 1 && (
            <Button variant="Secondary" onClick={handlePrevious} className="px-8">
              Précédent
            </Button>
          )}
        </div>
        <div className="flex gap-4">
          <ConfirmPopover
            onConfirm={handleCancelConfirm}
            title="Annuler la modification du dossier ?"
            message="Les modifications seront perdues. Cette action est irréversible."
            confirmText="Oui, annuler"
            cancelText="Non, continuer"
          >
            <Button variant="Secondary" className="px-8">
              Annuler
            </Button>
          </ConfirmPopover>
          {currentStep < 3 ? (
            <Button variant="Primary" onClick={handleNext} className="px-8">
              Suivant
            </Button>
          ) : (
            <Button
              variant="Primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              className="px-8"
            >
              Enregistrer les modifications
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
