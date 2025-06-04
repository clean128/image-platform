import React from 'react';
import axios from 'axios';
import { useAuth } from './use-auth';
import { addToast } from '@heroui/react';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useApi = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  
  const api = React.useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized, token might be expired
          logout();
          addToast({
            title: t('errors.sessionExpired'),
            description: t('errors.pleaseLoginAgain'),
            color: 'warning'
          });
        }
        return Promise.reject(error);
      }
    );
    
    return instance;
  }, [logout, t]);
  
  return api;
};
