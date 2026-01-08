import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import apiClient from '@/shared/api/client';
import { jwtDecode } from 'jwt-decode';
import type { JWTPayload, UserProfile } from '@/shared/types/auth';

interface AuthContextType {
  user: UserProfile | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Gestion de l'état de l'utilisateur
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode<JWTPayload>(savedToken);
        return {
          username: decoded.username,
          roles: decoded.roles,
          token: savedToken,
          nom: null,
          prenom: null
        };
      } catch (e) {
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

  // QUand un token est present, on tente de recuperer le profile de l'utilisateur
  useEffect(() => {
    let mounted = true
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/me')
        if (!mounted) return
        setUser(prev => prev ? ({ ...prev, nom: res.data.nom ?? null, prenom: res.data.prenom ?? null }) : null)
      } catch (e) {
        // Ignorer l'erreur (le token peut être invalide/expiration)
      }
    }

    if (user?.token) {
      fetchProfile()
    }

    return () => { mounted = false }
  }, [user?.token])

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const userData: UserProfile = {
        username: decoded.username,
        roles: decoded.roles,
        token: token,
        nom: null,
        prenom: null,
      };
      setUser(userData);
      localStorage.setItem('token', token);

      // Recuperer le profile de l'utilisateur
      (async () => {
        try {
          const res = await apiClient.get('/me')
          setUser(prev => prev ? ({ ...prev, nom: res.data.nom ?? null, prenom: res.data.prenom ?? null }) : prev)
        } catch (e) {
          // ignore
        }
      })();
    } catch (e) {
      console.error('Invalid token:', e);
      logout();
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};