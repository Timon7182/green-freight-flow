import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, Download, Upload, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  requestId: string;
  canUpload?: boolean;
  canManageVisibility?: boolean;
}

export const RequestDocuments = ({ requestId, canUpload = false, canManageVisibility = false }: Props) => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from("attachments")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [requestId]);

  const handleDownload = async (doc: any) => {
    const { data } = await supabase.storage.from("shipment-files").createSignedUrl(doc.file_path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const filePath = `docs/${user.id}/${requestId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("shipment-files").upload(filePath, file);
      if (!error) {
        await supabase.from("attachments").insert({
          request_id: requestId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
          visible_to_client: true,
        });
      }
    }

    await fetchDocs();
    setUploading(false);
    toast.success("Файлы загружены");
    if (fileRef.current) fileRef.current.value = "";
  };

  const toggleVisibility = async (doc: any) => {
    await supabase.from("attachments").update({ visible_to_client: !doc.visible_to_client }).eq("id", doc.id);
    await fetchDocs();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {canUpload && (
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" multiple className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Загрузить документ
          </Button>
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Документов пока нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <Card key={doc.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)} МБ` : ""}
                      {" • "}
                      {new Date(doc.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canManageVisibility && (
                    <div className="flex items-center gap-1.5">
                      {doc.visible_to_client ? <Eye className="h-3.5 w-3.5 text-muted-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                      <Switch checked={doc.visible_to_client} onCheckedChange={() => toggleVisibility(doc)} />
                    </div>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
