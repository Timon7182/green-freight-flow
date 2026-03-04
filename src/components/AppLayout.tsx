import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Package, Plus, List, Settings, LogOut,
  Menu, X, Users, Warehouse, LayoutDashboard, User, Moon, Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ElementType;
}

const clientNavItems: NavItem[] = [
  { labelKey: "nav.home", path: "/client/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.newRequest", path: "/client/create", icon: Plus },
  { labelKey: "nav.myRequests", path: "/client/requests", icon: List },
  { labelKey: "nav.profile", path: "/client/profile", icon: User },
];

const staffNavItems: NavItem[] = [
  { labelKey: "nav.home", path: "/admin/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.requests", path: "/admin/requests", icon: List },
  { labelKey: "nav.warehouses", path: "/admin/warehouses", icon: Warehouse },
  { labelKey: "nav.directories", path: "/admin/directories", icon: Settings },
  { labelKey: "nav.users", path: "/admin/users", icon: Users },
];

const useTheme = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
};

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { role, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle: toggleTheme } = useTheme();

  const navItems = role === "client" ? clientNavItems : staffNavItems;
  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const roleBadge = role === "admin" ? t("role.admin") : role === "manager" ? t("role.manager") : t("role.client");

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card p-4">
        <div className="flex items-center justify-between px-2 mb-8">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">SilkWay</span>
          </div>
          <div className="flex items-center gap-0.5">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <NotificationBell />
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.path)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </button>
          ))}
        </nav>
        <div className="border-t pt-4 mt-4 space-y-3">
          <div className="px-3">
            <p className="text-sm font-medium truncate">{profile?.full_name || t("role.user")}</p>
            <p className="text-xs text-muted-foreground">{roleBadge}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between border-b px-4 py-3 bg-card">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-bold">SilkWay</span>
          </div>
          <div className="flex items-center gap-0.5">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>
        {mobileOpen && (
          <div className="md:hidden border-b bg-card px-4 py-3 space-y-1 animate-fade-in">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t("nav.logout")}
            </button>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
