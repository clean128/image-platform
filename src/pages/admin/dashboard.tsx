// New admin dashboard page component
import React from 'react';
import { Card, CardBody, CardHeader, Divider, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../hooks/use-api';

interface AdminStats {
  totalUsers: number;
  pendingApprovals: number;
  totalImages: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  recentRegistrations: number;
}

const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const api = useApi();
  const [stats, setStats] = React.useState<AdminStats>({
    totalUsers: 0,
    pendingApprovals: 0,
    totalImages: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    expiredSubscriptions: 0,
    recentRegistrations: 0
  });
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    fetchAdminStats();
  }, []);
  
  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {t('admin.dashboardTitle')}
          </h1>
          <p className="text-default-600">
            {t('admin.dashboardDescription')}
          </p>
        </div>
        
        <Button
          as={RouterLink}
          to="/admin/users"
          color="primary"
          startContent={<Icon icon="lucide:users" />}
        >
          {t('admin.manageUsers')}
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardBody className="flex flex-col items-center text-center p-6">
                <div className="rounded-full bg-primary-100 p-3 mb-4">
                  <Icon icon="lucide:users" className="text-primary" width={24} height={24} />
                </div>
                <h3 className="text-xl font-semibold">{stats.totalUsers}</h3>
                <p className="text-default-600">{t('admin.totalUsers')}</p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="flex flex-col items-center text-center p-6">
                <div className="rounded-full bg-warning-100 p-3 mb-4">
                  <Icon icon="lucide:user-check" className="text-warning" width={24} height={24} />
                </div>
                <h3 className="text-xl font-semibold">{stats.pendingApprovals}</h3>
                <p className="text-default-600">{t('admin.pendingApprovals')}</p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="flex flex-col items-center text-center p-6">
                <div className="rounded-full bg-success-100 p-3 mb-4">
                  <Icon icon="lucide:image" className="text-success" width={24} height={24} />
                </div>
                <h3 className="text-xl font-semibold">{stats.totalImages}</h3>
                <p className="text-default-600">{t('admin.totalImages')}</p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="flex flex-col items-center text-center p-6">
                <div className="rounded-full bg-secondary-100 p-3 mb-4">
                  <Icon icon="lucide:credit-card" className="text-secondary" width={24} height={24} />
                </div>
                <h3 className="text-xl font-semibold">{stats.activeSubscriptions}</h3>
                <p className="text-default-600">{t('admin.activeSubscriptions')}</p>
              </CardBody>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">{t('admin.subscriptionOverview')}</h2>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-default-600">{t('admin.activeSubscriptions')}</span>
                    <span className="font-semibold">{stats.activeSubscriptions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-default-600">{t('admin.trialSubscriptions')}</span>
                    <span className="font-semibold">{stats.trialSubscriptions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-default-600">{t('admin.expiredSubscriptions')}</span>
                    <span className="font-semibold">{stats.expiredSubscriptions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-default-600">{t('admin.totalRevenue')}</span>
                    <span className="font-semibold">$1,234.56</span>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">{t('admin.quickActions')}</h2>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="space-y-4">
                  <Button
                    as={RouterLink}
                    to="/admin/users"
                    color="primary"
                    variant="flat"
                    startContent={<Icon icon="lucide:user-check" />}
                    className="w-full justify-start"
                  >
                    {t('admin.approveUsers')} ({stats.pendingApprovals})
                  </Button>
                  
                  <Button
                    color="secondary"
                    variant="flat"
                    startContent={<Icon icon="lucide:mail" />}
                    className="w-full justify-start"
                  >
                    {t('admin.sendNotifications')}
                  </Button>
                  
                  <Button
                    color="success"
                    variant="flat"
                    startContent={<Icon icon="lucide:download" />}
                    className="w-full justify-start"
                  >
                    {t('admin.exportUserData')}
                  </Button>
                  
                  <Button
                    color="warning"
                    variant="flat"
                    startContent={<Icon icon="lucide:settings" />}
                    className="w-full justify-start"
                  >
                    {t('admin.systemSettings')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h2 className="text-lg font-semibold">{t('admin.recentActivity')}</h2>
                <Button
                  variant="light"
                  size="sm"
                  endContent={<Icon icon="lucide:refresh-cw" width={16} />}
                  onPress={fetchAdminStats}
                >
                  {t('admin.refresh')}
                </Button>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary-100 p-2 mt-1">
                    <Icon icon="lucide:user-plus" className="text-primary" width={16} height={16} />
                  </div>
                  <div>
                    <p className="font-medium">{t('admin.newUserRegistrations')}</p>
                    <p className="text-small text-default-500">
                      {stats.recentRegistrations} {t('admin.newUsersToday')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-success-100 p-2 mt-1">
                    <Icon icon="lucide:image-plus" className="text-success" width={16} height={16} />
                  </div>
                  <div>
                    <p className="font-medium">{t('admin.newImagesUploaded')}</p>
                    <p className="text-small text-default-500">
                      {Math.floor(stats.totalImages * 0.1)} {t('admin.newImagesToday')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-secondary-100 p-2 mt-1">
                    <Icon icon="lucide:credit-card" className="text-secondary" width={16} height={16} />
                  </div>
                  <div>
                    <p className="font-medium">{t('admin.newSubscriptions')}</p>
                    <p className="text-small text-default-500">
                      {Math.floor(stats.activeSubscriptions * 0.05)} {t('admin.newSubscriptionsToday')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-warning-100 p-2 mt-1">
                    <Icon icon="lucide:alert-triangle" className="text-warning" width={16} height={16} />
                  </div>
                  <div>
                    <p className="font-medium">{t('admin.expiringTrials')}</p>
                    <p className="text-small text-default-500">
                      {Math.floor(stats.trialSubscriptions * 0.2)} {t('admin.trialsExpiringToday')}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;