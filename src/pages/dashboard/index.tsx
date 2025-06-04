// New dashboard page component
import React from 'react';
import { Card, CardBody, CardHeader, Divider, Button, Progress } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/use-auth';
import { useImages } from '../../hooks/use-images';
import { useSubscription } from '../../hooks/use-subscription';
import { format, parseISO } from 'date-fns';
import { ImageGrid } from '../../components/image-grid';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { images, loading, error, fetchImages } = useImages();
  const { subscription, fetchSubscription } = useSubscription();
  
  React.useEffect(() => {
    fetchImages();
    fetchSubscription();
  }, []);
  
  const recentImages = images.slice(0, 3);
  
  const getSubscriptionStatus = () => {
    if (!user) return 'inactive';
    
    if (user.subscriptionStatus === 'trial') {
      return 'trial';
    } else if (user.subscriptionStatus === 'active') {
      return 'active';
    } else {
      return 'inactive';
    }
  };
  
  const getTrialDaysLeft = () => {
    if (!user?.trialEndDate) return 0;
    
    const trialEnd = parseISO(user.trialEndDate);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };
  
  const trialDaysLeft = getTrialDaysLeft();
  const subscriptionStatus = getSubscriptionStatus();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {t('dashboard.welcome', { name: user?.fullName || user?.username })}
          </h1>
          <p className="text-default-600">
            {t('dashboard.welcomeMessage')}
          </p>
        </div>
        
        <Button
          as={RouterLink}
          to="/dashboard/upload"
          color="primary"
          startContent={<Icon icon="lucide:upload" />}
        >
          {t('dashboard.uploadNewImage')}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="flex flex-col items-center text-center p-6">
            <div className="rounded-full bg-primary-100 p-3 mb-4">
              <Icon icon="lucide:image" className="text-primary" width={24} height={24} />
            </div>
            <h3 className="text-xl font-semibold">{images.length}</h3>
            <p className="text-default-600">{t('dashboard.totalImages')}</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex flex-col items-center text-center p-6">
            <div className="rounded-full bg-success-100 p-3 mb-4">
              <Icon icon="lucide:tag" className="text-success" width={24} height={24} />
            </div>
            <h3 className="text-xl font-semibold">
              {images.reduce((total, img) => total + img.tags.length, 0)}
            </h3>
            <p className="text-default-600">{t('dashboard.totalTags')}</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex flex-col items-center text-center p-6">
            <div className="rounded-full bg-warning-100 p-3 mb-4">
              <Icon icon="lucide:clock" className="text-warning" width={24} height={24} />
            </div>
            <h3 className="text-xl font-semibold">
              {images.filter(img => {
                const expirationDate = new Date(img.expiresAt);
                const today = new Date();
                const diffTime = expirationDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 3;
              }).length}
            </h3>
            <p className="text-default-600">{t('dashboard.expiringImages')}</p>
          </CardBody>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h2 className="text-lg font-semibold">{t('dashboard.recentImages')}</h2>
                <Button
                  as={RouterLink}
                  to="/dashboard/images"
                  variant="light"
                  size="sm"
                  endContent={<Icon icon="lucide:chevron-right" width={16} />}
                >
                  {t('dashboard.viewAll')}
                </Button>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center text-danger py-8">
                  <Icon icon="lucide:alert-circle" width={32} height={32} className="mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : recentImages.length === 0 ? (
                <div className="text-center py-8">
                  <Icon icon="lucide:image-off" width={32} height={32} className="mx-auto mb-2 text-default-400" />
                  <p className="text-default-500">{t('dashboard.noImagesYet')}</p>
                  <Button
                    as={RouterLink}
                    to="/dashboard/upload"
                    color="primary"
                    variant="flat"
                    size="sm"
                    className="mt-4"
                  >
                    {t('dashboard.uploadYourFirstImage')}
                  </Button>
                </div>
              ) : (
                <ImageGrid images={recentImages} onDelete={() => fetchImages()} />
              )}
            </CardBody>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">{t('dashboard.subscriptionStatus')}</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              {subscriptionStatus === 'active' ? (
                <>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:check-circle" className="text-success" width={20} height={20} />
                    <span className="text-success font-medium">{t('subscription.active')}</span>
                  </div>
                  
                  {subscription && (
                    <>
                      <p className="text-small text-default-600">
                        {t('subscription.expiresOn', { 
                          date: format(parseISO(subscription.endDate), 'MMM d, yyyy') 
                        })}
                      </p>
                      
                      <p className="text-small text-default-600">
                        {t('subscription.autoRenew')}: {
                          subscription.autoRenew 
                            ? t('subscription.enabled') 
                            : t('subscription.disabled')
                        }
                      </p>
                    </>
                  )}
                </>
              ) : subscriptionStatus === 'trial' ? (
                <>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:clock" className="text-warning" width={20} height={20} />
                    <span className="text-warning font-medium">{t('subscription.trial')}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-small">
                      <span>{t('subscription.daysLeft')}</span>
                      <span>{trialDaysLeft} / 7</span>
                    </div>
                    <Progress 
                      value={(7 - trialDaysLeft) * 100 / 7} 
                      color="warning"
                      size="sm"
                    />
                  </div>
                  
                  <p className="text-small text-default-600">
                    {t('subscription.trialEndsOn', { 
                      date: user?.trialEndDate 
                        ? format(parseISO(user.trialEndDate), 'MMM d, yyyy')
                        : '—'
                    })}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:x-circle" className="text-danger" width={20} height={20} />
                    <span className="text-danger font-medium">{t('subscription.inactive')}</span>
                  </div>
                  
                  <p className="text-small text-default-600">
                    {t('subscription.inactiveMessage')}
                  </p>
                </>
              )}
              
              <Button
                as={RouterLink}
                to="/dashboard/subscription"
                color="primary"
                variant="flat"
                className="w-full mt-4"
              >
                {subscriptionStatus === 'active' 
                  ? t('subscription.manageSubscription')
                  : t('subscription.subscribe')}
              </Button>
            </CardBody>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">{t('dashboard.yourGallery')}</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <p className="text-small text-default-600">
                {t('dashboard.shareYourGallery')}
              </p>
              
              <div className="flex items-center gap-2 p-2 bg-default-100 rounded-md">
                <Input
                  readOnly
                  value={`${window.location.origin}/gallery/${user?.username}`}
                  size="sm"
                  className="flex-1"
                />
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/gallery/${user?.username}`);
                    addToast({
                      title: t('common.copied'),
                      color: 'success'
                    });
                  }}
                >
                  <Icon icon="lucide:copy" width={16} height={16} />
                </Button>
              </div>
              
              <Button
                as={RouterLink}
                to={`/gallery/${user?.username}`}
                variant="flat"
                color="primary"
                className="w-full"
                endContent={<Icon icon="lucide:external-link" width={16} height={16} />}
              >
                {t('dashboard.viewGallery')}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;