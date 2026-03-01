# Learn Claude Code — 開発計画 総合概要

## プロジェクト概要

**App Name:** Learn Claude Code
**目的:** Claude Code の使い方をインタラクティブに学べる教育アプリ
**プラットフォーム:** Web (Next.js 15) + Mobile (React Native CLI) + API (Hono)

---

## モノレポ構成

```
learn-claude-code/
├── package.json                  # ワークスペースルート (pnpm workspaces)
├── pnpm-workspace.yaml
├── turbo.json                    # Turborepo ビルド設定
├── .env.example
├── .gitignore
├── CLAUDE.md
│
├── packages/
│   ├── shared-types/             # Module, Lesson, Quiz, User 等の型定義
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── user.ts
│   │       ├── module.ts
│   │       ├── quiz.ts
│   │       ├── progress.ts
│   │       ├── billing.ts
│   │       └── notification.ts
│   │
│   ├── api-client/               # Hono API への fetch wrapper (Web/Mobile共通)
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── client.ts         # ベース HTTP クライアント
│   │       ├── auth.ts
│   │       ├── modules.ts
│   │       ├── quizzes.ts
│   │       ├── progress.ts
│   │       ├── billing.ts
│   │       └── notifications.ts
│   │
│   ├── zod-schemas/              # API リクエスト/レスポンスの Zod スキーマ
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── auth.ts
│   │       ├── module.ts
│   │       ├── quiz.ts
│   │       ├── progress.ts
│   │       └── billing.ts
│   │
│   └── content-renderer/         # Markdown → React コンポーネント変換
│       ├── package.json
│       └── src/
│           ├── web.tsx           # react-markdown + rehype-highlight
│           └── mobile.tsx        # react-native-markdown-display
│
├── apps/
│   ├── web/                      # Next.js 15 (App Router)
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── src/
│   │       ├── app/              # App Router pages
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── store/            # Redux Toolkit
│   │       └── lib/
│   │
│   ├── mobile/                   # React Native CLI
│   │   ├── package.json
│   │   ├── app.json
│   │   ├── android/
│   │   ├── ios/
│   │   └── src/
│   │       ├── screens/
│   │       ├── components/
│   │       ├── navigation/
│   │       ├── hooks/
│   │       └── store/            # Redux Toolkit
│   │
│   └── api/                      # Hono + Node.js
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts          # エントリポイント
│           ├── routes/
│           ├── middleware/
│           ├── services/
│           └── lib/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── scripts/
│   └── seed-content.ts           # コンテンツインポーター
│
└── doc/
    └── contents/                 # 教育コンテンツ (Markdown/JSON)
        ├── module-01-introduction/
        ├── module-02-basics/
        └── ...
```

---

## 開発フェーズ一覧

| Phase | 期間目安 | 内容 | 詳細ドキュメント |
|-------|---------|------|-----------------|
| **Phase 1: MVP** | 4-6 weeks | プロジェクト基盤 + Web版基本機能 | [01-phase1-mvp.md](./01-phase1-mvp.md) |
| **Phase 2: Core** | 4-6 weeks | 全認証 + 課金(Web) + Playground + Mobile基本 | [02-phase2-core.md](./02-phase2-core.md) |
| **Phase 3: Advanced** | 4-6 weeks | Mobile課金 + 通知 + オフライン + 分析 | [03-phase3-advanced.md](./03-phase3-advanced.md) |
| **Phase 4: Growth** | 継続 | ウィジェット + シェア + コミュニティ | [04-phase4-growth.md](./04-phase4-growth.md) |

---

## 技術スタック早見表

| Layer | Technology |
|-------|-----------|
| Web Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Mobile | React Native CLI + TypeScript |
| Backend API | Hono + Node.js + TypeScript |
| ORM | Prisma |
| Validation | Zod |
| Database | PostgreSQL |
| Authentication | arctic + jose (JWT) |
| Billing (Web) | Stripe Billing |
| Billing (Mobile) | RevenueCat (Apple IAP + Google Play Billing) |
| Storage | VPS Server (Nginx + ローカルFS) |
| State Management | Redux Toolkit |
| Code Editor | Monaco Editor (web) / react-native-code-editor (mobile) |
| Monorepo | pnpm workspaces + Turborepo |

---

## 関連ドキュメント

- [設計仕様書](../../../bouken.app/claudecode/doc/design.md)
- [Phase 1: MVP 開発計画](./01-phase1-mvp.md)
- [Phase 2: Core Features 開発計画](./02-phase2-core.md)
- [Phase 3: Advanced Features 開発計画](./03-phase3-advanced.md)
- [Phase 4: Growth 開発計画](./04-phase4-growth.md)
- [技術セットアップガイド](./05-setup-guide.md)
