# MeilleureVieSales

IT企業・ソフトウェア会社向けクラウド型AI営業支援SaaS（Phase 1 実装ベース）

引き継ぎメモの技術スタック・DB設計・画面構成に沿って構築しています。

## スタック

- Next.js 16 (App Router / TypeScript / Turbopack)
- Tailwind CSS v4（shadcn/ui 相当のコンポーネントを `src/components/ui` に手動実装 — 後述）
- Supabase（PostgreSQL + Auth、`@supabase/ssr` でCookieベースのセッション管理）

> **注記:** この開発サンドボックスは `ui.shadcn.com` にネットワークアクセスできないため、`npx shadcn init` は実行できませんでした。代わりに Radix UI プリミティブ（`@radix-ui/react-*`）と `class-variance-authority` を使って、shadcn/ui と同じ構成・スタイルの手法でコンポーネント（Button, Input, Select, Card, Badge, Table など）を `src/components/ui/` に直接実装しています。挙動・見た目はshadcn/uiと同等です。ご自身の環境であれば `npx shadcn@latest add <component>` で追加コンポーネントを取り込むこともできます。

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.local に Supabase の URL / anon key を設定
```

Supabaseプロジェクトを作成したら、SQLエディタで以下を**この順番で**実行してスキーマを作成してください:

```
supabase/migrations/0001_init.sql
supabase/migrations/0002_multi_tenant.sql
supabase/migrations/0003_stripe_checkout.sql
```

（Supabase CLIを使う場合は `supabase db push` でも可）

```bash
npm run dev
```

`/signup` からアカウントを作成 → `/login` でログイン → `/dashboard` にリダイレクトされます。

## Stripe決済のセットアップ

1. https://dashboard.stripe.com/apikeys （テストモード）から **Secret key** をコピーし `.env.local` の `STRIPE_SECRET_KEY` に設定
2. Supabase → **Settings → API** の **service_role key** をコピーし `.env.local` の `SUPABASE_SERVICE_ROLE_KEY` に設定（このキーはRLSを完全にバイパスするため、サーバーサイド専用・`NEXT_PUBLIC_` を付けないこと）
3. Webhookの設定:
   - **ローカル開発時**: [Stripe CLI](https://docs.stripe.com/stripe-cli) を使い `stripe listen --forward-to localhost:3000/api/stripe/webhook` を実行すると、表示される `whsec_...` を `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定
   - **本番環境**: Stripeダッシュボード → **Developers → Webhooks → Add endpoint** で `https://<本番ドメイン>/api/stripe/webhook` を登録し、イベントは **`checkout.session.completed`** を選択。発行される signing secret を Vercel の Environment Variables に `STRIPE_WEBHOOK_SECRET` として設定（設定後は Redeploy を忘れずに）
4. 動作確認: 請求書を作成 →ステータスを「送付済み」に→ `/checkout` または請求書詳細ページから決済リンクをコピー → シークレットウィンドウで開き、Stripeのテストカード（`4242 4242 4242 4242` / 任意の将来の有効期限 / 任意のCVC）で支払い、請求書が自動で「入金済み」になるか確認

## 実装済み

