
-- Enums
create type public.app_role as enum ('client', 'manager', 'admin');
create type public.service_type as enum ('consolidated_pickup', 'consolidated_warehouse', 'container_fcl', 'truck_ftl');
create type public.request_status as enum ('draft', 'submitted', 'calculating', 'quoted', 'confirmed', 'awaiting_payment', 'paid', 'in_progress', 'completed', 'cancelled');
create type public.delivery_status as enum ('picked_up', 'arrived_china_warehouse', 'shipped', 'at_border', 'customs_cleared', 'in_delivery', 'delivered');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  company text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

-- has_role function
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- create_profile_for_user (called from app after signup)
create or replace function public.create_profile_for_user(_user_id uuid, _email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (_user_id, _email) on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (_user_id, 'client') on conflict (user_id, role) do nothing;
end;
$$;

-- Warehouses (China)
create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  full_address text not null,
  contact_name text,
  contact_phone text,
  working_hours text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Countries
create table public.countries (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_ru text not null,
  sort_order int default 0
);

-- Destination cities
create table public.destination_cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references public.countries(id) on delete cascade not null,
  name_ru text not null,
  is_consolidated_hub boolean default false
);

-- Shipment requests
create sequence if not exists public.request_number_seq start 1;

create table public.shipment_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text unique,
  client_id uuid references auth.users(id) on delete cascade not null,
  assigned_manager_id uuid references auth.users(id),
  service_type service_type not null,
  source_warehouse_id uuid references public.warehouses(id),
  pickup_province text,
  pickup_city text,
  pickup_address text,
  pickup_contact_name text,
  pickup_contact_phone text,
  pickup_contact_wechat text,
  destination_country_id uuid references public.countries(id),
  destination_city_id uuid references public.destination_cities(id),
  destination_city_custom text,
  destination_station text,
  destination_comment text,
  cargo_name text,
  hs_code text,
  material text,
  purpose text,
  places_count int,
  weight_gross numeric,
  weight_net numeric,
  volume_m3 numeric,
  clarify_with_supplier boolean default false,
  supplier_contact text,
  supplier_phone text,
  supplier_wechat text,
  supplier_comment text,
  status request_status default 'draft',
  delivery_status delivery_status,
  agreed_terms boolean default false,
  agreed_privacy boolean default false,
  agreed_offer boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-generate request number
create or replace function public.generate_request_number()
returns trigger language plpgsql as $$
begin
  new.request_number := 'SW-' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('public.request_number_seq')::text, 4, '0');
  return new;
end;
$$;

create trigger set_request_number before insert on public.shipment_requests
  for each row when (new.request_number is null) execute function public.generate_request_number();

