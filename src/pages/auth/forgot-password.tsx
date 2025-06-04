import React from 'react';
import { Card, CardBody, CardHeader, CardFooter, Input, Button, Link, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/use-auth';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { forgotPassword, isLoading } = useAuth();
  const history = useHistory();
  const [email, setEmail] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    email?: string;
    general?: string;
  }>({});
  
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('validation.emailInvalid');
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
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({
        ...errors,
        general: t('auth.forgotPasswordFailed')
      });
    }
  };
  
  return (
    <Card className="max-w-md w-full">
      <CardHeader className="flex flex-col gap-1 items-center">
        <h1 className="text-2xl font-bold">{t('auth.forgotPassword')}</h1>
        <p className="text-default-500">{t('auth.forgotPasswordDescription')}</p>
      </CardHeader>
      <Divider />
      <CardBody>
        {isSubmitted ? (
          <div className="text-center py-4">
            <Icon icon="lucide:mail-check" className="text-success w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('auth.checkYourEmail')}</h2>
            <p className="text-default-600 mb-4">
              {t('auth.passwordResetEmailSent', { email })}
            </p>
            <Button 
              as={RouterLink} 
              to="/login" 
              color="primary" 
              variant="flat"
            >
              {t('auth.backToLogin')}
            </Button>
          </div>
        ) : (
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
            
            <Button 
              type="submit" 
              color="primary" 
              className="w-full" 
              isLoading={isLoading}
            >
              {t('auth.resetPassword')}
            </Button>
          </form>
        )}
      </CardBody>
      <Divider />
      <CardFooter className="flex justify-center">
        <p>
          {t('auth.rememberedPassword')}{' '}
          <Link as={RouterLink} to="/login" color="primary">
            {t('auth.login')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordPage;