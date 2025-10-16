import Link from 'next/link';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { UserNav } from '@/components/auth/user-nav';
import { MainNav } from '@/components/layout/main-nav';

export function Header(): React.ReactElement {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <NotificationBell />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}