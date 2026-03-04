import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

const DELIVERY_STEPS = [
  { key: "picked_up", label: "Забран" },
  { key: "arrived_china_warehouse", label: "На складе КНР" },
  { key: "shipped", label: "Отправлен" },
  { key: "at_border", label: "На границе" },
  { key: "customs_cleared", label: "Таможня" },
  { key: "in_delivery", label: "В доставке" },
  { key: "delivered", label: "Доставлен" },
];

interface Props {
  currentStatus: string;
  requestId: string;
}

export const RequestTracking = ({ currentStatus, requestId }: Props) => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("tracking_events").select("*").eq("request_id", requestId).order("created_at").then(({ data }) => {
      setEvents(data || []);
    });
  }, [requestId]);

  const currentIdx = DELIVERY_STEPS.findIndex(s => s.key === currentStatus);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {DELIVERY_STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={step.key} className="flex items-center gap-1 flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={cn(
                  "h-2 w-full rounded-full transition-colors",
                  done ? "bg-primary" : "bg-muted"
                )} />
                <span className={cn(
                  "text-[10px] text-center leading-tight",
                  isCurrent ? "text-primary font-semibold" : done ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event log */}
      {events.length > 0 && (
        <div className="space-y-2 text-sm">
          {events.map(ev => (
            <div key={ev.id} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">
                  {DELIVERY_STEPS.find(s => s.key === ev.status)?.label || ev.status}
                </p>
                {ev.comment && <p className="text-muted-foreground">{ev.comment}</p>}
                <p className="text-xs text-muted-foreground">{new Date(ev.created_at).toLocaleString("ru-RU")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
