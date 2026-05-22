# Claude 開発ガイド

## プロジェクト概要

本プロジェクトは、IT企業・ソフトウェア企業向けのCRM / SFA SaaSシステムである。

主な目的：

- 顧客管理（CRM）
- 営業活動管理（SFA）
- 提案管理
- 営業業務効率化
- AIによる営業支援

また、本システムは「デジタル化・AI導入補助金」の  
共P-01（顧客対応・販売支援）に対応することを目的とする。

---

# 主要機能

## CRM機能

- 顧客管理
- 商談履歴管理
- メモ管理
- 顧客検索・フィルタ

## SFA機能

- 商談管理
- 営業ステータス管理
- 活動履歴管理
- タスク管理
- 営業進捗管理

## ダッシュボード機能

- 営業状況サマリー
- 商談進捗一覧
- KPI表示

## AI機能（Phase2以降）

- AI提案書生成
- AI営業メール生成
- AI商談要約
- AI顧客分析

---

# 技術構成

## フロントエンド

- Next.js（App Router）
- TypeScript
- Tailwind CSS
- shadcn/ui

## バックエンド

- Supabase
  - PostgreSQL
  - Supabase Auth
  - Storage

## AI

- OpenAI API

## Hosting

- Vercel

---

# 開発ルール

## 基本方針

- シンプルな実装を優先する
- 過度な設計を避ける
- 可読性・保守性を重視する
- 分かりやすいTypeScriptを書く

## UIルール

- 可能な限りshadcn/uiを利用する
- シンプルで業務向けUIにする
- レスポンシブ対応する
- PC利用を優先する
- 過度なアニメーションは禁止

## コードルール

- TypeScript strict modeを使用
- async/awaitを利用
- 可能な限りServer Componentsを使用
- 業務ロジックとUIを分離
- 再利用可能なコンポーネント化を意識

## APIルール

- Server Actions または Route Handlers を利用
- 入力値検証を行う
- エラーハンドリングを実装する

## DBルール

- UUIDを主キーに使用
- created_at / updated_at を保持
- 外部キーを適切に設定
- 重複データを避ける

---

# フォルダ構成

```txt
/app
/components
/lib
/types
/hooks
/services
/docs