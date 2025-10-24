'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCog, FileText, ScrollText, BarChart } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminDashboardProps {
  children: React.ReactNode;
}

const adminNavItems = [
  {
    title: 'Overview',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    href: '/dashboard/admin/users',
    icon: Users,
  },
  {
    title: 'Role Management',
    href: '/dashboard/admin/roles',
    icon: UserCog,
  },
  {
    title: 'Reports',
    href: '/dashboard/admin/reports',
    icon: BarChart,
  },
  {
    title: 'Audit Logs',
    href: '/dashboard/admin/audit-logs',
    icon: ScrollText,
  },
];

export function AdminDashboard({ children }: AdminDashboardProps) {
  const pathname = usePathname();

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <aside className="lg:col-span-1">
        <nav className="flex flex-col space-y-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted',
                pathname === item.href ? 'bg-muted text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:col-span-4">
        {children}
      </main>
    </div>
  );
}

// Placeholder for Admin Overview Page
export function AdminOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Welcome to the Admin Dashboard. Select an option from the sidebar.</p>
        {/* Add some key stats or quick links here */}
      </CardContent>
    </Card>
  );
}