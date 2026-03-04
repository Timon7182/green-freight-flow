
CREATE TABLE public.request_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.shipment_requests(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.request_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "history_select" ON public.request_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shipment_requests sr
      WHERE sr.id = request_history.request_id
      AND (sr.client_id = auth.uid() OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

CREATE POLICY "history_insert_staff" ON public.request_history
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
  );
