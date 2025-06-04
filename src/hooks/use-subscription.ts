import React from 'react';
import { useApi } from './use-api';
import { addToast } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './use-auth';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  paymentMethod: 'paypal' | 'stripe';
  autoRenew: boolean;
}

export const useSubscription = () => {
  const api = useApi();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [plans, setPlans] = React.useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data);
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setError(t('errors.failedToLoadPlans'));
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/subscriptions/my-subscription');
      setSubscription(response.data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(t('errors.failedToLoadSubscription'));
    } finally {
      setLoading(false);
    }
  };
  
  const createSubscription = async (planId: string, paymentMethod: 'paypal' | 'stripe') => {
    try {
      setLoading(true);
      
      const response = await api.post('/subscriptions', {
        planId,
        paymentMethod
      });
      
      // Redirect to payment provider if needed
      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
        return;
      }
      
      // Otherwise, update local subscription state
      setSubscription(response.data.subscription);
      
      addToast({
        title: t('subscription.subscriptionCreated'),
        description: t('subscription.waitingForApproval'),
        color: 'success'
      });
      
      return response.data;
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      const errorMessage = err.response?.data?.message || t('errors.subscriptionFailed');
      
      addToast({
        title: t('errors.subscriptionFailed'),
        description: errorMessage,
        color: 'danger'
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const cancelSubscription = async () => {
    try {
      setLoading(true);
      
      await api.post('/subscriptions/cancel');
      
      // Update local state
      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'canceled',
          autoRenew: false
        });
      }
      
      addToast({
        title: t('subscription.subscriptionCanceled'),
        description: t('subscription.subscriptionCanceledMessage'),
        color: 'warning'
      });
    } catch (err) {
      console.error('Error canceling subscription:', err);
      
      addToast({
        title: t('errors.cancelFailed'),
        description: t('errors.failedToCancelSubscription'),
        color: 'danger'
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAutoRenew = async (autoRenew: boolean) => {
    try {
      setLoading(true);
      
      await api.post('/subscriptions/auto-renew', { autoRenew });
      
      // Update local state
      if (subscription) {
        setSubscription({
          ...subscription,
          autoRenew
        });
      }
      
      addToast({
        title: autoRenew 
          ? t('subscription.autoRenewEnabled') 
          : t('subscription.autoRenewDisabled'),
        color: 'success'
      });
    } catch (err) {
      console.error('Error toggling auto-renew:', err);
      
      addToast({
        title: t('errors.updateFailed'),
        description: t('errors.failedToUpdateAutoRenew'),
        color: 'danger'
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    plans,
    subscription,
    loading,
    error,
    fetchPlans,
    fetchSubscription,
    createSubscription,
    cancelSubscription,
    toggleAutoRenew
  };
};
