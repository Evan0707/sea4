import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/useToast';
import { useAuth } from '@/features/auth/context/AuthContext';
import Button from '@/shared/components/ui/Button';
import { H1, Text } from '@/shared/components/ui/Typography';
import ConfirmPopover from '@/shared/components/ui/ConfirmPopover';
import { clientFormSchema, chantierFormSchema, type ClientFormData, type ChantierFormData } from '@/shared/utils/validators';
import apiClient from '@/shared/api/client';

import { ClientStep } from '../components/wizard/ClientStep';
import { ChantierStep } from '../components/wizard/ChantierStep';
import { RecapStep } from '../components/wizard/RecapStep';

const STORAGE_KEY = 'nouveau-dossier-draft';

export const NouveauDossierPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  useAuth();

  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).currentStep || 1 : 1;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les données sauvegardées
  const savedData = useMemo(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  // Form pour Client (étape 1)
  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: savedData?.clientData || {
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
    defaultValues: savedData?.chantierData || {
      adresseChantier: '',
      cpChantier: '',
      villeChantier: '',
      dateCreation: new Date().toISOString().split('T')[0],
      statutChantier: 'À compléter',
      noMOE: undefined,
      noModele: undefined,
      latitude: null,
      longitude: null,
    },
  });

  // Sauvegarder les données dans localStorage à chaque changement
  useEffect(() => {
    const subscription = clientForm.watch((data) => {
      const saved = localStorage.getItem(STORAGE_KEY);
      const current = saved ? JSON.parse(saved) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...current,
        clientData: data,
        currentStep,
      }));
    });
    return () => subscription.unsubscribe();
  }, [clientForm, currentStep]);

  useEffect(() => {
    const subscription = chantierForm.watch((data) => {
      const saved = localStorage.getItem(STORAGE_KEY);
      const current = saved ? JSON.parse(saved) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...current,
        chantierData: data,
        currentStep,
      }));
    });
    return () => subscription.unsubscribe();
  }, [chantierForm, currentStep]);

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

  // Gestion du retour
  const handlePrevious = () => {
    setCurrentStep((prev: number) => Math.max(prev - 1, 1));
  };

  // Gestion de la soumission
  const handleSubmit = async () => {
    const clientData = clientForm.getValues();
    const chantierData = chantierForm.getValues();

    setIsSubmitting(true);
    try {
      await apiClient.post(
        '/dossiers',
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
            latitude: chantierData.latitude || null,
            longitude: chantierData.longitude || null,
            dateCreation: chantierData.dateCreation,
          },
        }
      );

      addToast('Dossier créé avec succès', 'success');
      localStorage.removeItem(STORAGE_KEY); // Nettoyer le brouillon après succès
      navigate('/commercial/dossiers');
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de la création du dossier', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirm = () => {
    localStorage.removeItem(STORAGE_KEY);
    navigate('/commercial/dossiers');
  };

  return (
    <div className="p-4 md:p-10 pt-5 max-w-[1500px] w-full mx-auto">
      <H1 className="mb-8">Créer un nouveau dossier</H1>

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

      {/* Étapes */}
      {currentStep === 1 && <ClientStep form={clientForm} />}
      {currentStep === 2 && <ChantierStep form={chantierForm} />}
      {currentStep === 3 && (
        <RecapStep
          clientData={clientForm.watch()}
          chantierData={chantierForm.watch()}
          onEditStep={setCurrentStep}
        />
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
          <ConfirmPopover
            onConfirm={handleCancelConfirm}
            title="Annuler la création du dossier ?"
            message="Les données saisies seront perdues. Cette action est irréversible."
            confirmText="Oui, annuler"
            cancelText="Non, continuer"
          >
            <Button variant="Secondary" classname="px-8">
              Annuler
            </Button>
          </ConfirmPopover>
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