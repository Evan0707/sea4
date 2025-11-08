import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  userRoles: string[];
  allowedRoles: string[];
}

export const ProtectedRoute = ({
  isAuthenticated,
  userRoles,
  allowedRoles,
}: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = userRoles.some(role => allowedRoles.includes(role));
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};