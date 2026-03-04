import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Clock, CheckCircle2, Loader2, FileText, MessageSquare, AlertCircle } from "lucide-react";

const statusLabels: Record<string, string> = {
  draft: "Черновик", submitted: "Отправлена", calculating: "В расчёте",
  quoted: "Рассчитана", confirmed: "Подтверждена", awaiting_payment: "Ожидаем оплату",
  paid: "Оплачена", in_progress: "В работе", completed: "Завершена", cancelled: "Отменена",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from("shipment_requests")
        .select("id, request_number, service_type, status, created_at, cargo_name, delivery_status")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });
      setRequests(data || []);

      // Count unread chat messages
      if (data && data.length > 0) {
        const requestIds = data.map(r => r.id);
        const { count } = await supabase
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .in("request_id", requestIds)
          .neq("sender_id", user.id)
          .eq("is_read", false);
        setUnreadMessages(count || 0);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const activeCount = requests.filter(r => !["completed", "cancelled", "draft"].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === "completed").length;
  const quotedCount = requests.filter(r => r.status === "quoted").length;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {profile?.full_name ? `Привет, ${profile.full_name}!` : "Главная"}
            </h1>
            <p className="text-muted-foreground text-sm">Ваши грузоперевозки из Китая</p>
          </div>
          <Button onClick={() => navigate("/client/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Новая заявка
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{requests.length}</p>
                <p className="text-xs text-muted-foreground">Всего</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Активные</p>
              </div>
            </CardContent>
          </Card>
          <Card className={quotedCount > 0 ? "ring-1 ring-amber-500/50" : ""}>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quotedCount}</p>
                <p className="text-xs text-muted-foreground">Ждут ответа</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Завершённые</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(quotedCount > 0 || unreadMessages > 0) && (
          <div className="space-y-2">
            {quotedCount > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm">У вас {quotedCount} {quotedCount === 1 ? "заявка ожидает" : "заявок ожидают"} вашего подтверждения КП</p>
              </div>
            )}
            {unreadMessages > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <MessageSquare className="h-5 w-5 text-blue-500 shrink-0" />
                <p className="text-sm">{unreadMessages} непрочитанных сообщений в чате</p>
              </div>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Последние заявки</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">У вас пока нет заявок</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/client/create")}>Создать первую заявку</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.slice(0, 10).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 cursor-pointer transition-colors" onClick={() => navigate(`/client/requests/${r.id}`)}>
                    <div>
                      <p className="font-medium text-sm">{r.request_number}</p>
                      <p className="text-xs text-muted-foreground">{r.cargo_name || "Без названия"}</p>
                    </div>
                    <Badge variant="secondary">{statusLabels[r.status] || r.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
