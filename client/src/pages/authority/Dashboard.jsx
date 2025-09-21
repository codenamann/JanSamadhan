import React from 'react';
import Dashboard from '@/pages/Dashboard';
import { useAuthorityAuth } from '@/context/AuthorityAuthContext';

const AuthorityDashboard = () => {
  const { user, logout } = useAuthorityAuth();
  
  // Pass auth context to the main Dashboard component
  return <Dashboard user={user} onLogout={logout} />;
};

export default AuthorityDashboard;


