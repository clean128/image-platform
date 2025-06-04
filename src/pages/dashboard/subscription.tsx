// New subscription page component
import React from 'react';
import { Card, CardBody, CardHeader, CardFooter, Button, Divider, Tabs, Tab, Switch, Radio, RadioGroup, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useSubscription, SubscriptionPlan } from '../../hooks/use-subscription';
import { useAuth } from '../../hooks/use-auth';
import { format, parseISO } from 'date-fns';

const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    plans, 
    subscription, 
    loading, 
    error, 
    fetchPlans, 
    fetchSubscription, 
    createSubscription, 
    cancelSubscription, 
    toggleAutoRenew 
  } = useSubscription();
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<'paypal' | 'stripe'>('paypal');
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  
  React.useEffect(() => {
    fetchPlans();
    fetchSubscription();
  }, []);
  
  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    try {
      await createSubscription(selectedPlan, paymentMethod);
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };
  
  const handleCancel = async () => {
    try {
      await cancelSubscription();
    } catch (error) {
      console.error('Cancellation error:', error);
    }
  };
  
  const handleToggleAutoRenew = async (enabled: boolean) => {
    try {
      await toggleAutoRenew(enabled);
    } catch (error) {
      console.error('Auto-renew toggle error:', error);
    }
  };
  
  const isSubscribed = subscription && ['active', 'trial'].includes(subscription.status);
  const isTrialActive = user?.subscriptionStatus === 'trial';
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('subscription.title')}</h1>
      
      {isSubscribed ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">{t('subscription.currentPlan')}</h2>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {plans.find(p => p.id === subscription?.planId)?.name || t('subscription.yearlyPlan')}
                </h3>
                
                <div className="flex items-center gap-2 mt-1">
                  <Chip 
                    color={subscription?.status === 'active' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {t(`subscription.status.${subscription?.status}`)}
                  </Chip>
                  
                  {subscription?.autoRenew && (
                    <Chip color="primary" size="sm">
                      {t('subscription.autoRenew')}
                    </Chip>
                  )}
                </div>
                
                <p className="text-default-600 mt-2">
                  {t('subscription.validUntil', { 
                    date: format(parseISO(subscription?.endDate || new Date().toISOString()), 'MMMM d, yyyy') 
                  })}
                </p>
                
                {isTrialActive && user?.trialEndDate && (
                  <p className="text-warning-600 mt-1">
                    {t('subscription.trialEndsOn', { 
                      date: format(parseISO(user.trialEndDate), 'MMMM d, yyyy') 
                    })}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    isSelected={subscription?.autoRenew}
                    onValueChange={handleToggleAutoRenew}
                    isDisabled={loading}
                  />
                  <span>{t('subscription.autoRenewSubscription')}</span>
                </div>
                
                <Button
                  color="danger"
                  variant="flat"
                  onPress={handleCancel}
                  isLoading={loading}
                  startContent={<Icon icon="lucide:x" />}
                >
                  {t('subscription.cancelSubscription')}
                </Button>
              </div>
            </div>
            
            <Divider />
            
            <div>
              <h3 className="text-md font-semibold mb-2">{t('subscription.paymentMethod')}</h3>
              <div className="flex items-center gap-2">
                {subscription?.paymentMethod === 'paypal' ? (
                  <Icon icon="logos:paypal" width={80} />
                ) : (
                  <Icon icon="logos:stripe" width={80} />
                )}
                <span className="text-default-600">
                  {t(`subscription.paymentMethods.${subscription?.paymentMethod}`)}
                </span>
              </div>
            </div>
            
            <Divider />
            
            <div>
              <h3 className="text-md font-semibold mb-2">{t('subscription.features')}</h3>
              <ul className="space-y-2">
                {plans.find(p => p.id === subscription?.planId)?.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icon icon="lucide:check" className="text-success mt-1" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Tabs aria-label="Subscription options">
          <Tab key="plans" title={t('subscription.choosePlan')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {loading ? (
                <div className="col-span-3 flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="col-span-3 text-center text-danger py-8">
                  <Icon icon="lucide:alert-circle" width={32} height={32} className="mx-auto mb-2" />
                  <p>{error}</p>
                  <Button
                    color="primary"
                    variant="flat"
                    className="mt-4"
                    onPress={fetchPlans}
                  >
                    {t('common.retry')}
                  </Button>
                </div>
              ) : plans.length === 0 ? (
                <div className="col-span-3 text-center py-8">
                  <Icon icon="lucide:package" width={32} height={32} className="mx-auto mb-2 text-default-400" />
                  <p className="text-default-500">{t('subscription.noPlansAvailable')}</p>
                </div>
              ) : (
                plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`border-2 ${selectedPlan === plan.id ? 'border-primary' : 'border-transparent'}`}
                    isPressable
                    onPress={() => setSelectedPlan(plan.id)}
                  >
                    <CardHeader className="flex flex-col items-center">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <div className="flex items-end gap-1 mt-2">
                        <span className="text-3xl font-bold">
                          {plan.price}
                        </span>
                        <span className="text-default-600">
                          {plan.currency}/{t(`subscription.interval.${plan.interval}`)}
                        </span>
                      </div>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                      <p className="text-center text-default-600 mb-4">
                        {plan.description}
                      </p>
                      
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Icon icon="lucide:check" className="text-success mt-1" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                    <Divider />
                    <CardFooter className="justify-center">
                      <Button
                        color={selectedPlan === plan.id ? 'primary' : 'default'}
                        variant={selectedPlan === plan.id ? 'solid' : 'flat'}
                        className="w-full"
                        onPress={() => setSelectedPlan(plan.id)}
                      >
                        {selectedPlan === plan.id ? t('subscription.selected') : t('subscription.selectPlan')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
            
            {selectedPlan && (
              <Card className="mt-6">
                <CardHeader>
                  <h2 className="text-lg font-semibold">{t('subscription.paymentMethod')}</h2>
                </CardHeader>
                <Divider />
                <CardBody>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod as any}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card isPressable className={paymentMethod === 'paypal' ? 'border-2 border-primary' : ''}>
                        <CardBody className="flex items-center gap-4">
                          <Radio value="paypal" />
                          <Icon icon="logos:paypal" width={100} />
                        </CardBody>
                      </Card>
                      
                      <Card isPressable className={paymentMethod === 'stripe' ? 'border-2 border-primary' : ''}>
                        <CardBody className="flex items-center gap-4">
                          <Radio value="stripe" />
                          <Icon icon="logos:stripe" width={100} />
                        </CardBody>
                      </Card>
                    </div>
                  </RadioGroup>
                  
                  <div className="mt-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        isSelected={acceptTerms}
                        onValueChange={setAcceptTerms}
                      />
                      <span>
                        {t('subscription.acceptTerms')}
                      </span>
                    </div>
                  </div>
                </CardBody>
                <Divider />
                <CardFooter>
                  <Button
                    color="primary"
                    className="w-full"
                    onPress={handleSubscribe}
                    isLoading={loading}
                    isDisabled={!selectedPlan || !acceptTerms || loading}
                  >
                    {t('subscription.subscribe')}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </Tab>
          
          <Tab key="trial" title={t('subscription.freeTrial')}>
            <Card className="mt-4">
              <CardHeader>
                <h2 className="text-lg font-semibold">{t('subscription.freeTrial')}</h2>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3 bg-success-50 text-success-600 p-4 rounded-lg">
                  <Icon icon="lucide:gift" width={24} height={24} />
                  <div>
                    <h3 className="font-semibold">{t('subscription.freeTrialOffer')}</h3>
                    <p className="text-sm">{t('subscription.freeTrialDescription')}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-md font-semibold">{t('subscription.trialIncludes')}</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Icon icon="lucide:check" className="text-success mt-1" />
                      <span>{t('subscription.trialFeature1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon icon="lucide:check" className="text-success mt-1" />
                      <span>{t('subscription.trialFeature2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon icon="lucide:check" className="text-success mt-1" />
                      <span>{t('subscription.trialFeature3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon icon="lucide:check" className="text-success mt-1" />
                      <span>{t('subscription.trialFeature4')}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      isSelected={acceptTerms}
                      onValueChange={setAcceptTerms}
                    />
                    <span>
                      {t('subscription.acceptTrialTerms')}
                    </span>
                  </div>
                </div>
              </CardBody>
              <Divider />
              <CardFooter>
                <Button
                  color="primary"
                  className="w-full"
                  onPress={() => createSubscription('trial', 'paypal')}
                  isLoading={loading}
                  isDisabled={!acceptTerms || loading || isTrialActive}
                >
                  {isTrialActive 
                    ? t('subscription.trialActive')
                    : t('subscription.startFreeTrial')}
                </Button>
              </CardFooter>
            </Card>
          </Tab>
        </Tabs>
      )}
    </div>
  );
};

export default SubscriptionPage;