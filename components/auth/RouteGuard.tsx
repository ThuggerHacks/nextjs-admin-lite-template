import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireDepartment?: boolean;
  redirectTo?: string;
}

export default function RouteGuard({ 
  children, 
  allowedRoles = [], 
  requireDepartment = false,
  redirectTo = '/profile'
}: RouteGuardProps) {
  const { user, hasRole } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user has required role
    if (allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        router.push(redirectTo);
        return;
      }
    }

    // Check if user has department when required
    if (requireDepartment && !user.departmentId) {
      router.push('/profile');
      return;
    }
  }, [user, allowedRoles, requireDepartment, redirectTo, router, hasRole]);

  if (!user) {
    return null;
  }

  // Check if user has required role
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return null;
    }
  }

  // Check if user has department when required
  if (requireDepartment && !user.departmentId) {
    return null;
  }

  return <>{children}</>;
}

// Role-based route guards
export const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <RouteGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]}>
    {children}
  </RouteGuard>
);

export const SupervisorRoute = ({ children }: { children: React.ReactNode }) => (
  <RouteGuard allowedRoles={[UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]}>
    {children}
  </RouteGuard>
);

export const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => (
  <RouteGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.DEVELOPER]}>
    {children}
  </RouteGuard>
);

export const DeveloperRoute = ({ children }: { children: React.ReactNode }) => (
  <RouteGuard allowedRoles={[UserRole.DEVELOPER]}>
    {children}
  </RouteGuard>
);

export const DepartmentRoute = ({ children }: { children: React.ReactNode }) => (
  <RouteGuard requireDepartment={true}>
    {children}
  </RouteGuard>
);
