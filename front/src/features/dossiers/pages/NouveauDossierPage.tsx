import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/useToast';
import { useAuth } from '@/features/auth/context/AuthContext';
import Button from '@/shared/components/ui/Button';
import { H1, Text } from '@/shared/components/ui/Typography';
import { cn } from '@/shared/lib/utils';
import ConfirmPopover from '@/shared/components/ui/ConfirmPopover';
import { clientFormSchema, chantierFormSchema, type ClientFormData, type ChantierFormData } from '@/shared/utils/validators';
import apiClient from '@/shared/api/client';

import { ClientStep } from '../components/wizard/ClientStep';
import { ChantierStep } from '../components/wizard/ChantierStep';
import { RecapStep } from '../components/wizard/RecapStep';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle } from '@mynaui/icons-react';

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

  const steps = [
    { id: 1, label: 'Client' },
    { id: 2, label: 'Projet' },
    { id: 3, label: 'Récapitulatif' },
  ];

  return (
    <div className="p-6 pt-8 max-w-4xl w-full mx-auto">
      <div className="mb-6">
        <H1 className="mb-2">Nouveau dossier</H1>
        <Text className="text-placeholder">Complétez les informations pour créer un nouveau dossier.</Text>
      </div>

      {/* Segmented Stepper */}
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="flex justify-between mb-3 px-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "text-[13px] font-bold transition-all duration-300",
                currentStep === step.id ? "text-primary tracking-wide" : "text-placeholder/60"
              )}
            >
              <span className="mr-1.5 opacity-50 tabular-nums">{step.id}.</span>
              {step.label}
            </div>
          ))}
        </div>
        <div className="flex gap-2 h-1.5 px-0.5">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex-1 relative rounded-full overflow-hidden bg-bg-secondary"
            >
              <motion.div
                initial={false}
                animate={{
                  width: currentStep >= step.id ? "100%" : "0%",
                  opacity: currentStep === step.id ? 1 : currentStep > step.id ? 0.7 : 0
                }}
                className={cn(
                  "h-full transition-all duration-500",
                  currentStep === step.id ? "bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]" : "bg-primary/60"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Étapes avec Animation */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {currentStep === 1 && <ClientStep form={clientForm} />}
            {currentStep === 2 && <ChantierStep form={chantierForm} />}
            {currentStep === 3 && (
              <RecapStep
                clientData={clientForm.watch()}
                chantierData={chantierForm.watch()}
                onEditStep={setCurrentStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-border/60">
        <div>
          {currentStep > 1 ? (
            <Button
              variant="Secondary"
              onClick={handlePrevious}
              size='md'
              icon={ChevronLeft}
            >
              Précédent
            </Button>
          ) : (
            <ConfirmPopover
              onConfirm={handleCancelConfirm}
              title="Annuler ?"
              message="Vos données seront perdues."
              confirmText="Oui, annuler"
              cancelText="Non"
            >
              <Button variant="Secondary" size='md'>
                Annuler
              </Button>
            </ConfirmPopover>
          )}
        </div>

        <div className="flex gap-4">
          {currentStep === 3 && (
            <ConfirmPopover
              onConfirm={handleCancelConfirm}
              title="Annuler ?"
              message="Vos données seront perdues."
              confirmText="Oui, annuler"
              cancelText="Non"
            >
              <Button variant="Secondary" size='md' className="md:hidden">
                Annuler
              </Button>
            </ConfirmPopover>
          )}

          {currentStep < 3 ? (
            <Button
              variant="Primary"
              onClick={handleNext}
              size='md'
              iconRight={ChevronRight}
            >
              Continuer
            </Button>
          ) : (
            <Button
              variant="Primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              size='md'
              iconRight={CheckCircle}
            >
              Créer le dossier
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};