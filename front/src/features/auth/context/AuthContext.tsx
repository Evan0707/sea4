import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios'
import { jwtDecode } from 'jwt-decode';
import type { JWTPayload, UserProfile } from '@/shared/types/auth';

interface AuthContextType {
  user: UserProfile | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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

  // When a token is present, try to fetch the user profile (/api/me)
  useEffect(() => {
    let mounted = true
    const fetchProfile = async (token: string) => {
      try {
        const res = await axios.get('/me')
        if (!mounted) return
        setUser(prev => prev ? ({ ...prev, nom: res.data.nom ?? null, prenom: res.data.prenom ?? null }) : null)
      } catch (e) {
        // ignore failure (token may be invalid/expired)
      }
    }

    if (user?.token) {
      fetchProfile(user.token)
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

      // fetch profile immediately
      (async () => {
        try {
          const res = await axios.get('/me')
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