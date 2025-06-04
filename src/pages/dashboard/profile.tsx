// New profile page component
import React from 'react';
import { Card, CardBody, CardHeader, CardFooter, Input, Button, Divider, Avatar, Tabs, Tab } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/use-auth';
import { useApi } from '../../hooks/use-api';
import { addToast } from '@heroui/react';

interface ProfileData {
  fullName: string;
  email: string;
  username: string;
  bio: string;
  website: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const api = useApi();
  const [loading, setLoading] = React.useState(false);
  const [profileData, setProfileData] = React.useState<ProfileData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || '',
    bio: '',
    website: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: ''
    }
  });
  const [passwordData, setPasswordData] = React.useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = React.useState<{
    profile?: Record<string, string>;
    password?: Record<string, string>;
  }>({});
  
  React.useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);
  
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      
      setProfileData({
        ...profileData,
        ...response.data,
        socialLinks: {
          ...profileData.socialLinks,
          ...response.data.socialLinks
        }
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      addToast({
        title: t('profile.fetchError'),
        description: t('profile.fetchErrorMessage'),
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };
  
  const handleSocialLinkChange = (platform: keyof ProfileData['socialLinks'], value: string) => {
    setProfileData({
      ...profileData,
      socialLinks: {
        ...profileData.socialLinks,
        [platform]: value
      }
    });
  };
  
  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData({
      ...passwordData,
      [field]: value
    });
  };
  
  const validateProfileData = () => {
    const newErrors: Record<string, string> = {};
    
    if (!profileData.fullName) {
      newErrors.fullName = t('validation.fullNameRequired');
    }
    
    if (!profileData.email) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }
    
    if (!profileData.username) {
      newErrors.username = t('validation.usernameRequired');
    } else if (profileData.username.length < 3) {
      newErrors.username = t('validation.usernameTooShort');
    } else if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
      newErrors.username = t('validation.usernameInvalid');
    }
    
    if (profileData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(profileData.website)) {
      newErrors.website = t('validation.websiteInvalid');
    }
    
    setErrors({ ...errors, profile: Object.keys(newErrors).length > 0 ? newErrors : undefined });
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePasswordData = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = t('validation.currentPasswordRequired');
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = t('validation.newPasswordRequired');
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = t('validation.passwordTooShort');
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      newErrors.confirmPassword = t('validation.passwordsDoNotMatch');
    }
    
    setErrors({ ...errors, password: Object.keys(newErrors).length > 0 ? newErrors : undefined });
    return Object.keys(newErrors).length === 0;
  };
  
  const handleUpdateProfile = async () => {
    if (!validateProfileData()) {
      return;
    }
    
    try {
      setLoading(true);
      
      await api.put('/users/profile', {
        fullName: profileData.fullName,
        email: profileData.email,
        username: profileData.username,
        bio: profileData.bio,
        website: profileData.website,
        socialLinks: profileData.socialLinks
      });
      
      addToast({
        title: t('profile.updateSuccess'),
        description: t('profile.profileUpdatedSuccessfully'),
        color: 'success'
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      const errorMessage = error.response?.data?.message || t('profile.updateError');
      addToast({
        title: t('profile.updateFailed'),
        description: errorMessage,
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePassword = async () => {
    if (!validatePasswordData()) {
      return;
    }
    
    try {
      setLoading(true);
      
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      addToast({
        title: t('profile.passwordUpdateSuccess'),
        description: t('profile.passwordUpdatedSuccessfully'),
        color: 'success'
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      const errorMessage = error.response?.data?.message || t('profile.passwordUpdateError');
      addToast({
        title: t('profile.passwordUpdateFailed'),
        description: errorMessage,
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-3/4">
          <Tabs aria-label="Profile tabs">
            <Tab key="profile" title={t('profile.personalInfo')}>
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">{t('profile.personalInfo')}</h2>
                </CardHeader>
                <Divider />
                <CardBody className="space-y-4">
                  <Input
                    label={t('profile.fullName')}
                    placeholder={t('profile.enterFullName')}
                    value={profileData.fullName}
                    onValueChange={(value) => handleProfileChange('fullName', value)}
                    isInvalid={!!errors.profile?.fullName}
                    errorMessage={errors.profile?.fullName}
                  />
                  
                  <Input
                    label={t('profile.email')}
                    placeholder={t('profile.enterEmail')}
                    type="email"
                    value={profileData.email}
                    onValueChange={(value) => handleProfileChange('email', value)}
                    isInvalid={!!errors.profile?.email}
                    errorMessage={errors.profile?.email}
                  />
                  
                  <Input
                    label={t('profile.username')}
                    placeholder={t('profile.enterUsername')}
                    value={profileData.username}
                    onValueChange={(value) => handleProfileChange('username', value)}
                    isInvalid={!!errors.profile?.username}
                    errorMessage={errors.profile?.username}
                    description={t('profile.usernameDescription')}
                  />
                  
                  <Input
                    label={t('profile.bio')}
                    placeholder={t('profile.enterBio')}
                    value={profileData.bio}
                    onValueChange={(value) => handleProfileChange('bio', value)}
                    isInvalid={!!errors.profile?.bio}
                    errorMessage={errors.profile?.bio}
                  />
                  
                  <Input
                    label={t('profile.website')}
                    placeholder={t('profile.enterWebsite')}
                    value={profileData.website}
                    onValueChange={(value) => handleProfileChange('website', value)}
                    isInvalid={!!errors.profile?.website}
                    errorMessage={errors.profile?.website}
                    startContent={<Icon icon="lucide:globe" className="text-default-400" />}
                  />
                </CardBody>
                <Divider />
                <CardFooter>
                  <Button
                    color="primary"
                    onPress={handleUpdateProfile}
                    isLoading={loading}
                  >
                    {t('profile.saveChanges')}
                  </Button>
                </CardFooter>
              </Card>
            </Tab>
            
            <Tab key="social" title={t('profile.socialLinks')}>
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">{t('profile.socialLinks')}</h2>
                </CardHeader>
                <Divider />
                <CardBody className="space-y-4">
                  <Input
                    label="Facebook"
                    placeholder={t('profile.enterFacebookUrl')}
                    value={profileData.socialLinks.facebook}
                    onValueChange={(value) => handleSocialLinkChange('facebook', value)}
                    startContent={<Icon icon="logos:facebook" className="text-default-400" width={20} />}
                  />
                  
                  <Input
                    label="Twitter"
                    placeholder={t('profile.enterTwitterUrl')}
                    value={profileData.socialLinks.twitter}
                    onValueChange={(value) => handleSocialLinkChange('twitter', value)}
                    startContent={<Icon icon="logos:twitter" className="text-default-400" width={20} />}
                  />
                  
                  <Input
                    label="Instagram"
                    placeholder={t('profile.enterInstagramUrl')}
                    value={profileData.socialLinks.instagram}
                    onValueChange={(value) => handleSocialLinkChange('instagram', value)}
                    startContent={<Icon icon="logos:instagram-icon" className="text-default-400" width={20} />}
                  />
                </CardBody>
                <Divider />
                <CardFooter>
                  <Button
                    color="primary"
                    onPress={handleUpdateProfile}
                    isLoading={loading}
                  >
                    {t('profile.saveChanges')}
                  </Button>
                </CardFooter>
              </Card>
            </Tab>
            
            <Tab key="password" title={t('profile.changePassword')}>
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">{t('profile.changePassword')}</h2>
                </CardHeader>
                <Divider />
                <CardBody className="space-y-4">
                  <Input
                    label={t('profile.currentPassword')}
                    placeholder={t('profile.enterCurrentPassword')}
                    type="password"
                    value={passwordData.currentPassword}
                    onValueChange={(value) => handlePasswordChange('currentPassword', value)}
                    isInvalid={!!errors.password?.currentPassword}
                    errorMessage={errors.password?.currentPassword}
                  />
                  
                  <Input
                    label={t('profile.newPassword')}
                    placeholder={t('profile.enterNewPassword')}
                    type="password"
                    value={passwordData.newPassword}
                    onValueChange={(value) => handlePasswordChange('newPassword', value)}
                    isInvalid={!!errors.password?.newPassword}
                    errorMessage={errors.password?.newPassword}
                  />
                  
                  <Input
                    label={t('profile.confirmNewPassword')}
                    placeholder={t('profile.enterConfirmNewPassword')}
                    type="password"
                    value={passwordData.confirmPassword}
                    onValueChange={(value) => handlePasswordChange('confirmPassword', value)}
                    isInvalid={!!errors.password?.confirmPassword}
                    errorMessage={errors.password?.confirmPassword}
                  />
                </CardBody>
                <Divider />
                <CardFooter>
                  <Button
                    color="primary"
                    onPress={handleUpdatePassword}
                    isLoading={loading}
                  >
                    {t('profile.updatePassword')}
                  </Button>
                </CardFooter>
              </Card>
            </Tab>
          </Tabs>
        </div>
        
        <div className="w-full md:w-1/4">
          <Card>
            <CardBody className="flex flex-col items-center text-center p-6">
              <Avatar
                name={user?.username}
                size="lg"
                className="mb-4"
                isBordered
                color={user?.isApproved ? "success" : "warning"}
              />
              
              <h3 className="text-lg font-semibold">{user?.fullName || user?.username}</h3>
              <p className="text-default-500">{user?.email}</p>
              
              <div className="mt-4 w-full">
                <p className="text-small text-default-500 mb-2">{t('profile.accountStatus')}</p>
                <div className={`text-sm font-medium px-2 py-1 rounded-md ${
                  user?.isApproved 
                    ? 'bg-success-100 text-success-600' 
                    : 'bg-warning-100 text-warning-600'
                }`}>
                  {user?.isApproved ? t('profile.approved') : t('profile.pendingApproval')}
                </div>
              </div>
              
              <div className="mt-4 w-full">
                <p className="text-small text-default-500 mb-2">{t('profile.role')}</p>
                <div className="text-sm font-medium px-2 py-1 rounded-md bg-primary-100 text-primary-600">
                  {user?.role === 'admin' ? t('profile.admin') : t('profile.user')}
                </div>
              </div>
              
              <div className="mt-4 w-full">
                <p className="text-small text-default-500 mb-2">{t('profile.galleryLink')}</p>
                <div className="flex items-center gap-2 p-2 bg-default-100 rounded-md">
                  <p className="text-tiny text-default-600 truncate">
                    /gallery/{user?.username}
                  </p>
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
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;