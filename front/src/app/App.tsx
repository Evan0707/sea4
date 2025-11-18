import './App.css';
import './styles/datepicker-custom.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../features/auth/pages/LoginPage';
import Error404 from './pages/Error404Page';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { DashboardLayout } from '../shared/components/layout/DashboardLayout';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { DossiersListPage } from '../features/dossiers/pages/DossiersListPage';
import { NouveauDossierPage } from '../features/dossiers/pages/NouveauDossierPage';
import { ProjetsListPage } from '../features/chantiers/pages/ProjetsListPage';
import { UtilisateursListPage } from '../features/users/pages/UtilisateursListPage';
import { ArtisansListPage } from '../features/users/pages/ArtisansListPage';
import { AuthProvider, useAuth } from '../features/auth/context/AuthContext';
import { ToastProvider } from '../shared/context/ToastProvider';
import { OnlineProvider } from '../shared/context/OnlineProvider';

function App() {
  return (
    <BrowserRouter>
      <OnlineProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </OnlineProvider>
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
        <Route path="/unauthorized" element={<div>Accès non autorisé</div>} />

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
        </Route>

        {/* Maitre d'oeuvre Routes */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRoles={user?.roles ?? []}
              allowedRoles={['ROLE_MAITRE_DOEUVRE']}
            />
          }
        >
          <Route path="/maitre-doeuvre" element={withDashboard(<DashboardPage />)} />
          <Route
            path="/maitre-doeuvre/dossiers"
            element={withDashboard(<DossiersListPage />)}
          />
          <Route
            path="/maitre-doeuvre/dossiers/:id"
            element={withDashboard(<div>Détails du dossier</div>)}
          />
          <Route
            path="/maitre-doeuvre/projets"
            element={withDashboard(<ProjetsListPage />)}
          />
          <Route
            path="/maitre-doeuvre/projets/:id"
            element={withDashboard(<div>Détails du projet</div>)}
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
          <Route path="/admin/projets" element={withDashboard(<ProjetsListPage />)} />
          <Route
            path="/admin/utilisateurs"
            element={withDashboard(<UtilisateursListPage />)}
          />
          <Route path="/admin/artisans" element={withDashboard(<ArtisansListPage />)} />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch all route for 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>
  );
}

export default App;
