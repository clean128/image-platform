import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useAuth } from './hooks/use-auth';
import { useTranslation } from 'react-i18next';

// Layouts
import MainLayout from './layouts/main-layout';
import AuthLayout from './layouts/auth-layout';
import DashboardLayout from './layouts/dashboard-layout';
import AdminLayout from './layouts/admin-layout';

// Pages
import HomePage from './pages/home';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import ForgotPasswordPage from './pages/auth/forgot-password';
import ResetPasswordPage from './pages/auth/reset-password';
import DashboardPage from './pages/dashboard';
import UploadPage from './pages/dashboard/upload';
import ImagesPage from './pages/dashboard/images';
import ProfilePage from './pages/dashboard/profile';
import SubscriptionPage from './pages/dashboard/subscription';
import AdminDashboardPage from './pages/admin/dashboard';
import AdminUsersPage from './pages/admin/users';
import UserGalleryPage from './pages/gallery';
import NotFoundPage from './pages/not-found';

// Route guards
const PrivateRoute = ({ component: Component, layout: Layout, ...rest }: any) => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Layout>
            <Component {...props} />
          </Layout>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

const AdminRoute = ({ component: Component, layout: Layout, ...rest }: any) => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated && user?.role === 'admin' ? (
          <Layout>
            <Component {...props} />
          </Layout>
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

const PublicRoute = ({ component: Component, layout: Layout, ...rest }: any) => {
  return (
    <Route
      {...rest}
      render={(props) => (
        <Layout>
          <Component {...props} />
        </Layout>
      )}
    />
  );
};

function App() {
  const { i18n } = useTranslation();
  
  return (
    <div className={i18n.language === 'ar' ? 'rtl-support' : ''}>
      <Switch>
        {/* Public routes */}
        <PublicRoute exact path="/" component={HomePage} layout={MainLayout} />
        <PublicRoute path="/login" component={LoginPage} layout={AuthLayout} />
        <PublicRoute path="/register" component={RegisterPage} layout={AuthLayout} />
        <PublicRoute path="/forgot-password" component={ForgotPasswordPage} layout={AuthLayout} />
        <PublicRoute path="/reset-password" component={ResetPasswordPage} layout={AuthLayout} />
        <PublicRoute path="/gallery/:username" component={UserGalleryPage} layout={MainLayout} />
        
        {/* User routes */}
        <PrivateRoute exact path="/dashboard" component={DashboardPage} layout={DashboardLayout} />
        <PrivateRoute path="/dashboard/upload" component={UploadPage} layout={DashboardLayout} />
        <PrivateRoute path="/dashboard/images" component={ImagesPage} layout={DashboardLayout} />
        <PrivateRoute path="/dashboard/profile" component={ProfilePage} layout={DashboardLayout} />
        <PrivateRoute path="/dashboard/subscription" component={SubscriptionPage} layout={DashboardLayout} />
        
        {/* Admin routes */}
        <AdminRoute exact path="/admin" component={AdminDashboardPage} layout={AdminLayout} />
        <AdminRoute path="/admin/users" component={AdminUsersPage} layout={AdminLayout} />
        
        {/* 404 route */}
        <PublicRoute component={NotFoundPage} layout={MainLayout} />
      </Switch>
    </div>
  );
}

export default App;