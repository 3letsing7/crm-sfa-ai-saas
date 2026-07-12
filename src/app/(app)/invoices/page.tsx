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
import type { InvoiceStatus } from "@/lib/supabase/types";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "下書き",
  sent: "送付済み",
  paid: "入金済み",
  overdue: "期限超過",
  void: "無効",
};

const STATUS_VARIANT: Record<InvoiceStatus, "default" | "success" | "destructive" | "warning" | "outline"> = {
  draft: "outline",
  sent: "default",
  paid: "success",
  overdue: "destructive",
  void: "outline",
};

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, customers(company_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">請求書管理</h1>
          <p className="text-sm text-muted-foreground">請求書の発行・インボイス対応</p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus />
            新規請求書作成
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>請求書番号</TableHead>
            <TableHead>顧客</TableHead>
            <TableHead>発行日</TableHead>
            <TableHead>支払期限</TableHead>
            <TableHead>合計金額</TableHead>
            <TableHead>ステータス</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Link href={`/invoices/${invoice.id}`} className="font-medium hover:text-primary hover:underline">
                    {invoice.invoice_no}
                  </Link>
                </TableCell>
                <TableCell>{(invoice.customers as { company_name?: string } | null)?.company_name ?? "-"}</TableCell>
                <TableCell>{formatDate(invoice.issued_date)}</TableCell>
                <TableCell>{formatDate(invoice.due_date)}</TableCell>
                <TableCell>{formatCurrency(invoice.total ?? 0)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[invoice.status as InvoiceStatus]}>
                    {STATUS_LABEL[invoice.status as InvoiceStatus]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                請求書がまだ登録されていません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
