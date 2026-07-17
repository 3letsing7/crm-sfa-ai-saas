import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrivalStatusSelect } from "@/components/purchases/arrival-status-select";
import { DeleteButton } from "@/components/ui/delete-button";
import { deletePurchaseOrder } from "@/app/(app)/purchases/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ArrivalStatus, ExpenseStatus } from "@/lib/supabase/types";

const PAYMENT_LABEL: Record<ExpenseStatus, string> = { unpaid: "未払い", paid: "支払済み" };
const PAYMENT_VARIANT: Record<ExpenseStatus, "warning" | "success"> = { unpaid: "warning", paid: "success" };

export default async function PurchasesPage() {
  const supabase = await createClient();
  const { data: purchaseOrders } = await supabase
    .from("purchase_orders")
    .select("*")
    .order("ordered_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">発注・仕入管理</h1>
          <p className="text-sm text-muted-foreground">仕入先への発注・入荷状況の管理</p>
        </div>
        <Button asChild>
          <Link href="/purchases/new">
            <Plus />
            新規発注登録
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>仕入先</TableHead>
            <TableHead>品目</TableHead>
            <TableHead>発注日</TableHead>
            <TableHead>納期</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>入荷状況</TableHead>
            <TableHead>支払状況</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseOrders && purchaseOrders.length > 0 ? (
            purchaseOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-medium">{po.vendor_name}</TableCell>
                <TableCell>{po.item_name}</TableCell>
                <TableCell>{formatDate(po.ordered_at)}</TableCell>
                <TableCell>{formatDate(po.due_date)}</TableCell>
                <TableCell>{formatCurrency(po.amount ?? 0)}</TableCell>
                <TableCell>
                  <ArrivalStatusSelect id={po.id} status={po.arrival_status as ArrivalStatus} />
                </TableCell>
                <TableCell>
                  <Badge variant={PAYMENT_VARIANT[po.payment_status as ExpenseStatus]}>
                    {PAYMENT_LABEL[po.payment_status as ExpenseStatus]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DeleteButton action={deletePurchaseOrder.bind(null, po.id)} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                発注がまだ登録されていません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
