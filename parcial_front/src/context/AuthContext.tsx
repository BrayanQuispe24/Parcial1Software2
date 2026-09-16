import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
  is_enabled?: boolean;
  accepted_terms?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.get('/auth/profile/');
          setUser(response.data);
          localStorage.setItem('user_data', JSON.stringify(response.data));
        } catch {
          // Token expirado o inválido
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login/', credentials);
    const { access, refresh, user: userData } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Si la API no retorna user directamente en login, pedimos profile
    let currentUser = userData;
    if (!currentUser) {
      const profileRes = await api.get('/auth/profile/');
      currentUser = profileRes.data;
    }
    
    setUser(currentUser);
    localStorage.setItem('user_data', JSON.stringify(currentUser));
  };

  const register = async (userData: any) => {
    await api.post('/auth/register/', userData);
  };

  const logout = () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      api.post('/auth/logout/', { refresh }).catch(() => {});
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
