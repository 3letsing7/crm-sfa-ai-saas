import { ComingSoon } from "@/components/layout/coming-soon";

export default function OrdersPage() {
  return (
    <ComingSoon
      title="受注管理"
      description="請求書に紐づく受注の進捗管理"
      table="orders"
      nextSteps={[
        "受注一覧（顧客・請求書と紐付け、progress: pending/in_progress/completed/cancelled）",
        "請求書から受注を自動生成するアクション",
      ]}
    />
  );
}
