import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthorityAuthContext = createContext(undefined);

export const useAuthorityAuth = () => {
  const context = useContext(AuthorityAuthContext);
  if (context === undefined) {
    throw new Error('useAuthorityAuth must be used within an AuthorityAuthProvider');
  }
  return context;
};

export const AuthorityAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authority_token');
    if (storedToken) {
      try {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({
            id: payload.id,
            name: payload.name,
            email: payload.email,
            department: payload.department,
            role: payload.role
          });
        } else {
          // Token expired
          localStorage.removeItem('authority_token');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('authority_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('authority_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authority_token');
    navigate('/authority/login');
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    getAuthHeaders
  };

  return (
    <AuthorityAuthContext.Provider value={value}>
      {children}
    </AuthorityAuthContext.Provider>
  );
};
