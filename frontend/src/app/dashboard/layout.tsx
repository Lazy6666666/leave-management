import { notFound } from "next/navigation";

import { dashboardConfig } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";
import { MainNav } from "@/components/layout/main-nav";
import { UserNav } from "@/components/auth/user-nav";
import { SiteFooter } from "@/components/layout/site-footer";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return notFound();
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b backdrop-blur-md bg-background/80">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <UserNav />
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          {/* <DashboardNav items={dashboardConfig.sidebarNav} /> */}
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          <div className="glass-card p-6">
            {children}
          </div>
        </main>
      </div>
      <SiteFooter className="border-t backdrop-blur-sm bg-background/50" />
    </div>
  );
}