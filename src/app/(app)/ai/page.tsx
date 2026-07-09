import { ComingSoon } from "@/components/layout/coming-soon";

export default function AiPage() {
  return (
    <ComingSoon
      title="AI営業支援"
      description="Phase 2: AI提案書生成・AI営業メール生成・AI商談要約・AI顧客分析（生成AI利用の申告対象）"
      table="proposals"
      nextSteps={[
        "OpenAI API (GPT-4o) 連携用の Route Handler を作成し、環境変数 OPENAI_API_KEY を追加",
        "AI提案書生成: 商談・顧客データをプロンプトに含めて proposals テーブルへ保存",
        "AI営業メール生成: 商談ステータス・活動履歴を要約してメール文面を生成",
        "AI商談要約 / AI顧客分析: activities テーブルの内容を要約する非生成AI（分類・要約モデル）を検討",
      ]}
    />
  );
}
