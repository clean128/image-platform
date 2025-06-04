import React from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { addToast } from '@heroui/react';
import { useTranslation } from 'react-i18next';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  isApproved: boolean;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'none';
  subscriptionEndDate?: string;
  trialEndDate?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  acceptTerms: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { t } = useTranslation();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // Check if user is already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expired
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // Valid token, fetch user data
          fetchUserData(token);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      await fetchUserData(token);
      
      addToast({
        title: t('auth.loginSuccess'),
        color: 'success'
      });
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || t('auth.loginError');
      addToast({
        title: t('auth.loginFailed'),
        description: errorMessage,
        color: 'danger'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/auth/register`, userData);
      
      addToast({
        title: t('auth.registerSuccess'),
        description: t('auth.registerSuccessMessage'),
        color: 'success'
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || t('auth.registerError');
      addToast({
        title: t('auth.registerFailed'),
        description: errorMessage,
        color: 'danger'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    addToast({
      title: t('auth.logoutSuccess'),
      color: 'success'
    });
  };
  
  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      
      addToast({
        title: t('auth.passwordResetEmailSent'),
        description: t('auth.passwordResetEmailSentMessage'),
        color: 'success'
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || t('auth.forgotPasswordError');
      addToast({
        title: t('auth.forgotPasswordFailed'),
        description: errorMessage,
        color: 'danger'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPassword = async (token: string, password: string) => {
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/auth/reset-password`, { token, password });
      
      addToast({
        title: t('auth.passwordResetSuccess'),
        description: t('auth.passwordResetSuccessMessage'),
        color: 'success'
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || t('auth.resetPasswordError');
      addToast({
        title: t('auth.resetPasswordFailed'),
        description: errorMessage,
        color: 'danger'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};