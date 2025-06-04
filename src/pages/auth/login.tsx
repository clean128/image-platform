import React from 'react';
import { Card, CardBody, CardHeader, CardFooter, Input, Button, Link, Checkbox, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/use-auth';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  
  // Get redirect path from location state or default to dashboard
  const { from } = (location.state as { from?: { pathname: string } }) || { 
    from: { pathname: '/dashboard' } 
  };
  
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('validation.emailInvalid');
    }
    
    if (!password) {
      newErrors.password = t('validation.passwordRequired');
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
      await login(email, password);
      history.replace(from);
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        ...errors,
        general: t('auth.invalidCredentials')
      });
    }
  };
  
  return (
    <Card className="max-w-md w-full">
      <CardHeader className="flex flex-col gap-1 items-center">
        <h1 className="text-2xl font-bold">{t('auth.welcomeBack')}</h1>
        <p className="text-default-500">{t('auth.loginToContinue')}</p>
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
            label={t('auth.password')}
            placeholder={t('auth.enterPassword')}
            type="password"
            value={password}
            onValueChange={setPassword}
            isInvalid={!!errors.password}
            errorMessage={errors.password}
            startContent={<Icon icon="lucide:lock" className="text-default-400" />}
          />
          
          <div className="flex justify-between items-center">
            <Checkbox isSelected={rememberMe} onValueChange={setRememberMe}>
              {t('auth.rememberMe')}
            </Checkbox>
            <Link as={RouterLink} to="/forgot-password" size="sm">
              {t('auth.forgotPassword')}
            </Link>
          </div>
          
          <Button 
            type="submit" 
            color="primary" 
            className="w-full" 
            isLoading={isLoading}
          >
            {t('auth.login')}
          </Button>
        </form>
      </CardBody>
      <Divider />
      <CardFooter className="flex justify-center">
        <p>
          {t('auth.dontHaveAccount')}{' '}
          <Link as={RouterLink} to="/register" color="primary">
            {t('auth.register')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginPage;