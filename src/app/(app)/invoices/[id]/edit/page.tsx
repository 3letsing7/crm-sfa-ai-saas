import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateInvoice } from "@/app/(app)/invoices/actions";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default async function EditInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: invoice }, { data: items }, { data: customers }, { data: deals }] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", id).single(),
    supabase.from("invoice_items").select("name, quantity, unit_price").eq("invoice_id", id),
    supabase.from("customers").select("id, company_name").order("company_name"),
    supabase.from("deals").select("id, title").order("created_at", { ascending: false }),
  ]);

  if (!invoice) notFound();
  if (invoice.status !== "draft") {
    redirect(`/invoices/${id}?error=${encodeURIComponent("下書き状態の請求書のみ編集できます")}`);
  }

  const boundUpdate = updateInvoice.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{invoice.invoice_no} を編集</h1>
        <p className="text-sm text-muted-foreground">下書き状態の請求書のみ編集できます</p>
      </div>
      <InvoiceForm
        action={boundUpdate}
        customers={(customers ?? []).map((c) => ({ id: c.id, label: c.company_name }))}
        deals={(deals ?? []).map((d) => ({ id: d.id, label: d.title }))}
        error={error}
        submitLabel="更新する"
        defaultValues={{
          customer_id: invoice.customer_id,
          deal_id: invoice.deal_id,
          due_date: invoice.due_date,
          invoice_number_t: invoice.invoice_number_t,
          tax_rate: invoice.tax_rate,
        }}
        defaultItems={items ?? []}
      />
    </div>
  );
}
