import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Truck, Package, CheckCircle2, Clock, ArrowRight, Flame } from "lucide-react";

const orderStages = [
  { key: "new", label: "Новая", icon: Package },
  { key: "accepted", label: "Принята", icon: CheckCircle2 },
  { key: "pickup", label: "Получение", icon: MapPin },
  { key: "in_transit", label: "В пути", icon: Truck },
  { key: "delivered", label: "Доставлен", icon: CheckCircle2 },
];

type OrderStatus = "pending" | "in_discussion" | "delivered";

interface Order {
  id: string;
  from: string;
  to: string;
  type: string;
  date: string;
  stage: string;
  status: OrderStatus;
}

const mockOrders: Order[] = [
  { id: "ZK-001", from: "Склад 1", to: "Алматы", type: "Сборный", date: "03.03.2026", stage: "in_transit", status: "in_discussion" },
  { id: "ZK-002", from: "Склад 2", to: "Астана", type: "Контейнерный (аренда)", date: "02.03.2026", stage: "accepted", status: "in_discussion" },
  { id: "ZK-003", from: "г. Караганда, ул. Ленина, 5", to: "Шымкент", type: "Контейнерный (выкуп)", date: "01.03.2026", stage: "delivered", status: "delivered" },
  { id: "ZK-006", from: "Склад 1", to: "Актобе", type: "Сборный", date: "03.03.2026", stage: "new", status: "pending" },
  { id: "ZK-007", from: "Склад 3", to: "Тараз", type: "Контейнерный (аренда)", date: "04.03.2026", stage: "new", status: "pending" },
];

const tabConfig = [
  { value: "active", label: "Активные", icon: Flame, filter: (o: Order) => o.status === "pending" },
  { value: "in_progress", label: "В процессе", icon: Clock, filter: (o: Order) => o.status === "in_discussion" },
  { value: "completed", label: "Отработанные", icon: CheckCircle2, filter: (o: Order) => o.status === "delivered" },
];

const stageColors: Record<string, string> = {
  new: "bg-muted text-muted-foreground",
  accepted: "bg-accent text-accent-foreground",
  pickup: "bg-accent text-accent-foreground",
  in_transit: "bg-primary text-primary-foreground",
  delivered: "bg-primary text-primary-foreground",
};

const StageTracker = ({ currentStage }: { currentStage: string }) => {
  const currentIndex = orderStages.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
      {orderStages.map((stage, i) => {
        const isActive = i <= currentIndex;
        const Icon = stage.icon;
        return (
          <div key={stage.key} className="flex items-center">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${isActive ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
              <Icon className="h-3 w-3" />
              {stage.label}
            </div>
            {i < orderStages.length - 1 && (
              <ArrowRight className={`h-3 w-3 mx-0.5 shrink-0 ${i < currentIndex ? "text-primary" : "text-muted-foreground/30"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const MyOrders = () => {
  const getStageLabel = (stage: string) => orderStages.find((s) => s.key === stage)?.label || stage;

  const renderOrder = (o: Order) => (
    <div key={o.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{o.id}</span>
          <Badge className={stageColors[o.stage]}>{getStageLabel(o.stage)}</Badge>
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
      <StageTracker currentStage={o.stage} />
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Мои заявки</h1>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-12">
            {tabConfig.map((tab) => {
              const count = mockOrders.filter(tab.filter).length;
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
            const filtered = mockOrders.filter(tab.filter);
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

export default MyOrders;
