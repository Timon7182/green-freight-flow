import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Package, Search } from "lucide-react";

const statusLabels: Record<string, string> = {
  draft: "Черновик", submitted: "Отправлена", calculating: "В расчёте",
  quoted: "Рассчитана", confirmed: "Подтверждена", awaiting_payment: "Ожидаем оплату",
  paid: "Оплачена", in_progress: "В работе", completed: "Завершена", cancelled: "Отменена",
};

const serviceLabels: Record<string, string> = {
  consolidated_pickup: "Сборный (забор)", consolidated_warehouse: "Сборный (до склада)",
  container_fcl: "Контейнер (FCL)", truck_ftl: "Фура (FTL)",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-500/10 text-blue-600",
  calculating: "bg-amber-500/10 text-amber-600",
  quoted: "bg-purple-500/10 text-purple-600",
  confirmed: "bg-emerald-500/10 text-emerald-600",
  awaiting_payment: "bg-orange-500/10 text-orange-600",
  paid: "bg-green-500/10 text-green-600",
  in_progress: "bg-blue-600/10 text-blue-700",
  completed: "bg-green-600/10 text-green-700",
  cancelled: "bg-destructive/10 text-destructive",
};

const RequestsAdmin = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("shipment_requests")
        .select("id, request_number, service_type, status, created_at, cargo_name, client_id, assigned_manager_id")
        .order("created_at", { ascending: false });

      setRequests(data || []);

      // Fetch client profiles
      const clientIds = [...new Set((data || []).map(r => r.client_id))];
      if (clientIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name, email, company").in("id", clientIds);
        const map: Record<string, any> = {};
        profs?.forEach(p => { map[p.id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = requests.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (serviceFilter !== "all" && r.service_type !== serviceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const client = profiles[r.client_id];
      const haystack = [r.request_number, r.cargo_name, client?.full_name, client?.email, client?.company]
        .filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Все заявки</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} из {requests.length} заявок</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Поиск по номеру, грузу, клиенту..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Статус" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Тип" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              {Object.entries(serviceLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">{requests.length === 0 ? "Заявок пока нет" : "Ничего не найдено"}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => {
              const client = profiles[r.client_id];
              return (
                <Card key={r.id} className="cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => navigate(`/admin/requests/${r.id}`)}>
                  <CardContent className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{r.request_number}</p>
                        <span className="text-xs text-muted-foreground">{serviceLabels[r.service_type]}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {client?.full_name || client?.email || "—"}
                        {client?.company && ` • ${client.company}`}
                        {r.cargo_name && ` • ${r.cargo_name}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleDateString("ru-RU")}</p>
                    </div>
                    <Badge className={statusColors[r.status] || ""} variant="secondary">{statusLabels[r.status] || r.status}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default RequestsAdmin;
