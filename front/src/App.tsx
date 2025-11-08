import './App.css';
import './styles/datepicker-custom.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { DossiersPage } from './pages/dashboard/DossiersPage';
import { NouveauDossierPage } from './pages/dashboard/NouveauDossierPage';
import { ProjetsPage } from './pages/dashboard/ProjetsPage';
import { UtilisateursPage } from './pages/dashboard/UtilisateursPage';
import { ArtisansPage } from './pages/dashboard/ArtisansPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
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
          <Route path="/commercial/dossiers" element={withDashboard(<DossiersPage />)} />
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
            element={withDashboard(<DossiersPage />)}
          />
          <Route
            path="/maitre-doeuvre/dossiers/:id"
            element={withDashboard(<div>Détails du dossier</div>)}
          />
          <Route
            path="/maitre-doeuvre/projets"
            element={withDashboard(<ProjetsPage />)}
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
          <Route path="/admin/dossiers" element={withDashboard(<DossiersPage />)} />
          <Route path="/admin/projets" element={withDashboard(<ProjetsPage />)} />
          <Route
            path="/admin/utilisateurs"
            element={withDashboard(<UtilisateursPage />)}
          />
          <Route path="/admin/artisans" element={withDashboard(<ArtisansPage />)} />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}

export default App;
