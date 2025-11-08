import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, JWTPayload } from '../types/auth';

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode<JWTPayload>(savedToken);
        return {
          username: decoded.username,
          roles: decoded.roles,
          token: savedToken
        };
      } catch (e) {
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const userData: User = {
        username: decoded.username,
        roles: decoded.roles,
        token: token
      };
      setUser(userData);
      localStorage.setItem('token', token);
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