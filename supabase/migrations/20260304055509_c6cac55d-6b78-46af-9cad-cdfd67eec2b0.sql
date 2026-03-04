
DROP POLICY "notifications_insert_auth" ON public.notifications;

CREATE POLICY "notifications_insert_restricted" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'manager'::app_role) 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.shipment_requests sr 
      WHERE sr.id = notifications.request_id 
      AND (sr.client_id = auth.uid())
    )
  );
