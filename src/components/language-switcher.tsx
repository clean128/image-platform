import React from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', icon: 'logos:usa-flag' },
    { code: 'de', name: 'Deutsch', icon: 'logos:germany-flag' },
    { code: 'ar', name: 'العربية', icon: 'logos:saudi-arabia-flag' }
  ];
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    
    // Add RTL support for Arabic
    if (langCode === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };
  
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          variant="light" 
          startContent={<Icon icon={currentLanguage.icon} width={20} height={20} />}
          endContent={<Icon icon="lucide:chevron-down" width={16} height={16} />}
        >
          {currentLanguage.name}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Language selection">
        {languages.map((language) => (
          <DropdownItem
            key={language.code}
            startContent={<Icon icon={language.icon} width={20} height={20} />}
            onPress={() => handleLanguageChange(language.code)}
            className={i18n.language === language.code ? 'text-primary' : ''}
          >
            {language.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};