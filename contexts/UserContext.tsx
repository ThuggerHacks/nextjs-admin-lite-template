'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '@/types';
import { authService } from '@/lib/services/authService';
import { apiService } from '@/lib/axios';

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  canAccess: (roles: UserRole[]) => boolean;
  canAccessRoute: (route: string) => boolean;
  getAllUsers: () => Promise<User[]>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// TODO: Replace with actual API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored auth on mount and initialize locale
  useEffect(() => {
    const initializeApp = async () => {
      // Set locale from localStorage or default to 'en'
      const storedLocale = localStorage.getItem('locale') || 'en';
      apiService.setLocale(storedLocale);

      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // Set token in axios instance
        apiService.setAuthToken(storedToken);

        // Validate token with backend and fetch user data
        await validateToken(storedToken);
      } else {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const validateToken = async (token: string) => {
    try {
      console.log('Validating token...');
      const isValid = await authService.verifyToken();
      if (isValid) {
        console.log('Token is valid, fetching user profile...');
        const userData = await authService.getProfile();
        console.log('User profile fetched:', userData);

        // Store user data and set current sucursal
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        if (userData.sucursal) {
          apiService.setCurrentSucursal(userData.sucursal);
        }
      } else {
        console.log('Token is invalid, clearing storage');
        logout();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setLoading(true);

      const response = await authService.login({ email, password });

      // Store user data and token (token is already stored in axios instance)
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      // Set current sucursal info if available
      if (response.user.sucursal) {
        apiService.setCurrentSucursal(response.user.sucursal);
      }

      console.log('Login successful, user set:', response.user);

      return { success: true, user: response.user };
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      // Clear all stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentSucursal');

      // Clear axios instance data
      apiService.clearAuthToken();

      setUser(null);
      console.log('Logout completed, all data cleared');
    }
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === UserRole.SUPER_ADMIN) return true;
    
    // Developer has all permissions  
    if (user.role === UserRole.DEVELOPER) return true;
    
    // Admin has admin, supervisor and user permissions
    if (user.role === UserRole.ADMIN && (role === UserRole.ADMIN || role === UserRole.SUPERVISOR || role === UserRole.USER)) {
      return true;
    }
    
    // Supervisor has supervisor and user permissions
    if (user.role === UserRole.SUPERVISOR && (role === UserRole.SUPERVISOR || role === UserRole.USER)) {
      return true;
    }
    
    // User only has user permissions
    return user.role === role;
  };

  const canAccess = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.some(role => hasRole(role));
  };

  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;

    // Define role-based route access
    const routePermissions: Record<string, UserRole[]> = {
      '/management/dashboard': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEVELOPER],
      '/management/users': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEVELOPER],
      '/management/requests': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DEVELOPER],
      '/departments': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DEVELOPER],
      '/reports': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DEVELOPER],
      '/goals': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.USER, UserRole.DEVELOPER],
      '/documents': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.USER, UserRole.DEVELOPER],
      '/libraries': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.USER, UserRole.DEVELOPER],
      '/scanner': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.USER, UserRole.DEVELOPER],
      '/digitalize': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.USER, UserRole.DEVELOPER],
      '/sucursals': [UserRole.SUPER_ADMIN, UserRole.DEVELOPER],
      '/homepage': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.USER, UserRole.DEVELOPER],
      '/profile': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.USER, UserRole.DEVELOPER],
      '/notifications': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.USER, UserRole.DEVELOPER],
    };

    const allowedRoles = routePermissions[route];
    if (!allowedRoles) return true; // Allow access to undefined routes by default

    return allowedRoles.includes(user.role);
  };

  const getDefaultRoute = (userRole: UserRole): string => {
    switch (userRole) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return '/management/dashboard';
      case UserRole.DEVELOPER:
        return '/management/dashboard';
      case UserRole.SUPERVISOR:
        return '/departments';
      case UserRole.USER:
      default:
        return '/homepage';
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.users;
      }
      
      return [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      return response.ok;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      hasRole,
      canAccess,
      canAccessRoute,
      getAllUsers,
      updateUser,
      deleteUser,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
