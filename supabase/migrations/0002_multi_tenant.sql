-- ============================================================
-- MeilleureVieSales — multi-tenant (organization) migration
-- Run this AFTER 0001_init.sql
-- ============================================================

-- ---------- organizations ----------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

-- ---------- add organization_id to every table ----------
alter table public.users add column if not exists organization_id uuid references public.organizations(id);

alter table public.customers add column if not exists organization_id uuid references public.organizations(id);
alter table public.deals add column if not exists organization_id uuid references public.organizations(id);
alter table public.activities add column if not exists organization_id uuid references public.organizations(id);
alter table public.tasks add column if not exists organization_id uuid references public.organizations(id);
alter table public.invoices add column if not exists organization_id uuid references public.organizations(id);
alter table public.invoice_items add column if not exists organization_id uuid references public.organizations(id);
alter table public.orders add column if not exists organization_id uuid references public.organizations(id);
alter table public.purchase_orders add column if not exists organization_id uuid references public.organizations(id);
alter table public.payments add column if not exists organization_id uuid references public.organizations(id);
alter table public.expenses add column if not exists organization_id uuid references public.organizations(id);
alter table public.proposals add column if not exists organization_id uuid references public.organizations(id);

create index if not exists idx_customers_org on public.customers(organization_id);
create index if not exists idx_deals_org on public.deals(organization_id);
create index if not exists idx_activities_org on public.activities(organization_id);
create index if not exists idx_tasks_org on public.tasks(organization_id);
create index if not exists idx_invoices_org on public.invoices(organization_id);
create index if not exists idx_invoice_items_org on public.invoice_items(organization_id);
create index if not exists idx_orders_org on public.orders(organization_id);
create index if not exists idx_purchase_orders_org on public.purchase_orders(organization_id);
create index if not exists idx_payments_org on public.payments(organization_id);
create index if not exists idx_expenses_org on public.expenses(organization_id);
create index if not exists idx_proposals_org on public.proposals(organization_id);

-- ---------- helper: current user's organization_id ----------
-- security definer so it can read public.users regardless of RLS,
-- avoiding recursive-policy issues when used inside other tables' policies.
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.users where id = auth.uid();
$$;

-- ---------- helper: look up an organization by invite code ----------
-- callable by anyone (even signed-out), but only returns the single
-- matching row — doesn't allow listing/enumerating all organizations.
create or replace function public.lookup_organization_by_invite_code(code text)
returns table(id uuid, name text)
language sql
stable
security definer
set search_path = public
as $$
  select id, name from public.organizations where invite_code = code;
$$;

grant execute on function public.lookup_organization_by_invite_code(text) to anon, authenticated;

-- ---------- rewrite signup trigger to create/join an organization ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  org_mode text := new.raw_user_meta_data ->> 'org_mode';
  company_name text := new.raw_user_meta_data ->> 'company_name';
  invite_code_input text := new.raw_user_meta_data ->> 'invite_code';
  target_org_id uuid;
  assigned_role user_role;
begin
  if org_mode = 'join' then
    select id into target_org_id from public.organizations where invite_code = invite_code_input;

    if target_org_id is null then
      raise exception '招待コードが正しくありません';
    end if;

    assigned_role := 'member';
  else
    insert into public.organizations (name)
    values (coalesce(nullif(company_name, ''), new.email || ' の会社'))
    returning id into target_org_id;

    assigned_role := 'admin';
  end if;

  insert into public.users (id, email, full_name, role, organization_id)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', assigned_role, target_org_id);

  return new;
end;
$$;

-- ============================================================
-- Replace all RLS policies with organization-scoped versions.
-- Rule: any member of the organization can view AND edit that
-- organization's data (per product decision — shared team access).
-- ============================================================

drop policy if exists "users_select_all" on public.users;
drop policy if exists "users_update_self" on public.users;
create policy "users_select_same_org" on public.users for select using (organization_id = public.current_org_id());
create policy "users_update_self" on public.users for update using (auth.uid() = id);

