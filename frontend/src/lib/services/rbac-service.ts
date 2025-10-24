import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string;
}

export class RBACService {
  private static instance: RBACService;
  private supabase = createClient(); // Add this line

  static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  // Permission definitions
  static readonly PERMISSIONS = {
    // User Management
    USER_CREATE: 'user:create',
    USER_READ: 'user:read',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',
    USER_LIST: 'user:list',
    
    // Leave Management
    LEAVE_REQUEST_CREATE: 'leave:request:create',
    LEAVE_REQUEST_READ: 'leave:request:read',
    LEAVE_REQUEST_UPDATE: 'leave:request:update',
    LEAVE_REQUEST_DELETE: 'leave:request:delete',
    LEAVE_REQUEST_LIST: 'leave:request:list',
    LEAVE_REQUEST_APPROVE: 'leave:request:approve',
    LEAVE_REQUEST_REJECT: 'leave:request:reject',
    
    // Leave Balance Management
    LEAVE_BALANCE_READ: 'leave:balance:read',
    LEAVE_BALANCE_UPDATE: 'leave:balance:update',
    LEAVE_BALANCE_ADJUST: 'leave:balance:adjust',
    
    // Report Management
    REPORT_GENERATE: 'report:generate',
    REPORT_EXPORT: 'report:export',
    REPORT_READ: 'report:read',
    
    // Document Management
    DOCUMENT_CREATE: 'document:create',
    DOCUMENT_READ: 'document:read',
    DOCUMENT_UPDATE: 'document:update',
    DOCUMENT_DELETE: 'document:delete',
    
    // System Administration
    SYSTEM_ADMIN: 'system:admin',
    SYSTEM_SETTINGS: 'system:settings',
    SYSTEM_AUDIT: 'system:audit',
    
    // Department Management
    DEPARTMENT_CREATE: 'department:create',
    DEPARTMENT_READ: 'department:read',
    DEPARTMENT_UPDATE: 'department:update',
    DEPARTMENT_DELETE: 'department:delete',
    
    // Role Management
    ROLE_CREATE: 'role:create',
    ROLE_READ: 'role:read',
    ROLE_UPDATE: 'role:update',
    ROLE_DELETE: 'role:delete',
    ROLE_ASSIGN: 'role:assign',
  };

  // Role definitions
  static readonly ROLES = {
    SUPER_ADMIN: {
      id: 'super-admin',
      name: 'Super Administrator',
      description: 'Full system access with all permissions',
      isSystem: true,
      permissions: Object.values(RBACService.PERMISSIONS),
    },
    HR_ADMIN: {
      id: 'hr-admin',
      name: 'HR Administrator',
      description: 'HR department administrator with employee and leave management access',
      isSystem: true,
      permissions: [
        RBACService.PERMISSIONS.USER_CREATE,
        RBACService.PERMISSIONS.USER_READ,
        RBACService.PERMISSIONS.USER_UPDATE,
        RBACService.PERMISSIONS.USER_LIST,
        RBACService.PERMISSIONS.LEAVE_REQUEST_READ,
        RBACService.PERMISSIONS.LEAVE_REQUEST_LIST,
        RBACService.PERMISSIONS.LEAVE_REQUEST_APPROVE,
        RBACService.PERMISSIONS.LEAVE_REQUEST_REJECT,
        RBACService.PERMISSIONS.LEAVE_BALANCE_READ,
        RBACService.PERMISSIONS.LEAVE_BALANCE_UPDATE,
        RBACService.PERMISSIONS.LEAVE_BALANCE_ADJUST,
        RBACService.PERMISSIONS.REPORT_GENERATE,
        RBACService.PERMISSIONS.REPORT_EXPORT,
        RBACService.PERMISSIONS.REPORT_READ,
        RBACService.PERMISSIONS.DOCUMENT_READ,
        RBACService.PERMISSIONS.DEPARTMENT_READ,
        RBACService.PERMISSIONS.DEPARTMENT_UPDATE,
      ],
    },
    DEPARTMENT_MANAGER: {
      id: 'department-manager',
      name: 'Department Manager',
      description: 'Manager with leave approval and team management access',
      isSystem: true,
      permissions: [
        RBACService.PERMISSIONS.USER_READ,
        RBACService.PERMISSIONS.USER_LIST,
        RBACService.PERMISSIONS.LEAVE_REQUEST_CREATE,
        RBACService.PERMISSIONS.LEAVE_REQUEST_READ,
        RBACService.PERMISSIONS.LEAVE_REQUEST_LIST,
        RBACService.PERMISSIONS.LEAVE_REQUEST_APPROVE,
        RBACService.PERMISSIONS.LEAVE_REQUEST_REJECT,
        RBACService.PERMISSIONS.LEAVE_BALANCE_READ,
        RBACService.PERMISSIONS.REPORT_READ,
        RBACService.PERMISSIONS.DOCUMENT_CREATE,
        RBACService.PERMISSIONS.DOCUMENT_READ,
        RBACService.PERMISSIONS.DEPARTMENT_READ,
      ],
    },
    EMPLOYEE: {
      id: 'employee',
      name: 'Employee',
      description: 'Standard employee with leave request and personal access',
      isSystem: true,
      permissions: [
        RBACService.PERMISSIONS.LEAVE_REQUEST_CREATE,
        RBACService.PERMISSIONS.LEAVE_REQUEST_READ,
        RBACService.PERMISSIONS.LEAVE_REQUEST_UPDATE,
        RBACService.PERMISSIONS.LEAVE_REQUEST_DELETE,
        RBACService.PERMISSIONS.LEAVE_BALANCE_READ,
        RBACService.PERMISSIONS.DOCUMENT_CREATE,
        RBACService.PERMISSIONS.DOCUMENT_READ,
        RBACService.PERMISSIONS.USER_READ,
      ],
    },
    GUEST: {
      id: 'guest',
      name: 'Guest',
      description: 'Guest user with minimal read-only access',
      isSystem: true,
      permissions: [
        RBACService.PERMISSIONS.USER_READ,
        RBACService.PERMISSIONS.LEAVE_BALANCE_READ,
      ],
    },
  };

