# Phase 1: MVP基盤構築 — 進捗レポート

**日付**: 2026-03-02
**ステータス**: 完了（100%）

---

## 概要

Phase 1 では、Learn Claude Code アプリのモノレポ基盤・バックエンドAPI・Web フロントエンド・OAuth認証・学習コンテンツ・全ページのデータ連携を構築した。前回レポート（2026-03-01、約60%）から、残りの認証ガード・Markdownレンダラー・useApiフック・学習コンテンツ作成・7ページのUI実装を完了。さらに、バックエンド API の E2E テストを自動化し、全フローの動作確認を完了した。

---

## 完了した作業

### 1. モノレポ基盤（100%）

81ファイルを作成し、以下の構造を構築：

```
sys/                                    # モノレポルート (pnpm + Turborepo)
├── package.json                        # ワークスペースルート
├── pnpm-workspace.yaml                 # backend/*, frontend/user/*, packages/*
├── turbo.json                          # build, dev, lint, type-check パイプライン
├── tsconfig.base.json                  # 共有 TS 設定 (ES2022, bundler, strict)
├── docker-compose.yml                  # PostgreSQL 16-alpine + Adminer
├── .env.example                        # 環境変数テンプレート
│
├── backend/api/                        # Hono API サーバー (port 4000)
├── frontend/user/web/                  # Next.js 15 App Router (port 3000)
├── packages/
│   ├── shared-types/                   # 共有型定義
│   ├── zod-schemas/                    # API バリデーションスキーマ
│   └── api-client/                     # Fetch ラッパー (Web/Mobile 共用)
└── scripts/seed-content.ts             # コンテンツインポーター
```

**技術スタック:**
- pnpm 9.15.9 ワークスペース + Turborepo
- TypeScript 5.x（strict モード）
- Node.js 22+

### 2. データベース（100%）

- **PostgreSQL 16** を Docker Compose で起動
- **Prisma ORM** でスキーマ定義・マイグレーション完了
- 8テーブル: User, OAuthAccount, Module, Lesson, Quiz, QuizQuestion, UserProgress, UserQuizAttempt, UserAchievement, UserStreak

```
sys/backend/api/prisma/
├── schema.prisma
└── migrations/20260301062237_initialize_0301/
```

### 3. バックエンド API（100%）

Hono フレームワークでREST API を構築：

| ファイル | 内容 |
|---------|------|
| `src/app.ts` | Hono app 定義（ミドルウェア・ルート登録） |
| `src/index.ts` | エントリーポイント（`serve()` のみ） |
| `src/lib/env.ts` | Zod による環境変数バリデーション |
| `src/lib/prisma.ts` | PrismaClient シングルトン |
| `src/lib/jwt.ts` | jose ベース JWT（access: 15分, refresh: 7日） |
| `src/middleware/auth.ts` | JWT 検証ミドルウェア（Cookie + Bearer） |
| `src/middleware/error-handler.ts` | AppError クラス + エラーハンドラ |
| `src/routes/auth.ts` | OAuth ルート（/me, /refresh, /logout, /:provider） |
| `src/routes/modules.ts` | モジュール一覧・詳細・レッスン取得 |
| `src/routes/quizzes.ts` | クイズ取得・回答送信 |
| `src/routes/progress.ts` | 進捗・ストリーク管理 |
| `src/services/*.ts` | 各ドメインのビジネスロジック |

### 4. OAuth 認証（100%）

Google と GitHub の OAuth ログインを実装・動作確認済み：

- **Google OAuth**: PKCE フロー（arctic ライブラリ v3）
  - `generateState()` + `generateCodeVerifier()` → Cookie に保存
  - コールバックで state 検証 + code 交換 → JWT 発行
- **GitHub OAuth**: state のみ（PKCE なし）
- **ログアウト**: Cookie 削除による実装
- **JWT**: httpOnly Cookie でアクセストークン・リフレッシュトークンを管理
- **トークンリフレッシュ**: POST /api/auth/refresh エンドポイント

### 5. 認証ガード（100%） ★ NEW

**新規作成**: `sys/frontend/user/web/src/middleware.ts`

- Next.js Middleware による認証ガード
- `access_token` Cookie の存在チェック → 未認証時は `/login` へリダイレクト
- 公開パス: `/`, `/login`, `/callback/*`
- 静的アセット（`_next/static`, `_next/image`, favicon 等）は除外

### 6. Markdown レンダラー（100%） ★ NEW

**新規作成**: `sys/frontend/user/web/src/components/content/MarkdownRenderer.tsx`

