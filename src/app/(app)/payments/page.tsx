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
import { formatCurrency, formatDate, formatPaymentMethod } from "@/lib/utils";
import type { PaymentMatchStatus } from "@/lib/supabase/types";

const MATCH_LABEL: Record<PaymentMatchStatus, string> = {
  unmatched: "未消込",
  matched: "消込済み",
  partial: "一部消込",
};

const MATCH_VARIANT: Record<PaymentMatchStatus, "default" | "success" | "warning"> = {
  unmatched: "default",
  matched: "success",
  partial: "warning",
};

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("*, invoices(invoice_no), customers(company_name)")
    .order("paid_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">入金管理</h1>
          <p className="text-sm text-muted-foreground">請求書に対する入金の記録・消込状況</p>
        </div>
        <Button asChild>
          <Link href="/payments/new">
            <Plus />
            入金を記録
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>入金日</TableHead>
            <TableHead>顧客</TableHead>
            <TableHead>請求書番号</TableHead>
            <TableHead>入金額</TableHead>
            <TableHead>方法</TableHead>
            <TableHead>消込状況</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments && payments.length > 0 ? (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{formatDate(payment.paid_at)}</TableCell>
                <TableCell>{(payment.customers as { company_name?: string } | null)?.company_name ?? "-"}</TableCell>
                <TableCell>
                  {(payment.invoices as { invoice_no?: string } | null)?.invoice_no ?? "-"}
                </TableCell>
                <TableCell>{formatCurrency(payment.paid_amount ?? 0)}</TableCell>
                <TableCell>{formatPaymentMethod(payment.method)}</TableCell>
                <TableCell>
                  <Badge variant={MATCH_VARIANT[payment.match_status as PaymentMatchStatus]}>
                    {MATCH_LABEL[payment.match_status as PaymentMatchStatus]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                入金記録がまだありません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
