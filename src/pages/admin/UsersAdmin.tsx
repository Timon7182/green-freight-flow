import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Shield } from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = { client: "Клиент", manager: "Менеджер", admin: "Администратор" };
const roleColors: Record<string, string> = { client: "bg-muted text-muted-foreground", manager: "bg-primary/10 text-primary", admin: "bg-destructive/10 text-destructive" };

const UsersAdmin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    // Get all profiles and their roles
    const { data: profiles } = await supabase.from("profiles").select("id, email, full_name, company, phone, created_at").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");

    const roleMap = new Map<string, string>();
    roles?.forEach(r => roleMap.set(r.user_id, r.role));

    setUsers((profiles || []).map(p => ({ ...p, role: roleMap.get(p.id) || "client" })));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (currentRole === newRole) return;

    // Delete old role
    await supabase.from("user_roles").delete().eq("user_id", userId);
    // Insert new role
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });

    toast.success(`Роль изменена на: ${roleLabels[newRole]}`);
    fetchUsers();
  };

  if (loading) return <AppLayout><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Пользователи</h1>
          <p className="text-sm text-muted-foreground">{users.length} пользователей</p>
        </div>

        <div className="space-y-3">
          {users.map(u => (
            <Card key={u.id}>
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.full_name || u.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    {u.company && <p className="text-xs text-muted-foreground">{u.company}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, u.role, v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Клиент</SelectItem>
                      <SelectItem value="manager">Менеджер</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default UsersAdmin;
