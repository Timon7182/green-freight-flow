import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [source, setSource] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [customContact, setCustomContact] = useState("");
  const [deliveryType, setDeliveryType] = useState<"collected" | "container" | "">("");
  const [containerType, setContainerType] = useState<"rented" | "purchased" | "">("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), "HH:mm"));
  const [files, setFiles] = useState<File[]>([]);
  const [contactInfo, setContactInfo] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(
        (f) => !f.type.startsWith("video/")
      );
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = () => {
    toast.success("Заявка успешно создана!", {
      description: "Перевозчики получат уведомление о вашей заявке.",
    });
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
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              Откуда?
            </div>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger><SelectValue placeholder="Выберите склад или укажите адрес" /></SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {source === "other" && (
              <div className="space-y-3 animate-fade-in">
                <div className="space-y-2">
                  <Label>Адрес</Label>
                  <Input placeholder="Город, улица, номер дома" value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Контакт на месте</Label>
                  <Input placeholder="+7 777 000 0000, Имя" value={customContact} onChange={(e) => setCustomContact(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Destination */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Truck className="h-4 w-4 text-primary" />
              Куда?
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "collected" as const, label: "Сборный" },
                { id: "container" as const, label: "Контейнерный" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setDeliveryType(t.id); setContainerType(""); setCity(t.id === "collected" ? "Алматы" : ""); }}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                    deliveryType === t.id
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {deliveryType === "collected" && (
              <div className="animate-fade-in rounded-lg bg-accent/50 px-4 py-3">
                <p className="text-sm"><span className="font-medium">Город назначения:</span> Алматы</p>
              </div>
            )}

            {deliveryType === "container" && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "rented" as const, label: "Арендованный" },
                    { id: "purchased" as const, label: "Выкупленный" },
                  ].map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => setContainerType(ct.id)}
                      className={cn(
                        "rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all",
                        containerType === ct.id
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
                {containerType && (
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger><SelectValue placeholder="Выберите город" /></SelectTrigger>
                    <SelectContent>
                      {kazakhstanCities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-primary" />
              Дата и время
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
