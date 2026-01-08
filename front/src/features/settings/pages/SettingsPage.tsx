import { useState, useEffect } from 'react';
import { H3, H2, Text, Label } from '@/shared/components/ui/Typography';
import { User, CogFour, Download, Check } from '@mynaui/icons-react';
import { useThemeContext } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/features/auth/context/AuthContext';

import { useToast } from '@/shared/hooks/useToast';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import axios from 'axios';
import SYSTEM from '@/shared/assets/SYSTEM.png'
import DARK from '@/shared/assets/DARK.png'
import LIGHT from '@/shared/assets/LIGHT.png'

type SettingSection = 'profil' | 'preferences' | 'export';
type DateFormat = 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';

export const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<SettingSection>('profil');
  const { theme, setTheme } = useThemeContext();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Profil state
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [profilLoading, setProfilLoading] = useState(false);
  const [profilSaving, setProfilSaving] = useState(false);

  // Export state
  const [exportLoading, setExportLoading] = useState(false);

  // Date format state
  const [dateFormat, setDateFormat] = useState<DateFormat>(() => {
    const saved = localStorage.getItem('dateFormat');
    return (saved as DateFormat) || 'dd/MM/yyyy';
  });



  useEffect(() => {
    localStorage.setItem('dateFormat', dateFormat);
  }, [dateFormat]);

  const formatExampleDate = (format: DateFormat) => {
    const date = new Date('2025-11-05');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
    }
  };

  // Charger les infos du profil
  useEffect(() => {
    const fetchProfil = async () => {
      setProfilLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/profil');
        setNom(response.data.nom || '');
        setPrenom(response.data.prenom || '');
      } catch (error) {
        console.error('Erreur chargement profil:', error);
      } finally {
        setProfilLoading(false);
      }
    };
    fetchProfil();
  }, []);

  const handleSaveProfil = async () => {
    setProfilSaving(true);
    try {
      await axios.put('http://localhost:8000/api/profil', { nom, prenom });
      addToast('Profil mis à jour', 'success');
    } catch (error) {
      addToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setProfilSaving(false);
    }
  };

  const handleExportChantiers = async () => {
    setExportLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/mes-chantiers/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chantiers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Export téléchargé', 'success');
    } catch (error) {
      addToast('Erreur lors de l\'export', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const sections = [
    { id: 'profil' as const, label: 'Profil', icon: User },
    { id: 'preferences' as const, label: 'Préférences', icon: CogFour },

    ...(user?.roles.includes('ROLE_MAITRE_OEUVRE') ? [{ id: 'export' as const, label: 'Export de données', icon: Download }] : []),
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profil':
        return (
          <div>
            <H2 className="mb-6">Mon profil</H2>
            {profilLoading ? (
              <Text className="text-placeholder">Chargement...</Text>
            ) : (
              <div className="space-y-4 max-w-md">
                <Input
                  label="Nom"
                  value={nom}
                  type='text'
                  name='nom'
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom"
                />
                <Input
                  label="Prénom"
                  value={prenom}
                  type='text'
                  name='prenom'
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Votre prénom"
                />
                <div className="pt-4">
                  <Button
                    variant="Primary"
                    onClick={handleSaveProfil}
                    loading={profilSaving}
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      case 'preferences':
        return (
          <div>
            <H2 className="mb-6">Préférences</H2>

            {/* Thème système */}
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Thème de l'interface</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col relative items-center gap-3 rounded-lg border-2 transition-all overflow-hidden ${theme === 'light'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/20'
                      }`}
                  >
                    <img src={LIGHT} className={`box-border ${theme === 'light' && 'border-2 rounded-md border-bg-secondary'}`} />
                    {theme === 'light' &&
                      <div className='p-2 bg-primary rounded-[100%] absolute bottom-2 right-2'>
                        <Check className='text-white' />
                      </div>
                    }
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-3 relative rounded-lg border-2 transition-all overflow-hidden ${theme === 'dark'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/20'
                      }`}
                  >
                    <img src={DARK} className={`box-border ${theme === 'dark' && 'border-2 rounded-md border-bg-secondary'}`} />
                    {theme === 'dark' &&
                      <div className='p-2 bg-primary rounded-[100%] absolute bottom-2 right-2'>
                        <Check className='text-white' />
                      </div>
                    }
                  </button>

                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-3 relative rounded-lg border-2 transition-all overflow-hidden ${theme === 'system'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/20'
                      }`}
                  >
                    <img src={SYSTEM} className={`box-border ${theme === 'system' && 'border-2 rounded-md border-bg-secondary'}`} />
                    {theme === 'system' &&
                      <div className='p-2 bg-primary rounded-[100%] absolute bottom-2 right-2'>
                        <Check className='text-white' />
                      </div>
                    }
                  </button>
                </div>
                <Text className='mt-3' weight='semibold'>{theme}</Text>
                <Text variant="small" className="text-text-secondary mt-2">
                  Le thème système suit automatiquement les préférences de votre appareil
                </Text>
              </div>

              {/* Format de date */}
              <div className="pt-6 border-t border-border">
                <Label className="mb-3 block">Format de date</Label>
                <div className="space-y-2">
                  {(['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'] as DateFormat[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => setDateFormat(format)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${dateFormat === format
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/20'
                        }`}
                    >
                      <div className="flex flex-col items-start">
                        <Text weight="medium">{format}</Text>
                        <Text variant="small" className="text-text-secondary">
                          Exemple: {formatExampleDate(format)}
                        </Text>
                      </div>
                      {dateFormat === format && (
                        <div className="p-1.5 bg-primary rounded-full">
                          <Check className="text-white" size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <Text variant="small" className="text-text-secondary mt-2">
                  Ce format sera utilisé pour l'affichage des dates dans toute l'application
                </Text>
              </div>
            </div>
          </div>
        );

      case 'export':
        return (
          <div>
            <H2 className="mb-6">Export de données</H2>
            <Text className="text-text-secondary mb-6">
              Téléchargez vos données au format CSV pour les analyser ou les archiver.
            </Text>

            <div className="space-y-4">
              <div className="p-4 bg-bg-primary rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <Text weight="semibold">Export des chantiers</Text>
                    <Text variant="small" className="text-placeholder mt-1">
                      Télécharge la liste de tous vos chantiers avec leur statut et montants
                    </Text>
                  </div>
                  <Button
                    variant="Secondary"
                    onClick={handleExportChantiers}
                    loading={exportLoading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar */}
      <div className="w-64 bg-bg-secondary border-r border-border py-4 px-3">
        <H3 className="mb-4" >Paramètres</H3>
        <nav className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive
                    ? 'bg-border/60 text-text-primary'
                    : 'hover:bg-border/35 text-text-secondary border-transparent'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <Text className={`font-medium ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {section.label}
                </Text>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto bg-bg-primary">
        <div className="max-w-4xl mx-auto bg-bg-secondary rounded-lg border border-border p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};
