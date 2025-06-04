import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/use-auth';
import { LanguageSwitcher } from '../components/language-switcher';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
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
              ImageShare <span className="text-danger ml-1">Admin</span>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={isActive('/admin')}>
            <Link as={RouterLink} to="/admin" color={isActive('/admin') ? 'primary' : 'foreground'}>
              {t('admin.dashboard')}
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isActive('/admin/users')}>
            <Link as={RouterLink} to="/admin/users" color={isActive('/admin/users') ? 'primary' : 'foreground'}>
              {t('admin.users')}
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
                    color="danger"
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem
                  key="dashboard"
                  startContent={<Icon icon="lucide:layout-dashboard" />}
                  as={RouterLink}
                  to="/dashboard"
                >
                  {t('nav.userDashboard')}
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
              to="/admin" 
              color={isActive('/admin') ? 'primary' : 'foreground'} 
              className="w-full" 
              size="lg"
            >
              {t('admin.dashboard')}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link 
              as={RouterLink} 
              to="/admin/users" 
              color={isActive('/admin/users') ? 'primary' : 'foreground'} 
              className="w-full" 
              size="lg"
            >
              {t('admin.users')}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link 
              as={RouterLink} 
              to="/dashboard" 
              color="foreground" 
              className="w-full" 
              size="lg"
            >
              {t('nav.userDashboard')}
            </Link>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;