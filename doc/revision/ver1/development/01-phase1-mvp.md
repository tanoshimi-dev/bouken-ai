# Phase 1: MVP — 開発計画

**期間目安:** 4-6 weeks
**目標:** Web版で基本的な学習フローが動作する状態

---

## 1.1 プロジェクト基盤セットアップ

### 1.1.1 モノレポ初期化

- [ ] pnpm workspace + Turborepo でモノレポ構築
- [ ] `apps/web`, `apps/api`, `apps/mobile`（スケルトンのみ）ディレクトリ作成
- [ ] `packages/shared-types`, `packages/zod-schemas`, `packages/api-client` 作成
- [ ] TypeScript 共通設定 (`tsconfig.base.json`)
- [ ] ESLint + Prettier 共通設定
- [ ] `.env.example` 作成（全環境変数を記載）
- [ ] Git リポジトリ初期化 + `.gitignore` 設定

### 1.1.2 バックエンド (Hono API) セットアップ

- [ ] `apps/api` に Hono + Node.js + TypeScript プロジェクト作成
- [ ] エントリポイント (`src/index.ts`) — Hono app インスタンス生成
- [ ] ルーティング構成:
  ```
  src/
  ├── index.ts
  ├── routes/
  │   ├── auth.ts
  │   ├── modules.ts
  │   ├── quizzes.ts
  │   └── progress.ts
  ├── middleware/
  │   ├── auth.ts          # JWT 検証ミドルウェア
  │   ├── error-handler.ts
  │   └── cors.ts
  ├── services/
  │   ├── auth.service.ts
  │   ├── module.service.ts
  │   ├── quiz.service.ts
  │   └── progress.service.ts
  └── lib/
      ├── prisma.ts        # Prisma Client シングルトン
      ├── jwt.ts           # jose による JWT 操作
      └── env.ts           # 環境変数バリデーション (Zod)
  ```
- [ ] CORS ミドルウェア設定（Web + Mobile 向け）
- [ ] エラーハンドリングミドルウェア（統一エラーレスポンス形式）
- [ ] ヘルスチェックエンドポイント (`GET /api/health`)
- [ ] 開発サーバー起動スクリプト (`tsx watch`)

### 1.1.3 データベース (PostgreSQL + Prisma)

- [ ] PostgreSQL ローカル環境構築（Docker Compose）
- [ ] `prisma/schema.prisma` 作成 — Phase 1 に必要なテーブル:
  - `users` — ユーザー基本情報
  - `oauth_accounts` — OAuth 連携
  - `modules` — モジュール定義
  - `lessons` — レッスン定義 (content_md)
  - `quizzes` — クイズ定義
  - `quiz_questions` — クイズ問題
  - `user_progress` — 学習進捗
  - `user_quiz_attempts` — クイズ回答履歴
- [ ] 初回マイグレーション実行
- [ ] Prisma Client 生成 + シングルトン設定

### 1.1.4 Web フロントエンド (Next.js 15) セットアップ

- [ ] `apps/web` に Next.js 15 + App Router プロジェクト作成
- [ ] Tailwind CSS v4 セットアップ
- [ ] ルーティング設計（App Router）:
  ```
  src/app/
  ├── layout.tsx                    # ルートレイアウト
  ├── page.tsx                      # ランディング / ホーム
  ├── (auth)/
  │   ├── login/page.tsx            # ログイン画面
  │   └── callback/[provider]/page.tsx  # OAuth コールバック
  ├── (app)/                        # 認証済みエリア
  │   ├── layout.tsx                # サイドバー + ヘッダー
  │   ├── dashboard/page.tsx        # ダッシュボード
  │   ├── modules/
  │   │   ├── page.tsx              # モジュール一覧
  │   │   └── [moduleId]/
  │   │       ├── page.tsx          # モジュール詳細
  │   │       └── lessons/
  │   │           └── [lessonId]/page.tsx  # レッスン表示
  │   ├── quiz/
  │   │   ├── [quizId]/page.tsx     # クイズ実施
  │   │   └── [quizId]/results/page.tsx  # クイズ結果
  │   └── profile/page.tsx          # プロフィール
  └── api/                          # Next.js API Routes (不使用 — Hono APIに統一)
  ```
