import React, { createContext, useContext, useState, useEffect } from 'react';
import { authorityOTPApi, authorityVerifyOTP, getAuthorityProfile } from '@/lib/apiCitizen';

const AuthorityAuthContext = createContext();

export const useAuthorityAuth = () => {
  const context = useContext(AuthorityAuthContext);
  if (!context) {
    throw new Error('useAuthorityAuth must be used within an AuthorityAuthProvider');
  }
  return context;
};

export const AuthorityAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authorityToken');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await getAuthorityProfile(token);
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('authorityToken');
      }
    } catch (error) {
      console.error('Error fetching authority profile:', error);
      localStorage.removeItem('authorityToken');
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (email) => {
    try {
      const response = await authorityOTPApi(email);
      return response;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await authorityVerifyOTP(email, otp);
      if (response.success) {
        localStorage.setItem('authorityToken', response.data.token);
        setUser(response.data.authority);
        setIsAuthenticated(true);
      }
      return response;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authorityToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem('authorityToken');
    if (token) {
      await fetchUserProfile(token);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    sendOTP,
    verifyOTP,
    logout,
    refreshProfile
  };

  return (
    <AuthorityAuthContext.Provider value={value}>
      {children}
    </AuthorityAuthContext.Provider>
  );
};