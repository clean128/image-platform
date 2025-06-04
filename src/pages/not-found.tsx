// New 404 page component
import React from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-8">
        <Icon icon="lucide:file-question" className="text-default-400" width={80} height={80} />
      </div>
      
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">{t('notFound.title')}</h2>
      <p className="text-default-600 max-w-md mb-8">
        {t('notFound.description')}
      </p>
      
      <div className="flex gap-4">
        <Button
          as={RouterLink}
          to="/"
          color="primary"
          startContent={<Icon icon="lucide:home" />}
        >
          {t('notFound.goHome')}
        </Button>
        
        <Button
          variant="flat"
          startContent={<Icon icon="lucide:help-circle" />}
        >
          {t('notFound.getHelp')}
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;