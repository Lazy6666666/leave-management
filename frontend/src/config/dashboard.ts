type DashboardConfig = {
  mainNav: Array<{ title: string; href: string }>;
  sidebarNav: Array<{ title: string; href: string; icon: string }>;
};

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Calendar",
      href: "/dashboard/calendar",
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
    },
    {
      title: "Documents",
      href: "/dashboard/documents",
    },
  ],
  sidebarNav: [
    {
      title: "My Leaves",
      href: "/dashboard/leaves",
      icon: "post",
    },
    {
      title: "Admin",
      href: "/dashboard/admin",
      icon: "settings",
    },
  ],
};