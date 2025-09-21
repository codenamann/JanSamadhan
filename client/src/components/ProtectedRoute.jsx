import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCitizenAuth } from '@/context/CitizenAuthContext';
import { useAuthorityAuth } from '@/context/AuthorityAuthContext';

const ProtectedRoute = ({ children, role }) => {
  const location = useLocation();
  const citizenAuth = useCitizenAuth();
  const authorityAuth = useAuthorityAuth();

  // Show loading spinner while checking authentication
  if (citizenAuth.loading || authorityAuth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated based on role
  const isAuthenticated = role === 'citizen' 
    ? citizenAuth.isAuthenticated 
    : authorityAuth.isAuthenticated;

  if (!isAuthenticated) {
    // Redirect to appropriate login page
    const loginPath = role === 'citizen' ? '/citizen/login' : '/authority/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
