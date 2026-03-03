import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, ArrowLeft, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
}

interface ChatThread {
  id: string;
  orderId: string;
  contactName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

const customerThreads: ChatThread[] = [
  {
    id: "t1", orderId: "ZK-001", contactName: "ИП Касымов", lastMessage: "Буду к этому времени на складе.", lastTime: "10:33", unread: 0,
    messages: [
      { id: 1, text: "Здравствуйте! По заявке ZK-001, когда будет готов груз?", sender: "other", time: "10:30" },
      { id: 2, text: "Добрый день! Груз будет готов к 14:00 сегодня.", sender: "me", time: "10:32" },
      { id: 3, text: "Буду к этому времени на складе.", sender: "other", time: "10:33" },
    ],
  },
  {
    id: "t2", orderId: "ZK-002", contactName: "ИП Ахметов К.Б.", lastMessage: "Какая цена за перевозку?", lastTime: "09:15", unread: 1,
    messages: [
      { id: 1, text: "Добрый день! Готов обсудить условия по ZK-002.", sender: "other", time: "09:10" },
      { id: 2, text: "Здравствуйте! Да, расскажите подробнее о грузе.", sender: "me", time: "09:12" },
      { id: 3, text: "Какая цена за перевозку?", sender: "other", time: "09:15" },
    ],
  },
  {
    id: "t3", orderId: "ZK-005", contactName: "ИП Сериков Б.Т.", lastMessage: "Ожидаю ваше предложение по цене.", lastTime: "Вчера", unread: 2,
    messages: [
      { id: 1, text: "Здравствуйте, по заявке ZK-005 есть вопросы.", sender: "other", time: "14:00" },
      { id: 2, text: "Добрый день! Слушаю вас.", sender: "me", time: "14:05" },
      { id: 3, text: "Ожидаю ваше предложение по цене.", sender: "other", time: "14:10" },
    ],
  },
];

const carrierThreads: ChatThread[] = [
  {
    id: "t1", orderId: "ZK-001", contactName: 'ТОО "Астана Логистик"', lastMessage: "Груз будет готов к 14:00 сегодня.", lastTime: "10:32", unread: 0,
    messages: [
      { id: 1, text: "Здравствуйте! По заявке ZK-001, когда будет готов груз?", sender: "me", time: "10:30" },
      { id: 2, text: "Добрый день! Груз будет готов к 14:00 сегодня.", sender: "other", time: "10:32" },
      { id: 3, text: "Отлично, буду к этому времени на складе.", sender: "me", time: "10:33" },
    ],
  },
  {
    id: "t2", orderId: "ZK-002", contactName: "ИП Ахметов К.Б.", lastMessage: "Какая цена за перевозку?", lastTime: "09:15", unread: 1,
    messages: [
      { id: 1, text: "Добрый день! Готов обсудить условия по ZK-002.", sender: "me", time: "09:10" },
      { id: 2, text: "Здравствуйте! Да, расскажите подробнее о грузе.", sender: "other", time: "09:12" },
      { id: 3, text: "Какая цена за перевозку?", sender: "me", time: "09:15" },
    ],
  },
  {
    id: "t3", orderId: "ZK-005", contactName: "ИП Сериков Б.Т.", lastMessage: "Ожидаю ваше предложение по цене.", lastTime: "Вчера", unread: 0,
    messages: [
      { id: 1, text: "Здравствуйте, по заявке ZK-005 есть вопросы.", sender: "me", time: "14:00" },
      { id: 2, text: "Добрый день! Слушаю вас.", sender: "other", time: "14:05" },
      { id: 3, text: "Ожидаю ваше предложение по цене.", sender: "me", time: "14:10" },
    ],
  },
];

const ChatPage = () => {
  const { role } = useAuth();
  const threads = role === "customer" ? customerThreads : carrierThreads;
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<Record<string, Message[]>>(
    Object.fromEntries(threads.map((t) => [t.id, t.messages]))
  );
  const [input, setInput] = useState("");

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const currentMessages = activeThreadId ? threadMessages[activeThreadId] || [] : [];

  const send = () => {
    if (!input.trim() || !activeThreadId) return;
    const newMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "me",
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
    };
    setThreadMessages((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg],
    }));
    setInput("");
  };

  // Thread list view
  if (!activeThreadId) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Сообщения</h1>
            <p className="text-sm text-muted-foreground mt-1">{threads.length} диалогов</p>
          </div>

          <div className="space-y-2">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm truncate">{t.contactName}</span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{t.lastTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-primary font-bold">{t.orderId}</span>
                    <span className="text-xs text-muted-foreground truncate">{t.lastMessage}</span>
                  </div>
                </div>
                {t.unread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                    {t.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  // Chat view
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
        <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
          <Button variant="ghost" size="icon" onClick={() => setActiveThreadId(null)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{activeThread?.contactName}</p>
            <p className="text-xs text-muted-foreground font-mono">Заявка {activeThread?.orderId}</p>
          </div>
        </div>

        <ScrollArea className="flex-1 pb-4">
          <div className="space-y-3 pr-3">
            {currentMessages.map((m) => (
              <div key={m.id} className={cn("flex", m.sender === "me" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  m.sender === "me"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border text-foreground rounded-bl-md"
                )}>
                  <p>{m.text}</p>
                  <p className={cn("text-[10px] mt-1", m.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground")}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

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
