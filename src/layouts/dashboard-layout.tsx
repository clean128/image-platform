import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Badge } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/use-auth';
import { LanguageSwitcher } from '../components/language-switcher';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
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
          <NavbarItem isActive={isActive('/dashboard')}>
            <Link as={RouterLink} to="/dashboard" color={isActive('/dashboard') ? 'primary' : 'foreground'}>
              {t('nav.dashboard')}
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isActive('/dashboard/upload')}>
            <Link as={RouterLink} to="/dashboard/upload" color={isActive('/dashboard/upload') ? 'primary' : 'foreground'}>
              {t('nav.upload')}
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isActive('/dashboard/images')}>
            <Link as={RouterLink} to="/dashboard/images" color={isActive('/dashboard/images') ? 'primary' : 'foreground'}>
              {t('nav.myImages')}
            </Link>
          </NavbarItem>
        </NavbarContent>
        
        <NavbarContent justify="end">
          <NavbarItem>
            <LanguageSwitcher />
          </NavbarItem>
          
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button 
                  variant="light" 
                  className="p-0"
                >
                  <Avatar
                    name={user?.username}
                    size="sm"
                    className="transition-transform"
                    isBordered
                    color={user?.isApproved ? "success" : "warning"}
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem
                  key="profile"
                  startContent={<Icon icon="lucide:user" />}
                  as={RouterLink}
                  to="/dashboard/profile"
                >
                  {t('nav.profile')}
                </DropdownItem>
                <DropdownItem
                  key="subscription"
                  startContent={<Icon icon="lucide:credit-card" />}
                  as={RouterLink}
                  to="/dashboard/subscription"
                  description={user?.subscriptionStatus === 'active' ? t('subscription.active') : t('subscription.inactive')}
                >
                  {t('nav.subscription')}
                </DropdownItem>
                <DropdownItem
                  key="gallery"
                  startContent={<Icon icon="lucide:image" />}
                  as={RouterLink}
                  to={`/gallery/${user?.username}`}
                >
                  {t('nav.myGallery')}
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<Icon icon="lucide:log-out" />}
                  onPress={logout}
                >
                  {t('auth.logout')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
        
        <NavbarMenu>
          <NavbarMenuItem>
            <Link 
              as={RouterLink} 
              to="/dashboard" 
              color={isActive('/dashboard') ? 'primary' : 'foreground'} 
              className="w-full" 
              size="lg"
            >
              {t('nav.dashboard')}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link 
              as={RouterLink} 
              to="/dashboard/upload" 
              color={isActive('/dashboard/upload') ? 'primary' : 'foreground'} 
              className="w-full" 
              size="lg"
            >
              {t('nav.upload')}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link 
              as={RouterLink} 
              to="/dashboard/images" 
              color={isActive('/dashboard/images') ? 'primary' : 'foreground'} 
              className="w-full" 
              size="lg"
            >
              {t('nav.myImages')}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link 
              as={RouterLink} 
              to="/dashboard/profile" 
              color={isActive('/dashboard/profile') ? 'primary' : 'foreground'} 
              className="w-full" 
              size="lg"
            >
              {t('nav.profile')}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link 
              as={RouterLink} 
              to="/dashboard/subscription" 
              color={isActive('/dashboard/subscription') ? 'primary' : 'foreground'} 
              className="w-full" 
              size="lg"
            >
              {t('nav.subscription')}
            </Link>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {!user?.isApproved && (
          <div className="mb-6">
            <Badge content="" color="warning" shape="rectangle" className="mb-4">
              <div className="bg-warning-50 text-warning-600 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon icon="lucide:alert-triangle" width={24} />
                  <div>
                    <h3 className="font-semibold">{t('dashboard.accountPendingApproval')}</h3>
                    <p className="text-sm mt-1">{t('dashboard.accountPendingApprovalMessage')}</p>
                  </div>
                </div>
              </div>
            </Badge>
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;