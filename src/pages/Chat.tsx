import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
}

const mockMessages: Message[] = [
  { id: 1, text: "Здравствуйте! По заявке ZK-001, когда будет готов груз?", sender: "other", time: "10:30" },
  { id: 2, text: "Добрый день! Груз будет готов к 14:00 сегодня.", sender: "me", time: "10:32" },
  { id: 3, text: "Отлично, буду к этому времени на складе.", sender: "other", time: "10:33" },
];

const ChatPage = () => {
  const { role } = useAuth();
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: input, sender: "me", time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setInput("");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
        <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <User className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {role === "customer" ? "Перевозчик — ИП Касымов" : 'Заказчик — ТОО "Астана Логистик"'}
            </p>
            <p className="text-xs text-muted-foreground">Заявка ZK-001</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.sender === "me" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                m.sender === "me"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-accent text-accent-foreground rounded-bl-md"
              )}>
                <p>{m.text}</p>
                <p className={cn("text-[10px] mt-1", m.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground")}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          <Input
            placeholder="Сообщение..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1"
          />
          <Button onClick={send} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
