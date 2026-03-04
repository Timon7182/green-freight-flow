import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, XCircle, Calculator } from "lucide-react";
import { toast } from "sonner";
import { notifyQuoteReady } from "@/lib/notifications";

interface Props {
  requestId: string;
  requestStatus: string;
  onStatusChange: () => void;
  isStaff: boolean;
}

const currencies = ["USD", "CNY", "RUB", "KZT", "UZS"];

export const RequestQuote = ({ requestId, requestStatus, onStatusChange, isStaff }: Props) => {
  const { user } = useAuth();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Staff form
  const [currency, setCurrency] = useState("USD");
  const [pickupChina, setPickupChina] = useState("");
  const [freight, setFreight] = useState("");
  const [warehouseConsolidation, setWarehouseConsolidation] = useState("");
  const [domesticDelivery, setDomesticDelivery] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [comments, setComments] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchQuote = async () => {
    const { data } = await supabase
      .from("quotes")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      const q = data[0];
      setQuote(q);
      setCurrency(q.currency || "USD");
      setPickupChina(q.pickup_china?.toString() || "");
      setFreight(q.freight?.toString() || "");
      setWarehouseConsolidation(q.warehouse_consolidation?.toString() || "");
      setDomesticDelivery(q.domestic_delivery?.toString() || "");
      setOtherCosts(q.other_costs?.toString() || "");
      setEstimatedDays(q.estimated_days?.toString() || "");
      setComments(q.comments || "");
    }
    setLoading(false);
  };

  useEffect(() => { fetchQuote(); }, [requestId]);

  const totalAmount = [pickupChina, freight, warehouseConsolidation, domesticDelivery, otherCosts]
    .reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  const handleSaveQuote = async () => {
    if (!user || totalAmount <= 0) return;
    setSaving(true);

    const quoteData = {
      request_id: requestId,
      currency,
      pickup_china: parseFloat(pickupChina) || null,
      freight: parseFloat(freight) || null,
      warehouse_consolidation: parseFloat(warehouseConsolidation) || null,
      domestic_delivery: parseFloat(domesticDelivery) || null,
      other_costs: parseFloat(otherCosts) || null,
      total_amount: totalAmount,
      estimated_days: parseInt(estimatedDays) || null,
      comments: comments || null,
      created_by: user.id,
    };

    if (quote) {
      await supabase.from("quotes").update(quoteData).eq("id", quote.id);
    } else {
      await supabase.from("quotes").insert(quoteData);
    }

    // Update status to quoted
    if (requestStatus === "submitted" || requestStatus === "calculating") {
      await supabase.from("shipment_requests").update({ status: "quoted" as any }).eq("id", requestId);
    }

    // Notify the client that quote is ready
    const { data: reqData } = await supabase
      .from("shipment_requests")
      .select("client_id, request_number")
      .eq("id", requestId)
      .single();
    if (reqData?.client_id) {
      notifyQuoteReady(requestId, reqData.client_id, reqData.request_number, totalAmount, currency);
    }

    toast.success("КП сохранено");
    setSaving(false);
    await fetchQuote();
    onStatusChange();
  };

  // Client actions
  const handleAccept = async () => {
    await supabase.from("shipment_requests").update({ status: "confirmed" as any }).eq("id", requestId);
    toast.success("Вы подтвердили КП");
    onStatusChange();
  };

  const handleReject = async () => {
    await supabase.from("shipment_requests").update({ status: "cancelled" as any }).eq("id", requestId);
    toast.info("Заявка отменена");
    onStatusChange();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  // Staff: edit/create quote
  if (isStaff) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Коммерческое предложение
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Валюта</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Забор по Китаю</Label><Input type="number" value={pickupChina} onChange={e => setPickupChina(e.target.value)} /></div>
            <div className="space-y-2"><Label>Доставка/фрахт</Label><Input type="number" value={freight} onChange={e => setFreight(e.target.value)} /></div>
            <div className="space-y-2"><Label>Склад/консолидация</Label><Input type="number" value={warehouseConsolidation} onChange={e => setWarehouseConsolidation(e.target.value)} /></div>
            <div className="space-y-2"><Label>Доставка по стране</Label><Input type="number" value={domesticDelivery} onChange={e => setDomesticDelivery(e.target.value)} /></div>
            <div className="space-y-2"><Label>Прочие расходы</Label><Input type="number" value={otherCosts} onChange={e => setOtherCosts(e.target.value)} /></div>
            <div className="space-y-2"><Label>Срок (дней)</Label><Input type="number" value={estimatedDays} onChange={e => setEstimatedDays(e.target.value)} /></div>
          </div>

          <div className="p-3 rounded-lg bg-primary/5 text-sm">
            <span className="text-muted-foreground">Итого: </span>
            <span className="font-bold text-lg">{totalAmount.toLocaleString()} {currency}</span>
          </div>

          <div className="space-y-2">
            <Label>Комментарии / условия</Label>
            <Textarea value={comments} onChange={e => setComments(e.target.value)} rows={3} />
          </div>

          <Button onClick={handleSaveQuote} disabled={saving || totalAmount <= 0} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {quote ? "Обновить КП" : "Сохранить КП"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Client view
  if (!quote) {
    return (
      <div className="text-center py-8">
        <Calculator className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">Расчёт ещё не готов</p>
        <p className="text-xs text-muted-foreground mt-1">Менеджер подготовит КП и вы увидите его здесь</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Коммерческое предложение</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          {quote.pickup_china > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Забор по Китаю</span><span>{quote.pickup_china} {quote.currency}</span></div>}
          {quote.freight > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Доставка/фрахт</span><span>{quote.freight} {quote.currency}</span></div>}
          {quote.warehouse_consolidation > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Склад/консолидация</span><span>{quote.warehouse_consolidation} {quote.currency}</span></div>}
          {quote.domestic_delivery > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Доставка по стране</span><span>{quote.domestic_delivery} {quote.currency}</span></div>}
          {quote.other_costs > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Прочие расходы</span><span>{quote.other_costs} {quote.currency}</span></div>}
          <div className="flex justify-between pt-2 border-t font-bold">
            <span>Итого</span>
            <span className="text-lg">{quote.total_amount?.toLocaleString()} {quote.currency}</span>
          </div>
        </div>

        {quote.estimated_days && <p className="text-sm text-muted-foreground">Ориентировочный срок: ~{quote.estimated_days} дней</p>}
        {quote.comments && <p className="text-sm bg-muted p-3 rounded-lg">{quote.comments}</p>}

        {requestStatus === "quoted" && (
          <div className="flex gap-3 pt-2">
            <Button onClick={handleAccept} className="flex-1">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Принять
            </Button>
            <Button variant="outline" onClick={handleReject} className="flex-1">
              <XCircle className="h-4 w-4 mr-2" /> Отказаться
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
