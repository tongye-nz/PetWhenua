import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingSpinner } from '../../ui';
import { isMeetupAdmin } from '../../../utils/userRoles';
import type { ReactNode } from 'react';

interface MeetupAdminRouteProps {
  children: ReactNode;
}

const MeetupAdminRoute: React.FC<MeetupAdminRouteProps> = ({ children }) => {
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

  // Redirect to home if not meetup admin or site admin
  if (!user || !isMeetupAdmin(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Render meetup admin content
  return <>{children}</>;
};

export default MeetupAdminRoute; 