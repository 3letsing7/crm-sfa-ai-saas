"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserAndOrg } from "@/lib/supabase/org";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";

type AiResult = { ok: true; content: string } | { ok: false; error: string };

async function chat(system: string, user: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    system,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";
}

function handleAiError(err: unknown): AiResult {
  console.error("[ai] generation failed:", err);
  const message = err instanceof Error ? err.message : "生成に失敗しました";
  return { ok: false, error: message };
}

// ---------- AI商談要約 ----------
export async function summarizeDeal(dealId: string): Promise<AiResult> {
  const supabase = await createClient();
  await requireUserAndOrg(supabase);

  const [{ data: deal }, { data: activities }] = await Promise.all([
    supabase.from("deals").select("*, customers(company_name, industry)").eq("id", dealId).single(),
    supabase
      .from("activities")
      .select("type, content, activity_date")
      .eq("deal_id", dealId)
      .order("activity_date", { ascending: true }),
  ]);

  if (!deal) return { ok: false, error: "商談が見つかりません" };

  const customer = deal.customers as { company_name?: string; industry?: string } | null;
  const activityText =
    activities && activities.length > 0
      ? activities.map((a) => `- [${a.type}] ${a.activity_date}: ${a.content ?? ""}`).join("\n")
      : "(活動履歴なし)";

  const prompt = `以下は商談の情報です。営業担当者が商談前に素早く確認できるよう、現在の状況・重要なポイント・次にやるべきことを日本語で簡潔に要約してください（300字程度）。

商談名: ${deal.title}
顧客: ${customer?.company_name ?? "不明"}（業種: ${customer?.industry ?? "不明"}）
ステータス: ${deal.status}
金額: ${deal.amount}円
次のアクション(登録済み): ${deal.next_action ?? "未設定"}

活動履歴:
${activityText}`;

  try {
    const content = await chat(
      "あなたは優秀なB2B営業アシスタントです。簡潔で実用的な日本語のビジネス文章を書きます。",
      prompt
    );
    return { ok: true, content };
  } catch (err) {
    return handleAiError(err);
  }
}

// ---------- AI提案書生成 ----------
export async function generateProposal(dealId: string): Promise<AiResult> {
  const supabase = await createClient();
  const { user, organizationId } = await requireUserAndOrg(supabase);

  const { data: deal } = await supabase
    .from("deals")
    .select("*, customers(company_name, industry, memo)")
    .eq("id", dealId)
    .single();

  if (!deal) return { ok: false, error: "商談が見つかりません" };

  const customer = deal.customers as { company_name?: string; industry?: string; memo?: string } | null;

  const prompt = `以下の商談情報をもとに、顧客に提示するビジネス提案書を日本語で作成してください。「概要」「課題認識」「提案内容」「導入後の効果」「概算金額」の見出しに沿って、具体的かつ丁寧なビジネス文書として記述してください。

商談名: ${deal.title}
顧客名: ${customer?.company_name ?? "不明"}
業種: ${customer?.industry ?? "不明"}
顧客メモ: ${customer?.memo ?? "なし"}
想定金額: ${deal.amount}円
次のアクション: ${deal.next_action ?? "未設定"}`;

  try {
    const content = await chat(
      "あなたは経験豊富なB2B営業のプロポーザルライターです。説得力があり、専門的で丁寧な日本語のビジネス提案書を作成します。",
      prompt
    );

    const { error } = await supabase.from("proposals").insert({
      deal_id: dealId,
      customer_id: deal.customer_id,
      content,
      created_by: user.id,
      organization_id: organizationId,
    });

    if (error) {
      return { ok: false, error: `生成はできましたが保存に失敗しました: ${error.message}` };
    }

    revalidatePath("/ai");
    return { ok: true, content };
  } catch (err) {
    return handleAiError(err);
  }
}

// ---------- AI営業メール生成 ----------
export async function generateSalesEmail(dealId: string): Promise<AiResult> {
  const supabase = await createClient();
  await requireUserAndOrg(supabase);

  const { data: deal } = await supabase
    .from("deals")
    .select("*, customers(company_name, contact_name)")
    .eq("id", dealId)
    .single();

  if (!deal) return { ok: false, error: "商談が見つかりません" };

  const customer = deal.customers as { company_name?: string; contact_name?: string } | null;

  const prompt = `以下の商談についてのフォローアップ営業メールを、日本語のビジネスメール形式（件名＋本文）で作成してください。丁寧語を使い、簡潔にまとめてください。

商談名: ${deal.title}
顧客: ${customer?.company_name ?? "不明"} ${customer?.contact_name ? "様（" + customer.contact_name + "様）" : ""}
現在のステータス: ${deal.status}
次のアクション: ${deal.next_action ?? "特になし"}`;

  try {
    const content = await chat(
      "あなたは丁寧で信頼される日本語ビジネスメールを書くB2B営業担当者です。",
      prompt
    );
    return { ok: true, content };
  } catch (err) {
    return handleAiError(err);
  }
}

// ---------- AI顧客分析・次回提案 ----------
export async function analyzeCustomer(customerId: string): Promise<AiResult> {
  const supabase = await createClient();
  await requireUserAndOrg(supabase);

  const [{ data: customer }, { data: deals }, { data: activities }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", customerId).single(),
    supabase.from("deals").select("title, status, amount, close_date").eq("customer_id", customerId),
    supabase
      .from("activities")
      .select("type, content, activity_date")
      .eq("customer_id", customerId)
      .order("activity_date", { ascending: false })
      .limit(20),
  ]);

  if (!customer) return { ok: false, error: "顧客が見つかりません" };

  const dealsText =
    deals && deals.length > 0
      ? deals.map((d) => `- ${d.title}（${d.status}, ${d.amount}円）`).join("\n")
      : "(商談なし)";
  const activityText =
    activities && activities.length > 0
      ? activities.map((a) => `- [${a.type}] ${a.activity_date}: ${a.content ?? ""}`).join("\n")
      : "(活動履歴なし)";

  const prompt = `以下は顧客の商談・活動履歴です。この顧客との関係状況を分析し、営業担当者が次に取るべきアクションを日本語で提案してください（「現状分析」「次回提案」の見出しで、それぞれ簡潔に）。

会社名: ${customer.company_name}
業種: ${customer.industry ?? "不明"}
ステータス: ${customer.status}
メモ: ${customer.memo ?? "なし"}

商談一覧:
${dealsText}

最近の活動履歴:
${activityText}`;

  try {
    const content = await chat(
      "あなたはデータに基づいて的確な営業戦略を提案するB2B営業アナリストです。",
      prompt
    );
    return { ok: true, content };
  } catch (err) {
    return handleAiError(err);
  }
}
