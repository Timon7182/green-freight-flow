import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Package, FileText, MessageSquare, MapPin, Truck, Settings, Activity } from "lucide-react";
import { RequestChat } from "@/components/RequestChat";
import { RequestDocuments } from "@/components/RequestDocuments";
import { RequestQuote } from "@/components/RequestQuote";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const statusLabels: Record<string, string> = {
  draft: "Черновик", submitted: "Отправлена", calculating: "В расчёте",
  quoted: "Рассчитана", confirmed: "Подтверждена", awaiting_payment: "Ожидаем оплату",
  paid: "Оплачена", in_progress: "В работе", completed: "Завершена", cancelled: "Отменена",
};

const serviceLabels: Record<string, string> = {
  consolidated_pickup: "Сборный (забор)", consolidated_warehouse: "Сборный (до склада)",
  container_fcl: "Контейнер (FCL)", truck_ftl: "Фура (FTL)",
};

const deliveryStatuses = [
  { value: "picked_up", label: "Забран у поставщика" },
  { value: "arrived_china_warehouse", label: "Прибыл на склад в Китае" },
  { value: "shipped", label: "Отправлен" },
  { value: "at_border", label: "На границе" },
  { value: "customs_cleared", label: "Прошёл таможню" },
  { value: "in_delivery", label: "В доставке" },
  { value: "delivered", label: "Доставлен" },
];

const businessStatuses = [
  "draft", "submitted", "calculating", "quoted", "confirmed",
  "awaiting_payment", "paid", "in_progress", "completed", "cancelled",
];

