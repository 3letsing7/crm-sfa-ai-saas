import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCustomer, deleteCustomer } from "@/app/(app)/customers/actions";
import { CustomerForm } from "@/components/customers/customer-form";
import { DeleteButton } from "@/components/ui/delete-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Deal } from "@/lib/supabase/types";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: customer }, { data: deals }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase.from("deals").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);

  if (!customer) notFound();

  const boundUpdate = updateCustomer.bind(null, id);
  const boundDelete = deleteCustomer.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{customer.company_name}</h1>
          <p className="text-sm text-muted-foreground">顧客詳細・編集</p>
        </div>
        <DeleteButton action={boundDelete} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerForm action={boundUpdate} defaultValues={customer} submitLabel="更新する" error={error} />
        </div>

        <Card className="h-fit">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">関連する商談</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/deals/new?customer_id=${id}`}>
                <Plus />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {deals && deals.length > 0 ? (
              deals.map((deal: Deal) => (
                <div key={deal.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="font-medium">{deal.title}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="outline">{deal.status}</Badge>
                    <span>{formatCurrency(deal.amount ?? 0)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">関連する商談はまだありません。</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
