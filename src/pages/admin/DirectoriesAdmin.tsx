import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Pencil, Trash2, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";

const DirectoriesAdmin = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Country dialog
  const [countryOpen, setCountryOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any>(null);
  const [countryForm, setCountryForm] = useState({ name_ru: "", code: "", sort_order: 0 });

  // City dialog
  const [cityOpen, setCityOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [cityForm, setCityForm] = useState({ name_ru: "", country_id: "", is_consolidated_hub: true });

  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    const [cRes, dRes] = await Promise.all([
      supabase.from("countries").select("*").order("sort_order"),
      supabase.from("destination_cities").select("*, countries(name_ru)").order("name_ru"),
    ]);
    setCountries(cRes.data || []);
    setCities(dRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Country CRUD
  const openCreateCountry = () => { setEditingCountry(null); setCountryForm({ name_ru: "", code: "", sort_order: 0 }); setCountryOpen(true); };
  const openEditCountry = (c: any) => { setEditingCountry(c); setCountryForm({ name_ru: c.name_ru, code: c.code, sort_order: c.sort_order || 0 }); setCountryOpen(true); };

  const saveCountry = async () => {
    if (!countryForm.name_ru || !countryForm.code) { toast.error("Заполните все поля"); return; }
    setSaving(true);
    if (editingCountry) {
      await supabase.from("countries").update(countryForm).eq("id", editingCountry.id);
    } else {
      await supabase.from("countries").insert(countryForm);
    }
    setSaving(false);
    setCountryOpen(false);
    toast.success("Сохранено");
    fetchAll();
  };

  const deleteCountry = async (id: string) => {
    if (!confirm("Удалить страну и все связанные города?")) return;
    await supabase.from("destination_cities").delete().eq("country_id", id);
    await supabase.from("countries").delete().eq("id", id);
    toast.success("Удалено");
    fetchAll();
  };

  // City CRUD
  const openCreateCity = () => { setEditingCity(null); setCityForm({ name_ru: "", country_id: countries[0]?.id || "", is_consolidated_hub: true }); setCityOpen(true); };
  const openEditCity = (c: any) => { setEditingCity(c); setCityForm({ name_ru: c.name_ru, country_id: c.country_id, is_consolidated_hub: c.is_consolidated_hub }); setCityOpen(true); };

  const saveCity = async () => {
    if (!cityForm.name_ru || !cityForm.country_id) { toast.error("Заполните все поля"); return; }
    setSaving(true);
    if (editingCity) {
      await supabase.from("destination_cities").update(cityForm).eq("id", editingCity.id);
    } else {
      await supabase.from("destination_cities").insert(cityForm);
    }
    setSaving(false);
    setCityOpen(false);
    toast.success("Сохранено");
    fetchAll();
  };

  const deleteCity = async (id: string) => {
    if (!confirm("Удалить город?")) return;
    await supabase.from("destination_cities").delete().eq("id", id);
    toast.success("Удалено");
    fetchAll();
  };

  if (loading) return <AppLayout><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Справочники</h1>
          <p className="text-sm text-muted-foreground">Страны и города доставки</p>
        </div>

        {/* Countries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Страны</h2>
            <Dialog open={countryOpen} onOpenChange={setCountryOpen}>
              <DialogTrigger asChild><Button size="sm" onClick={openCreateCountry}><Plus className="h-4 w-4 mr-1" /> Страна</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingCountry ? "Редактировать" : "Новая страна"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Название</Label><Input value={countryForm.name_ru} onChange={e => setCountryForm({ ...countryForm, name_ru: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Код (KZ, RU...)</Label><Input value={countryForm.code} onChange={e => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })} maxLength={3} /></div>
                  <div className="space-y-2"><Label>Порядок</Label><Input type="number" value={countryForm.sort_order} onChange={e => setCountryForm({ ...countryForm, sort_order: parseInt(e.target.value) || 0 })} /></div>
                  <Button onClick={saveCountry} disabled={saving} className="w-full">{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {countries.map(c => (
              <Card key={c.id}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{c.code}</span>
                    <span className="font-medium text-sm">{c.name_ru}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditCountry(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteCountry(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Города-хабы</h2>
            <Dialog open={cityOpen} onOpenChange={setCityOpen}>
              <DialogTrigger asChild><Button size="sm" onClick={openCreateCity}><Plus className="h-4 w-4 mr-1" /> Город</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingCity ? "Редактировать" : "Новый город"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Страна</Label>
                    <Select value={cityForm.country_id} onValueChange={v => setCityForm({ ...cityForm, country_id: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{countries.map(c => <SelectItem key={c.id} value={c.id}>{c.name_ru}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Город</Label><Input value={cityForm.name_ru} onChange={e => setCityForm({ ...cityForm, name_ru: e.target.value })} /></div>
                  <div className="flex items-center gap-2">
                    <Switch checked={cityForm.is_consolidated_hub} onCheckedChange={v => setCityForm({ ...cityForm, is_consolidated_hub: v })} />
                    <Label>Хаб для сборных грузов</Label>
                  </div>
                  <Button onClick={saveCity} disabled={saving} className="w-full">{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {countries.map(country => {
              const countryCities = cities.filter(c => c.country_id === country.id);
              if (countryCities.length === 0) return null;
              return (
                <Card key={country.id}>
                  <CardHeader className="py-3"><CardTitle className="text-sm">{country.name_ru}</CardTitle></CardHeader>
                  <CardContent className="pt-0 space-y-1">
                    {countryCities.map(c => (
                      <div key={c.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{c.name_ru}</span>
                          {c.is_consolidated_hub && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">хаб</span>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCity(c)}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteCity(c.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DirectoriesAdmin;