- [ ] Redux Toolkit ストア設定 (`src/store/`)
- [ ] 共通レイアウトコンポーネント（ヘッダー、サイドバー、フッター）
- [ ] API クライアント統合 (`packages/api-client` 利用)

### 1.1.5 共有パッケージ

- [ ] `packages/shared-types`: Phase 1 に必要な型定義
  - `User`, `OAuthAccount`
  - `Module`, `Lesson`
  - `Quiz`, `QuizQuestion`, `QuizAttempt`
  - `UserProgress`
  - API レスポンス共通型 (`ApiResponse<T>`, `PaginatedResponse<T>`)
- [ ] `packages/zod-schemas`: Phase 1 に必要なスキーマ
  - 認証関連 (callback params)
  - クイズ回答送信
  - 進捗更新
- [ ] `packages/api-client`: ベース HTTP クライアント
  - 認証トークン自動付与
  - エラーハンドリング
  - `auth`, `modules`, `quizzes`, `progress` モジュール

---

## 1.2 OAuth 認証 (Google + GitHub)

### 1.2.1 バックエンド認証実装

- [ ] `arctic` ライブラリで Google OAuth 2.0 プロバイダー設定
- [ ] `arctic` ライブラリで GitHub OAuth プロバイダー設定
- [ ] 認証ルート実装:
  - `GET /api/auth/google` → Google 認可画面へリダイレクト
  - `GET /api/auth/google/callback` → コード交換 → ユーザー情報取得 → JWT 発行
  - `GET /api/auth/github` → GitHub 認可画面へリダイレクト
  - `GET /api/auth/github/callback` → 同上
  - `GET /api/auth/me` → 現在のユーザー情報返却
  - `POST /api/auth/refresh` → JWT リフレッシュ
  - `POST /api/auth/logout` → Cookie 削除
- [ ] JWT 管理 (`jose`):
  - アクセストークン発行（有効期限: 15分）
  - リフレッシュトークン発行（有効期限: 7日）
  - Web: `httpOnly` + `Secure` + `SameSite=Lax` Cookie に保存
- [ ] ユーザー upsert ロジック:
  - 初回ログイン → `users` + `oauth_accounts` 作成
  - 再ログイン → 既存ユーザーで JWT 発行
- [ ] 認証ミドルウェア (`middleware/auth.ts`):
  - JWT 検証
  - `c.set('user', ...)` でリクエストコンテキストにユーザー情報注入
  - 未認証時 401 レスポンス

### 1.2.2 Web 認証フロー

- [ ] ログイン画面 UI（Google / GitHub ボタン）
- [ ] OAuth リダイレクト処理
- [ ] コールバック画面（JWT 受け取り → Cookie 設定 → ダッシュボードへ遷移）
- [ ] 認証状態管理 (Redux slice)
- [ ] 未認証時のリダイレクト処理（ミドルウェア or レイアウト）
- [ ] ログアウト処理

---

## 1.3 コンテンツインポーター

### 1.3.1 コンテンツディレクトリ構成

- [ ] `doc/contents/` ディレクトリ構成策定:
  ```
  doc/contents/
  ├── module-01-introduction/
  │   ├── README.md                 # モジュールメタデータ (YAML frontmatter)
  │   ├── lesson-01-what-is-claude-code.md
  │   ├── lesson-02-installation.md
  │   ├── lesson-03-initial-setup.md
  │   └── quiz.json
  ├── module-02-basics/
  │   ├── README.md
  │   ├── lesson-01-writing-prompts.md
  │   ├── lesson-02-file-editing.md
  │   ├── lesson-03-bash-commands.md
  │   └── quiz.json
  └── module-03-claude-md/
      ├── README.md
      ├── lesson-01-creating-claude-md.md
      ├── lesson-02-best-practices.md
      ├── lesson-03-init-command.md
      └── quiz.json
  ```

### 1.3.2 インポーター実装 (`scripts/seed-content.ts`)

- [ ] README.md パーサー（YAML frontmatter からモジュール情報抽出）
- [ ] Lesson Markdown 読み込み + order 決定ロジック
- [ ] quiz.json パーサー（問題・選択肢・正答・解説を展開）
- [ ] Prisma `upsert` による冪等インポート
- [ ] 整合性チェック（必須フィールドの存在確認、参照整合性）
- [ ] CLI 実行可能にする (`npx tsx scripts/seed-content.ts`)