- `react-markdown` + `rehype-highlight` + `remark-gfm`
- `highlight.js/styles/github-dark.css` でシンタックスハイライト
- カスタムコンポーネント（headings, code blocks, tables, blockquote, links 等）
- `@tailwindcss/typography` 不使用 — ReactMarkdown の `components` prop でスタイリング

### 7. useApi フック + 型修正（100%） ★ NEW

**新規作成**: `sys/frontend/user/web/src/hooks/useApi.ts`

- 汎用 fetch-on-mount パターン（`data`, `error`, `loading` を返却）
- キャンセル処理（アンマウント時のステート更新を防止）

**型修正**:
- `shared-types/module.ts` に `ModuleDetail` 型を追加（Module + lessons + quizzes）
- `api-client/client.ts` の `getModule()` 戻り値を `ApiResponse<ModuleDetail>` に修正

### 8. 学習コンテンツ（100%） ★ NEW

`doc/contents/` に3モジュール・9レッスン・15クイズ問題を作成：

| ディレクトリ | タイトル | レッスン | クイズ |
|-------------|---------|---------|-------|
| `module-01-introduction/` | Claude Code 入門 | 3本 | 5問（easy, 100pt） |
| `module-02-prompt-engineering/` | プロンプトエンジニアリング基礎 | 3本 | 5問（medium, 150pt） |
| `module-03-practical-projects/` | 実践プロジェクト | 3本 | 5問（medium, 200pt） |

各モジュールの構成:
- `README.md` — frontmatter（number, description, estimatedMinutes）+ タイトル
- `lesson-1.md` ~ `lesson-3.md` — 日本語、コード例付き（各60行以上）
- `quiz.json` — multiple_choice（3問）+ true_false（2問）

`pnpm db:seed` で全コンテンツのDBインポートを確認済み。

### 9. Web フロントエンド — 全ページ実装（100%） ★ NEW

Next.js 15 App Router で以下の全ページがAPIデータ連携済み：

| ページ | ファイル | API | 実装内容 |
|--------|---------|-----|---------|
| ダッシュボード | `DashboardContent.tsx` | `getProgress()`, `getStreaks()` | 進捗カード、ストリーク表示、現在のモジュール、モジュール別進捗 |
| モジュール一覧 | `ModulesContent.tsx` | `getModules()` | カードグリッド、進捗バー、推定学習時間 |
| モジュール詳細 | `ModuleDetailContent.tsx` | `getModule(id)` | レッスン一覧（ステータスアイコン）、クイズリンク |
| レッスン | `LessonContent.tsx` | `getLesson()`, `completeLesson()` | MarkdownRenderer、完了ボタン、前後ナビゲーション |
| クイズ | `QuizContent.tsx` | `getQuiz()`, `submitQuiz()` | 問題表示、回答選択、進捗バー、送信 |
| クイズ結果 | `QuizResultsContent.tsx` | sessionStorage | スコア表示、問題別結果、解説、再挑戦リンク |
| プロフィール | `ProfileContent.tsx` | `useAuth()`, `getProgress()`, `getStreaks()` | ユーザー情報、アバター、学習統計、ログアウト |

**共通機能**:
- 全ページにローディングスケルトン（animate-pulse）
- エラー表示 + リカバリーリンク
- パンくずナビゲーション（レッスンページ）

### 10. バックエンド API E2E テスト（100%） ★ NEW

Vitest + Hono `app.request()` による E2E テストを実装。実際の DB に対してフルフローを自動検証：

**リファクタ**: `src/index.ts` から Hono app のセットアップを `src/app.ts` に分離し、テストから直接インポート可能に。

**テスト基盤**:

| ファイル | 役割 |
|---------|------|
| `src/__tests__/helpers.ts` | テストユーザー作成（Prisma）、JWT 発行（jose）、リクエストヘルパー |
| `src/__tests__/e2e.test.ts` | 12 テストケースの E2E スイート |
| `vitest.config.ts` | Vitest 設定（globals, timeout） |

**テストケース（全12件 pass）**:

| # | エンドポイント | 検証内容 |
|---|---------------|---------|
| 1 | `GET /api/health` | 200, `status: "ok"` |
| 2 | `GET /api/auth/me` (トークンなし) | 401 |
| 3 | `GET /api/auth/me` (トークンあり) | 200, ユーザープロフィール |
| 4 | `GET /api/modules` | 200, モジュール一覧（3件以上） |
| 5 | `GET /api/modules/:id` | 200, レッスン + クイズ含む |
| 6 | `GET /api/modules/:moduleId/lessons/:lessonId` | 200, `contentMd` 含む |
| 7 | `POST /api/progress/lessons/:lessonId` | 200, `lessonCompleted: true` |
| 8 | `GET /api/progress` | 200, `completedLessons >= 1` |
| 9 | `GET /api/progress/streaks` | 200, `currentStreak >= 1` |
| 10 | `GET /api/quizzes/:id` | 200, `correctAnswer` が非公開 |
| 11 | `POST /api/quizzes/:id/submit` | 200, スコア・結果 |
| 12 | `POST /api/auth/logout` | 200 |

