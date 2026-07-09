import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Deal } from "@/lib/supabase/types";

const DEAL_STATUS_LABEL: Record<string, string> = {
  lead: "リード",
  approach: "アプローチ",
  proposal: "提案",
  negotiation: "交渉",
  won: "受注",
  lost: "失注",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: customerCount }, { data: openDeals }, { count: openTaskCount }, { data: recentDeals }] =
    await Promise.all([
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("deals").select("amount").not("status", "in", "(won,lost)"),
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("is_done", false),
      supabase
        .from("deals")
        .select("id, title, status, amount, close_date, customers(company_name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const pipelineTotal = (openDeals ?? []).reduce((sum: number, d: { amount: number }) => sum + (d.amount ?? 0), 0);

  const kpis = [
    { label: "顧客数", value: `${customerCount ?? 0}件` },
    { label: "商談中パイプライン", value: formatCurrency(pipelineTotal) },
    { label: "未完了タスク", value: `${openTaskCount ?? 0}件` },
    { label: "進行中の商談数", value: `${(openDeals ?? []).length}件` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">ダッシュボード</h1>
        <p className="text-sm text-muted-foreground">営業活動の全体状況</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardTitle>{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">最近の商談</CardTitle>
          <Link href="/deals" className="text-sm text-primary hover:underline">
            すべて見る
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentDeals && recentDeals.length > 0 ? (
            recentDeals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{deal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {(deal.customers as { company_name?: string } | null)?.company_name} ・ 完了予定{" "}
                    {formatDate(deal.close_date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{formatCurrency(deal.amount ?? 0)}</span>
                  <Badge variant={deal.status === "won" ? "success" : deal.status === "lost" ? "destructive" : "default"}>
                    {DEAL_STATUS_LABEL[deal.status as Deal["status"]] ?? deal.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              まだ商談がありません。
              <Link href="/deals/new" className="ml-1 text-primary hover:underline">
                最初の商談を登録
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
