import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/supabase/types";

export default async function PayInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { invoiceId } = await params;
  const { status: redirectStatus } = await searchParams;
  const supabase = await createClient();

  const { data: invoices } = await supabase.rpc("get_invoice_public", {
    p_invoice_id: invoiceId,
  });
  const invoice = invoices?.[0];

  if (!invoice) notFound();

  const status = invoice.status as InvoiceStatus;
  const canPay = status === "sent" || status === "overdue";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">{invoice.invoice_no}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {redirectStatus === "success" && status !== "paid" && (
          <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
            決済処理を受け付けました。反映まで少しお時間をいただく場合があります。
          </p>
        )}
        {redirectStatus === "cancelled" && (
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            お支払いはキャンセルされました。
          </p>
        )}

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">請求先</span>
            <span>{invoice.company_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">支払期限</span>
            <span>{formatDate(invoice.due_date)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border p-4">
          <span className="text-sm text-muted-foreground">お支払い金額</span>
          <span className="text-xl font-semibold">{formatCurrency(invoice.total)}</span>
        </div>

        {status === "paid" && (
          <Badge variant="success" className="w-full justify-center py-2 text-sm">
            お支払い済みです
          </Badge>
        )}
        {status === "void" && (
          <Badge variant="outline" className="w-full justify-center py-2 text-sm">
            この請求書は無効化されています
          </Badge>
        )}
        {status === "draft" && (
          <p className="rounded-md bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
            この請求書はまだお支払いいただけません。
          </p>
        )}

        {canPay && (
          <form action="/api/checkout" method="POST">
            <input type="hidden" name="invoice_id" value={invoice.id} />
            <Button type="submit" className="w-full" size="lg">
              カードで支払う
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
