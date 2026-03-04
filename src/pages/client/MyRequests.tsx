import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Package, Plus } from "lucide-react";

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

const MyRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("shipment_requests")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRequests(data || []);
        setLoading(false);
      });
  }, [user]);

  const activeStatuses = ["submitted", "calculating", "quoted", "confirmed", "awaiting_payment", "paid", "in_progress"];
  const active = requests.filter(r => activeStatuses.includes(r.status));
  const drafts = requests.filter(r => r.status === "draft");
  const done = requests.filter(r => ["completed", "cancelled"].includes(r.status));

  const renderList = (list: any[]) => {
    if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    if (list.length === 0) return (
      <div className="text-center py-8">
        <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">Нет заявок</p>
      </div>
    );
    return (
      <div className="space-y-3">
        {list.map((r) => (
          <Card key={r.id} className="cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => navigate(`/client/requests/${r.id}`)}>
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{r.request_number}</p>
                <p className="text-xs text-muted-foreground">
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
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Мои заявки</h1>
          <Button onClick={() => navigate("/client/create")}>
            <Plus className="h-4 w-4 mr-2" /> Новая заявка
          </Button>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Активные ({active.length})</TabsTrigger>
            <TabsTrigger value="drafts">Черновики ({drafts.length})</TabsTrigger>
            <TabsTrigger value="done">Завершённые ({done.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">{renderList(active)}</TabsContent>
          <TabsContent value="drafts">{renderList(drafts)}</TabsContent>
          <TabsContent value="done">{renderList(done)}</TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default MyRequests;