  // Check if user has permission
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      // Get user's roles
      const { data: userRoles } = await this.supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId);

      if (!userRoles || userRoles.length === 0) {
        return false;
      }

      // Get permissions for user's roles
      const roleIds = userRoles.map(ur => ur.role_id);
      const { data: rolePermissions } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .in('role_id', roleIds);

      if (!rolePermissions) {
        return false;
      }

      const permissionIds = rolePermissions.map(rp => rp.permission_id);
      
      // Check if the specific permission exists
      const { data: permissions } = await supabase
        .from('permissions')
        .select('id')
        .eq('name', permission)
        .in('id', permissionIds);

      return !!permissions && permissions.length > 0;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Check if user has any of the specified permissions
  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }

  // Check if user has all specified permissions
  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission))) {
        return false;
      }
    }
    return true;
  }

  // Get user's roles
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const { data: userRoles } = await this.supabase
        .from('user_roles')
        .select(`
          role_id,
          roles (
            id,
            name,
            description,
            is_system
          )
        `)
        .eq('user_id', userId);

      if (!userRoles) {
        return [];
      }

      const roles = await Promise.all(
        userRoles.map(async (ur: any) => {
          const role = ur?.roles?.[0] ?? ur?.roles;
          const permissions = await this.getRolePermissions(role?.id);
          return {
            id: role?.id,
            name: role?.name,
            description: role?.description,
            isSystem: role?.is_system,
            permissions,
          };
        })
      );

      return roles;
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  // Get role permissions
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      const { data: rolePermissions } = await this.supabase
        .from('role_permissions')
        .select(`
          permission_id,
          permissions (
            id,
            name,
            description,
            resource,
            action
          )
        `)
        .eq('role_id', roleId);

      if (!rolePermissions) {
        return [];
      }

      return rolePermissions.map((rp: any) => ({
        id: rp?.permissions?.id,
        name: rp?.permissions?.name,
        description: rp?.permissions?.description,
        resource: rp?.permissions?.resource,
        action: rp?.permissions?.action,
      }));
    } catch (error) {
      console.error('Error getting role permissions:', error);
      return [];
    }
  }

  // Assign role to user
  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
        });

      return !error;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  // Remove role from user
  async removeRole(userId: string, roleId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);

      return !error;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  // Get all roles
  async getAllRoles(): Promise<Role[]> {
    try {
      const { data: roles } = await this.supabase
        .from('roles')
        .select('*')
        .order('name');

      if (!roles) {
        return [];
      }

      return await Promise.all(
        roles.map(async (role) => {
          const permissions = await this.getRolePermissions(role.id);
          return {
            id: role.id,
            name: role.name,
            description: role.description,
            isSystem: role.is_system,
            permissions,
          };
        })
      );
    } catch (error) {
      console.error('Error getting all roles:', error);
      return [];
    }
  }

  // Create custom role
  async createRole(name: string, description: string, permissionIds: string[]): Promise<Role | null> {
    try {
      const { data: role, error: roleError } = await this.supabase
        .from('roles')
        .insert({
          name,
          description,
          is_system: false,
        })
        .select()
        .single();

      if (roleError || !role) {
        return null;
      }

      // Add permissions to role
      if (permissionIds.length > 0) {
        const rolePermissions = permissionIds.map(permissionId => ({
          role_id: role.id,
          permission_id: permissionId,
        }));

        const { error: rpError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (rpError) {
          // Rollback role creation
          await supabase.from('roles').delete().eq('id', role.id);
          return null;
        }
      }

      const permissions = await this.getRolePermissions(role.id);
      return {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.is_system,
        permissions,
      };
    } catch (error) {
      console.error('Error creating role:', error);
      return null;
    }
  }

  // Update role
  async updateRole(roleId: string, name: string, description: string, permissionIds: string[]): Promise<boolean> {
    try {
      // Update role details
      const { error: roleError } = await this.supabase
        .from('roles')
        .update({ name, description })
        .eq('id', roleId);

      if (roleError) {
        return false;
      }

      // Update permissions
      // Remove existing permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (deleteError) {
        return false;
      }

      // Add new permissions
      if (permissionIds.length > 0) {
        const rolePermissions = permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId,
        }));

        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (insertError) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating role:', error);
      return false;
    }
  }

  // Delete role
  async deleteRole(roleId: string): Promise<boolean> {
    try {
      // Check if role is assigned to any users
      const { data: userRoles } = await this.supabase
        .from('user_roles')
        .select('id')
        .eq('role_id', roleId)
        .limit(1);

      if (userRoles && userRoles.length > 0) {
        return false; // Cannot delete role that is assigned to users
      }

      // Delete role permissions first
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      // Delete role
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      return !error;
    } catch (error) {
      console.error('Error deleting role:', error);
      return false;
    }
  }

  // Get all permissions
  async getAllPermissions(): Promise<Permission[]> {
    try {
      const { data: permissions } = await this.supabase
        .from('permissions')
        .select('*')
        .order('name');

      if (!permissions) {
        return [];
      }

      return permissions.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        resource: p.resource,
        action: p.action,
      }));
    } catch (error) {
      console.error('Error getting all permissions:', error);
      return [];
    }
  }

  // Initialize system roles and permissions
  async initializeSystem(): Promise<boolean> {
    try {
      // Create permissions if they don't exist
      const allPermissions = Object.values(RBACService.PERMISSIONS);
      
      for (const permissionName of allPermissions) {
        const [resource, action] = permissionName.split(':');
        
        const { error } = await this.supabase
          .from('permissions')
          .upsert({
            name: permissionName,
            description: `${action} ${resource}`,
            resource: resource,
            action: action,
          }, {
            onConflict: 'name',
          });

        if (error) {
          console.error(`Error creating permission ${permissionName}:`, error);
        }
      }

      // Create system roles
      const systemRoles = Object.values(RBACService.ROLES);
      
      for (const roleData of systemRoles) {
        // Create role
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .upsert({
            id: roleData.id,
            name: roleData.name,
            description: roleData.description,
            is_system: roleData.isSystem,
          }, {
            onConflict: 'id',
          })
          .select()
          .single();

        if (roleError || !role) {
          console.error(`Error creating role ${roleData.name}:`, roleError);
          continue;
        }

        // Get permission IDs
        const { data: permissions } = await supabase
          .from('permissions')
          .select('id')
          .in('name', roleData.permissions);

        if (permissions && permissions.length > 0) {
          // Delete existing role permissions
          await supabase
            .from('role_permissions')
            .delete()
            .eq('role_id', role.id);

          // Add new role permissions
          const rolePermissions = permissions.map(p => ({
            role_id: role.id,
            permission_id: p.id,
          }));

          await supabase
            .from('role_permissions')
            .insert(rolePermissions);
        }
      }

      return true;
    } catch (error) {
      console.error('Error initializing RBAC system:', error);
      return false;
    }
  }

  // Middleware for API route protection
  async requirePermission(permission: string) {
    return async (request: NextRequest) => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          return new Response('Unauthorized', { status: 401 });
        }

        const hasPerm = await this.hasPermission(user.id, permission);
        if (!hasPerm) {
          return new Response('Forbidden', { status: 403 });
        }

        return null; // Permission granted, continue to route handler
      } catch (error) {
        console.error('Error in permission middleware:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    };
  }

  // Middleware for API route protection with any permission
  async requireAnyPermission(permissions: string[]) {
    return async (request: NextRequest) => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          return new Response('Unauthorized', { status: 401 });
        }

        const hasAnyPerm = await this.hasAnyPermission(user.id, permissions);
        if (!hasAnyPerm) {
          return new Response('Forbidden', { status: 403 });
        }

        return null; // Permission granted, continue to route handler
      } catch (error) {
        console.error('Error in permission middleware:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    };
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const userRoles = await this.getUserRoles(userId);
      const allPermissions = userRoles.flatMap(role => role.permissions);
      
      // Remove duplicates
      const uniquePermissions = allPermissions.filter((permission, index, self) =>
        index === self.findIndex(p => p.id === permission.id)
      );
      
      return uniquePermissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  // Get users with specific role
  async getUsersWithRole(roleId: string): Promise<string[]> {
    try {
      const { data: userRoles } = await this.supabase
        .from('user_roles')
        .select('user_id')
        .eq('role_id', roleId);

      if (!userRoles) {
        return [];
      }

      return userRoles.map(ur => ur.user_id);
    } catch (error) {
      console.error('Error getting users with role:', error);
      return [];
    }
  }
}

export const rbacService = RBACService.getInstance();