import { ComingSoon } from "@/components/layout/coming-soon";

export default function PurchasesPage() {
  return (
    <ComingSoon
      title="発注・仕入管理"
      description="仕入先への発注・入荷状況の管理"
      table="purchase_orders"
      nextSteps={[
        "発注一覧・新規登録フォーム（vendor_name, item_name, amount）",
        "arrival_status（pending/arrived/cancelled）の更新アクション",
        "支払管理（expenses）との連携",
      ]}
    />
  );
}
