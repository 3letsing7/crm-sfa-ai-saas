import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpenseStatusToggle } from "@/components/expenses/expense-status-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatPaymentMethod } from "@/lib/utils";
import type { ExpenseStatus } from "@/lib/supabase/types";

const STATUS_LABEL: Record<ExpenseStatus, string> = { unpaid: "未払い", paid: "支払済み" };
const STATUS_VARIANT: Record<ExpenseStatus, "warning" | "success"> = { unpaid: "warning", paid: "success" };

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, purchase_orders(item_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">支払管理</h1>
          <p className="text-sm text-muted-foreground">発注・仕入に対する支払(買掛)の管理</p>
        </div>
        <Button asChild>
          <Link href="/expenses/new">
            <Plus />
            支払を登録
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>仕入先</TableHead>
            <TableHead>関連発注</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>支払日</TableHead>
            <TableHead>方法</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses && expenses.length > 0 ? (
            expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.vendor_name}</TableCell>
                <TableCell>{(expense.purchase_orders as { item_name?: string } | null)?.item_name ?? "-"}</TableCell>
                <TableCell>{formatCurrency(expense.amount ?? 0)}</TableCell>
                <TableCell>{formatDate(expense.paid_at)}</TableCell>
                <TableCell>{formatPaymentMethod(expense.method)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[expense.status as ExpenseStatus]}>
                    {STATUS_LABEL[expense.status as ExpenseStatus]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ExpenseStatusToggle id={expense.id} status={expense.status as ExpenseStatus} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                支払記録がまだありません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
