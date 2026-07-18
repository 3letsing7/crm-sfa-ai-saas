-- ============================================================
-- MeilleureVieSales — Stripe checkout support
-- Run this AFTER 0001_init.sql and 0002_multi_tenant.sql
-- ============================================================

-- Exposes only the handful of fields the public payment page needs
-- (never the raw invoices row, and never any other customer's data).
-- Callable by anyone — the invoice UUID itself acts as the unguessable
-- "access token" for this page (128-bit random id).
create or replace function public.get_invoice_public(p_invoice_id uuid)
returns table (
  id uuid,
  invoice_no text,
  status invoice_status,
  total numeric,
  due_date date,
  company_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id,
    i.invoice_no,
    i.status,
    i.total,
    i.due_date,
    c.company_name
  from public.invoices i
  join public.customers c on c.id = i.customer_id
  where i.id = p_invoice_id;
$$;

grant execute on function public.get_invoice_public(uuid) to anon, authenticated;
