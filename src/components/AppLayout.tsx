import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Package, Plus, List, Settings, LogOut,
  Menu, X, Users, Warehouse, LayoutDashboard, User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const clientNav: NavItem[] = [
  { label: "Главная", path: "/client/dashboard", icon: LayoutDashboard },
  { label: "Новая заявка", path: "/client/create", icon: Plus },
  { label: "Мои заявки", path: "/client/requests", icon: List },
  { label: "Профиль", path: "/client/profile", icon: User },
];

const staffNav: NavItem[] = [
  { label: "Главная", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Заявки", path: "/admin/requests", icon: List },
  { label: "Склады", path: "/admin/warehouses", icon: Warehouse },
  { label: "Справочники", path: "/admin/directories", icon: Settings },
  { label: "Пользователи", path: "/admin/users", icon: Users },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { role, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = role === "client" ? clientNav : staffNav;
  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const roleBadge = role === "admin" ? "Администратор" : role === "manager" ? "Менеджер" : "Клиент";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card p-4">
        <div className="flex items-center gap-2 px-2 mb-8">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">SilkWay</span>
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
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
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t pt-4 mt-4 space-y-3">
          <div className="px-3">
            <p className="text-sm font-medium truncate">{profile?.full_name || "Пользователь"}</p>
            <p className="text-xs text-muted-foreground">{roleBadge}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Выйти
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
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>
        {mobileOpen && (
          <div className="md:hidden border-b bg-card px-4 py-3 space-y-1 animate-fade-in">
            {nav.map((item) => (
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
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Выйти
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
