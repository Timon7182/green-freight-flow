import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  requestId: string;
}

export const RequestChat = ({ requestId }: Props) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat-${requestId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `request_id=eq.${requestId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (!user || messages.length === 0) return;
    const unread = messages.filter(m => m.sender_id !== user.id && !m.is_read);
    if (unread.length > 0) {
      supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("request_id", requestId)
        .neq("sender_id", user.id)
        .eq("is_read", false)
        .then(() => {});
    }
  }, [messages, user]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    await supabase.from("chat_messages").insert({
      request_id: requestId,
      sender_id: user.id,
      message: text.trim(),
    });
    setText("");
    setSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setSending(true);

    const filePath = `chat/${user.id}/${requestId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("shipment-files").upload(filePath, file);
    if (!error) {
      await supabase.from("chat_messages").insert({
        request_id: requestId,
        sender_id: user.id,
        message: null,
        file_name: file.name,
        file_path: filePath,
      });
    }
    setSending(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFileUrl = async (path: string) => {
    const { data } = await supabase.storage.from("shipment-files").createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="flex flex-col h-[500px] border rounded-xl overflow-hidden bg-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Сообщений пока нет. Напишите менеджеру!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                isMe
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              )}>
                {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                {msg.file_name && (
                  <button
                    onClick={() => getFileUrl(msg.file_path)}
                    className={cn(
                      "flex items-center gap-2 underline",
                      isMe ? "text-primary-foreground/80" : "text-primary"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    {msg.file_name}
                  </button>
                )}
                <p className={cn(
                  "text-[10px] mt-1",
                  isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                )}>
                  {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={sending}>
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение..."
          disabled={sending}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={sending || !text.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
