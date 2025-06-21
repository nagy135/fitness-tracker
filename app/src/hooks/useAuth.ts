'use client';

import { useState, useEffect } from 'react';
import { AuthService, LoginCredentials } from '@/lib/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(credentials);
      AuthService.saveToken(response.accessToken);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.removeToken();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
} 