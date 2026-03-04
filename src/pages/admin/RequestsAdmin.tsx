import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package } from "lucide-react";

const statusLabels: Record<string, string> = {
  draft: "Черновик",
  submitted: "Отправлена",
  calculating: "В расчёте",
  quoted: "Рассчитана",
  confirmed: "Подтверждена",
  awaiting_payment: "Ожидаем оплату",
  paid: "Оплачена",
  in_progress: "В работе",
  completed: "Завершена",
  cancelled: "Отменена",
};

const serviceLabels: Record<string, string> = {
  consolidated_pickup: "Сборный (забор)",
  consolidated_warehouse: "Сборный (до склада)",
  container_fcl: "Контейнер (FCL)",
  truck_ftl: "Фура (FTL)",
};

const RequestsAdmin = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("shipment_requests")
      .select("id, request_number, service_type, status, created_at, cargo_name, client_id")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRequests(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Все заявки</h1>
          <p className="text-muted-foreground text-sm">Управление заявками клиентов</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Заявок пока нет</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <Card
                key={r.id}
                className="cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => navigate(`/admin/requests/${r.id}`)}
              >
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.request_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {serviceLabels[r.service_type] || r.service_type}
                      {r.cargo_name && ` • ${r.cargo_name}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(r.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <Badge variant="secondary">{statusLabels[r.status] || r.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default RequestsAdmin;
