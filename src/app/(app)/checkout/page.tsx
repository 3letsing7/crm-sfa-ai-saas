import { ComingSoon } from "@/components/layout/coming-soon";

export default function CheckoutPage() {
  return (
    <ComingSoon
      title="顧客向け決済画面"
      description="請求書からのリンクで顧客が閲覧する決済ページ（認証不要の公開ページとして別途実装が必要）"
      table="invoices, payments"
      nextSteps={[
        "このページは /checkout/[invoiceId] のような公開ルートとして middleware の認証対象外にする",
        "Stripe Checkout Session を作成する Route Handler（app/api/checkout/route.ts）",
        "決済完了 Webhook（app/api/stripe-webhook/route.ts）で payments テーブルに記録し invoices.status を更新",
      ]}
    />
  );
}
