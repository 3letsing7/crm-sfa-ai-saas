import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CopyPaymentLink } from "@/components/invoices/copy-payment-link";
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

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, customers(company_name)")
    .in("status", ["sent", "overdue"])
    .order("due_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">顧客向け決済画面</h1>
        <p className="text-sm text-muted-foreground">
          送付済み・期限超過の請求書について、Stripeでの決済リンクを発行・コピーできます。コピーしたリンクをメールやチャットで顧客に共有してください。
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>請求書番号</TableHead>
            <TableHead>顧客</TableHead>
            <TableHead>支払期限</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>決済リンク</TableHead>
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
                <TableCell>{formatDate(invoice.due_date)}</TableCell>
                <TableCell>{formatCurrency(invoice.total ?? 0)}</TableCell>
                <TableCell>
                  <Badge variant={invoice.status === "overdue" ? "destructive" : "default"}>
                    {STATUS_LABEL[invoice.status as InvoiceStatus]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <CopyPaymentLink invoiceId={invoice.id} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                決済リンクを送付できる請求書がありません(下書き・入金済み・無効の請求書は対象外です)。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
