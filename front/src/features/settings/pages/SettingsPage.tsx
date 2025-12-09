import { useState, useEffect } from 'react';
import { H3, H2, Text, Label } from '@/shared/components/ui/Typography';
import { User, Bell, Shield, CogFour, Lock, Trash, Check, Map } from '@mynaui/icons-react';
import { useThemeContext } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DepartementAutocomplete } from '@/shared/components/ui/DepartementAutocomplete';
import SYSTEM from '@/shared/assets/SYSTEM.png'
import DARK from '@/shared/assets/DARK.png'
import LIGHT from '@/shared/assets/LIGHT.png'

type SettingSection = 'profil' | 'preferences' | 'notifications' | 'securite' | 'confidentialite' | 'zone' | 'danger';
type DateFormat = 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';

export const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<SettingSection>('profil');
  const { theme, setTheme } = useThemeContext();
  const { user } = useAuth();
  const [dateFormat, setDateFormat] = useState<DateFormat>(() => {
    const saved = localStorage.getItem('dateFormat');
    return (saved as DateFormat) || 'dd/MM/yyyy';
  });
  const [selectedDepartements, setSelectedDepartements] = useState<string[]>(() => {
    const saved = localStorage.getItem('preferredZones');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dateFormat', dateFormat);
  }, [dateFormat]);

  useEffect(() => {
    localStorage.setItem('preferredZones', JSON.stringify(selectedDepartements));
  }, [selectedDepartements]);

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

  const sections = [
    { id: 'profil' as const, label: 'Profil', icon: User },
    { id: 'preferences' as const, label: 'Préférences', icon: CogFour },
    ...(user?.roles.includes('ROLE_COMMERCIAL') ? [{ id: 'zone' as const, label: 'Zone géographique', icon: Map }] : []),
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'securite' as const, label: 'Sécurité', icon: Shield },
    { id: 'confidentialite' as const, label: 'Confidentialité', icon: Lock },
    { id: 'danger' as const, label: 'Zone dangereuse', icon: Trash },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profil':
        return (
          <div>
            <H2 className="mb-4">Mon profil</H2>
            <Text className="text-text-secondary">Section profil à compléter</Text>
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
                    className={`flex flex-col relative items-center gap-3 rounded-lg border-2 transition-all overflow-hidden ${
                      theme === 'light'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/20'
                    }`}
                  >
                    <img src={LIGHT} className={`box-border ${theme === 'light'&&'border-2 rounded-md border-bg-secondary'}`}/>
                    {theme === 'light'&&
                      <div className='p-2 bg-primary rounded-[100%] absolute bottom-2 right-2'>
                        <Check className='text-white'/>
                      </div>
                    }
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-3 relative rounded-lg border-2 transition-all overflow-hidden ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/20'
                    }`}
                  >
                    <img src={DARK} className={`box-border ${theme === 'dark'&&'border-2 rounded-md border-bg-secondary'}`}/>
                    {theme === 'dark'&&
                      <div className='p-2 bg-primary rounded-[100%] absolute bottom-2 right-2'>
                        <Check className='text-white'/>
                      </div>
                    }
                  </button>

                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-3 relative rounded-lg border-2 transition-all overflow-hidden ${
                      theme === 'system'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/20'
                    }`}
                  >
                    <img src={SYSTEM} className={`box-border ${theme === 'system'&&'border-2 rounded-md border-bg-secondary'}`}/>
                    {theme === 'system'&&
                      <div className='p-2 bg-primary rounded-[100%] absolute bottom-2 right-2'>
                        <Check className='text-white'/>
                      </div>
                    }
                  </button>
                </div>
                <Text className='mt-3' weight='semibold'>{theme}</Text>
                <Text variant="small" className="text-text-secondary mt-2">
                  Le thème système suit automatiquement les préférences de votre appareil
                </Text>
              </div>

              {/* Autres préférences à ajouter */}
              <div className="pt-6 border-t border-border">
                <Label className="mb-3 block">Format de date</Label>
                <div className="space-y-2">
                  {(['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'] as DateFormat[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => setDateFormat(format)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                        dateFormat === format
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
      case 'zone':
        return (
          <div>
            <H2 className="mb-6">Zone géographique préférée</H2>
            <Text className="text-text-secondary mb-6">
              Sélectionnez les départements dans lesquels vous souhaitez intervenir en priorité.
              Ces zones seront utilisées pour le filtrage et les suggestions de dossiers.
            </Text>
            
            <DepartementAutocomplete
              label="Départements préférés"
              selectedDepartements={selectedDepartements}
              onChange={(codes) => {
                setSelectedDepartements(codes);
                localStorage.setItem('preferredZones', JSON.stringify(codes));
              }}
              info="Recherchez et sélectionnez les départements où vous intervenez"
              placeholder="Rechercher un département..."
            />
            
            {selectedDepartements.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Text variant="small" className="text-yellow-800">
                  Aucune zone sélectionnée. Sélectionnez au moins un département pour optimiser votre travail.
                </Text>
              </div>
            )}
          </div>
        );
      case 'notifications':
        return (
          <div>
            <H2 className="mb-4 text-text-primary">Notifications</H2>
            <Text className="text-text-secondary">Section notifications à compléter</Text>
          </div>
        );
      case 'securite':
        return (
          <div>
            <H2 className="mb-4 text-text-primary">Sécurité</H2>
            <Text className="text-text-secondary">Section sécurité à compléter</Text>
          </div>
        );
      case 'confidentialite':
        return (
          <div>
            <H2 className="mb-4 text-text-primary">Confidentialité</H2>
            <Text className="text-text-secondary">Section confidentialité à compléter</Text>
          </div>
        );
      case 'danger':
        return (
          <div>
            <H2 className="mb-4 text-text-primary">Zone dangereuse</H2>
            <Text className="text-red">Actions irréversibles à compléter</Text>
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
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-border/60 text-text-primary'
                    : section.id === 'danger'
                    ? 'hover:bg-red-bg text-red border-transparent'
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
