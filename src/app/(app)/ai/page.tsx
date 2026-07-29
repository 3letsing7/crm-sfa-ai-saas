import { createClient } from "@/lib/supabase/server";
import { AiGeneratorCard } from "@/components/ai/ai-generator-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  summarizeDeal,
  generateProposal,
  generateSalesEmail,
  analyzeCustomer,
} from "@/app/(app)/ai/actions";

export default async function AiPage() {
  const supabase = await createClient();

  const [{ data: deals }, { data: customers }, { data: proposals }] = await Promise.all([
    supabase
      .from("deals")
      .select("id, title, customers(company_name)")
      .order("created_at", { ascending: false }),
    supabase.from("customers").select("id, company_name").order("company_name"),
    supabase
      .from("proposals")
      .select("id, content, created_at, deals(title), customers(company_name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const dealOptions = (deals ?? []).map((d) => ({
    id: d.id,
    label: `${d.title}（${(d.customers as { company_name?: string } | null)?.company_name ?? "顧客未設定"}）`,
  }));
  const customerOptions = (customers ?? []).map((c) => ({ id: c.id, label: c.company_name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">AI営業支援</h1>
        <p className="text-sm text-muted-foreground">
          OpenAI (GPT-4o) を利用して、提案書・営業メールの下書き作成や、商談・顧客の分析を行います。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AiGeneratorCard
          title="AI商談要約"
          description="選んだ商談の活動履歴から、現状と次のアクションを要約します。"
          pickerLabel="商談を選択"
          buttonLabel="要約を生成"
          options={dealOptions}
          emptyMessage="商談がまだ登録されていません。"
          action={summarizeDeal}
        />

        <AiGeneratorCard
          title="AI提案書生成"
          description="商談・顧客情報から提案書のドラフトを生成します。生成結果は自動的に保存されます。"
          pickerLabel="商談を選択"
          buttonLabel="提案書を生成"
          options={dealOptions}
          emptyMessage="商談がまだ登録されていません。"
          action={generateProposal}
          savedNote="生成した提案書は自動的に保存されました。"
        />

        <AiGeneratorCard
          title="AI営業メール生成"
          description="商談のフォローアップメールの下書きを作成します。"
          pickerLabel="商談を選択"
          buttonLabel="メールを生成"
          options={dealOptions}
          emptyMessage="商談がまだ登録されていません。"
          action={generateSalesEmail}
        />

        <AiGeneratorCard
          title="AI顧客分析・次回提案"
          description="顧客の商談・活動履歴から関係状況を分析し、次のアクションを提案します。"
          pickerLabel="顧客を選択"
          buttonLabel="分析を生成"
          options={customerOptions}
          emptyMessage="顧客がまだ登録されていません。"
          action={analyzeCustomer}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">保存済みの提案書</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {proposals && proposals.length > 0 ? (
            proposals.map((p) => (
              <details key={p.id} className="rounded-md border border-border p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  {(p.deals as { title?: string } | null)?.title ?? "商談不明"} ・{" "}
                  {(p.customers as { company_name?: string } | null)?.company_name ?? "顧客不明"} ・{" "}
                  <span className="text-xs font-normal text-muted-foreground">{formatDate(p.created_at)}</span>
                </summary>
                <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{p.content}</div>
              </details>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">まだ保存された提案書はありません。</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