drop policy if exists "organizations_select" on public.organizations;
create policy "organizations_select_own" on public.organizations for select using (id = public.current_org_id());
create policy "organizations_update_own" on public.organizations for update using (id = public.current_org_id());

drop policy if exists "customers_select" on public.customers;
drop policy if exists "customers_insert" on public.customers;
drop policy if exists "customers_update" on public.customers;
drop policy if exists "customers_delete" on public.customers;
create policy "customers_select" on public.customers for select using (organization_id = public.current_org_id());
create policy "customers_insert" on public.customers for insert with check (organization_id = public.current_org_id());
create policy "customers_update" on public.customers for update using (organization_id = public.current_org_id());
create policy "customers_delete" on public.customers for delete using (organization_id = public.current_org_id());

drop policy if exists "deals_select" on public.deals;
drop policy if exists "deals_insert" on public.deals;
drop policy if exists "deals_update" on public.deals;
drop policy if exists "deals_delete" on public.deals;
create policy "deals_select" on public.deals for select using (organization_id = public.current_org_id());
create policy "deals_insert" on public.deals for insert with check (organization_id = public.current_org_id());
create policy "deals_update" on public.deals for update using (organization_id = public.current_org_id());
create policy "deals_delete" on public.deals for delete using (organization_id = public.current_org_id());

drop policy if exists "activities_select" on public.activities;
drop policy if exists "activities_insert" on public.activities;
drop policy if exists "activities_update" on public.activities;
drop policy if exists "activities_delete" on public.activities;
create policy "activities_select" on public.activities for select using (organization_id = public.current_org_id());
create policy "activities_insert" on public.activities for insert with check (organization_id = public.current_org_id());
create policy "activities_update" on public.activities for update using (organization_id = public.current_org_id());
create policy "activities_delete" on public.activities for delete using (organization_id = public.current_org_id());

drop policy if exists "tasks_select" on public.tasks;
drop policy if exists "tasks_insert" on public.tasks;
drop policy if exists "tasks_update" on public.tasks;
drop policy if exists "tasks_delete" on public.tasks;
create policy "tasks_select" on public.tasks for select using (organization_id = public.current_org_id());
create policy "tasks_insert" on public.tasks for insert with check (organization_id = public.current_org_id());
create policy "tasks_update" on public.tasks for update using (organization_id = public.current_org_id());
create policy "tasks_delete" on public.tasks for delete using (organization_id = public.current_org_id());

drop policy if exists "invoices_select" on public.invoices;
drop policy if exists "invoices_insert" on public.invoices;
drop policy if exists "invoices_update" on public.invoices;
drop policy if exists "invoices_delete" on public.invoices;
create policy "invoices_select" on public.invoices for select using (organization_id = public.current_org_id());
create policy "invoices_insert" on public.invoices for insert with check (organization_id = public.current_org_id());
create policy "invoices_update" on public.invoices for update using (organization_id = public.current_org_id());
create policy "invoices_delete" on public.invoices for delete using (organization_id = public.current_org_id());

drop policy if exists "invoice_items_select" on public.invoice_items;
drop policy if exists "invoice_items_insert" on public.invoice_items;
drop policy if exists "invoice_items_update" on public.invoice_items;
drop policy if exists "invoice_items_delete" on public.invoice_items;
create policy "invoice_items_select" on public.invoice_items for select using (organization_id = public.current_org_id());
create policy "invoice_items_insert" on public.invoice_items for insert with check (organization_id = public.current_org_id());
create policy "invoice_items_update" on public.invoice_items for update using (organization_id = public.current_org_id());
create policy "invoice_items_delete" on public.invoice_items for delete using (organization_id = public.current_org_id());

drop policy if exists "orders_select" on public.orders;
drop policy if exists "orders_insert" on public.orders;
drop policy if exists "orders_update" on public.orders;
drop policy if exists "orders_delete" on public.orders;
create policy "orders_select" on public.orders for select using (organization_id = public.current_org_id());
create policy "orders_insert" on public.orders for insert with check (organization_id = public.current_org_id());
create policy "orders_update" on public.orders for update using (organization_id = public.current_org_id());
create policy "orders_delete" on public.orders for delete using (organization_id = public.current_org_id());

