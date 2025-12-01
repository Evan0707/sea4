import './App.css';
import './styles/datepicker-custom.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../features/auth/pages/LoginPage';
import Error404 from './pages/Error404Page';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { DashboardLayout } from '../shared/components/layout/DashboardLayout';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import EditArtisanPage from '@/features/users/pages/EditArtisanPage';
import { DossiersListPage } from '../features/dossiers/pages/DossiersListPage';
import { MesDossiersPage } from '../features/dossiers/pages/MesDossiersPage';
import { NouveauDossierPage } from '../features/dossiers/pages/NouveauDossierPage';
import { EditDossierPage } from '../features/dossiers/pages/EditDossierPage';
import CompleteDossierPage from '../features/dossiers/pages/CompleteDossierPage';
import { ProjetsListPage } from '../features/chantiers/pages/ProjetsListPage';
import { UtilisateursListPage } from '../features/users/pages/UtilisateursListPage';
import { ArtisansListPage } from '../features/users/pages/ArtisansListPage';
import NewUtilisateurPage from '@/features/users/pages/NewUtilisateurPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { AuthProvider, useAuth } from '../features/auth/context/AuthContext';
import { ToastProvider } from '../shared/context/ToastProvider';
import { OnlineProvider } from '../shared/context/OnlineProvider';
import { ThemeProvider } from '../shared/context/ThemeProvider';
import Unauthorized from './pages/Unauthorized';
import NewArtisanPage from '@/features/users/pages/NewArtisanPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <OnlineProvider>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthProvider>
        </OnlineProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Wraps content in dashboard layout for authenticated routes
  const withDashboard = (component: React.ReactNode) => (
    <DashboardLayout user={user}>{component}</DashboardLayout>
  );

  return (
    <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized/>} />

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
          <Route path="/commercial" element={withDashboard(<DashboardPage />)} />
          <Route path="/commercial/dossiers" element={withDashboard(<DossiersListPage />)} />
          <Route
            path="/commercial/nouveau-dossier"
            element={withDashboard(<NouveauDossierPage />)}
          />
          <Route
            path="/commercial/dossiers/:id/edit"
            element={withDashboard(<EditDossierPage />)}
          />
          <Route
            path="/commercial/settings"
            element={withDashboard(<SettingsPage />)}
          />
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
          <Route path="/maitre-doeuvre" element={withDashboard(<DashboardPage />)} />
          <Route
            path="/maitre-doeuvre/dossiers"
            element={withDashboard(<MesDossiersPage />)}
          />
          <Route
            path="/maitre-doeuvre/dossiers/:id"
            element={withDashboard(<div>Détails du dossier</div>)}
          />
          <Route
            path="/maitre-doeuvre/chantiers/:id/completer"
            element={withDashboard(<CompleteDossierPage />)}
          />
          <Route
            path="/maitre-doeuvre/chantiers"
            element={withDashboard(<ProjetsListPage />)}
          />
          <Route
            path="/maitre-doeuvre/chantiers/:id"
            element={withDashboard(<div>Détails du chantier</div>)}
          />
          <Route
            path="/maitre-doeuvre/settings"
            element={withDashboard(<SettingsPage />)}
          />
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
          <Route path="/admin" element={withDashboard(<DashboardPage />)} />
          <Route path="/admin/dossiers" element={withDashboard(<DossiersListPage />)} />
          <Route path="/admin/chantiers" element={withDashboard(<ProjetsListPage />)} />
          <Route
            path="/admin/utilisateurs"
            element={withDashboard(<UtilisateursListPage />)}
          />
          <Route path="/admin/utilisateurs/new" element={withDashboard(<NewUtilisateurPage />)} />
          <Route path="/admin/artisans" element={withDashboard(<ArtisansListPage />)} />
          <Route path="/admin/artisans/:id/edit" element={withDashboard(<EditArtisanPage />)} />
          <Route path='/admin/artisans/new' element={withDashboard(<NewArtisanPage />)} />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch all route for 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>
  );
}

export default App;
