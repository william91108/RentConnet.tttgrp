import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Home, Building2, AlertTriangle, Bell, FileText,
  Phone, BookOpen, Settings, LogOut, Shield, Users,
  LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/properties", icon: Building2, label: "Properties" },
  { to: "/issues", icon: AlertTriangle, label: "Issues" },
  { to: "/notices", icon: Bell, label: "Notices" },
  { to: "/documents", icon: FileText, label: "Documents" },
  { to: "/contacts", icon: Phone, label: "Contacts" },
  { to: "/tenants", icon: Users, label: "Tenants" },
];

const tenantLinks = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/report-issue", icon: AlertTriangle, label: "Report Issue" },
  { to: "/my-issues", icon: Shield, label: "My Issues" },
  { to: "/notices", icon: Bell, label: "Notices" },
  { to: "/house-rules", icon: BookOpen, label: "House Rules" },
  { to: "/documents", icon: FileText, label: "Documents" },
  { to: "/emergency", icon: LifeBuoy, label: "Emergency Info" },
  { to: "/contacts", icon: Phone, label: "Contacts" },
];

export function AppSidebar() {
  const { role, signOut, user } = useAuth();
  const location = useLocation();
  const links = role === "admin" ? adminLinks : tenantLinks;

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <Building2 className="h-7 w-7 text-sidebar-primary" />
        <span className="text-lg font-bold tracking-tight text-sidebar-primary-foreground">
          RentConnect
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              location.pathname === link.to
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-2">
        <p className="text-xs text-sidebar-foreground/50 truncate px-1">
          {user?.email}
        </p>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
