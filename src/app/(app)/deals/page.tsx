import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DealStatus } from "@/lib/supabase/types";

const STATUS_LABEL: Record<DealStatus, string> = {
  lead: "リード",
  approach: "アプローチ",
  proposal: "提案",
  negotiation: "交渉",
  won: "受注",
  lost: "失注",
};

const STATUS_VARIANT: Record<DealStatus, "default" | "success" | "destructive" | "warning"> = {
  lead: "default",
  approach: "default",
  proposal: "warning",
  negotiation: "warning",
  won: "success",
  lost: "destructive",
};

export default async function DealsPage() {
  const supabase = await createClient();
  const { data: deals } = await supabase
    .from("deals")
    .select("*, customers(company_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">商談管理</h1>
          <p className="text-sm text-muted-foreground">商談の一覧・ステータス管理</p>
        </div>
        <Button asChild>
          <Link href="/deals/new">
            <Plus />
            新規商談登録
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>商談名</TableHead>
            <TableHead>顧客</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>完了予定日</TableHead>
            <TableHead>ステータス</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals && deals.length > 0 ? (
            deals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">{deal.title}</TableCell>
                <TableCell>{deal.customers?.company_name ?? "-"}</TableCell>
                <TableCell>{formatCurrency(deal.amount ?? 0)}</TableCell>
                <TableCell>{formatDate(deal.close_date)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[deal.status as DealStatus]}>
                    {STATUS_LABEL[deal.status as DealStatus]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                商談がまだ登録されていません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
