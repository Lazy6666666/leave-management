'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Mail,
  Phone,
  Building,
  Shield,
  Check,
  X,
  UserCheck,
  UserX,
  MoreVertical
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  department: string;
  job_title: string;
  employee_id: string;
  phone_number?: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  manager_id?: string;
  join_date: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  is_active: boolean;
}

interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  job_title: string;
  employee_id: string;
  phone_number: string;
  role: string;
  manager_id: string;
  join_date: string;
  is_active: boolean;
}

function UserForm({ 
  user, 
  onSave, 
  onCancel 
}: { 
  user?: User;
  onSave: (data: UserFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    department: user?.department || '',
    job_title: user?.job_title || '',
    employee_id: user?.employee_id || '',
    phone_number: user?.phone_number || '',
    role: user?.role || 'employee',
    manager_id: user?.manager_id || '',
    join_date: user?.join_date || new Date().toISOString().split('T')[0],
    is_active: user?.is_active ?? true,
  });

  const [managers, setManagers] = useState<User[]>([]);

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or('role.eq.department-manager,role.eq.hr-admin,role.eq.super-admin');
      
      if (data) {
        setManagers(data);
      }
    } catch (error) {
      console.error('Error loading managers:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getAvatarFallback = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Basic Information */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Basic Information</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Contact Information</Label>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
                disabled={!!user}
              />
            </div>
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Employment Details</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_id">Employee ID *</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                placeholder="Enter employee ID"
                required
                disabled={!!user}
              />
            </div>
            <div>
              <Label htmlFor="join_date">Join Date *</Label>
              <Input
                id="join_date"
                type="date"
                value={formData.join_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, join_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, department: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="job_title">Job Title *</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                placeholder="Enter job title"
                required
              />
            </div>
          </div>
        </div>

        {/* Role Assignment */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Role Assignment</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, role: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="department-manager">Department Manager</SelectItem>
                  <SelectItem value="hr-admin">HR Admin</SelectItem>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="manager_id">Manager</Label>
              <Select
                value={formData.manager_id}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, manager_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Manager</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.full_name} ({manager.job_title})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked: boolean | 'indeterminate') => 
              setFormData(prev => ({ ...prev, is_active: Boolean(checked) }))
            }
          />
          <Label htmlFor="is_active" className="font-normal">
            User account is active
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {user ? 'Update User' : 'Create User'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setUsers(data);
      } else if (error) {
        console.error('Error loading users:', error);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: UserFormData) => {
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: 'TempPassword123!', // Should be changed on first login
      });

      if (authError) {
        throw authError;
      }

      // Create user profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: `${userData.first_name} ${userData.last_name}`,
          department: userData.department,
          job_title: userData.job_title,
          employee_id: userData.employee_id,
          phone_number: userData.phone_number,
          role: userData.role,
          manager_id: userData.manager_id || null,
          join_date: userData.join_date,
          is_active: userData.is_active,
          status: userData.is_active ? 'active' : 'inactive',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(prev => [data, ...prev]);
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (userData: UserFormData) => {
    if (!editingUser) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: `${userData.first_name} ${userData.last_name}`,
          department: userData.department,
          job_title: userData.job_title,
          phone_number: userData.phone_number,
          role: userData.role,
          manager_id: userData.manager_id || null,
          join_date: userData.join_date,
          is_active: userData.is_active,
          status: userData.is_active ? 'active' : 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? data : u));
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.full_name}"? This action cannot be undone.`)) {
      try {
        // Delete from auth first
        const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (authError) {
          throw authError;
        }

        // Delete from users table
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        setUsers(prev => prev.filter(u => u.id !== user.id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.is_active ? 'inactive' : 'active';
      const { data, error } = await supabase
        .from('users')
        .update({
          is_active: !user.is_active,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(prev => prev.map(u => u.id === user.id ? data : u));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success border-success/20';
      case 'inactive':
        return 'bg-destructive/20 text-destructive border-destructive/20';
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'super-admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'hr-admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'department-manager':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'employee':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const departments = [...new Set(users.map(user => user.department))].sort();
  const roles = [...new Set(users.map(user => user.role))].sort();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Loading users...</CardDescription>
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
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">
            Manage system users and their access permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{users.filter(u => u.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold">{users.filter(u => !u.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role.includes('admin') || u.role === 'super-admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="department-filter">Department:</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="role-filter">Role:</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="status-filter">Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url} alt={user.full_name} />
                          <AvatarFallback>
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.employee_id}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.job_title}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.manager_id ? (
                        <span className="text-sm">
                          {users.find(u => u.id === user.manager_id)?.full_name || 'Unknown'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">No Manager</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.join_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setEditingUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {user.is_active ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || departmentFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all'
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first user."
                }
              </p>
              {searchTerm === '' && departmentFilter === 'all' && roleFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with appropriate role and permissions
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSave={handleCreateUser}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open: boolean) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role assignment
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <UserForm
              user={editingUser}
              onSave={handleUpdateUser}
              onCancel={() => setEditingUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Replace label styles
<Label className="text-sm font-medium text-foreground mb-2 block">Basic Information</Label>

// Replace status badge styles
const getStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-success/20 text-success border-success/20';
    case 'inactive':
      return 'bg-destructive/20 text-destructive border-destructive/20';
    case 'pending':
      return 'bg-warning/20 text-warning border-warning/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

// Replace role badge styles
const getRoleBadgeStyle = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-destructive/20 text-destructive border-destructive/20';
    case 'manager':
      return 'bg-primary/20 text-primary border-primary/20';
    case 'employee':
      return 'bg-success/20 text-success border-success/20';
    case 'hr':
      return 'bg-secondary/20 text-secondary border-secondary/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

// Replace loading placeholders
<div key={i} className="h-20 bg-muted rounded"></div>

// Replace stat card icons
<Users className="h-8 w-8 text-primary" />
<p className="text-sm font-medium text-muted-foreground">Total Users</p>

<UserCheck className="h-8 w-8 text-success" />
<p className="text-sm font-medium text-muted-foreground">Active Users</p>

<UserX className="h-8 w-8 text-destructive" />
<p className="text-sm font-medium text-muted-foreground">Inactive Users</p>

<Shield className="h-8 w-8 text-secondary" />
<p className="text-sm font-medium text-muted-foreground">Admins</p>

// Replace search icon
<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

// Replace user email and manager text
<div className="text-sm text-muted-foreground">{user.email}</div>
<span className="text-sm text-muted-foreground">No Manager</span>

// Replace delete button
className="text-destructive"

// Replace empty state
<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
<h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
<p className="text-muted-foreground mb-4">