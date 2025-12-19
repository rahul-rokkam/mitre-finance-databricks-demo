import SidebarLayout from "@/components/apx/sidebar-layout";
import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  Activity,
  Briefcase,
  ShieldAlert,
  DollarSign,
  Landmark,
  User,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/_sidebar")({
  component: () => <Layout />,
});

function Layout() {
  const location = useLocation();

  const moduleItems = [
    {
      to: "/financial-health",
      label: "Financial Health",
      icon: <Activity size={16} />,
      match: (path: string) => path === "/financial-health",
    },
    {
      to: "/program-portfolio",
      label: "Program Portfolio",
      icon: <Briefcase size={16} />,
      match: (path: string) => path === "/program-portfolio",
    },
    {
      to: "/risk-compliance",
      label: "Risk & Compliance",
      icon: <ShieldAlert size={16} />,
      match: (path: string) => path === "/risk-compliance",
    },
    {
      to: "/sponsor-funding",
      label: "Sponsor Funding",
      icon: <DollarSign size={16} />,
      match: (path: string) => path === "/sponsor-funding",
    },
    {
      to: "/government-relations",
      label: "Government Relations",
      icon: <Landmark size={16} />,
      match: (path: string) => path === "/government-relations",
    },
  ];

  const navItems = [
    {
      to: "/profile",
      label: "Profile",
      icon: <User size={16} />,
      match: (path: string) => path === "/profile",
    },
  ];

  return (
    <SidebarLayout>
      <SidebarGroup>
        <SidebarGroupLabel>Command Center</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {moduleItems.map((item) => (
              <SidebarMenuItem key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg",
                    item.match(location.pathname)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator />
      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg",
                    item.match(location.pathname)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarLayout>
  );
}
