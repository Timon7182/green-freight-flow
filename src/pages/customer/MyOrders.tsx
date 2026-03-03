import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Truck } from "lucide-react";

const mockOrders = [
  { id: "ZK-001", from: "Склад 1", to: "Алматы", type: "Сборный", date: "03.03.2026", status: "new" },
  { id: "ZK-002", from: "Склад 2", to: "Астана", type: "Контейнерный (аренда)", date: "02.03.2026", status: "in_progress" },
  { id: "ZK-003", from: "г. Караганда, ул. Ленина, 5", to: "Шымкент", type: "Контейнерный (выкуп)", date: "01.03.2026", status: "completed" },
];

const statusMap: Record<string, { label: string; className: string }> = {
  new: { label: "Новая", className: "bg-accent text-accent-foreground" },
  in_progress: { label: "В работе", className: "bg-primary text-primary-foreground" },
  completed: { label: "Завершена", className: "bg-muted text-muted-foreground" },
};

const MyOrders = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Мои заявки</h1>
      <div className="space-y-3">
        {mockOrders.map((o) => (
          <div key={o.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-mono text-muted-foreground">{o.id}</span>
                <Badge className={`ml-2 ${statusMap[o.status].className}`}>{statusMap[o.status].label}</Badge>
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Truck className="h-3 w-3" />
              {o.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default MyOrders;
