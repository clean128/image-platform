import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/use-auth';
import { LanguageSwitcher } from '../components/language-switcher';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const history = useHistory();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isBordered>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <Link as={RouterLink} to="/" className="font-bold text-inherit">
              <Icon icon="lucide:image" className="mr-2" />
              ImageShare
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link as={RouterLink} to="/" color="foreground">
              {t('nav.home')}
            </Link>
          </NavbarItem>
          {isAuthenticated && (
            <NavbarItem>
              <Link as={RouterLink} to="/dashboard" color="foreground">
                {t('nav.dashboard')}
              </Link>
            </NavbarItem>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <NavbarItem>
              <Link as={RouterLink} to="/admin" color="foreground">
                {t('nav.admin')}
              </Link>
            </NavbarItem>
          )}
        </NavbarContent>
        
        <NavbarContent justify="end">
          <NavbarItem>
            <LanguageSwitcher />
          </NavbarItem>
          
          {isAuthenticated ? (
            <NavbarItem>
              <Button 
                color="danger" 
                variant="flat"
                onPress={() => {
                  logout();
                  history.push('/');
                }}
              >
                {t('auth.logout')}
              </Button>
            </NavbarItem>
          ) : (
            <>
              <NavbarItem className="hidden sm:flex">
                <Link as={RouterLink} to="/login" color="foreground">
                  {t('auth.login')}
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Button as={RouterLink} to="/register" color="primary" variant="flat">
                  {t('auth.register')}
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
        
        <NavbarMenu>
          <NavbarMenuItem>
            <Link as={RouterLink} to="/" color="foreground" className="w-full" size="lg">
              {t('nav.home')}
            </Link>
          </NavbarMenuItem>
          {isAuthenticated && (
            <NavbarMenuItem>
              <Link as={RouterLink} to="/dashboard" color="foreground" className="w-full" size="lg">
                {t('nav.dashboard')}
              </Link>
            </NavbarMenuItem>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <NavbarMenuItem>
              <Link as={RouterLink} to="/admin" color="foreground" className="w-full" size="lg">
                {t('nav.admin')}
              </Link>
            </NavbarMenuItem>
          )}
          {!isAuthenticated && (
            <NavbarMenuItem>
              <Link as={RouterLink} to="/login" color="foreground" className="w-full" size="lg">
                {t('auth.login')}
              </Link>
            </NavbarMenuItem>
          )}
        </NavbarMenu>
      </Navbar>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-content1 py-8 border-t border-divider">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.about')}</h3>
              <p className="text-default-600">
                {t('footer.aboutText')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.links')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" color="foreground">{t('footer.termsOfService')}</Link>
                </li>
                <li>
                  <Link href="#" color="foreground">{t('footer.privacyPolicy')}</Link>
                </li>
                <li>
                  <Link href="#" color="foreground">{t('footer.gdprCompliance')}</Link>
                </li>
                <li>
                  <Link href="#" color="foreground">{t('footer.contact')}</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.followUs')}</h3>
              <div className="flex space-x-4">
                <Link href="#" isExternal>
                  <Icon icon="logos:facebook" width={24} height={24} />
                </Link>
                <Link href="#" isExternal>
                  <Icon icon="logos:twitter" width={24} height={24} />
                </Link>
                <Link href="#" isExternal>
                  <Icon icon="logos:instagram-icon" width={24} height={24} />
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-divider text-center text-default-500">
            <p>&copy; {new Date().getFullYear()} ImageShare. {t('footer.allRightsReserved')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;