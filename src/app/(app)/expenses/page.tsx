import { ComingSoon } from "@/components/layout/coming-soon";

export default function ExpensesPage() {
  return (
    <ComingSoon
      title="支払管理"
      description="発注・仕入に対する支払（買掛）の管理"
      table="expenses"
      nextSteps={[
        "支払一覧・登録フォーム（purchase_order_id と紐付け）",
        "status（unpaid/paid）の更新アクション",
      ]}
    />
  );
}
