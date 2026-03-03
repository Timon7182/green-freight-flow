import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Upload, Send, MapPin, Truck, Clock, Paperclip, Phone } from "lucide-react";
import { toast } from "sonner";

const warehouses = [
  { id: "warehouse1", label: "Склад 1 — г. Астана, ул. Промышленная, 15" },
  { id: "warehouse2", label: "Склад 2 — г. Алматы, пр. Суюнбая, 89" },
  { id: "warehouse3", label: "Склад 3 — г. Шымкент, ул. Байтурсынова, 42" },
  { id: "other", label: "Другой адрес" },
];

const kazakhstanCities = [
  "Астана", "Алматы", "Шымкент", "Караганда", "Актобе", "Тараз",
  "Павлодар", "Усть-Каменогорск", "Семей", "Атырау", "Костанай",
  "Кызылорда", "Петропавловск", "Актау", "Темиртау", "Туркестан",
  "Талдыкорган", "Экибастуз", "Рудный", "Жезказган", "Кокшетау",
];

const CreateOrder = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [customContact, setCustomContact] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [containerType, setContainerType] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), "HH:mm"));
  const [files, setFiles] = useState<File[]>([]);
  const [contactInfo, setContactInfo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(
        (f) => !f.type.startsWith("video/")
      );
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!source) errs.source = "Выберите откуда";
    if (source === "other" && !customAddress.trim()) errs.customAddress = "Укажите адрес";
    if (!deliveryType) errs.deliveryType = "Выберите тип перевозки";
    if (deliveryType === "container" && !containerType) errs.containerType = "Выберите тип контейнера";
    if (deliveryType === "container" && !city) errs.city = "Выберите город";
    if (deliveryType === "container" && !containerType) errs.containerType = "Выберите тип контейнера";
    if (!date) errs.date = "Укажите дату";
    if (!time) errs.time = "Укажите время";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    toast.success("Заявка успешно создана!", {
      description: "Перевозчики получат уведомление о вашей заявке.",
    });
    navigate("/customer/orders");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Новая заявка</h1>
          <p className="text-muted-foreground text-sm mt-1">Заполните информацию о перевозке</p>
        </div>

        <div className="space-y-6">
          {/* Source */}
          <div className={cn("rounded-xl border bg-card p-5 space-y-4", errors.source ? "border-destructive" : "border-border")}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              Откуда? <span className="text-destructive">*</span>
            </div>
            <Select value={source} onValueChange={(v) => { setSource(v); setErrors((e) => ({ ...e, source: "" })); }}>
              <SelectTrigger><SelectValue placeholder="Выберите склад или укажите адрес" /></SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.source && <p className="text-xs text-destructive">{errors.source}</p>}
            {source === "other" && (
              <div className="space-y-3 animate-fade-in">
                <div className="space-y-2">
                  <Label>Адрес <span className="text-destructive">*</span></Label>
                  <Input placeholder="Город, улица, номер дома" value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} />
                  {errors.customAddress && <p className="text-xs text-destructive">{errors.customAddress}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Контакт на месте</Label>
                  <Input placeholder="+7 777 000 0000, Имя" value={customContact} onChange={(e) => setCustomContact(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Destination */}
          <div className={cn("rounded-xl border bg-card p-5 space-y-4", errors.deliveryType ? "border-destructive" : "border-border")}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Truck className="h-4 w-4 text-primary" />
              Куда? <span className="text-destructive">*</span>
            </div>

            <RadioGroup value={deliveryType} onValueChange={(v) => { setDeliveryType(v); setContainerType(""); setCity(v === "collected" ? "Алматы" : ""); setErrors((e) => ({ ...e, deliveryType: "", containerType: "", city: "" })); }}>
              <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-accent/30 transition-colors">
                <RadioGroupItem value="collected" id="collected" />
                <Label htmlFor="collected" className="cursor-pointer flex-1">Сборный</Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-accent/30 transition-colors">
                <RadioGroupItem value="container" id="container" />
                <Label htmlFor="container" className="cursor-pointer flex-1">Контейнерный</Label>
              </div>
            </RadioGroup>
            {errors.deliveryType && <p className="text-xs text-destructive">{errors.deliveryType}</p>}

            {deliveryType === "collected" && (
              <div className="animate-fade-in rounded-lg bg-accent/50 px-4 py-3">
                <p className="text-sm"><span className="font-medium">Город назначения:</span> Алматы</p>
              </div>
            )}

            {deliveryType === "container" && (
              <div className="space-y-3 animate-fade-in">
                <Select value={city} onValueChange={(v) => { setCity(v); setErrors((e) => ({ ...e, city: "" })); }}>
                  <SelectTrigger><SelectValue placeholder="Выберите город назначения" /></SelectTrigger>
                  <SelectContent>
                    {kazakhstanCities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                <Select value={containerType} onValueChange={(v) => { setContainerType(v); setErrors((e) => ({ ...e, containerType: "" })); }}>
                  <SelectTrigger><SelectValue placeholder="Тип контейнера" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rented">Арендованный</SelectItem>
                    <SelectItem value="purchased">Выкупленный</SelectItem>
                  </SelectContent>
                </Select>
                {errors.containerType && <p className="text-xs text-destructive">{errors.containerType}</p>}
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className={cn("rounded-xl border bg-card p-5 space-y-4", (errors.date || errors.time) ? "border-destructive" : "border-border")}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-primary" />
              Дата и время <span className="text-destructive">*</span>
            </div>
            <div className="flex gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "d MMMM yyyy", { locale: ru })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-32"
              />
            </div>
          </div>

          {/* Files */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Paperclip className="h-4 w-4 text-primary" />
              Вложения и фото
            </div>
            <label className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Нажмите для загрузки файлов</p>
              <p className="text-xs text-muted-foreground">Все форматы кроме видео</p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-accent/50 px-3 py-2 text-sm">
                    <span className="truncate">{f.name}</span>
                    <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive ml-2">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Phone className="h-4 w-4 text-primary" />
              Как связаться?
            </div>
            <Textarea
              placeholder="Дополнительная контактная информация, удобное время звонка и т.д."
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              rows={3}
            />
          </div>

          <Button className="w-full py-6 text-base" onClick={handleSubmit}>
            <Send className="h-5 w-5 mr-2" />
            Отправить заявку
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateOrder;
