import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Truck } from "lucide-react";

const mockOrders = [
  { id: "ZK-001", from: "Склад 1", to: "Алматы", type: "Сборный", date: "03.03.2026", status: "in_progress", productCode: "KZ-4421" },
];

const MyCarrierOrders = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Мои заказы</h1>
      {mockOrders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>У вас пока нет принятых заказов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mockOrders.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono font-bold text-primary">{o.id}</span>
                  <Badge className="ml-2 bg-primary text-primary-foreground">В работе</Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {o.date}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{o.from}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{o.to}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span><Truck className="h-3 w-3 inline mr-1" />{o.type}</span>
                <span>Код: <span className="font-mono font-medium text-foreground">{o.productCode}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </AppLayout>
);

export default MyCarrierOrders;
