import { createClient } from "@/lib/supabase/server";
import { createPayment } from "@/app/(app)/payments/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice_id?: string; error?: string }>;
}) {
  const { invoice_id, error } = await searchParams;
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_no, total, customers(company_name)")
    .neq("status", "paid")
    .neq("status", "void")
    .order("issued_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">入金を記録</h1>
        <p className="text-sm text-muted-foreground">請求書に対する入金を記録し、消込処理を行います</p>
      </div>

      <form action={createPayment} className="max-w-xl space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="invoice_id">対象の請求書 *</Label>
          <Select id="invoice_id" name="invoice_id" required defaultValue={invoice_id ?? ""}>
            <option value="" disabled>
              請求書を選択
            </option>
            {invoices?.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoice_no} ・ {(inv.customers as { company_name?: string } | null)?.company_name} ・{" "}
                {formatCurrency(inv.total ?? 0)}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="paid_amount">入金額 *</Label>
          <Input id="paid_amount" name="paid_amount" type="number" min={0} step={1} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="paid_at">入金日</Label>
          <Input id="paid_at" name="paid_at" type="date" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="method">入金方法</Label>
          <Select id="method" name="method" defaultValue="bank_transfer">
            <option value="bank_transfer">銀行振込</option>
            <option value="credit_card">クレジットカード</option>
            <option value="cash">現金</option>
            <option value="other">その他</option>
          </Select>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <Button type="submit">記録する</Button>
      </form>
    </div>
  );
}
