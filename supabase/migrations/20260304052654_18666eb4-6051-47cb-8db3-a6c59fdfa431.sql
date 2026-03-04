-- Allow admin to manage countries
CREATE POLICY "countries_insert_admin" ON public.countries FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "countries_update_admin" ON public.countries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "countries_delete_admin" ON public.countries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admin to manage destination_cities
CREATE POLICY "cities_insert_admin" ON public.destination_cities FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cities_update_admin" ON public.destination_cities FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cities_delete_admin" ON public.destination_cities FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));