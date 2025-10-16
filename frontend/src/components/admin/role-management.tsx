'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Shield,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  UserPlus,
  Key
} from 'lucide-react';
import { rbacService, type Role, type Permission } from '@/lib/services/rbac-service';
import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type RoleFormData = {
  name: string;
  description: string;
  permissionIds: string[];
};

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
};
interface RoleFormProps {
  role?: Role;
  permissions: Permission[];
  onSave: (roleData: RoleFormData) => void;
  onCancel: () => void;
}

function RoleForm({ role, permissions, onSave, onCancel }: RoleFormProps) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissionIds: role?.permissions.map(p => p.id) || [],
  });

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const groupedPermissions = permissions.reduce((groups, permission) => {
    const resource = permission.resource;
    if (!groups[resource]) {
      groups[resource] = [];
    }
    groups[resource].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Role Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter role name"
            required
            disabled={role?.isSystem}
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter role description"
            rows={3}
            disabled={role?.isSystem}
          />
        </div>
      </div>

      <div>
        <Label>Permissions</Label>
        <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
          {Object.entries(groupedPermissions).map(([resource, perms]) => (
            <div key={resource} className="mb-4 last:mb-0">
              <h4 className="font-medium text-sm text-gray-700 mb-2 capitalize">
                {resource.replace(/_/g, ' ')}
              </h4>
              <div className="space-y-2">
                {perms.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={formData.permissionIds.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                      disabled={role?.isSystem}
                    />
                    <Label 
                      htmlFor={`permission-${permission.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {permission.description}
                      <span className="text-gray-500 ml-1">
                        ({permission.action})
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Select permissions this role should have
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {role ? 'Update Role' : 'Create Role'}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface RoleAssignmentProps {
  role: Role;
  onAssign: (userId: string) => void;
  onUnassign: (userId: string) => void;
  onClose: () => void;
}

function RoleAssignment({ role, onAssign, onUnassign, onClose }: RoleAssignmentProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
    loadAssignedUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual user service call
      // For now, we'll use a mock implementation
      setUsers([]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedUsers = async () => {
    try {
      const assignedUserIds = await rbacService.getUsersWithRole(role.id);
      setAssignedUsers(assignedUserIds);
    } catch (error) {
      console.error('Error loading assigned users:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (userId: string) => {
    onAssign(userId);
    setAssignedUsers(prev => [...prev, userId]);
  };

  const handleUnassign = (userId: string) => {
    onUnassign(userId);
    setAssignedUsers(prev => prev.filter(id => id !== userId));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="search-users">Search Users</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="search-users"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg max-h-64 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No users found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell className="text-right">
                    {assignedUsers.includes(user.id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnassign(user.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAssign(user.id)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function RoleManagement() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [assigningRole, setAssigningRole] = useState<Role | null>(null);

  useEffect(() => {
    if (user) {
      loadRoles();
      loadPermissions();
    }
  }, [user]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const allRoles = await rbacService.getAllRoles();
      setRoles(allRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const allPermissions = await rbacService.getAllPermissions();
      setPermissions(allPermissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const handleCreateRole = async (roleData: RoleFormData) => {
    try {
      const newRole = await rbacService.createRole(
        roleData.name,
        roleData.description,
        roleData.permissionIds
      );
      
      if (newRole) {
        setRoles(prev => [...prev, newRole]);
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleUpdateRole = async (roleData: RoleFormData) => {
    if (!editingRole) return;
    
    try {
      const success = await rbacService.updateRole(
        editingRole.id,
        roleData.name,
        roleData.description,
        roleData.permissionIds
      );
      
      if (success) {
        await loadRoles();
        setEditingRole(null);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystem) {
      alert('Cannot delete system roles');
      return;
    }
    
    if (confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
      try {
        const success = await rbacService.deleteRole(role.id);
        if (success) {
          setRoles(prev => prev.filter(r => r.id !== role.id));
        }
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleAssignUser = async (userId: string) => {
    if (!assigningRole || !user) return;
    
    try {
      const success = await rbacService.assignRole(userId, assigningRole.id, user.id);
      if (success) {
        console.log(`User ${userId} assigned to role ${assigningRole.name}`);
      }
    } catch (error) {
      console.error('Error assigning user to role:', error);
    }
  };

  const handleUnassignUser = async (userId: string) => {
    if (!assigningRole) return;
    
    try {
      const success = await rbacService.removeRole(userId, assigningRole.id);
      if (success) {
        console.log(`User ${userId} removed from role ${assigningRole.name}`);
      }
    } catch (error) {
      console.error('Error removing user from role:', error);
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionCount = (role: Role) => {
    return role.permissions.length;
  };

  const getRoleColor = (role: Role) => {
    if (role.isSystem) {
      switch (role.id) {
        case 'super-admin':
          return 'bg-destructive/20 text-destructive border-destructive/20';
        case 'hr-admin':
          return 'bg-primary/20 text-primary border-primary/20';
        case 'department-manager':
          return 'bg-success/20 text-success border-success/20';
        case 'employee':
          return 'bg-secondary/20 text-secondary border-secondary/20';
        default:
          return 'bg-muted text-muted-foreground border-border';
      }
    }
    return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Loading roles and permissions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-gray-600">
            Manage user roles and permissions for the system
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role) => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </div>
                <Badge className={cn("text-xs", getRoleColor(role))}>
                  {role.isSystem ? 'System' : 'Custom'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Permissions:</span>
                  <Badge variant="secondary">
                    {getPermissionCount(role)} permissions
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingRole(role)}
                    disabled={role.isSystem}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setAssigningRole(role)}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Assign
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteRole(role)}
                    disabled={role.isSystem}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRoles.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? "Try adjusting your search terms." 
                : "Get started by creating your first role."
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Role Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions for the system
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            permissions={permissions}
            onSave={handleCreateRole}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      // REFACTOR: Explicitly type 'open' parameter to satisfy TS7006 (implicit any)
      <Dialog open={!!editingRole} onOpenChange={(open: boolean) => !open && setEditingRole(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details and permissions
            </DialogDescription>
          </DialogHeader>
          {editingRole && (
            <RoleForm
              role={editingRole}
              permissions={permissions}
              onSave={handleUpdateRole}
              onCancel={() => setEditingRole(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      // REFACTOR: Explicitly type 'open' parameter to satisfy TS7006 (implicit any)
      <Dialog open={!!assigningRole} onOpenChange={(open: boolean) => !open && setAssigningRole(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Users to Role</DialogTitle>
            <DialogDescription>
              Manage users assigned to the \"{assigningRole?.name}\" role
            </DialogDescription>
          </DialogHeader>
          {assigningRole && (
            <RoleAssignment
              role={assigningRole}
              onAssign={handleAssignUser}
              onUnassign={handleUnassignUser}
              onClose={() => setAssigningRole(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}