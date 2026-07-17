import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/app/(app)/orders/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: customers }, { data: invoices }] = await Promise.all([
    supabase.from("customers").select("id, company_name").order("company_name"),
    supabase.from("invoices").select("id, invoice_no").order("issued_date", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">新規受注登録</h1>
        <p className="text-sm text-muted-foreground">顧客・請求書に紐づく受注を登録します</p>
      </div>

      <form action={createOrder} className="max-w-2xl space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="customer_id">顧客 *</Label>
            <Select id="customer_id" name="customer_id" required defaultValue="">
              <option value="" disabled>
                顧客を選択
              </option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="invoice_id">関連する請求書(任意)</Label>
            <Select id="invoice_id" name="invoice_id" defaultValue="">
              <option value="">なし</option>
              {invoices?.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_no}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">受注名 *</Label>
            <Input id="title" name="title" required placeholder="例：SFAツール導入一式" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ordered_at">受注日</Label>
            <Input id="ordered_at" name="ordered_at" type="date" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="due_date">納期</Label>
            <Input id="due_date" name="due_date" type="date" />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="amount">金額(円)</Label>
            <Input id="amount" name="amount" type="number" min={0} step={1} defaultValue={0} />
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <Button type="submit">登録する</Button>
      </form>
    </div>
  );
}
