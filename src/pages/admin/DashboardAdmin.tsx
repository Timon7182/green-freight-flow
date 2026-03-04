import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

const statusLabels: Record<string, string> = {
  draft: "Черновик", submitted: "Отправлена", calculating: "В расчёте",
  quoted: "Рассчитана", confirmed: "Подтверждена", awaiting_payment: "Ожидаем оплату",
  paid: "Оплачена", in_progress: "В работе", completed: "Завершена", cancelled: "Отменена",
};

const serviceLabels: Record<string, string> = {
  consolidated_pickup: "Сборный (забор)", consolidated_warehouse: "Сборный (до склада)",
  container_fcl: "Контейнер (FCL)", truck_ftl: "Фура (FTL)",
};

const PIE_COLORS = [
  "hsl(152, 56%, 39%)", "hsl(210, 70%, 50%)", "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 50%)", "hsl(0, 84%, 60%)", "hsl(180, 50%, 45%)",
  "hsl(120, 40%, 50%)", "hsl(45, 80%, 55%)", "hsl(330, 60%, 50%)", "hsl(200, 50%, 40%)",
];

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, awaitingAction: 0, completed: 0, usersCount: 0 });
  const [statusChartData, setStatusChartData] = useState<any[]>([]);
  const [serviceChartData, setServiceChartData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
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

      // Status counts for bar chart
      const counts: Record<string, number> = {};
      reqs.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
      setStatusChartData(
        Object.entries(statusLabels)
          .map(([key, label]) => ({ name: label, count: counts[key] || 0, key }))
          .filter(d => d.count > 0)
      );

      // Service type pie chart
      const serviceCounts: Record<string, number> = {};
      reqs.forEach(r => { serviceCounts[r.service_type] = (serviceCounts[r.service_type] || 0) + 1; });
      setServiceChartData(
        Object.entries(serviceLabels)
          .map(([key, label]) => ({ name: label, value: serviceCounts[key] || 0 }))
          .filter(d => d.value > 0)
      );

      // Monthly trend (last 6 months)
      const months: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months[key] = 0;
      }
      reqs.forEach(r => {
        const d = new Date(r.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key in months) months[key]++;
      });
      setMonthlyData(
        Object.entries(months).map(([key, count]) => {
          const [y, m] = key.split("-");
          const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
          return { name: monthNames[parseInt(m) - 1], count };
        })
      );

      const active = reqs.filter(r => !["completed", "cancelled", "draft"].includes(r.status)).length;
      const awaitingAction = (counts["submitted"] || 0) + (counts["confirmed"] || 0);

      setStats({ total: reqs.length, active, awaitingAction, completed: counts["completed"] || 0, usersCount: users.length });
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

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Monthly trend */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Заявки по месяцам</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Line type="monotone" dataKey="count" stroke="hsl(152, 56%, 39%)" strokeWidth={2} dot={{ fill: "hsl(152, 56%, 39%)" }} name="Заявки" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service type pie */}
          <Card>
            <CardHeader><CardTitle className="text-sm">По типу услуги</CardTitle></CardHeader>
            <CardContent>
              {serviceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={serviceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {serviceChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Нет данных</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status bar chart */}
        <Card>
          <CardHeader><CardTitle className="text-sm">По статусам</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="count" fill="hsl(152, 56%, 39%)" radius={[4, 4, 0, 0]} name="Заявки" />
              </BarChart>
            </ResponsiveContainer>
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
