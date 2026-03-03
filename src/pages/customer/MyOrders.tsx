import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Truck, Package, CheckCircle2, Clock, ArrowRight } from "lucide-react";

const orderStages = [
  { key: "new", label: "Новая", icon: Package },
  { key: "accepted", label: "Принята", icon: CheckCircle2 },
  { key: "pickup", label: "Получение", icon: MapPin },
  { key: "in_transit", label: "В пути", icon: Truck },
  { key: "delivered", label: "Доставлен", icon: CheckCircle2 },
];

const mockOrders = [
  { id: "ZK-001", from: "Склад 1", to: "Алматы", type: "Сборный", date: "03.03.2026", stage: "in_transit" },
  { id: "ZK-002", from: "Склад 2", to: "Астана", type: "Контейнерный (аренда)", date: "02.03.2026", stage: "accepted" },
  { id: "ZK-003", from: "г. Караганда, ул. Ленина, 5", to: "Шымкент", type: "Контейнерный (выкуп)", date: "01.03.2026", stage: "delivered" },
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

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Мои заявки</h1>
        <div className="space-y-3">
          {mockOrders.map((o) => (
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
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default MyOrders;
