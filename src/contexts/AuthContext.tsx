import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('disaster-alert-token');
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user profile
      authAPI.getProfile(storedToken)
        .then((response) => {
          if (response.success) {
            const userWithToken = { ...response.data.user, token: storedToken };
            setUser(userWithToken);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('disaster-alert-token');
            setToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('disaster-alert-token');
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        const userWithToken = { ...response.data.user, token: response.data.token };
        setUser(userWithToken);
        setToken(response.data.token);
        localStorage.setItem('disaster-alert-token', response.data.token);
        return true;
      } else {
        console.error('Login failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.register({ name, email, password, phone });
      
      if (response.success) {
        const userWithToken = { ...response.data.user, token: response.data.token };
        setUser(userWithToken);
        setToken(response.data.token);
        localStorage.setItem('disaster-alert-token', response.data.token);
        return true;
      } else {
        console.error('Registration failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('disaster-alert-token');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