-- Attachments
create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.shipment_requests(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  mime_type text,
  visible_to_client boolean default true,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Quotes
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.shipment_requests(id) on delete cascade not null,
  currency text default 'USD',
  total_amount numeric not null,
  pickup_china numeric,
  freight numeric,
  warehouse_consolidation numeric,
  domestic_delivery numeric,
  other_costs numeric,
  estimated_days int,
  comments text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Tracking events
create table public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.shipment_requests(id) on delete cascade not null,
  status delivery_status not null,
  comment text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Chat messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.shipment_requests(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  message text,
  file_path text,
  file_name text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Updated_at trigger function
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger requests_updated_at before update on public.shipment_requests
  for each row execute function public.update_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.warehouses enable row level security;
alter table public.countries enable row level security;
alter table public.destination_cities enable row level security;
alter table public.shipment_requests enable row level security;
alter table public.attachments enable row level security;
alter table public.quotes enable row level security;
alter table public.tracking_events enable row level security;
alter table public.chat_messages enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_select_staff" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin'));
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid());

-- User roles policies
create policy "roles_select_own" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "roles_select_admin" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "roles_insert_admin" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "roles_update_admin" on public.user_roles for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "roles_delete_admin" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Warehouses policies
create policy "warehouses_select" on public.warehouses for select to authenticated using (true);
create policy "warehouses_insert_admin" on public.warehouses for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "warehouses_update_admin" on public.warehouses for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "warehouses_delete_admin" on public.warehouses for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Reference tables (public read)
create policy "countries_select" on public.countries for select to authenticated using (true);
create policy "cities_select" on public.destination_cities for select to authenticated using (true);

-- Shipment requests policies
create policy "requests_select" on public.shipment_requests for select to authenticated using (
  client_id = auth.uid() or public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin')
);
create policy "requests_insert" on public.shipment_requests for insert to authenticated with check (client_id = auth.uid());
create policy "requests_update_client" on public.shipment_requests for update to authenticated using (client_id = auth.uid());
create policy "requests_update_staff" on public.shipment_requests for update to authenticated using (public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin'));

-- Attachments policies
create policy "attachments_select" on public.attachments for select to authenticated using (
  exists (select 1 from public.shipment_requests sr where sr.id = request_id and (sr.client_id = auth.uid() or public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin')))
  and (visible_to_client = true or public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin'))
);
create policy "attachments_insert" on public.attachments for insert to authenticated with check (
  exists (select 1 from public.shipment_requests sr where sr.id = request_id and (sr.client_id = auth.uid() or public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin')))
);
create policy "attachments_update_staff" on public.attachments for update to authenticated using (public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin'));

-- Quotes policies
create policy "quotes_select" on public.quotes for select to authenticated using (
  exists (select 1 from public.shipment_requests sr where sr.id = request_id and (sr.client_id = auth.uid() or public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin')))
);
create policy "quotes_insert_staff" on public.quotes for insert to authenticated with check (public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin'));
create policy "quotes_update_staff" on public.quotes for update to authenticated using (public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin'));

-- Tracking policies
create policy "tracking_select" on public.tracking_events for select to authenticated using (
  exists (select 1 from public.shipment_requests sr where sr.id = request_id and (sr.client_id = auth.uid() or public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin')))
);
create policy "tracking_insert_staff" on public.tracking_events for insert to authenticated with check (public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin'));

-- Chat policies
create policy "chat_select" on public.chat_messages for select to authenticated using (
  exists (select 1 from public.shipment_requests sr where sr.id = request_id and (sr.client_id = auth.uid() or public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin')))
);
create policy "chat_insert" on public.chat_messages for insert to authenticated with check (
  exists (select 1 from public.shipment_requests sr where sr.id = request_id and (sr.client_id = auth.uid() or public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin')))
);
create policy "chat_update_read" on public.chat_messages for update to authenticated using (
  exists (select 1 from public.shipment_requests sr where sr.id = request_id and (sr.client_id = auth.uid() or public.has_role(auth.uid(), 'manager') or public.has_role(auth.uid(), 'admin')))
);

-- Storage bucket for files
insert into storage.buckets (id, name, public, file_size_limit) values ('shipment-files', 'shipment-files', false, 52428800);

create policy "auth_upload_files" on storage.objects for insert to authenticated with check (bucket_id = 'shipment-files');
create policy "auth_read_files" on storage.objects for select to authenticated using (bucket_id = 'shipment-files');

-- Realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Seed: warehouses
insert into public.warehouses (name, city, full_address, contact_name) values
  ('Склад Гуанчжоу', 'Гуанчжоу', 'Guangzhou, Baiyun District, Warehouse Complex A', 'Менеджер склада'),
  ('Склад Иу', 'Иу', 'Yiwu, Futian District, International Trade Center B', 'Менеджер склада'),
  ('Склад Шэньчжэнь', 'Шэньчжэнь', 'Shenzhen, Nanshan District, Logistics Park C', 'Менеджер склада'),
  ('Склад Пекин', 'Пекин', 'Beijing, Chaoyang District, North Warehouse D', 'Менеджер склада'),
  ('Склад Шанхай', 'Шанхай', 'Shanghai, Pudong New Area, Free Trade Zone E', 'Менеджер склада');

-- Seed: countries
insert into public.countries (code, name_ru, sort_order) values
  ('KZ', 'Казахстан', 1), ('RU', 'Россия', 2), ('UZ', 'Узбекистан', 3),
  ('KG', 'Кыргызстан', 4), ('BY', 'Беларусь', 5), ('TM', 'Туркменистан', 6),
  ('TJ', 'Таджикистан', 7), ('GE', 'Грузия', 8), ('KR', 'Южная Корея', 9),
  ('TH', 'Таиланд', 10), ('VN', 'Вьетнам', 11), ('JP', 'Япония', 12);

-- Seed: destination cities
insert into public.destination_cities (country_id, name_ru, is_consolidated_hub)
select c.id, v.city, v.is_hub
from public.countries c
join (values
  ('KZ', 'Алматы', true), ('KZ', 'Астана', true),
  ('RU', 'Москва', true), ('RU', 'Санкт-Петербург', true), ('RU', 'Екатеринбург', true),
  ('UZ', 'Ташкент', true),
  ('KG', 'Бишкек', true),
  ('BY', 'Минск', true),
  ('TM', 'Ашхабад', true),
  ('TJ', 'Душанбе', true), ('TJ', 'Худжанд', true),
  ('GE', 'Тбилиси', true)
) as v(code, city, is_hub) on c.code = v.code;