- **マルチテナント（組織）**: 会社アカウント（`organizations`）に複数の個人ユーザーが所属する構成。サインアップ時に「新しい会社を登録」（会社を作成し招待コードを発行、自分が管理者になる）または「招待コードで参加」（既存の会社にメンバーとして参加）を選択。同じ会社のメンバーは、顧客・商談・タスク・請求書・入金など全データを閲覧・編集可能（RLSで `organization_id` ベースにスコープ）。招待コードは `/settings` で確認・コピーできます。
- **認証**: Supabase Auth によるログイン・サインアップ・ログアウト（Server Actions）。`proxy.ts` で未ログイン時は `/login` にリダイレクト。
- **DBスキーマ**: 引き継ぎメモのテーブル定義（customers, deals, activities, tasks, invoices, invoice_items, orders, purchase_orders, payments, expenses, proposals）＋ Enum型 ＋ 組織スコープのRLSポリシーを `supabase/migrations/` に用意。
- **顧客管理**: 一覧（検索付き）・新規登録・詳細編集・削除。フル機能で実装済み（他モジュールの実装パターンの参考になります）。
- **商談管理**: 一覧（顧客名・金額・ステータスバッジ表示）・新規登録。
- **タスク管理**: 一覧・クイック追加・完了チェック（優先度バッジ付き）。
- **請求書管理**: 一覧・新規作成（明細行の動的追加/削除・消費税自動計算・適格請求書番号対応）・編集（下書きのみ）・ステータス遷移。
- **入金管理**: 入金記録、請求書への自動消込（入金累計が合計に達すると請求書ステータスを自動で `paid` に更新）。
- **受注管理**: 一覧・新規登録（顧客・請求書と紐付け）・進捗管理（未着手/進行中/完了/キャンセル）。
- **発注・仕入管理**: 一覧・新規登録・入荷状況管理（未入荷/入荷済み/キャンセル）・支払状況表示。
- **支払管理**: 一覧・支払登録（発注と紐付け可）・支払済みへの更新。支払済みにすると、紐づく発注の支払状況も自動更新。
- **Stripe決済連携**: 送付済み・期限超過の請求書に対して決済リンクを発行（`/checkout` 画面、または請求書詳細ページの「決済リンクをコピー」）。顧客は認証不要の `/pay/[invoiceId]` ページでカード決済でき、Stripe Webhook（`app/api/stripe/webhook/route.ts`）が決済完了を検知して `payments` テーブルへ記録＋請求書ステータスを自動で `paid` に更新します。
- **AI営業支援（Phase 2・Anthropic Claude連携）**: `/ai` 画面から以下の4機能を利用可能。
  - **AI商談要約**: 商談の活動履歴から現状・次のアクションを要約
  - **AI提案書生成**: 商談・顧客情報から提案書を生成し、`proposals` テーブルへ自動保存（画面下部で保存済み提案書を一覧・展開表示）
  - **AI営業メール生成**: 商談のフォローアップメール下書きを作成
  - **AI顧客分析・次回提案**: 顧客の商談・活動履歴を分析し、次のアクションを提案
  - いずれも Anthropic の `claude-sonnet-5` モデルを使用（`src/lib/anthropic.ts`、Server Actionsは `src/app/(app)/ai/actions.ts`）
- **ダッシュボード**: 顧客数・パイプライン総額・未完了タスク数・最近の商談をSupabaseから実データで集計表示。
- **レイアウト**: サイドバー（引き継ぎメモの11画面すべてにリンク）＋ ヘッダー（ユーザー表示・ログアウト・設定）。

## 未実装

現時点で、引き継ぎメモのPhase 1・Phase 2の主要機能はすべて実装済みです。今後の改善候補は以下の通りです。

- AI商談要約・AI顧客分析・AI営業メールの生成結果を保存する機能（現状は提案書のみ保存）
- 管理者によるメンバー権限変更・除名、招待コードの再発行（`/settings`）
- Stripe決済の失敗時のリトライ導線、返金対応

## GitHubへの反映について

このサンドボックス環境からは `github.com/3letsing7/crm-sfa-ai-saas` へ直接pushする認証情報を持っていないため、コードはこのチャットのファイルとしてお渡ししています。お手元で以下の手順で反映してください:

```bash
# 1. 既存リポジトリをclone
git clone https://github.com/3letsing7/crm-sfa-ai-saas.git
cd crm-sfa-ai-saas

# 2. このzipの中身を展開してコピー（.git は上書きしない）
# 3. コミット & push
git add .
git commit -m "feat: Next.js + Supabase Phase1 scaffold (auth, customers, deals, tasks, dashboard)"
git push
```

## AI営業支援のセットアップ

1. https://console.anthropic.com/settings/keys でAPIキーを発行（すでにClaude/Anthropicと契約済みの場合は、既存のコンソールから発行できます）
2. `.env.local`（ローカル）または Vercel の Environment Variables（本番）に `ANTHROPIC_API_KEY` を設定（本番は設定後 Redeploy が必要です）
3. `/ai` 画面で、商談または顧客を選んで各生成ボタンを押して動作確認

## 次にやること（優先順）

1. Supabaseプロジェクトを作成し、`0001_init.sql` → `0002_multi_tenant.sql` → `0003_stripe_checkout.sql` の順に適用
2. `.env.local` を設定して `npm run dev` で動作確認
3. Stripe・Anthropic の本番用キーへの切り替え（現在はテスト/サンドボックスキーを想定した案内をしています）
