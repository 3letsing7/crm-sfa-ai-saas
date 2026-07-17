import { createPurchaseOrder } from "@/app/(app)/purchases/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function NewPurchaseOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">新規発注登録</h1>
        <p className="text-sm text-muted-foreground">仕入先への発注を登録します</p>
      </div>

      <form action={createPurchaseOrder} className="max-w-2xl space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="vendor_name">仕入先名 *</Label>
            <Input id="vendor_name" name="vendor_name" required placeholder="例：株式会社サンプル商事" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item_name">品目 *</Label>
            <Input id="item_name" name="item_name" required placeholder="例：サーバーライセンス" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ordered_at">発注日</Label>
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
