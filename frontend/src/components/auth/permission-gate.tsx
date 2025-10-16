'use client';

import { ReactNode } from 'react';
import { UserRole } from '@/types';
import { Permission, hasPermission, hasAllPermissions, hasAnyPermission } from '@/lib/auth/permissions';

interface PermissionGateProps {
  /**
   * The user's role
   */
  userRole: UserRole;
  
  /**
   * A single permission to check
   */
  permission?: Permission;
  
  /**
   * Multiple permissions to check (all must be satisfied)
   */
  permissions?: Permission[];
  
  /**
   * Multiple permissions to check (any one can be satisfied)
   */
  anyPermission?: Permission[];
  
  /**
   * Content to render if the user has the required permissions
   */
  children: ReactNode;
  
  /**
   * Optional content to render if the user doesn't have the required permissions
   */
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders content based on user permissions
 */
export function PermissionGate({
  userRole,
  permission,
  permissions,
  anyPermission,
  children,
  fallback = null,
}: PermissionGateProps) {
  // Check if the user has the required permissions
  const hasAccess = () => {
    if (permission) {
      return hasPermission(userRole, permission);
    }
    
    if (permissions && permissions.length > 0) {
      return hasAllPermissions(userRole, permissions);
    }
    
    if (anyPermission && anyPermission.length > 0) {
      return hasAnyPermission(userRole, anyPermission);
    }
    
    // If no permission checks are specified, allow access by default
    return true;
  };
  
  // Render the children if the user has access, otherwise render the fallback
  return hasAccess() ? <>{children}</> : <>{fallback}</>;
}