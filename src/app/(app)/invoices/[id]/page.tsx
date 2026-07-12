import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteInvoice } from "@/app/(app)/invoices/actions";
import { InvoiceStatusActions } from "@/components/invoices/invoice-status-actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: invoice }, { data: items }, { data: payments }] = await Promise.all([
    supabase.from("invoices").select("*, customers(company_name, contact_name)").eq("id", id).single(),
    supabase.from("invoice_items").select("*").eq("invoice_id", id),
    supabase.from("payments").select("*").eq("invoice_id", id).order("paid_at", { ascending: false }),
  ]);

  if (!invoice) notFound();

  const boundDelete = deleteInvoice.bind(null, id);
  const status = invoice.status as InvoiceStatus;
  const customer = invoice.customers as { company_name?: string; contact_name?: string } | null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{invoice.invoice_no}</h1>
          <p className="text-sm text-muted-foreground">
            {customer?.company_name} {customer?.contact_name ? `(${customer.contact_name})` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
          <InvoiceStatusActions id={id} status={status} />
          <DeleteButton action={boundDelete} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">明細</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>品目</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>単価</TableHead>
                    <TableHead>金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex justify-end">
                <div className="w-full max-w-xs space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">小計</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">消費税({invoice.tax_rate}%)</span>
                    <span>{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold">
                    <span>合計</span>
                    <span>{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>

              {invoice.invoice_number_t && (
                <p className="mt-4 text-xs text-muted-foreground">
                  適格請求書発行事業者登録番号: {invoice.invoice_number_t}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                発行日: {formatDate(invoice.issued_date)} ・ 支払期限: {formatDate(invoice.due_date)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">入金履歴</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/payments/new?invoice_id=${id}`}>
                <Plus />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {payments && payments.length > 0 ? (
              payments.map((p) => (
                <div key={p.id} className="rounded-md border border-border p-3 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>{formatCurrency(p.paid_amount)}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(p.paid_at)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.method}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">入金記録はまだありません。</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
