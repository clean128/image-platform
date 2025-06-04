import React from 'react';
import { Card, CardBody, CardHeader, CardFooter, Input, Button, Link, Checkbox, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/use-auth';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { register, isLoading } = useAuth();
  const history = useHistory();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
    fullName?: string;
    acceptTerms?: string;
    general?: string;
  }>({});
  
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('validation.emailInvalid');
    }
    
    if (!password) {
      newErrors.password = t('validation.passwordRequired');
    } else if (password.length < 8) {
      newErrors.password = t('validation.passwordTooShort');
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = t('validation.passwordsDoNotMatch');
    }
    
    if (!username) {
      newErrors.username = t('validation.usernameRequired');
    } else if (username.length < 3) {
      newErrors.username = t('validation.usernameTooShort');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = t('validation.usernameInvalid');
    }
    
    if (!fullName) {
      newErrors.fullName = t('validation.fullNameRequired');
    }
    
    if (!acceptTerms) {
      newErrors.acceptTerms = t('validation.acceptTermsRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await register({
        email,
        password,
        username,
        fullName,
        acceptTerms
      });
      
      // Redirect to login page after successful registration
      history.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        ...errors,
        general: t('auth.registrationFailed')
      });
    }
  };
  
  return (
    <Card className="max-w-md w-full">
      <CardHeader className="flex flex-col gap-1 items-center">
        <h1 className="text-2xl font-bold">{t('auth.createAccount')}</h1>
        <p className="text-default-500">{t('auth.registerToContinue')}</p>
      </CardHeader>
      <Divider />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-danger-50 text-danger p-3 rounded-md text-sm">
              {errors.general}
            </div>
          )}
          
          <Input
            label={t('auth.email')}
            placeholder={t('auth.enterEmail')}
            type="email"
            value={email}
            onValueChange={setEmail}
            isInvalid={!!errors.email}
            errorMessage={errors.email}
            startContent={<Icon icon="lucide:mail" className="text-default-400" />}
          />
          
          <Input
            label={t('auth.username')}
            placeholder={t('auth.enterUsername')}
            value={username}
            onValueChange={setUsername}
            isInvalid={!!errors.username}
            errorMessage={errors.username}
            startContent={<Icon icon="lucide:at-sign" className="text-default-400" />}
          />
          
          <Input
            label={t('auth.fullName')}
            placeholder={t('auth.enterFullName')}
            value={fullName}
            onValueChange={setFullName}
            isInvalid={!!errors.fullName}
            errorMessage={errors.fullName}
            startContent={<Icon icon="lucide:user" className="text-default-400" />}
          />
          
          <Input
            label={t('auth.password')}
            placeholder={t('auth.enterPassword')}
            type="password"
            value={password}
            onValueChange={setPassword}
            isInvalid={!!errors.password}
            errorMessage={errors.password}
            startContent={<Icon icon="lucide:lock" className="text-default-400" />}
          />
          
          <Input
            label={t('auth.confirmPassword')}
            placeholder={t('auth.enterConfirmPassword')}
            type="password"
            value={confirmPassword}
            onValueChange={setConfirmPassword}
            isInvalid={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
            startContent={<Icon icon="lucide:lock" className="text-default-400" />}
          />
          
          <div>
            <Checkbox 
              isSelected={acceptTerms} 
              onValueChange={setAcceptTerms}
              isInvalid={!!errors.acceptTerms}
            >
              {t('auth.acceptTerms')}{' '}
              <Link href="#" isExternal>
                {t('auth.termsOfService')}
              </Link>{' '}
              {t('auth.and')}{' '}
              <Link href="#" isExternal>
                {t('auth.privacyPolicy')}
              </Link>
            </Checkbox>
            {errors.acceptTerms && (
              <p className="text-danger text-xs mt-1">{errors.acceptTerms}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            color="primary" 
            className="w-full" 
            isLoading={isLoading}
          >
            {t('auth.register')}
          </Button>
        </form>
      </CardBody>
      <Divider />
      <CardFooter className="flex justify-center">
        <p>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link as={RouterLink} to="/login" color="primary">
            {t('auth.login')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterPage;