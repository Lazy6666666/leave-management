import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { AuditLogViewer } from '@/components/admin/audit-log-viewer';

export default function AdminAuditLogsPage() {
  return (
    <AdminDashboard>
      <AuditLogViewer />
    </AdminDashboard>
  );
}