### 1.3.3 Module 1-3 コンテンツ作成

- [ ] Module 1: はじめに（3レッスン + クイズ）
- [ ] Module 2: 基本操作（3レッスン + クイズ）
- [ ] Module 3: CLAUDE.md マスター（3レッスン + クイズ）
- [ ] 各クイズに Multiple Choice + True/False 問題を最低5問ずつ

---

## 1.4 モジュール・レッスン表示

### 1.4.1 API エンドポイント

- [ ] `GET /api/modules` — モジュール一覧（公開済みのみ）
- [ ] `GET /api/modules/:id` — モジュール詳細 + レッスン一覧
- [ ] `GET /api/modules/:moduleId/lessons/:lessonId` — レッスン詳細（content_md 含む）

### 1.4.2 Web UI

- [ ] モジュール一覧画面（カード型レイアウト）
  - モジュール番号、タイトル、説明、所要時間
  - 進捗バー（% 表示）
- [ ] モジュール詳細画面
  - レッスン一覧（完了/未完了アイコン）
  - モジュール全体の進捗
- [ ] レッスン表示画面
  - Markdown レンダリング (`react-markdown` + `remark-gfm` + `rehype-highlight`)
  - コードブロックのシンタックスハイライト
  - 「完了」ボタン
  - 前後レッスンへのナビゲーション

### 1.4.3 Markdown レンダラー (`packages/content-renderer`)

- [ ] Web 用 Markdown コンポーネント (`web.tsx`)
  - `react-markdown` + `remark-gfm`
  - コードブロック: `rehype-highlight` または Shiki
  - カスタムコンポーネント（注意書き、ヒントブロック等）

---

## 1.5 クイズ機能

### 1.5.1 API エンドポイント

- [ ] `GET /api/modules/:id/quizzes` — モジュールのクイズ一覧
- [ ] `GET /api/quizzes/:id` — クイズ詳細 + 問題（正答は含まない）
- [ ] `POST /api/quizzes/:id/submit` — 回答送信 → スコア計算
  - リクエスト: `{ answers: { questionId: answer }[] }`
  - レスポンス: `{ score, maxScore, results: { questionId, correct, explanation }[] }`
  - `user_quiz_attempts` に記録

### 1.5.2 Web UI

- [ ] クイズ開始画面（問題数、難易度、制限時間の表示）
- [ ] Multiple Choice UI（4択ラジオボタン）
- [ ] True/False UI（2択ボタン）
- [ ] 問題間ナビゲーション（次へ / 戻る）
- [ ] 回答送信 + ローディング表示
- [ ] 結果画面:
  - スコア表示（X / Y 問正解、XX%）
  - 問題ごとの正誤 + 解説表示
  - 「もう一度」「モジュールに戻る」ボタン

---

## 1.6 進捗トラッキング

### 1.6.1 API エンドポイント

- [ ] `POST /api/progress/lessons/:id` — レッスン完了記録
  - `user_progress` に `status: completed` を upsert
  - 全レッスン完了時にモジュールも completed に
- [ ] `GET /api/progress` — ユーザー全体の進捗
  - モジュールごとの完了率
  - 最新のクイズスコア

### 1.6.2 Web UI

- [ ] ダッシュボード画面:
  - 全体の学習進捗（円グラフ or プログレスバー）
  - 現在のモジュールカード（続きから学習）
  - 最近のクイズスコア
- [ ] プロフィール画面（基本情報 + 学習統計）

---

## 1.7 インフラ・開発環境

- [ ] Docker Compose (PostgreSQL + API 開発用)
- [ ] Turborepo ビルドパイプライン設定
  - `turbo dev` — Web + API 同時起動
  - `turbo build` — 全パッケージビルド
  - `turbo lint` — 全パッケージ lint
- [ ] 環境変数管理 (`.env.local`, `.env.example`)
- [ ] README.md（セットアップ手順）

---

## Phase 1 完了基準

- [ ] Google / GitHub でログインでき、JWT が発行される
- [ ] Module 1-3 のレッスンが表示・閲覧できる
- [ ] Markdown コンテンツがシンタックスハイライト付きで表示される
- [ ] Multiple Choice / True/False クイズが実施でき、スコアが表示される
- [ ] レッスン完了を記録でき、ダッシュボードに進捗が表示される
- [ ] コンテンツインポーターが冪等に動作する
