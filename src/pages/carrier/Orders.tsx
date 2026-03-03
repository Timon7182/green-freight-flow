import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, User, Phone, MessageCircle, Package, FileCheck, Lock, Flame, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  from: string;
  to: string;
  type: string;
  date: string;
  customer: string;
  contact: string;
  contactInfo: string;
  productCode: string;
  status: "pending" | "chat" | "price_sent" | "approved" | "delivered";
}

const initialOrders: Order[] = [
  { id: "ZK-001", from: "Склад 1", to: "Алматы", type: "Сборный", date: "03.03.2026", customer: 'ТОО "Астана Логистик"', contact: "+7 777 123 4567", contactInfo: "Звонить с 9 до 18", productCode: "KZ-4421", status: "approved" },
  { id: "ZK-002", from: "Склад 2", to: "Астана", type: "Контейнерный (аренда)", date: "03.03.2026", customer: "ИП Ахметов К.Б.", contact: "+7 701 555 8899", contactInfo: "WhatsApp предпочтительно", productCode: "", status: "chat" },
  { id: "ZK-003", from: "г. Караганда, ул. Ленина, 5", to: "Шымкент", type: "Контейнерный (выкуп)", date: "02.03.2026", customer: 'ТОО "КазТранс"', contact: "+7 702 111 2233", contactInfo: "", productCode: "", status: "pending" },
  { id: "ZK-004", from: "Склад 3", to: "Караганда", type: "Сборный", date: "25.02.2026", customer: 'ТОО "Степь Транс"', contact: "+7 705 333 4455", contactInfo: "", productCode: "KZ-7712", status: "delivered" },
  { id: "ZK-005", from: "Склад 1", to: "Актобе", type: "Контейнерный (аренда)", date: "01.03.2026", customer: "ИП Сериков Б.Т.", contact: "+7 700 222 1100", contactInfo: "Звонить после 12:00", productCode: "", status: "price_sent" },
];

const statusInfo: Record<string, { label: string; className: string }> = {
  pending: { label: "Ожидает", className: "bg-muted text-muted-foreground" },
  chat: { label: "Обсуждение", className: "bg-accent text-accent-foreground" },
  price_sent: { label: "Цена отправлена", className: "bg-warning text-warning-foreground" },
  approved: { label: "Утверждено", className: "bg-primary text-primary-foreground" },
  delivered: { label: "Доставлено", className: "bg-primary text-primary-foreground" },
};

const tabConfig = [
  { value: "active", label: "Активные", icon: Flame, filter: (o: Order) => o.status === "pending" },
  { value: "in_progress", label: "В процессе", icon: Clock, filter: (o: Order) => ["chat", "price_sent", "approved"].includes(o.status) },
  { value: "completed", label: "Отработанные", icon: CheckCircle2, filter: (o: Order) => o.status === "delivered" },
];

const Orders = () => {
  const navigate = useNavigate();
  const [orders] = useState(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleRespond = (id: string) => {
    toast.info(`Откройте чат для обсуждения условий по заявке ${id}`);
    navigate("/chat");
  };

  const renderOrder = (o: Order) => (
    <div
      key={o.id}
      className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      <button
        className="w-full p-5 text-left"
        onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary text-base">{o.id}</span>
            <Badge className={statusInfo[o.status].className}>{statusInfo[o.status].label}</Badge>
            <Badge variant="outline" className="text-xs">{o.type}</Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {o.date}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span>{o.from}</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-semibold">{o.to}</span>
        </div>
      </button>

      {expandedId === o.id && (
        <div className="border-t border-border p-5 bg-accent/10 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{o.customer}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{o.contact}</span>
            </div>
            {o.contactInfo && (
              <div className="col-span-full text-muted-foreground text-xs italic">
                {o.contactInfo}
              </div>
            )}
          </div>

          {o.status === "approved" || o.status === "delivered" ? (
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <FileCheck className="h-4 w-4" />
                Договор утверждён
              </div>
              <p className="text-sm">
                Код товара: <span className="font-mono font-bold text-foreground">{o.productCode}</span>
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-muted/50 border border-border p-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              Код товара будет доступен после утверждения договора и цен через чат
            </div>
          )}

          <div className="flex gap-3">
            {o.status === "pending" && (
              <Button onClick={() => handleRespond(o.id)} className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Откликнуться
              </Button>
            )}
            {(o.status === "chat" || o.status === "price_sent") && (
              <Button onClick={() => navigate("/chat")} className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Продолжить обсуждение
              </Button>
            )}
            {(o.status === "approved" || o.status === "delivered") && (
              <Button variant="outline" onClick={() => navigate("/chat")} className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Чат
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Заявки</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} всего</p>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-12">
            {tabConfig.map((tab) => {
              const count = orders.filter(tab.filter).length;
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className="text-xs opacity-60">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabConfig.map((tab) => {
            const filtered = orders.filter(tab.filter);
            return (
              <TabsContent key={tab.value} value={tab.value} className="space-y-3">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p>Нет заявок в этой категории</p>
                  </div>
                ) : (
                  filtered.map(renderOrder)
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Orders;
