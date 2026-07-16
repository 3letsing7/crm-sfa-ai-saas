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
```

（Supabase CLIを使う場合は `supabase db push` でも可）

```bash
npm run dev
```

`/signup` からアカウントを作成 → `/login` でログイン → `/dashboard` にリダイレクトされます。

## 実装済み

- **マルチテナント（組織）**: 会社アカウント（`organizations`）に複数の個人ユーザーが所属する構成。サインアップ時に「新しい会社を登録」（会社を作成し招待コードを発行、自分が管理者になる）または「招待コードで参加」（既存の会社にメンバーとして参加）を選択。同じ会社のメンバーは、顧客・商談・タスク・請求書・入金など全データを閲覧・編集可能（RLSで `organization_id` ベースにスコープ）。招待コードは `/settings` で確認・コピーできます。
- **認証**: Supabase Auth によるログイン・サインアップ・ログアウト（Server Actions）。`proxy.ts` で未ログイン時は `/login` にリダイレクト。
- **DBスキーマ**: 引き継ぎメモのテーブル定義（customers, deals, activities, tasks, invoices, invoice_items, orders, purchase_orders, payments, expenses, proposals）＋ Enum型 ＋ 組織スコープのRLSポリシーを `supabase/migrations/` に用意。
- **顧客管理**: 一覧（検索付き）・新規登録・詳細編集・削除。フル機能で実装済み（他モジュールの実装パターンの参考になります）。
- **商談管理**: 一覧（顧客名・金額・ステータスバッジ表示）・新規登録。
- **タスク管理**: 一覧・クイック追加・完了チェック（優先度バッジ付き）。
- **ダッシュボード**: 顧客数・パイプライン総額・未完了タスク数・最近の商談をSupabaseから実データで集計表示。
- **レイアウト**: サイドバー（引き継ぎメモの11画面すべてにリンク）＋ ヘッダー（ユーザー表示・ログアウト）。

## 未実装（スタブページとして骨組みのみ）

以下は `src/app/(app)/{invoices,orders,purchases,payments,expenses,checkout,ai}/page.tsx` に、実装すべき内容を明記したプレースホルダーを置いています。顧客管理・商談管理・タスク管理と同じ実装パターン（`actions.ts` の Server Action + 一覧 + 新規作成フォーム）で進められます。

1. **請求書管理**（`invoices` / `invoice_items`）— 明細行の動的追加、消費税自動計算、適格請求書番号対応
2. **受注管理**（`orders`）— 請求書からの自動生成
3. **発注・仕入管理**（`purchase_orders`）
4. **入金管理**（`payments`）— 消込処理、Stripe Webhook連携
5. **支払管理**（`expenses`）
6. **顧客向け決済画面**（`/checkout`）— これは**認証不要の公開ページ**にする必要があるため、`proxy.ts` の `PUBLIC_PATHS` に追加し、Stripe Checkout Session 発行用の Route Handler（`app/api/checkout/route.ts`）を新設してください
7. **AI営業支援**（Phase 2）— OpenAI API (GPT-4o) 連携。`OPENAI_API_KEY` を環境変数に追加し、`proposals` テーブルへ生成結果を保存

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

## 次にやること（優先順）

1. Supabaseプロジェクトを作成し、`0001_init.sql` を適用
2. `.env.local` を設定して `npm run dev` で動作確認
3. 上記「未実装」リストの中から、補助金申請のインボイス要件に直結する **請求書管理 → 入金管理** を優先実装
4. Stripe連携（Phase 2 決済リンク）
5. OpenAI API連携（Phase 2 AI機能）
