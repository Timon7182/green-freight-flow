import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Package, FileText, MessageSquare, MapPin, Truck } from "lucide-react";
import { RequestChat } from "@/components/RequestChat";
import { RequestDocuments } from "@/components/RequestDocuments";
import { RequestTracking } from "@/components/RequestTracking";
import { RequestQuote } from "@/components/RequestQuote";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground", submitted: "bg-primary/10 text-primary",
  calculating: "bg-warning/10 text-warning", quoted: "bg-accent text-accent-foreground",
  confirmed: "bg-primary/20 text-primary", awaiting_payment: "bg-warning/10 text-warning",
  paid: "bg-primary/20 text-primary", in_progress: "bg-primary/10 text-primary",
  completed: "bg-primary text-primary-foreground", cancelled: "bg-destructive/10 text-destructive",
};

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, tStatus, tService } = useLanguage();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<any>(null);
  const [city, setCity] = useState<any>(null);
  const [warehouse, setWarehouse] = useState<any>(null);
  const [unreadChat, setUnreadChat] = useState(0);

  const fetchRequest = async () => {
    if (!id) return;
    const { data } = await supabase.from("shipment_requests").select("*").eq("id", id).single();
    setRequest(data);
    setLoading(false);

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

  const fetchUnreadChat = async () => {
    if (!id || !user) return;
    const { count } = await supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("request_id", id)
      .neq("sender_id", user.id)
      .eq("is_read", false);
    setUnreadChat(count || 0);
  };

  useEffect(() => {
    fetchRequest();
    fetchUnreadChat();
  }, [id]);

  if (loading) return (
    <AppLayout>
      <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    </AppLayout>
  );

  if (!request) return (
    <AppLayout>
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("detail.notFound")}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("detail.back")}
        </Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> {t("detail.back")}
            </Button>
            <h1 className="text-2xl font-bold">{request.request_number}</h1>
            <p className="text-sm text-muted-foreground">{tService(request.service_type)}</p>
          </div>
          <Badge className={statusColors[request.status] || ""}>{tStatus(request.status)}</Badge>
        </div>

        {request.delivery_status && (
          <RequestTracking currentStatus={request.delivery_status} requestId={request.id} />
        )}

        <Tabs defaultValue="info">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="info"><Package className="h-4 w-4 mr-1" /> {t("detail.info")}</TabsTrigger>
            <TabsTrigger value="docs"><FileText className="h-4 w-4 mr-1" /> {t("detail.docs")}</TabsTrigger>
            <TabsTrigger value="quote"><Truck className="h-4 w-4 mr-1" /> {t("detail.quote")}</TabsTrigger>
            <TabsTrigger value="chat" className="relative">
              <MessageSquare className="h-4 w-4 mr-1" /> {t("detail.chat")}
              {unreadChat > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadChat}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {t("detail.from")}</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  {warehouse ? (
                    <>
                      <p className="font-medium">{warehouse.name}</p>
                      <p className="text-muted-foreground">{warehouse.city}</p>
                      <p className="text-muted-foreground">{warehouse.full_address}</p>
                    </>
                  ) : (
                    <>
                      {request.pickup_province && <p>{request.pickup_province}, {request.pickup_city}</p>}
                      {request.pickup_address && <p>{request.pickup_address}</p>}
                      {request.pickup_contact_name && <p className="text-muted-foreground">Контакт: {request.pickup_contact_name}</p>}
                      {request.pickup_contact_phone && <p className="text-muted-foreground">Тел: {request.pickup_contact_phone}</p>}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> {t("detail.to")}</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  {country && <p className="font-medium">{country.name_ru}</p>}
                  {city && <p>{city.name_ru}</p>}
                  {request.destination_city_custom && <p>{request.destination_city_custom}</p>}
                  {request.destination_station && <p className="text-muted-foreground">Станция: {request.destination_station}</p>}
                  {request.destination_comment && <p className="text-muted-foreground">{request.destination_comment}</p>}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> {t("detail.cargo")}</CardTitle></CardHeader>
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
                      {request.supplier_comment && <p className="text-muted-foreground mt-1">{request.supplier_comment}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="docs">
            <RequestDocuments requestId={request.id} canUpload={false} />
          </TabsContent>

          <TabsContent value="quote">
            <RequestQuote requestId={request.id} requestStatus={request.status} onStatusChange={fetchRequest} isStaff={false} />
          </TabsContent>

          <TabsContent value="chat">
            <RequestChat requestId={request.id} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RequestDetail;
