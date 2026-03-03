import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Truck, Package, User, Phone, MessageCircle } from "lucide-react";
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
}

const initialOrders: Order[] = [
  { id: "ZK-001", from: "Склад 1", to: "Алматы", type: "Сборный", date: "03.03.2026", customer: 'ТОО "Астана Логистик"', contact: "+7 777 123 4567", contactInfo: "Звонить с 9 до 18", productCode: "" },
  { id: "ZK-002", from: "Склад 2", to: "Астана", type: "Контейнерный (аренда)", date: "03.03.2026", customer: "ИП Ахметов К.Б.", contact: "+7 701 555 8899", contactInfo: "WhatsApp предпочтительно", productCode: "" },
  { id: "ZK-003", from: "г. Караганда, ул. Ленина, 5", to: "Шымкент", type: "Контейнерный (выкуп)", date: "02.03.2026", customer: 'ТОО "КазТранс"', contact: "+7 702 111 2233", contactInfo: "", productCode: "" },
];

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateProductCode = (id: string, code: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, productCode: code } : o)));
  };

  const handleAccept = (id: string) => {
    toast.success(`Заявка ${id} принята!`);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Заявки</h1>
            <p className="text-sm text-muted-foreground">{orders.length} активных</p>
          </div>
        </div>

        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                className="w-full p-4 text-left"
                onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{o.id}</span>
                    <Badge className="bg-accent text-accent-foreground">{o.type}</Badge>
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
                  <span className="font-medium">{o.to}</span>
                </div>
              </button>

              {expandedId === o.id && (
                <div className="border-t border-border p-4 bg-accent/20 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{o.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{o.contact}</span>
                    </div>
                    {o.contactInfo && (
                      <div className="col-span-full text-muted-foreground text-xs">
                        {o.contactInfo}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Код товара</label>
                    <Input
                      placeholder="Введите код товара"
                      value={o.productCode}
                      onChange={(e) => updateProductCode(o.id, e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => handleAccept(o.id)} className="flex-1">
                      <Package className="h-4 w-4 mr-2" />
                      Принять заявку
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/chat")}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Чат
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Orders;
