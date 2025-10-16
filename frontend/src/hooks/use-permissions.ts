'use client';

import { useCallback } from 'react';
import { UserRole } from '@/types';
import { 
  Permission, 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission,
  getPermissionsForRole
} from '@/lib/auth/permissions';

/**
 * Custom hook for checking user permissions
 * @param userRole The user's role
 * @returns Object with permission checking functions
 */
export function usePermissions(userRole: UserRole) {
  const can = useCallback(
    (permission: Permission) => hasPermission(userRole, permission),
    [userRole]
  );
  
  const canAll = useCallback(
    (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
    [userRole]
  );
  
  const canAny = useCallback(
    (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    [userRole]
  );
  
  const getAllPermissions = useCallback(
    () => getPermissionsForRole(userRole),
    [userRole]
  );
  
  return {
    can,
    canAll,
    canAny,
    getAllPermissions,
    role: userRole
  };
}