drop policy if exists "po_select" on public.purchase_orders;
drop policy if exists "po_insert" on public.purchase_orders;
drop policy if exists "po_update" on public.purchase_orders;
drop policy if exists "po_delete" on public.purchase_orders;
create policy "po_select" on public.purchase_orders for select using (organization_id = public.current_org_id());
create policy "po_insert" on public.purchase_orders for insert with check (organization_id = public.current_org_id());
create policy "po_update" on public.purchase_orders for update using (organization_id = public.current_org_id());
create policy "po_delete" on public.purchase_orders for delete using (organization_id = public.current_org_id());

drop policy if exists "payments_select" on public.payments;
drop policy if exists "payments_insert" on public.payments;
drop policy if exists "payments_update" on public.payments;
drop policy if exists "payments_delete" on public.payments;
create policy "payments_select" on public.payments for select using (organization_id = public.current_org_id());
create policy "payments_insert" on public.payments for insert with check (organization_id = public.current_org_id());
create policy "payments_update" on public.payments for update using (organization_id = public.current_org_id());
create policy "payments_delete" on public.payments for delete using (organization_id = public.current_org_id());

drop policy if exists "expenses_select" on public.expenses;
drop policy if exists "expenses_insert" on public.expenses;
drop policy if exists "expenses_update" on public.expenses;
drop policy if exists "expenses_delete" on public.expenses;
create policy "expenses_select" on public.expenses for select using (organization_id = public.current_org_id());
create policy "expenses_insert" on public.expenses for insert with check (organization_id = public.current_org_id());
create policy "expenses_update" on public.expenses for update using (organization_id = public.current_org_id());
create policy "expenses_delete" on public.expenses for delete using (organization_id = public.current_org_id());

drop policy if exists "proposals_select" on public.proposals;
drop policy if exists "proposals_insert" on public.proposals;
drop policy if exists "proposals_update" on public.proposals;
drop policy if exists "proposals_delete" on public.proposals;
create policy "proposals_select" on public.proposals for select using (organization_id = public.current_org_id());
create policy "proposals_insert" on public.proposals for insert with check (organization_id = public.current_org_id());
create policy "proposals_update" on public.proposals for update using (organization_id = public.current_org_id());
create policy "proposals_delete" on public.proposals for delete using (organization_id = public.current_org_id());

-- ============================================================
-- Backfill for any data created before this migration.
-- Safe no-op on a fresh database with no existing rows.
--
-- Everything that predates multi-tenancy is assumed to belong to
-- one company, so it's all placed into a single fallback
-- organization (rather than one org per user) — this preserves
-- the existing shared visibility between whoever was already
-- using the app. Covers every organization_id column, including
-- the ones the first version of this migration missed
-- (activities, invoice_items, orders, purchase_orders, expenses,
-- proposals).
-- ============================================================
do $$
declare
  fallback_org_id uuid;
  needs_backfill boolean;
begin
  select exists(select 1 from public.users where organization_id is null) into needs_backfill;

  if needs_backfill then
    insert into public.organizations (name) values ('未分類の組織（既存データ）') returning id into fallback_org_id;

    update public.users set organization_id = fallback_org_id where organization_id is null;
    update public.customers set organization_id = fallback_org_id where organization_id is null;
    update public.deals set organization_id = fallback_org_id where organization_id is null;
    update public.activities set organization_id = fallback_org_id where organization_id is null;
    update public.tasks set organization_id = fallback_org_id where organization_id is null;
    update public.invoices set organization_id = fallback_org_id where organization_id is null;
    update public.invoice_items set organization_id = fallback_org_id where organization_id is null;
    update public.orders set organization_id = fallback_org_id where organization_id is null;
    update public.purchase_orders set organization_id = fallback_org_id where organization_id is null;
    update public.payments set organization_id = fallback_org_id where organization_id is null;
    update public.expenses set organization_id = fallback_org_id where organization_id is null;
    update public.proposals set organization_id = fallback_org_id where organization_id is null;
  end if;
end $$;
