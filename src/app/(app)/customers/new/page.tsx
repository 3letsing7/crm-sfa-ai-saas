import { createCustomer } from "@/app/(app)/customers/actions";
import { CustomerForm } from "@/components/customers/customer-form";

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">新規顧客登録</h1>
        <p className="text-sm text-muted-foreground">顧客マスタに新しい顧客を追加します</p>
      </div>
      <CustomerForm action={createCustomer} submitLabel="登録する" error={error} />
    </div>
  );
}
