import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { ReportingDashboard } from '@/components/reports/reporting-dashboard';

export default function AdminReportsPage() {
  return (
    <AdminDashboard>
      <ReportingDashboard />
    </AdminDashboard>
  );
}