**実行コマンド**:
```bash
cd sys
pnpm --filter api test
```

### 11. 共有パッケージ（100%）

- **shared-types**: User, Module, ModuleDetail, Lesson, LessonDetail, Quiz, QuizDetail, Progress, StreakInfo 型定義
- **zod-schemas**: quizSubmissionSchema, lessonCompleteParamsSchema
- **api-client**: ApiClient クラス（auth, modules, quizzes, progress メソッド、`credentials: 'include'`）

---

## 発生した問題と解決策

### 問題 1-8: 前回レポート参照

前回（2026-03-01）のレポートに記載済み。Prisma DATABASE_URL、モノレポ自動インストール、API環境変数、Google OAuth API署名、redirect_uri_mismatch、クロスオリジン Cookie、Hono ルート順序、.js拡張子ビルドエラーの8件。

### 問題 9: seed-content.ts — ブロックコメント内の `*/` パターン ★ NEW

**症状:** `pnpm db:seed` 実行時に esbuild トランスパイルエラー `Expected ";" but found "→"`

**原因:** JSDoc コメント内の `module-XX-*/README.md` の `*/` がブロックコメント終了として解釈された。

**解決策:** `/** */` ブロックコメントを `//` 行コメントに変更し、パスの `*` を `<name>` に置換。

### 問題 10: seed-content.ts — `import.meta.dirname` が undefined ★ NEW

**症状:** `TypeError: The "paths[0]" argument must be of type string. Received undefined`

**原因:** tsx が CJS モードでトランスパイルした際に `import.meta.dirname` が利用できなかった。

**解決策:** `fileURLToPath(import.meta.url)` によるフォールバックを追加：
```typescript
import { fileURLToPath } from 'node:url';
const __dirname = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
```

---

## 残作業

### 完了済み ★ NEW
- [x] バックエンド API E2E テスト — 12テストケースが全 pass（認証・モジュール・レッスン・進捗・ストリーク・クイズ・ログアウト）
- [x] `app.ts` 分離リファクタ — テストから Hono app を直接インポート可能に

### 軽微な改善（任意・Phase 2 以降）
- [ ] コンテンツ内容の精査・校正
- [ ] レスポンシブデザインの微調整
- [ ] エラーハンドリングの統一性確認
- [ ] フロントエンド E2E テスト（Playwright 等）

---

## アーキテクチャ全体像

```
┌─────────────────────────────────────────────────┐
│  doc/contents/                                   │
│  module-01-*/  module-02-*/  module-03-*/        │
│  (README.md, lesson-*.md, quiz.json)             │
└──────────────────┬──────────────────────────────┘
                   │ pnpm db:seed
                   ▼
┌──────────────────────────────────────────────────┐
│  PostgreSQL (Docker)                              │
│  modules, lessons, quizzes, quiz_questions,       │
│  users, oauth_accounts, user_progress,            │
│  user_quiz_attempts, user_achievements,           │
│  user_streaks                                     │
└──────────────────┬──────────────────────────────┘
                   │ Prisma ORM
                   ▼
┌──────────────────────────────────────────────────┐
│  Backend API (Hono, port 4000)                    │
│  /api/auth/*  /api/modules/*  /api/quizzes/*      │
│  /api/progress/*                                  │
└──────────────────┬──────────────────────────────┘
                   │ Next.js rewrites (/api/* proxy)
                   ▼
┌──────────────────────────────────────────────────┐
│  Frontend (Next.js 15, port 3000)                 │
│  Middleware (auth guard)                          │
│  Pages: dashboard, modules, lessons, quiz,        │
│         quiz results, profile                     │
│  Components: MarkdownRenderer, Header, Sidebar    │
│  Hooks: useAuth, useApi                           │
│  Store: Redux Toolkit (authSlice)                 │
└──────────────────────────────────────────────────┘
```

---

## ファイル変更サマリー（2026-03-02）

### 新規作成

