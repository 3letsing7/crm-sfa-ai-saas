import { ComingSoon } from "@/components/layout/coming-soon";

export default function PaymentsPage() {
  return (
    <ComingSoon
      title="入金管理（消込）"
      description="請求書に対する入金の記録・消込処理"
      table="payments"
      nextSteps={[
        "入金一覧（invoice_id と紐付け、match_status: unmatched/matched/partial）",
        "入金登録フォーム → 対応する invoices.status を自動的に paid に更新",
        "Stripe Webhook 連携（Phase 2: 決済完了時に自動で入金レコードを作成）",
      ]}
    />
  );
}