const RequestDetailAdmin = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [country, setCountry] = useState<any>(null);
  const [city, setCity] = useState<any>(null);
  const [warehouse, setWarehouse] = useState<any>(null);

  // Tracking
  const [newDeliveryStatus, setNewDeliveryStatus] = useState("");
  const [trackingComment, setTrackingComment] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchRequest = async () => {
    if (!id) return;
    const { data } = await supabase.from("shipment_requests").select("*").eq("id", id).single();
    setRequest(data);
    setLoading(false);

    if (data?.client_id) {
      supabase.from("profiles").select("full_name, email, company, phone").eq("id", data.client_id).single().then(r => setClientProfile(r.data));
    }
    if (data?.destination_country_id) {
      supabase.from("countries").select("name_ru").eq("id", data.destination_country_id).single().then(r => setCountry(r.data));
    }
    if (data?.destination_city_id) {
      supabase.from("destination_cities").select("name_ru").eq("id", data.destination_city_id).single().then(r => setCity(r.data));
    }
    if (data?.source_warehouse_id) {
      supabase.from("warehouses").select("name, city, full_address").eq("id", data.source_warehouse_id).single().then(r => setWarehouse(r.data));
    }
  };

  useEffect(() => { fetchRequest(); }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    await supabase.from("shipment_requests").update({ status: newStatus as any }).eq("id", id);
    toast.success(`Статус: ${statusLabels[newStatus]}`);
    fetchRequest();
  };

  const handleDeliveryStatusUpdate = async () => {
    if (!newDeliveryStatus || !user || !id) return;
    setUpdatingStatus(true);

    await supabase.from("tracking_events").insert({
      request_id: id,
      status: newDeliveryStatus as any,
      comment: trackingComment || null,
      created_by: user.id,
    });

    await supabase.from("shipment_requests").update({ delivery_status: newDeliveryStatus as any }).eq("id", id);

    toast.success("Статус доставки обновлён");
    setNewDeliveryStatus("");
    setTrackingComment("");
    setUpdatingStatus(false);
    fetchRequest();
  };

  if (loading) return (
    <AppLayout><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></AppLayout>
  );

  if (!request) return (
    <AppLayout>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Заявка не найдена</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Назад</Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/requests")} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> К заявкам
            </Button>
            <h1 className="text-2xl font-bold">{request.request_number}</h1>
            <p className="text-sm text-muted-foreground">{serviceLabels[request.service_type]}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={request.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {businessStatuses.map(s => (
                  <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Client info */}
        {clientProfile && (
          <Card>
            <CardContent className="py-3 flex items-center gap-4 text-sm">
              <span className="font-medium">{clientProfile.full_name || clientProfile.email}</span>
              {clientProfile.company && <span className="text-muted-foreground">{clientProfile.company}</span>}
              {clientProfile.phone && <span className="text-muted-foreground">{clientProfile.phone}</span>}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="info">
          <TabsList className="w-full justify-start flex-wrap">
            <TabsTrigger value="info"><Package className="h-4 w-4 mr-1" /> Инфо</TabsTrigger>
            <TabsTrigger value="quote"><Settings className="h-4 w-4 mr-1" /> КП</TabsTrigger>
            <TabsTrigger value="docs"><FileText className="h-4 w-4 mr-1" /> Документы</TabsTrigger>
            <TabsTrigger value="tracking"><Activity className="h-4 w-4 mr-1" /> Трекинг</TabsTrigger>
            <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-1" /> Чат</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Откуда</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  {warehouse ? (
                    <>
                      <p className="font-medium">{warehouse.name}</p>
                      <p className="text-muted-foreground">{warehouse.city} — {warehouse.full_address}</p>
                    </>
                  ) : (
                    <>
                      {request.pickup_province && <p>{request.pickup_province}, {request.pickup_city}</p>}
                      {request.pickup_address && <p>{request.pickup_address}</p>}
                      {request.pickup_contact_name && <p className="text-muted-foreground">Контакт: {request.pickup_contact_name}</p>}
                      {request.pickup_contact_phone && <p className="text-muted-foreground">Тел: {request.pickup_contact_phone}</p>}
                      {request.pickup_contact_wechat && <p className="text-muted-foreground">WeChat: {request.pickup_contact_wechat}</p>}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Куда</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  {country && <p className="font-medium">{country.name_ru}</p>}
                  {city && <p>{city.name_ru}</p>}
                  {request.destination_city_custom && <p>{request.destination_city_custom}</p>}
                  {request.destination_station && <p className="text-muted-foreground">Станция: {request.destination_station}</p>}
                  {request.destination_comment && <p className="text-muted-foreground">{request.destination_comment}</p>}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Груз</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {request.cargo_name && <div><p className="text-muted-foreground">Товар</p><p className="font-medium">{request.cargo_name}</p></div>}
                    {request.hs_code && <div><p className="text-muted-foreground">HS код</p><p className="font-medium">{request.hs_code}</p></div>}
                    {request.material && <div><p className="text-muted-foreground">Материал</p><p className="font-medium">{request.material}</p></div>}
                    {request.purpose && <div><p className="text-muted-foreground">Назначение</p><p className="font-medium">{request.purpose}</p></div>}
                    {request.places_count && <div><p className="text-muted-foreground">Мест</p><p className="font-medium">{request.places_count}</p></div>}
                    {request.weight_gross && <div><p className="text-muted-foreground">Брутто</p><p className="font-medium">{request.weight_gross} кг</p></div>}
                    {request.weight_net && <div><p className="text-muted-foreground">Нетто</p><p className="font-medium">{request.weight_net} кг</p></div>}
                    {request.volume_m3 && <div><p className="text-muted-foreground">Объём</p><p className="font-medium">{request.volume_m3} м³</p></div>}
                  </div>
                  {request.clarify_with_supplier && (
                    <div className="mt-4 p-3 rounded-lg bg-warning/10 text-sm">
                      <p className="font-medium text-warning">Уточняется у поставщика</p>
                      {request.supplier_contact && <p>Контакт: {request.supplier_contact}</p>}
                      {request.supplier_phone && <p>Тел: {request.supplier_phone}</p>}
                      {request.supplier_wechat && <p>WeChat: {request.supplier_wechat}</p>}
                      {request.supplier_comment && <p className="text-muted-foreground mt-1">{request.supplier_comment}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quote">
            <RequestQuote requestId={request.id} requestStatus={request.status} onStatusChange={fetchRequest} isStaff={true} />
          </TabsContent>

          <TabsContent value="docs">
            <RequestDocuments requestId={request.id} canUpload={true} canManageVisibility={true} />
          </TabsContent>

          <TabsContent value="tracking">
            <Card>
              <CardHeader><CardTitle className="text-lg">Обновить статус доставки</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Текущий статус: <Badge variant="secondary">{request.delivery_status ? deliveryStatuses.find(d => d.value === request.delivery_status)?.label || "—" : "Не установлен"}</Badge></Label>
                </div>
                <div className="space-y-2">
                  <Label>Новый статус</Label>
                  <Select value={newDeliveryStatus} onValueChange={setNewDeliveryStatus}>
                    <SelectTrigger><SelectValue placeholder="Выберите статус" /></SelectTrigger>
                    <SelectContent>
                      {deliveryStatuses.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Комментарий</Label>
                  <Textarea value={trackingComment} onChange={e => setTrackingComment(e.target.value)} placeholder="Детали обновления" rows={2} />
                </div>
                <Button onClick={handleDeliveryStatusUpdate} disabled={!newDeliveryStatus || updatingStatus}>
                  {updatingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Обновить статус
                </Button>
              </CardContent>
            </Card>

            {/* Show tracking history */}
            <div className="mt-4">
              <TrackingHistory requestId={request.id} />
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <RequestChat requestId={request.id} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

// Inline tracking history component
const TrackingHistory = ({ requestId }: { requestId: string }) => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("tracking_events").select("*").eq("request_id", requestId).order("created_at", { ascending: false }).then(({ data }) => {
      setEvents(data || []);
    });
  }, [requestId]);

  const deliveryLabels: Record<string, string> = {
    picked_up: "Забран у поставщика", arrived_china_warehouse: "Прибыл на склад в Китае",
    shipped: "Отправлен", at_border: "На границе", customs_cleared: "Прошёл таможню",
    in_delivery: "В доставке", delivered: "Доставлен",
  };

  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">История статусов</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {events.map(ev => (
          <div key={ev.id} className="flex items-start gap-3 text-sm">
            <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div>
              <p className="font-medium">{deliveryLabels[ev.status] || ev.status}</p>
              {ev.comment && <p className="text-muted-foreground">{ev.comment}</p>}
              <p className="text-xs text-muted-foreground">{new Date(ev.created_at).toLocaleString("ru-RU")}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RequestDetailAdmin;
