import { AdminDashboard } from '@/components/admin/admin-dashboard';
import RoleManagement from '@/components/admin/role-management';

export default function AdminRoleManagementPage() {
  return (
    <AdminDashboard>
      <RoleManagement />
    </AdminDashboard>
  );
}