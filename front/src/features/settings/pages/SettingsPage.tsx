import { useState, useEffect } from 'react';
import { H2, Text, Label } from '@/shared/components/ui/Typography';
import { useThemeContext } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/shared/hooks/useToast';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import { Switch } from '@/shared/components/ui/Switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/ui/Card';
import apiClient from '@/shared/api/client';
import Skeleton from '@/shared/components/ui/Skeleton';
import { Check, TriangleSolid } from '@mynaui/icons-react';
import SYSTEM from '@/shared/assets/SYSTEM.png';
import DARK from '@/shared/assets/DARK.png';
import LIGHT from '@/shared/assets/LIGHT.png';

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

  // Preference state
  const [dateFormat, setDateFormat] = useState<DateFormat>(() => {
    const saved = localStorage.getItem('dateFormat');
    return (saved as DateFormat) || 'dd/MM/yyyy';
  });
  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem('compactMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('dateFormat', dateFormat);
  }, [dateFormat]);

  useEffect(() => {
    localStorage.setItem('compactMode', String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    const fetchProfil = async () => {
      setProfilLoading(true);
      try {
        const response = await apiClient.get('/profil');
        setNom(response.data.nom || '');
        setPrenom(response.data.prenom || '');
      } catch {
        addToast('Impossible de charger le profil', 'error');
      } finally {
        setProfilLoading(false);
      }
    };
    fetchProfil();
  }, [addToast]);

  const handleSaveProfil = async () => {
    setProfilSaving(true);
    try {
      await apiClient.put('/profil', { nom, prenom });
      addToast('Profil mis à jour avec succès', 'success');
    } catch {
      addToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setProfilSaving(false);
    }
  };

  const handleExportChantiers = async () => {
    setExportLoading(true);
    try {
      const response = await apiClient.get('/mes-chantiers/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chantiers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Export téléchargé avec succès', 'success');
    } catch {
      addToast('Erreur lors de l\'export', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const roleLabels: Record<string, string> = {
    ROLE_ADMIN: 'Administrateur',
    ROLE_MAITRE_OEUVRE: "Maître d'œuvre",
    ROLE_COMMERCIAL: 'Commercial',
    ROLE_ARTISAN: 'Artisan',
  };

  const getRoleLabel = () => {
    const role = user?.roles.find(r => r !== 'ROLE_USER');
    return role ? roleLabels[role] || role : 'Utilisateur';
  };

  const sections = [
    { id: 'profil' as const, label: 'Général' },
    { id: 'preferences' as const, label: 'Préférences' },
    ...(user?.roles.includes('ROLE_MAITRE_OEUVRE') || user?.roles.includes('ROLE_ADMIN')
      ? [{ id: 'export' as const, label: 'Avancé' }]
      : []),
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profil':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card padding="none">
              <CardHeader className="p-6 pb-0">
                <CardTitle>Identité</CardTitle>
                <CardDescription>Utilisé pour vous identifier dans l'application et sur vos documents.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {profilLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><Skeleton className="h-4 w-16" /><Skeleton className="h-9 w-full" /></div>
                    <div className="space-y-1"><Skeleton className="h-4 w-16" /><Skeleton className="h-9 w-full" /></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm">Prénom</Label>
                        <Input
                          value={prenom}
                          type="text"
                          name="prenom"
                          onChange={(e) => setPrenom(e.target.value)}
                          placeholder="John"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Nom</Label>
                        <Input
                          value={nom}
                          type="text"
                          name="nom"
                          onChange={(e) => setNom(e.target.value)}
                          placeholder="Doe"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <Text className="text-xs text-text-secondary">
                      Ceci est votre nom d'affichage public. Il apparaîtra sur vos devis et factures.
                    </Text>
                  </div>
                )}
              </CardContent>
              <CardFooter className="px-6 py-4 bg-bg-secondary/50 border-t border-border mt-0 pt-0">
                <Button
                  variant="Primary"
                  className="w-auto h-9 px-4 text-sm"
                  onClick={handleSaveProfil}
                  loading={profilSaving}
                  disabled={profilLoading}
                >
                  Enregistrer
                </Button>
              </CardFooter>
            </Card>

            <Card padding="none">
              <CardHeader className="p-6 pb-0">
                <CardTitle>Informations du compte</CardTitle>
                <CardDescription>Détails de votre compte et de votre rôle dans l'application.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Identifiant</Label>
                      <Text className="text-xs text-text-secondary">Votre identifiant de connexion.</Text>
                    </div>
                    <Text className="text-sm font-mono bg-bg-secondary px-3 py-1.5 rounded-md border border-border">
                      {user?.username || '—'}
                    </Text>
                  </div>
                  <hr className="border-border/50" />
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Rôle</Label>
                      <Text className="text-xs text-text-secondary">Détermine vos permissions dans l'application.</Text>
                    </div>
                    <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                      {getRoleLabel()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card padding="none">
              <CardHeader className="p-6 pb-0">
                <CardTitle>Apparence</CardTitle>
                <CardDescription>Personnalisez l'apparence de l'application.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(['light', 'dark', 'system'] as const).map((t) => {
                    const images: Record<string, string> = { light: LIGHT, dark: DARK, system: SYSTEM };
                    const labels: Record<string, string> = { light: 'Clair', dark: 'Sombre', system: 'Système' };
                    return (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex flex-col relative items-center gap-2 rounded-xl border-2 transition-all overflow-hidden ${theme === t
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-bg-secondary'
                          }`}
                      >
                        <img src={images[t]} className="w-full object-cover aspect-video" alt={`Thème ${labels[t]}`} />
                        {theme === t &&
                          <div className="p-1 bg-primary rounded-full absolute bottom-2 right-2 shadow-sm">
                            <Check className="text-white w-3 h-3" />
                          </div>
                        }
                        <div className="w-full text-center py-2 px-2 border-t border-border/50 bg-bg-primary">
                          <Text weight="medium" className="text-sm">{labels[t]}</Text>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Mode compact</Label>
                    <Text className="text-xs text-text-secondary">Réduit l'espacement dans les tableaux et listes.</Text>
                  </div>
                  <Switch
                    checked={compactMode}
                    onCheckedChange={(c) => {
                      setCompactMode(c);
                      addToast(`Mode compact ${c ? 'activé' : 'désactivé'}`, 'info');
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card padding="none">
              <CardHeader className="p-6 pb-0">
                <CardTitle>Affichage des données</CardTitle>
                <CardDescription>Configurez comment les données sont affichées dans l'application.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  {(['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'] as DateFormat[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => setDateFormat(format)}
                      className={`flex items-center justify-center px-4 py-2 text-sm font-mono rounded-md border transition-all ${dateFormat === format
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border bg-bg-primary text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                        }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'export':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card padding="none">
              <CardHeader className="p-6 pb-0">
                <CardTitle>Exporter les données</CardTitle>
                <CardDescription>Téléchargez tous vos projets et données au format CSV.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Text className="text-sm text-text-primary">
                  L'export inclut tous les détails des projets, les montants financiers et les statuts actuels.
                </Text>
              </CardContent>
              <CardFooter className="px-6 py-4 bg-bg-secondary/50 border-t border-border mt-0 pt-0">
                <Button
                  variant="Secondary"
                  className="w-auto h-9 px-4 text-sm"
                  onClick={handleExportChantiers}
                  loading={exportLoading}
                >
                  Télécharger CSV
                </Button>
              </CardFooter>
            </Card>

            <Card padding="none" className="border-red/20">
              <CardHeader className="p-6 pb-0">
                <CardTitle>
                  <span className="flex items-center gap-2 text-red">
                    <TriangleSolid className="w-5 h-5" />
                    Zone de danger
                  </span>
                </CardTitle>
                <CardDescription>Actions irréversibles liées à votre compte.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-red">Supprimer le compte</Label>
                    <Text className="text-xs text-text-secondary">Supprimez définitivement votre compte et toutes les données associées.</Text>
                  </div>
                  <Button
                    variant="Destructive"
                    className="w-auto h-9 px-4 text-sm"
                    onClick={() => addToast('Veuillez contacter le support pour supprimer votre compte', 'error')}
                  >
                    Supprimer le compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary">


      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-bg-primary">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 overflow-y-auto border-r border-border py-6 px-4">
          <H2 className="text-xl font-bold tracking-tight text-text-primary mb-5">Paramètres</H2>
          <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center justify-start rounded-md px-3 py-2 text-sm transition-colors ${isActive
                    ? 'bg-bg-secondary text-text-primary font-semibold shadow-sm'
                    : 'text-text-secondary font-medium hover:bg-bg-secondary/50 hover:text-text-primary'
                    }`}
                >
                  {section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};
