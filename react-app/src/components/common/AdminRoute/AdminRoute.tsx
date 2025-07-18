import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingSpinner } from '../../ui';
import { isAdmin } from '../../../utils/userRoles';
import type { ReactNode } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <LoadingSpinner 
        size="large"
        centered
        containerProps={{ minHeight: "60vh" }}
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if not admin
  if (!user || !isAdmin(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Render admin content
  return <>{children}</>;
};

export default AdminRoute; 