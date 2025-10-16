import { AdminDashboard } from '@/components/admin/admin-dashboard';
import UserManagement from '@/components/admin/user-management';

export default function AdminUserManagementPage() {
  return (
    <AdminDashboard>
      <UserManagement />
    </AdminDashboard>
  );
}