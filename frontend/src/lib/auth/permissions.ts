import { UserRole } from '@/types';

// Define permission types
export type Permission = 
  // Leave management permissions
  | 'leaves.create'
  | 'leaves.view'
  | 'leaves.view.all'
  | 'leaves.approve'
  | 'leaves.reject'
  | 'leaves.delete'
  
  // User management permissions
  | 'users.create'
  | 'users.view'
  | 'users.view.all'
  | 'users.update'
  | 'users.delete'
  
  // Leave type management permissions
  | 'leave-types.create'
  | 'leave-types.view'
  | 'leave-types.update'
  | 'leave-types.delete'
  
  // Leave balance management permissions
  | 'leave-balances.view'
  | 'leave-balances.view.all'
  | 'leave-balances.update'
  
  // Reports and analytics permissions
  | 'reports.view'
  | 'reports.export'
  
  // System settings permissions
  | 'settings.view'
  | 'settings.update';

// Define role-based permissions
const rolePermissions: Record<UserRole, Permission[]> = {
  employee: [
    'leaves.create',
    'leaves.view',
    'leave-types.view',
    'leave-balances.view',
  ],
  
  manager: [
    // All employee permissions
    'leaves.create',
    'leaves.view',
    'leave-types.view',
    'leave-balances.view',
    
    // Manager-specific permissions
    'leaves.view.all',
    'leaves.approve',
    'leaves.reject',
    'users.view',
    'users.view.all',
    'leave-balances.view.all',
    'reports.view',
  ],
  
  hr: [
    // All manager permissions
    'leaves.create',
    'leaves.view',
    'leave-types.view',
    'leave-balances.view',
    'leaves.view.all',
    'leaves.approve',
    'leaves.reject',
    'users.view',
    'users.view.all',
    'leave-balances.view.all',
    'reports.view',
    
    // HR-specific permissions
    'users.create',
    'users.update',
    'leave-types.create',
    'leave-types.update',
    'leave-balances.update',
    'reports.export',
  ],
  
  admin: [
    // All permissions
    'leaves.create',
    'leaves.view',
    'leaves.view.all',
    'leaves.approve',
    'leaves.reject',
    'leaves.delete',
    'users.create',
    'users.view',
    'users.view.all',
    'users.update',
    'users.delete',
    'leave-types.create',
    'leave-types.view',
    'leave-types.update',
    'leave-types.delete',
    'leave-balances.view',
    'leave-balances.view.all',
    'leave-balances.update',
    'reports.view',
    'reports.export',
    'settings.view',
    'settings.update',
  ],
};

/**
 * Check if a user has a specific permission
 * @param userRole The user's role
 * @param permission The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return rolePermissions[userRole]?.includes(permission) || false;
}

/**
 * Check if a user has all of the specified permissions
 * @param userRole The user's role
 * @param permissions Array of permissions to check
 * @returns Boolean indicating if the user has all permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Check if a user has any of the specified permissions
 * @param userRole The user's role
 * @param permissions Array of permissions to check
 * @returns Boolean indicating if the user has any of the permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a specific role
 * @param userRole The user's role
 * @returns Array of permissions for the role
 */
export function getPermissionsForRole(userRole: UserRole): Permission[] {
  return rolePermissions[userRole] || [];
}