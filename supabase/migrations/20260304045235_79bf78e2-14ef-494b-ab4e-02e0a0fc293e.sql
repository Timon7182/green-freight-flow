
create or replace function public.generate_request_number()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.request_number := 'SW-' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('public.request_number_seq')::text, 4, '0');
  return new;
end;
$$;

create or replace function public.update_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
