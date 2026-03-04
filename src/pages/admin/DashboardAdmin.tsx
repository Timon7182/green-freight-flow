import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Users, Clock, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

const statusLabels: Record<string, string> = {
  draft: "Черновик", submitted: "Отправлена", calculating: "В расчёте",
  quoted: "Рассчитана", confirmed: "Подтверждена", awaiting_payment: "Ожидаем оплату",
  paid: "Оплачена", in_progress: "В работе", completed: "Завершена", cancelled: "Отменена",
};

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, awaitingAction: 0, completed: 0, usersCount: 0 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchAll = async () => {
      const [reqRes, usersRes] = await Promise.all([
        supabase.from("shipment_requests").select("id, request_number, status, created_at, cargo_name, client_id, service_type").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email"),
      ]);

      const reqs = reqRes.data || [];
      const users = usersRes.data || [];

      const profMap: Record<string, any> = {};
      users.forEach(u => { profMap[u.id] = u; });
      setProfiles(profMap);

      const counts: Record<string, number> = {};
      reqs.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
      setStatusCounts(counts);

      const active = reqs.filter(r => !["completed", "cancelled", "draft"].includes(r.status)).length;
      const awaitingAction = (counts["submitted"] || 0) + (counts["confirmed"] || 0);

      setStats({
        total: reqs.length,
        active,
        awaitingAction,
        completed: counts["completed"] || 0,
        usersCount: users.length,
      });

      setRecentRequests(reqs.slice(0, 8));
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <AppLayout><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">Панель управления</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="h-5 w-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Всего заявок</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-blue-500" /></div>
              <div><p className="text-2xl font-bold">{stats.active}</p><p className="text-xs text-muted-foreground">Активные</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-amber-500" /></div>
              <div><p className="text-2xl font-bold">{stats.awaitingAction}</p><p className="text-xs text-muted-foreground">Ждут действия</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><Users className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="text-2xl font-bold">{stats.usersCount}</p><p className="text-xs text-muted-foreground">Пользователей</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Status breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-lg">По статусам</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusLabels).map(([key, label]) => {
                const count = statusCounts[key] || 0;
                if (count === 0) return null;
                return (
                  <Badge key={key} variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => navigate(`/admin/requests?status=${key}`)}>
                    {label}: {count}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Последние заявки</CardTitle>
            <span className="text-sm text-primary cursor-pointer hover:underline" onClick={() => navigate("/admin/requests")}>Все →</span>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentRequests.map(r => (
              <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-accent/30 cursor-pointer transition-colors" onClick={() => navigate(`/admin/requests/${r.id}`)}>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{r.request_number}</p>
                  <p className="text-xs text-muted-foreground truncate">{profiles[r.client_id]?.full_name || profiles[r.client_id]?.email || "—"} {r.cargo_name && `• ${r.cargo_name}`}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{statusLabels[r.status]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DashboardAdmin;
