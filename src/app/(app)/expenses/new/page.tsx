import { createClient } from "@/lib/supabase/server";
import { createExpense } from "@/app/(app)/expenses/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: purchaseOrders } = await supabase
    .from("purchase_orders")
    .select("id, vendor_name, item_name, amount")
    .neq("payment_status", "paid")
    .order("ordered_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">支払を登録</h1>
        <p className="text-sm text-muted-foreground">発注・仕入に対する支払を記録します</p>
      </div>

      <form action={createExpense} className="max-w-xl space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="purchase_order_id">関連する発注(任意)</Label>
          <Select id="purchase_order_id" name="purchase_order_id" defaultValue="">
            <option value="">なし(直接入力)</option>
            {purchaseOrders?.map((po) => (
              <option key={po.id} value={po.id}>
                {po.vendor_name} ・ {po.item_name} ・ {formatCurrency(po.amount ?? 0)}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vendor_name">仕入先名 *</Label>
          <Input id="vendor_name" name="vendor_name" required placeholder="例：株式会社サンプル商事" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">金額(円) *</Label>
          <Input id="amount" name="amount" type="number" min={0} step={1} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">ステータス</Label>
          <Select id="status" name="status" defaultValue="unpaid">
            <option value="unpaid">未払い</option>
            <option value="paid">支払済み</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="paid_at">支払日</Label>
          <Input id="paid_at" name="paid_at" type="date" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="method">支払方法</Label>
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

        <Button type="submit">登録する</Button>
      </form>
    </div>
  );
}
