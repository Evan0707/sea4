import './App.css';
import './styles/datepicker-custom.css';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { Login } from '../features/auth/pages/LoginPage';
import Error404 from './pages/Error404Page';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { CommercialDashboardPage } from '@/features/dashboard/pages/CommercialDashboardPage';
import { AdminDashboardPage } from '@/features/dashboard/pages/AdminDashboardPage';
import { MoeDashboardPage } from '@/features/dashboard/pages/MoeDashboardPage';
import EditArtisanPage from '@/features/users/pages/EditArtisanPage';
import { DossiersListPage } from '@/features/dossiers/pages/DossiersListPage';
import { MesDossiersPage } from '@/features/dossiers/pages/MesDossiersPage';
import { NouveauDossierPage } from '@/features/dossiers/pages/NouveauDossierPage';
import { EditDossierPage } from '@/features/dossiers/pages/EditDossierPage';
import CompleteDossierPage from '@/features/dossiers/pages/CompleteDossierPage';
import { AdminChantiersListPage } from '@/features/chantiers/pages/AdminChantiersListPage';
import { AdminChantierDetailPage } from '@/features/chantiers/pages/AdminChantierDetailPage';
import { MesProjetsListPage } from '@/features/chantiers/pages/MesProjetsListPage';
import { ChantierDetailPage } from '@/features/chantiers/pages/ChantierDetailPage';
import { UtilisateursListPage } from '@/features/users/pages/UtilisateursListPage';
import { ArtisansListPage } from '@/features/users/pages/ArtisansListPage';
import ArtisanDetailsPage from '@/features/users/pages/ArtisanDetailsPage';
import NewUtilisateurPage from '@/features/users/pages/NewUtilisateurPage';
import UserDetailPage from '@/features/users/pages/UserDetailPage';
import EditUserPage from '@/features/users/pages/EditUserPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { ToastProvider } from '@/shared/context/ToastProvider';
import { OnlineProvider } from '@/shared/context/OnlineProvider';
import { ThemeProvider } from '@/shared/context/ThemeProvider';
import Unauthorized from './pages/Unauthorized';
import NewArtisanPage from '@/features/users/pages/NewArtisanPage';
import { LayoutProvider } from '@/shared/context/LayoutContext';

import { ChantiersMapPage } from '@/features/dashboard/pages/ChantiersMapPage';
import { ModelesListPage } from '@/features/chantiers/pages/ModelesListPage';
import { ModeleEditPage } from '@/features/chantiers/pages/ModeleEditPage';
import {ArtisanDashboardPage} from "@/features/dashboard/pages/ArtisanDashboardPage";
import {ArtisanChantierPage} from "@/features/users/pages/ArtisanChantierPage";
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <OnlineProvider>
          <AuthProvider>
            <LayoutProvider>
              <ToastProvider>
               <ErrorBoundary>
                <AppRoutes />
               </ErrorBoundary>
              </ToastProvider>
            </LayoutProvider>
          </AuthProvider>
        </OnlineProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Commercial Routes */}
      <Route
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            userRoles={user?.roles ?? []}
            allowedRoles={['ROLE_COMMERCIAL']}
          />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route path="/commercial" element={<CommercialDashboardPage />} />
          <Route path="/commercial/dossiers" element={<DossiersListPage />} />
          <Route
            path="/commercial/nouveau-dossier"
            element={<NouveauDossierPage />}
          />
          <Route
            path="/commercial/dossiers/:id/edit"
            element={<EditDossierPage />}
          />
          <Route
            path="/commercial/settings"
            element={<SettingsPage />}
          />
        </Route>
      </Route>

      {/* Maitre d'oeuvre Routes */}
      <Route
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            userRoles={user?.roles ?? []}
            allowedRoles={['ROLE_MAITRE_OEUVRE']}
          />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route path="/maitre-doeuvre" element={<MoeDashboardPage />} />
          <Route
            path="/maitre-doeuvre/dossiers"
            element={<MesDossiersPage />}
          />
          <Route
            path="/maitre-doeuvre/dossiers/:id"
            element={<div>Détails du dossier</div>}
          />
          <Route
            path="/maitre-doeuvre/chantiers/:id/completer"
            element={<CompleteDossierPage />}
          />
          <Route
            path="/maitre-doeuvre/chantiers"
            element={<MesProjetsListPage />}
          />
          <Route
            path="/maitre-doeuvre/chantiers/:id"
            element={<ChantierDetailPage />}
          />
          <Route
            path="/maitre-doeuvre/settings"
            element={<SettingsPage />}
          />
        </Route>
      </Route>


      {/* Artisan Routes */}
        <Route
            element={
            <ProtectedRoute
                isAuthenticated={isAuthenticated}
                userRoles={user?.roles ?? []}
                allowedRoles={['ROLE_ARTISAN']}
                />
            }
            >
            <Route element={<DashboardLayout />}>
                <Route
                    path="/artisan"
                    element={<ArtisanDashboardPage />}
                />
                <Route
                    path="/artisan/:id"
                    element={<ArtisanChantierPage />}
                />
            </Route>
        </Route>



      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            userRoles={user?.roles ?? []}
            allowedRoles={['ROLE_ADMIN']}
          />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dossiers" element={<DossiersListPage />} />
          <Route path="/admin/dossiers/:id/completer" element={<CompleteDossierPage />} />
          <Route path="/admin/chantiers" element={<AdminChantiersListPage />} />
          <Route path="/admin/chantiers/map" element={<ChantiersMapPage />} />
          <Route path="/admin/chantiers/:id" element={<AdminChantierDetailPage />} />
          <Route
            path="/admin/utilisateurs"
            element={<UtilisateursListPage />}
          />
          <Route path="/admin/utilisateurs/new" element={<NewUtilisateurPage />} />
          <Route path="/admin/utilisateurs/:id" element={<UserDetailPage />} />
          <Route path="/admin/utilisateurs/:id" element={<UserDetailPage />} />
          <Route path="/admin/utilisateurs/:id/edit" element={<EditUserPage />} />


          <Route path="/admin/artisans" element={<ArtisansListPage />} />
          <Route path='/admin/artisans/new' element={<NewArtisanPage />} />
          <Route path="/admin/artisans/:id/edit" element={<EditArtisanPage />} />
          <Route path="/admin/artisans/:id" element={<ArtisanDetailsPage />} />
          <Route path="/admin/artisans/:id" element={<ArtisanDetailsPage />} />

          <Route path="/admin/modeles" element={<ModelesListPage />} />
          <Route path="/admin/modeles/new" element={<ModeleEditPage />} />
          <Route path="/admin/modeles/:id/edit" element={<ModeleEditPage />} />

          <Route
            path="/admin/settings"
            element={<SettingsPage />}
          />
        </Route>
      </Route>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch all route for 404 */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

export default App;
