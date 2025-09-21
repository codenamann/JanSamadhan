import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CitizenAuthContext = createContext(undefined);

export const useCitizenAuth = () => {
  const context = useContext(CitizenAuthContext);
  if (context === undefined) {
    throw new Error('useCitizenAuth must be used within a CitizenAuthProvider');
  }
  return context;
};

export const CitizenAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('citizen_token');
    if (storedToken) {
      try {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        console.log(payload);
        if (payload.exp * 1000 > Date.now()) {
          setToken(storedToken);
          const newUser = {
            id: payload.id,
            name: payload.name,
            phone: payload.phone,
            role: payload.role
          }
          setUser(newUser);
        } else {
          // Token expired
          localStorage.removeItem('citizen_token');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('citizen_token');
        navigate('/citizen/login');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('citizen_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('citizen_token');
    navigate('/citizen/login');
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
    <CitizenAuthContext.Provider value={value}>
      {children}
    </CitizenAuthContext.Provider>
  );
};
