import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Pencil, Trash2, Warehouse } from "lucide-react";
import { toast } from "sonner";

const emptyWarehouse = { name: "", city: "", full_address: "", contact_name: "", contact_phone: "", working_hours: "", is_active: true };

const WarehousesAdmin = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyWarehouse);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("warehouses").select("*").order("name");
    setWarehouses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyWarehouse); setOpen(true); };
  const openEdit = (w: any) => {
    setEditing(w);
    setForm({ name: w.name, city: w.city, full_address: w.full_address, contact_name: w.contact_name || "", contact_phone: w.contact_phone || "", working_hours: w.working_hours || "", is_active: w.is_active });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.city || !form.full_address) { toast.error("Заполните обязательные поля"); return; }
    setSaving(true);
    if (editing) {
      await supabase.from("warehouses").update(form).eq("id", editing.id);
      toast.success("Склад обновлён");
    } else {
      await supabase.from("warehouses").insert(form);
      toast.success("Склад создан");
    }
    setSaving(false);
    setOpen(false);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить склад?")) return;
    await supabase.from("warehouses").delete().eq("id", id);
    toast.success("Склад удалён");
    fetch();
  };

  if (loading) return <AppLayout><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Склады в Китае</h1>
            <p className="text-sm text-muted-foreground">Управление адресами складов</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Добавить</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Редактировать склад" : "Новый склад"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Название <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Город <span className="text-destructive">*</span></Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                <div className="space-y-2"><Label>Полный адрес <span className="text-destructive">*</span></Label><Input value={form.full_address} onChange={e => setForm({ ...form, full_address: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Контакт</Label><Input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Телефон</Label><Input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Часы работы</Label><Input value={form.working_hours} onChange={e => setForm({ ...form, working_hours: e.target.value })} placeholder="Пн-Пт 9:00-18:00" /></div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                  <Label>Активен</Label>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editing ? "Сохранить" : "Создать"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {warehouses.map(w => (
            <Card key={w.id} className={!w.is_active ? "opacity-50" : ""}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Warehouse className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">{w.name}</p>
                    <p className="text-sm text-muted-foreground">{w.city} — {w.full_address}</p>
                    {w.contact_name && <p className="text-xs text-muted-foreground">{w.contact_name} • {w.contact_phone}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(w)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default WarehousesAdmin;
