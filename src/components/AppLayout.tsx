import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Package,
  PlusCircle,
  FileText,
  MessageCircle,
  Newspaper,
  ShoppingBag,
  LogOut,
  Truck,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const customerNav: NavItem[] = [
  { label: "Новая заявка", path: "/customer/create", icon: <PlusCircle className="h-5 w-5" /> },
  { label: "Мои заявки", path: "/customer/orders", icon: <FileText className="h-5 w-5" /> },
  { label: "Чат", path: "/chat", icon: <MessageCircle className="h-5 w-5" /> },
  { label: "Новости", path: "/news", icon: <Newspaper className="h-5 w-5" /> },
  { label: "Маркетплейс", path: "/marketplace", icon: <ShoppingBag className="h-5 w-5" /> },
];

const carrierNav: NavItem[] = [
  { label: "Заявки", path: "/carrier/orders", icon: <Package className="h-5 w-5" /> },
  { label: "Мои заказы", path: "/carrier/my-orders", icon: <FileText className="h-5 w-5" /> },
  { label: "Чат", path: "/chat", icon: <MessageCircle className="h-5 w-5" /> },
  { label: "Новости", path: "/news", icon: <Newspaper className="h-5 w-5" /> },
  { label: "Маркетплейс", path: "/marketplace", icon: <ShoppingBag className="h-5 w-5" /> },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = role === "customer" ? customerNav : carrierNav;

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">SilkWay</h1>
            <p className="text-xs text-muted-foreground">
              {role === "customer" ? "Заказчик" : "Перевозчик"}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-border px-3 py-4 space-y-3">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
              <User className="h-4 w-4 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex md:hidden items-center justify-between border-b border-border px-4 py-3 bg-card">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">SilkWay</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 py-2 animate-fade-in">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent/50"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
            >
              <LogOut className="h-5 w-5" />
              Выйти
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
