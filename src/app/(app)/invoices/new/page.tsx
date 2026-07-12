import { createClient } from "@/lib/supabase/server";
import { createInvoice } from "@/app/(app)/invoices/actions";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: customers }, { data: deals }] = await Promise.all([
    supabase.from("customers").select("id, company_name").order("company_name"),
    supabase.from("deals").select("id, title").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">新規請求書作成</h1>
        <p className="text-sm text-muted-foreground">顧客・商談に紐づく請求書を作成します</p>
      </div>
      <InvoiceForm
        action={createInvoice}
        customers={(customers ?? []).map((c) => ({ id: c.id, label: c.company_name }))}
        deals={(deals ?? []).map((d) => ({ id: d.id, label: d.title }))}
        error={error}
      />
    </div>
  );
}