| ファイル | 概要 |
|---------|------|
| `sys/frontend/user/web/src/middleware.ts` | Next.js 認証ガード |
| `sys/frontend/user/web/src/components/content/MarkdownRenderer.tsx` | Markdownレンダラー |
| `sys/frontend/user/web/src/hooks/useApi.ts` | 汎用API fetchフック |
| `doc/contents/module-01-introduction/README.md` | Module 1 メタデータ |
| `doc/contents/module-01-introduction/lesson-1.md` | Claude Codeとは |
| `doc/contents/module-01-introduction/lesson-2.md` | 環境セットアップ |
| `doc/contents/module-01-introduction/lesson-3.md` | 基本操作ガイド |
| `doc/contents/module-01-introduction/quiz.json` | Module 1 クイズ（5問） |
| `doc/contents/module-02-prompt-engineering/README.md` | Module 2 メタデータ |
| `doc/contents/module-02-prompt-engineering/lesson-1.md` | 効果的なプロンプトの書き方 |
| `doc/contents/module-02-prompt-engineering/lesson-2.md` | コンテキスト管理 |
| `doc/contents/module-02-prompt-engineering/lesson-3.md` | 高度なプロンプトテクニック |
| `doc/contents/module-02-prompt-engineering/quiz.json` | Module 2 クイズ（5問） |
| `doc/contents/module-03-practical-projects/README.md` | Module 3 メタデータ |
| `doc/contents/module-03-practical-projects/lesson-1.md` | Webアプリケーション開発 |
| `doc/contents/module-03-practical-projects/lesson-2.md` | API開発とテスト |
| `doc/contents/module-03-practical-projects/lesson-3.md` | デバッグとリファクタリング |
| `doc/contents/module-03-practical-projects/quiz.json` | Module 3 クイズ（5問） |
| `sys/backend/api/src/app.ts` | Hono app 定義（index.ts から分離） |
| `sys/backend/api/vitest.config.ts` | Vitest 設定 |
| `sys/backend/api/src/__tests__/helpers.ts` | E2E テストユーティリティ |
| `sys/backend/api/src/__tests__/e2e.test.ts` | E2E テストスイート（12ケース） |
| `doc/runbook/e2e-test.md` | E2E テスト実行手順書 |

### 修正

| ファイル | 変更内容 |
|---------|---------|
| `sys/packages/shared-types/src/module.ts` | `ModuleDetail` 型を追加 |
| `sys/packages/shared-types/src/index.ts` | `ModuleDetail` エクスポート追加 |
| `sys/packages/api-client/src/client.ts` | `getModule()` 戻り値を `ApiResponse<ModuleDetail>` に修正 |
| `sys/scripts/seed-content.ts` | JSDocコメント修正、`import.meta.dirname` フォールバック追加 |
| `sys/backend/api/src/index.ts` | app.ts から import して `serve()` のみに変更 |
| `sys/backend/api/package.json` | vitest devDep 追加、test/test:watch スクリプト追加 |
| `sys/frontend/user/web/src/app/(app)/dashboard/DashboardContent.tsx` | API連携実装 |
| `sys/frontend/user/web/src/app/(app)/modules/ModulesContent.tsx` | API連携実装 |
| `sys/frontend/user/web/src/app/(app)/modules/[moduleId]/ModuleDetailContent.tsx` | API連携実装 |
| `sys/frontend/user/web/src/app/(app)/modules/[moduleId]/lessons/[lessonId]/LessonContent.tsx` | API連携実装 |
| `sys/frontend/user/web/src/app/(app)/quiz/[quizId]/QuizContent.tsx` | API連携実装 |
| `sys/frontend/user/web/src/app/(app)/quiz/[quizId]/results/QuizResultsContent.tsx` | API連携実装 |
| `sys/frontend/user/web/src/app/(app)/profile/ProfileContent.tsx` | API連携実装 |

---

## 環境情報

| 項目 | 値 |
|------|-----|
| API サーバー | http://localhost:4000 |
| Web フロントエンド | http://localhost:3000 |
| PostgreSQL | localhost:5432/learn_claude_code |
| Adminer | http://localhost:8080 |
| Next.js rewrites | /api/* → localhost:4000/api/* |

### 起動手順

```bash
cd sys
pnpm install
docker compose up -d          # PostgreSQL + Adminer
pnpm db:migrate               # マイグレーション実行
pnpm db:seed                  # コンテンツインポート
pnpm turbo dev                # API + Web 同時起動
```

---

## 参考資料

- 設計仕様書: `doc/development/01-phase1-mvp.md`
- コンテンツインポート仕様: `doc/spec/content-import.md`
- 開発計画: `doc/development/00-overview.md`
- 参考プロジェクト: `/Volumes/SSD-PSTU3A/work/dev/gengoka`
