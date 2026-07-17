import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { OrderProgressSelect } from "@/components/orders/order-progress-select";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteOrder } from "@/app/(app)/orders/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderProgress } from "@/lib/supabase/types";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, customers(company_name), invoices(invoice_no)")
    .order("ordered_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">受注管理</h1>
          <p className="text-sm text-muted-foreground">請求書に紐づく受注の進捗管理</p>
        </div>
        <Button asChild>
          <Link href="/orders/new">
            <Plus />
            新規受注登録
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>受注名</TableHead>
            <TableHead>顧客</TableHead>
            <TableHead>関連請求書</TableHead>
            <TableHead>受注日</TableHead>
            <TableHead>納期</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>進捗</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.title}</TableCell>
                <TableCell>{(order.customers as { company_name?: string } | null)?.company_name ?? "-"}</TableCell>
                <TableCell>{(order.invoices as { invoice_no?: string } | null)?.invoice_no ?? "-"}</TableCell>
                <TableCell>{formatDate(order.ordered_at)}</TableCell>
                <TableCell>{formatDate(order.due_date)}</TableCell>
                <TableCell>{formatCurrency(order.amount ?? 0)}</TableCell>
                <TableCell>
                  <OrderProgressSelect id={order.id} progress={order.progress as OrderProgress} />
                </TableCell>
                <TableCell>
                  <DeleteButton action={deleteOrder.bind(null, order.id)} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                受注がまだ登録されていません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
