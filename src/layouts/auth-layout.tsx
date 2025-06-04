import React from 'react';
import { Link } from '@heroui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { LanguageSwitcher } from '../components/language-switcher';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-default-50">
      <header className="p-4 flex justify-between items-center">
        <Link as={RouterLink} to="/" className="font-bold text-inherit flex items-center">
          <Icon icon="lucide:image" className="mr-2" />
          ImageShare
        </Link>
        <LanguageSwitcher />
      </header>
      
      <main className="flex-grow flex items-center justify-center p-4">
        {children}
      </main>
      
      <footer className="p-4 text-center text-default-500 text-sm">
        &copy; {new Date().getFullYear()} ImageShare. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;