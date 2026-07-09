import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "@/lib/supabase/types";

const STATUS_LABEL: Record<Customer["status"], string> = {
  lead: "リード",
  prospect: "見込み客",
  active: "取引中",
  churned: "離脱",
};

const STATUS_VARIANT: Record<Customer["status"], "default" | "primary" | "success" | "warning"> = {
  lead: "default",
  prospect: "warning",
  active: "success",
  churned: "default",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`company_name.ilike.%${q}%,contact_name.ilike.%${q}%`);
  }

  const { data: customers } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">顧客管理</h1>
          <p className="text-sm text-muted-foreground">顧客マスタの一覧・検索・登録</p>
        </div>
        <Button asChild>
          <Link href="/customers/new">
            <Plus />
            新規顧客登録
          </Link>
        </Button>
      </div>

      <form className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={q} placeholder="会社名・担当者名で検索" className="pl-9" />
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>会社名</TableHead>
            <TableHead>担当者</TableHead>
            <TableHead>業種</TableHead>
            <TableHead>連絡先</TableHead>
            <TableHead>ステータス</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers && customers.length > 0 ? (
            customers.map((customer: Customer) => (
              <TableRow key={customer.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/customers/${customer.id}`} className="font-medium hover:text-primary hover:underline">
                    {customer.company_name}
                  </Link>
                </TableCell>
                <TableCell>{customer.contact_name ?? "-"}</TableCell>
                <TableCell>{customer.industry ?? "-"}</TableCell>
                <TableCell className="text-muted-foreground">{customer.email ?? customer.phone ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[customer.status]}>{STATUS_LABEL[customer.status]}</Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                顧客がまだ登録されていません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
