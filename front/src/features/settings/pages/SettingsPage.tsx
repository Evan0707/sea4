import { useState } from 'react';
import { H3, H2, Text, Label } from '@/shared/components/ui/Typography';
import { User, Bell, Shield, CogFour, Lock, Trash, Check } from '@mynaui/icons-react';
import { useThemeContext } from '@/shared/context/ThemeProvider';
import SYSTEM from '@/shared/assets/SYSTEM.png'
import DARK from '@/shared/assets/DARK.png'
import LIGHT from '@/shared/assets/LIGHT.png'

type SettingSection = 'profil' | 'preferences' | 'notifications' | 'securite' | 'confidentialite' | 'danger';

export const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<SettingSection>('profil');
  const { theme, setTheme } = useThemeContext();

  const sections = [
    { id: 'profil' as const, label: 'Profil', icon: User },
    { id: 'preferences' as const, label: 'Préférences', icon: CogFour },
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
                    <img src={LIGHT} className={`box-border ${theme === 'light'&&'border-[2px] rounded-md border-bg-secondary'}`}/>
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
                    <img src={DARK} className={`box-border ${theme === 'dark'&&'border-[2px] rounded-md border-bg-secondary'}`}/>
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
                    <img src={SYSTEM} className={`box-border ${theme === 'system'&&'border-[2px] rounded-md border-bg-secondary'}`}/>
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
                <Text className="text-text-secondary">Autres préférences à compléter</Text>
              </div>
            </div>
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
      <div className="w-64 bg-bg-secondary border-r border-border p-6">
        <H3 className="mb-8" >Paramètres</H3>
        <nav className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border-1 ${
                  isActive
                    ? 'bg-primary/10 border-primary text-text-primary'
                    : section.id === 'danger'
                    ? 'hover:bg-red-bg text-red border-transparent'
                    : 'hover:bg-primary/5 text-text-secondary border-transparent'
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
