import { ComingSoon } from "@/components/layout/coming-soon";

export default function InvoicesPage() {
  return (
    <ComingSoon
      title="請求書管理"
      description="請求書の発行・インボイス対応（適格請求書6要件）"
      table="invoices / invoice_items"
      nextSteps={[
        "請求書一覧ページ（顧客・商談から作成、ステータス: draft/sent/paid/overdue/void）",
        "請求書作成フォーム（invoice_items の明細行を動的追加・小計/消費税/合計の自動計算）",
        "invoice_number_t（適格請求書発行事業者登録番号）の表示・PDF出力",
        "「決済リンク送付」ボタン → /checkout ページへの導線",
      ]}
    />
  );
}
