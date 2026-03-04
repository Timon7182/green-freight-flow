import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Send, MapPin, Truck, Package as PackageIcon,
  Upload, CheckCircle2, Loader2, Warehouse
} from "lucide-react";

const serviceOptions = [
  { value: "consolidated_pickup", label: "Сборный груз — забор у поставщика", icon: Truck },
  { value: "consolidated_warehouse", label: "Сборный груз — до вашего склада в Китае", icon: Warehouse },
  { value: "container_fcl", label: "Контейнер (FCL)", icon: PackageIcon },
  { value: "truck_ftl", label: "Авто фура (FTL)", icon: Truck },
];

const STEPS = ["Услуга", "Откуда", "Куда", "Груз", "Подтверждение"];

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [serviceType, setServiceType] = useState("");

  // Step 2 - Source
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [pickupProvince, setPickupProvince] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupContactName, setPickupContactName] = useState("");
  const [pickupContactPhone, setPickupContactPhone] = useState("");
  const [pickupContactWechat, setPickupContactWechat] = useState("");

  // Step 3 - Destination
  const [destCountryId, setDestCountryId] = useState("");
  const [destCityId, setDestCityId] = useState("");
  const [destCityCustom, setDestCityCustom] = useState("");
  const [destStation, setDestStation] = useState("");
  const [destComment, setDestComment] = useState("");

  // Step 4 - Cargo
  const [cargoName, setCargoName] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [material, setMaterial] = useState("");
  const [purpose, setPurpose] = useState("");
  const [placesCount, setPlacesCount] = useState("");
  const [weightGross, setWeightGross] = useState("");
  const [weightNet, setWeightNet] = useState("");
  const [volumeM3, setVolumeM3] = useState("");
  const [clarifyWithSupplier, setClarifyWithSupplier] = useState(false);
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierWechat, setSupplierWechat] = useState("");
  const [supplierComment, setSupplierComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Step 5
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedOffer, setAgreedOffer] = useState(false);

  // Reference data
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("warehouses").select("*").eq("is_active", true).order("name"),
      supabase.from("countries").select("*").order("sort_order"),
    ]).then(([wRes, cRes]) => {
      setWarehouses(wRes.data || []);
      setCountries(cRes.data || []);
    });
  }, []);

  useEffect(() => {
    if (!destCountryId) { setCities([]); return; }
    supabase
      .from("destination_cities")
      .select("*")
      .eq("country_id", destCountryId)
      .order("name_ru")
      .then(({ data }) => setCities(data || []));
  }, [destCountryId]);

  const isConsolidated = serviceType === "consolidated_pickup" || serviceType === "consolidated_warehouse";
  const needsPickup = serviceType === "consolidated_pickup" || serviceType === "container_fcl" || serviceType === "truck_ftl";
  const needsWarehouse = serviceType === "consolidated_warehouse";

  const canNext = () => {
    if (step === 0) return !!serviceType;
    if (step === 1) {
      if (needsWarehouse) return !!sourceWarehouseId;
      if (needsPickup) return !!pickupAddress && !!pickupContactPhone;
      return true;
    }
    if (step === 2) {
      if (!destCountryId) return false;
      if (isConsolidated) return !!destCityId;
      return true;
    }
    if (step === 3) {
      if (clarifyWithSupplier) return !!supplierPhone;
      return !!cargoName;
    }
    if (step === 4) return agreedTerms && agreedPrivacy && agreedOffer;
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => !f.type.startsWith("video/"));
      setFiles(prev => [...prev, ...newFiles].slice(0, 20));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("shipment_requests")
      .insert({
        client_id: user.id,
        service_type: serviceType as any,
        source_warehouse_id: needsWarehouse ? sourceWarehouseId || null : null,
        pickup_province: needsPickup ? pickupProvince || null : null,
        pickup_city: needsPickup ? pickupCity || null : null,
        pickup_address: needsPickup ? pickupAddress || null : null,
        pickup_contact_name: needsPickup ? pickupContactName || null : null,
        pickup_contact_phone: needsPickup ? pickupContactPhone || null : null,
        pickup_contact_wechat: pickupContactWechat || null,
        destination_country_id: destCountryId || null,
        destination_city_id: destCityId || null,
        destination_city_custom: destCityCustom || null,
        destination_station: destStation || null,
        destination_comment: destComment || null,
        cargo_name: cargoName || null,
        hs_code: hsCode || null,
        material: material || null,
        purpose: purpose || null,
        places_count: placesCount ? parseInt(placesCount) : null,
        weight_gross: weightGross ? parseFloat(weightGross) : null,
        weight_net: weightNet ? parseFloat(weightNet) : null,
        volume_m3: volumeM3 ? parseFloat(volumeM3) : null,
        clarify_with_supplier: clarifyWithSupplier,
        supplier_contact: supplierContact || null,
        supplier_phone: supplierPhone || null,
        supplier_wechat: supplierWechat || null,
        supplier_comment: supplierComment || null,
        status: "submitted" as any,
        agreed_terms: agreedTerms,
        agreed_privacy: agreedPrivacy,
        agreed_offer: agreedOffer,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Ошибка создания заявки");
      setSubmitting(false);
      return;
    }

    // Upload files
    if (data && files.length > 0) {
      for (const file of files) {
        const filePath = `${user.id}/${data.id}/${Date.now()}_${file.name}`;
        const { error: uploadErr } = await supabase.storage.from("shipment-files").upload(filePath, file);
        if (!uploadErr) {
          await supabase.from("attachments").insert({
            request_id: data.id,
            file_name: file.name,
            file_path: filePath,
            file_type: "cargo_photo",
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
          });
        }
      }
    }

    setSubmitting(false);
    toast.success("Заявка отправлена!", { description: "Менеджер свяжется с вами в ближайшее время." });
    navigate("/client/requests");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Новая заявка</h1>
          {/* Stepper */}
          <div className="flex items-center gap-1 mt-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={cn(
                  "h-2 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-muted"
                )} />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Шаг {step + 1} из {STEPS.length}: {STEPS[step]}
          </p>
        </div>

        {/* Step 1: Service Type */}
        {step === 0 && (
          <div className="space-y-3">
            <RadioGroup value={serviceType} onValueChange={setServiceType}>
              {serviceOptions.map(opt => (
                <label key={opt.value} className={cn(
                  "flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-colors",
                  serviceType === opt.value ? "border-primary bg-primary/5" : "hover:bg-accent/30"
                )}>
                  <RadioGroupItem value={opt.value} />
                  <opt.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">{opt.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Step 2: Source */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {needsWarehouse ? "Выберите склад в Китае" : "Адрес забора в Китае"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {needsWarehouse && (
                <Select value={sourceWarehouseId} onValueChange={setSourceWarehouseId}>
                  <SelectTrigger><SelectValue placeholder="Выберите склад" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} — {w.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {needsPickup && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Провинция/Город</Label>
                      <Input value={pickupProvince} onChange={e => setPickupProvince(e.target.value)} placeholder="Guangdong" />
                    </div>
                    <div className="space-y-2">
                      <Label>Город</Label>
                      <Input value={pickupCity} onChange={e => setPickupCity(e.target.value)} placeholder="Guangzhou" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Адрес забора <span className="text-destructive">*</span></Label>
                    <Input value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} placeholder="Полный адрес" />
                  </div>
                  <div className="space-y-2">
                    <Label>Контакт (ФИО/компания)</Label>
                    <Input value={pickupContactName} onChange={e => setPickupContactName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Телефон <span className="text-destructive">*</span></Label>
                      <Input value={pickupContactPhone} onChange={e => setPickupContactPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>WeChat</Label>
                      <Input value={pickupContactWechat} onChange={e => setPickupContactWechat(e.target.value)} />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Destination */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Куда доставить?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Страна <span className="text-destructive">*</span></Label>
                <Select value={destCountryId} onValueChange={(v) => { setDestCountryId(v); setDestCityId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Выберите страну" /></SelectTrigger>
                  <SelectContent>
                    {countries.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name_ru}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isConsolidated && cities.length > 0 && (
                <div className="space-y-2">
                  <Label>Город назначения <span className="text-destructive">*</span></Label>
                  <Select value={destCityId} onValueChange={setDestCityId}>
                    <SelectTrigger><SelectValue placeholder="Выберите город" /></SelectTrigger>
                    <SelectContent>
                      {cities.filter(c => c.is_consolidated_hub).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name_ru}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!isConsolidated && (
                <>
                  <div className="space-y-2">
                    <Label>Город назначения</Label>
                    <Input value={destCityCustom} onChange={e => setDestCityCustom(e.target.value)} placeholder="Город" />
                  </div>
                  <div className="space-y-2">
                    <Label>Код ЖД станции</Label>
                    <Input value={destStation} onChange={e => setDestStation(e.target.value)} placeholder="Введите код станции" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Комментарий</Label>
                <Textarea value={destComment} onChange={e => setDestComment(e.target.value)} placeholder="Дополнительная информация" rows={2} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Cargo */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PackageIcon className="h-5 w-5 text-primary" />
                Характеристики груза
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Checkbox checked={clarifyWithSupplier} onCheckedChange={(v) => setClarifyWithSupplier(!!v)} id="clarify" />
                <Label htmlFor="clarify" className="cursor-pointer text-sm">Уточнить характеристики у поставщика</Label>
              </div>

              {clarifyWithSupplier && (
                <div className="space-y-3 rounded-lg bg-accent/50 p-4">
                  <div className="space-y-2">
                    <Label>Контакт поставщика</Label>
                    <Input value={supplierContact} onChange={e => setSupplierContact(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Телефон <span className="text-destructive">*</span></Label>
                      <Input value={supplierPhone} onChange={e => setSupplierPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>WeChat</Label>
                      <Input value={supplierWechat} onChange={e => setSupplierWechat(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Что уточнить?</Label>
                    <Textarea value={supplierComment} onChange={e => setSupplierComment(e.target.value)} rows={2} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Наименование товара {!clarifyWithSupplier && <span className="text-destructive">*</span>}</Label>
                <Input value={cargoName} onChange={e => setCargoName(e.target.value)} placeholder="Например: текстиль, электроника" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>HS код</Label>
                  <Input value={hsCode} onChange={e => setHsCode(e.target.value)} placeholder="6-10 цифр" />
                </div>
                <div className="space-y-2">
                  <Label>Материал</Label>
                  <Input value={material} onChange={e => setMaterial(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Назначение</Label>
                <Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Для чего используется" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Кол-во мест</Label>
                  <Input type="number" value={placesCount} onChange={e => setPlacesCount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Объём (м³)</Label>
                  <Input type="number" step="0.01" value={volumeM3} onChange={e => setVolumeM3(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Вес брутто (кг)</Label>
                  <Input type="number" step="0.1" value={weightGross} onChange={e => setWeightGross(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Вес нетто (кг)</Label>
                  <Input type="number" step="0.1" value={weightNet} onChange={e => setWeightNet(e.target.value)} />
                </div>
              </div>

              {/* File upload */}
              <div className="space-y-2">
                <Label>Фото / документы</Label>
                <label className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Фото груза, упаковки, инвойсы, packing list</p>
                  <p className="text-xs text-muted-foreground">До 20 файлов, до 50 МБ каждый</p>
                  <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange} className="hidden" />
                </label>
                {files.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-accent/50 px-3 py-2 text-sm">
                        <span className="truncate">{f.name}</span>
                        <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive ml-2">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Confirmation */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Подтверждение
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-accent/50 p-4 space-y-2 text-sm">
                <p><span className="font-medium">Тип услуги:</span> {serviceOptions.find(s => s.value === serviceType)?.label}</p>
                {cargoName && <p><span className="font-medium">Товар:</span> {cargoName}</p>}
                {weightGross && <p><span className="font-medium">Вес:</span> {weightGross} кг</p>}
                {volumeM3 && <p><span className="font-medium">Объём:</span> {volumeM3} м³</p>}
                {files.length > 0 && <p><span className="font-medium">Файлов:</span> {files.length}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox checked={agreedTerms} onCheckedChange={(v) => setAgreedTerms(!!v)} id="terms" />
                  <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed">
                    Я согласен с <span className="text-primary underline">пользовательским соглашением</span>
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox checked={agreedPrivacy} onCheckedChange={(v) => setAgreedPrivacy(!!v)} id="privacy" />
                  <Label htmlFor="privacy" className="cursor-pointer text-sm leading-relaxed">
                    Я согласен с <span className="text-primary underline">политикой конфиденциальности</span>
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox checked={agreedOffer} onCheckedChange={(v) => setAgreedOffer(!!v)} id="offer" />
                  <Label htmlFor="offer" className="cursor-pointer text-sm leading-relaxed">
                    Я принимаю <span className="text-primary underline">условия оказания услуг (оферту)</span>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="flex-1">
              Далее
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canNext() || submitting} className="flex-1">
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Отправить заявку
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateRequest;
