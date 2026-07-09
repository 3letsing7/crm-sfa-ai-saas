import { createClient } from "@/lib/supabase/server";
import { createDeal } from "@/app/(app)/deals/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function NewDealPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; error?: string }>;
}) {
  const { customer_id, error } = await searchParams;
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, company_name")
    .order("company_name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">新規商談登録</h1>
        <p className="text-sm text-muted-foreground">顧客に紐づく商談を登録します</p>
      </div>

      <form action={createDeal} className="max-w-2xl space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="customer_id">顧客 *</Label>
            <Select id="customer_id" name="customer_id" required defaultValue={customer_id ?? ""}>
              <option value="" disabled>
                顧客を選択
              </option>
              {customers?.map((c: { id: string; company_name: string }) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">商談名 *</Label>
            <Input id="title" name="title" required placeholder="例：SFAツール導入案件" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">金額（円）</Label>
            <Input id="amount" name="amount" type="number" min={0} step={1} defaultValue={0} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">ステータス</Label>
            <Select id="status" name="status" defaultValue="lead">
              <option value="lead">リード</option>
              <option value="approach">アプローチ</option>
              <option value="proposal">提案</option>
              <option value="negotiation">交渉</option>
              <option value="won">受注</option>
              <option value="lost">失注</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="close_date">完了予定日</Label>
            <Input id="close_date" name="close_date" type="date" />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="next_action">次のアクション</Label>
            <Textarea id="next_action" name="next_action" rows={3} />
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
