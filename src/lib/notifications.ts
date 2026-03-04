import { supabase } from "@/integrations/supabase/client";

const statusLabels: Record<string, string> = {
  draft: "Черновик", submitted: "Отправлена", calculating: "В расчёте",
  quoted: "Рассчитана", confirmed: "Подтверждена", awaiting_payment: "Ожидаем оплату",
  paid: "Оплачена", in_progress: "В работе", completed: "Завершена", cancelled: "Отменена",
};

export async function notifyStatusChange(
  requestId: string,
  clientId: string,
  requestNumber: string | null,
  newStatus: string
) {
  await supabase.from("notifications").insert({
    user_id: clientId,
    type: "status_change",
    title: `Статус заявки ${requestNumber || ""} изменён`,
    body: `Новый статус: ${statusLabels[newStatus] || newStatus}`,
    request_id: requestId,
  });
}

export async function notifyQuoteReady(
  requestId: string,
  clientId: string,
  requestNumber: string | null,
  totalAmount: number,
  currency: string
) {
  await supabase.from("notifications").insert({
    user_id: clientId,
    type: "quote_ready",
    title: `КП по заявке ${requestNumber || ""} готово`,
    body: `Сумма: ${totalAmount.toLocaleString()} ${currency}`,
    request_id: requestId,
  });
}

export async function notifyNewMessage(
  requestId: string,
  recipientId: string,
  requestNumber: string | null,
  messagePreview: string | null
) {
  await supabase.from("notifications").insert({
    user_id: recipientId,
    type: "new_message",
    title: `Новое сообщение по заявке ${requestNumber || ""}`,
    body: messagePreview ? messagePreview.slice(0, 100) : "Файл",
    request_id: requestId,
  });
}
