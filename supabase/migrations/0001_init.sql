-- ============================================================
-- MeilleureVieSales — initial schema
-- Phase 1 (CRM/SFA + Invoicing/Payments) + Phase 2 (AI) tables
-- ============================================================

-- ---------- Enum types ----------
create type deal_status as enum ('lead','approach','proposal','negotiation','won','lost');
create type activity_type as enum ('call','email','meeting','note','demo');
create type task_priority as enum ('low','medium','high');
create type customer_status as enum ('lead','prospect','active','churned');
create type user_role as enum ('admin','manager','member');
create type invoice_status as enum ('draft','sent','paid','overdue','void');
create type payment_match_status as enum ('unmatched','matched','partial');
create type arrival_status as enum ('pending','arrived','cancelled');
create type expense_status as enum ('unpaid','paid');
create type order_progress as enum ('pending','in_progress','completed','cancelled');

-- ---------- users (mirrors auth.users) ----------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'member',
  created_at timestamptz not null default now()
);

-- Auto-create a public.users row whenever someone signs up via Supabase Auth
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- customers ----------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  industry text,
  status customer_status not null default 'lead',
  memo text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- deals ----------
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  assigned_to uuid references public.users(id),
  title text not null,
  status deal_status not null default 'lead',
  amount numeric(14,2) default 0,
  close_date date,
  next_action text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- activities ----------
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references public.deals(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  created_by uuid references public.users(id),
  type activity_type not null default 'note',
  content text,
  activity_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------- tasks ----------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references public.deals(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  assigned_to uuid references public.users(id),
  created_by uuid references public.users(id),
  title text not null,
  description text,
  priority task_priority not null default 'medium',
  is_done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- invoices (invoice / インボイス対応) ----------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  deal_id uuid references public.deals(id),
  invoice_no text not null unique,
  issued_date date not null default current_date,
  due_date date,
  subtotal numeric(14,2) not null default 0,
  tax_rate numeric(5,2) not null default 10,
  tax_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  status invoice_status not null default 'draft',
  invoice_number_t text, -- 適格請求書発行事業者登録番号 (T-number)
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  name text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(14,2) not null default 0,
  amount numeric(14,2) not null default 0
);

-- ---------- orders (受注管理) ----------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  invoice_id uuid references public.invoices(id),
  title text not null,
  ordered_at date not null default current_date,
  due_date date,
  amount numeric(14,2) default 0,
  progress order_progress not null default 'pending',
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

-- ---------- purchase_orders (発注・仕入管理) ----------
create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  vendor_name text not null,
  item_name text not null,
  ordered_at date not null default current_date,
  due_date date,
  amount numeric(14,2) default 0,
  arrival_status arrival_status not null default 'pending',
  payment_status expense_status not null default 'unpaid',
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

-- ---------- payments (入金・消込管理) ----------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id),
  customer_id uuid references public.customers(id),
  paid_amount numeric(14,2) not null,
  paid_at date not null default current_date,
  method text,
  match_status payment_match_status not null default 'unmatched',
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

-- ---------- expenses (支払管理) ----------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid references public.purchase_orders(id),
  vendor_name text not null,
  amount numeric(14,2) not null,
  paid_at date,
  method text,
  status expense_status not null default 'unpaid',
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

-- ---------- proposals (AI提案書 — Phase 2) ----------
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references public.deals(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  content text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- MVP policy: a row is visible/editable by whoever created it,
-- or (for deals/tasks) whoever it is assigned to.
-- ============================================================

alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.orders enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.proposals enable row level security;

-- users: everyone signed in can read the team directory; can only edit self
create policy "users_select_all" on public.users for select using (auth.uid() is not null);
create policy "users_update_self" on public.users for update using (auth.uid() = id);

-- customers
create policy "customers_select" on public.customers for select using (auth.uid() is not null);
create policy "customers_insert" on public.customers for insert with check (auth.uid() = created_by);
create policy "customers_update" on public.customers for update using (auth.uid() = created_by);
create policy "customers_delete" on public.customers for delete using (auth.uid() = created_by);

-- deals
create policy "deals_select" on public.deals for select using (auth.uid() is not null);
create policy "deals_insert" on public.deals for insert with check (auth.uid() = created_by);
create policy "deals_update" on public.deals for update using (auth.uid() = created_by or auth.uid() = assigned_to);
create policy "deals_delete" on public.deals for delete using (auth.uid() = created_by);

-- activities
create policy "activities_select" on public.activities for select using (auth.uid() is not null);
create policy "activities_insert" on public.activities for insert with check (auth.uid() = created_by);
create policy "activities_update" on public.activities for update using (auth.uid() = created_by);
create policy "activities_delete" on public.activities for delete using (auth.uid() = created_by);

-- tasks
create policy "tasks_select" on public.tasks for select using (auth.uid() is not null);
create policy "tasks_insert" on public.tasks for insert with check (auth.uid() = created_by);
create policy "tasks_update" on public.tasks for update using (auth.uid() = created_by or auth.uid() = assigned_to);
create policy "tasks_delete" on public.tasks for delete using (auth.uid() = created_by);

-- invoices / invoice_items
create policy "invoices_select" on public.invoices for select using (auth.uid() is not null);
create policy "invoices_insert" on public.invoices for insert with check (auth.uid() = created_by);
create policy "invoices_update" on public.invoices for update using (auth.uid() = created_by);
create policy "invoices_delete" on public.invoices for delete using (auth.uid() = created_by);

create policy "invoice_items_select" on public.invoice_items for select using (auth.uid() is not null);
create policy "invoice_items_insert" on public.invoice_items for insert with check (auth.uid() is not null);
create policy "invoice_items_update" on public.invoice_items for update using (auth.uid() is not null);
create policy "invoice_items_delete" on public.invoice_items for delete using (auth.uid() is not null);

-- orders
create policy "orders_select" on public.orders for select using (auth.uid() is not null);
create policy "orders_insert" on public.orders for insert with check (auth.uid() = created_by);
create policy "orders_update" on public.orders for update using (auth.uid() = created_by);
create policy "orders_delete" on public.orders for delete using (auth.uid() = created_by);

-- purchase_orders
create policy "po_select" on public.purchase_orders for select using (auth.uid() is not null);
create policy "po_insert" on public.purchase_orders for insert with check (auth.uid() = created_by);
create policy "po_update" on public.purchase_orders for update using (auth.uid() = created_by);
create policy "po_delete" on public.purchase_orders for delete using (auth.uid() = created_by);

-- payments
create policy "payments_select" on public.payments for select using (auth.uid() is not null);
create policy "payments_insert" on public.payments for insert with check (auth.uid() = created_by);
create policy "payments_update" on public.payments for update using (auth.uid() = created_by);
create policy "payments_delete" on public.payments for delete using (auth.uid() = created_by);

-- expenses
create policy "expenses_select" on public.expenses for select using (auth.uid() is not null);
create policy "expenses_insert" on public.expenses for insert with check (auth.uid() = created_by);
create policy "expenses_update" on public.expenses for update using (auth.uid() = created_by);
create policy "expenses_delete" on public.expenses for delete using (auth.uid() = created_by);

-- proposals
create policy "proposals_select" on public.proposals for select using (auth.uid() is not null);
create policy "proposals_insert" on public.proposals for insert with check (auth.uid() = created_by);
create policy "proposals_update" on public.proposals for update using (auth.uid() = created_by);
create policy "proposals_delete" on public.proposals for delete using (auth.uid() = created_by);

-- ---------- indexes ----------
create index idx_deals_customer_id on public.deals(customer_id);
create index idx_activities_deal_id on public.activities(deal_id);
create index idx_activities_customer_id on public.activities(customer_id);
create index idx_tasks_deal_id on public.tasks(deal_id);
create index idx_invoices_customer_id on public.invoices(customer_id);
create index idx_payments_invoice_id on public.payments(invoice_id);
