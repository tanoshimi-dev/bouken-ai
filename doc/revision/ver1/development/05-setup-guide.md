# 技術セットアップガイド

Phase 1 開始時に実施する初期セットアップの詳細手順。

---

## 1. 前提環境

| Tool | Version | 用途 |
|------|---------|------|
| Node.js | 22 LTS | ランタイム |
| pnpm | 9.x | パッケージマネージャー |
| Docker / Docker Compose | latest | PostgreSQL ローカル環境 |
| PostgreSQL | 16 | データベース |
| Xcode | 16+ | iOS ビルド（Phase 2） |
| Android Studio | latest | Android ビルド（Phase 2） |
| Ruby | 3.x | CocoaPods（Phase 2） |

---

## 2. モノレポ初期化手順

### 2.1 ルートプロジェクト作成

```bash
mkdir learn-claude-code && cd learn-claude-code
pnpm init

# pnpm workspace 設定
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
```

### 2.2 Turborepo 設定

```bash
pnpm add -Dw turbo
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 2.3 TypeScript 共通設定

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 2.4 ESLint + Prettier

```bash
pnpm add -Dw eslint prettier eslint-config-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

---

## 3. バックエンド (Hono API) セットアップ

```bash
mkdir -p apps/api && cd apps/api
pnpm init
pnpm add hono @hono/node-server
pnpm add prisma @prisma/client arctic jose zod
pnpm add -D typescript tsx @types/node
```

### エントリポイント

```typescript
// apps/api/src/index.ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './routes/auth'
import { moduleRoutes } from './routes/modules'
import { quizRoutes } from './routes/quizzes'
import { progressRoutes } from './routes/progress'
import { errorHandler } from './middleware/error-handler'

const app = new Hono().basePath('/api')

// Middleware
app.use('*', cors({
  origin: [
    'http://localhost:3000',   // Next.js dev
  ],
  credentials: true,
}))
app.onError(errorHandler)

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// Routes
app.route('/auth', authRoutes)
app.route('/modules', moduleRoutes)
app.route('/quizzes', quizRoutes)
app.route('/progress', progressRoutes)

serve({ fetch: app.fetch, port: 4000 }, (info) => {
  console.log(`API server running on http://localhost:${info.port}`)
})

export default app
```

### 開発サーバー

```json
// apps/api/package.json (scripts)
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsx src/index.ts",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx ../../scripts/seed-content.ts"
  }
}
```

---

## 4. データベース (PostgreSQL + Prisma)

### Docker Compose

```yaml
# docker-compose.yml (ルート)
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: learn_claude_code
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Prisma スキーマ (Phase 1 部分)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String?
  avatarUrl String?  @map("avatar_url")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  oauthAccounts    OAuthAccount[]
  progress         UserProgress[]
  quizAttempts     UserQuizAttempt[]
  achievements     UserAchievement[]
  streak           UserStreak?

  @@map("users")
}

model OAuthAccount {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  provider     String   // google|microsoft|apple|github|line
  providerId   String   @map("provider_id")
  accessToken  String?  @map("access_token")
  refreshToken String?  @map("refresh_token")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@map("oauth_accounts")
}

model Module {
  id               String   @id @default(cuid())
  number           Int      @unique
  title            String
  description      String
  estimatedMinutes Int      @map("estimated_minutes")
  isPublished      Boolean  @default(false) @map("is_published")

  lessons  Lesson[]
  quizzes  Quiz[]
  progress UserProgress[]

  @@map("modules")
}

model Lesson {
  id         String   @id @default(cuid())
  moduleId   String   @map("module_id")
  order      Int
  title      String
  contentMd  String   @map("content_md")
  lessonType String   @default("tutorial") @map("lesson_type") // tutorial|exercise|sandbox
  isPublished Boolean @default(false) @map("is_published")

  module   Module         @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  progress UserProgress[]

  @@unique([moduleId, order])
  @@map("lessons")
}

model Quiz {
  id         String @id @default(cuid())
  moduleId   String @map("module_id")
  title      String
  difficulty String @default("medium") // easy|medium|hard
  points     Int

  module    Module           @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  questions QuizQuestion[]
  attempts  UserQuizAttempt[]

  @@map("quizzes")
}

model QuizQuestion {
  id            String  @id @default(cuid())
  quizId        String  @map("quiz_id")
  questionType  String  @map("question_type") // multiple_choice|code_completion|true_false|ordering
  questionText  String  @map("question_text")
  codeSnippet   String? @map("code_snippet")
  options       Json
  correctAnswer Json    @map("correct_answer")
  explanation   String
  order         Int

  quiz Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@unique([quizId, order])
  @@map("quiz_questions")
}

model UserProgress {
  id          String    @id @default(cuid())
  userId      String    @map("user_id")
  moduleId    String    @map("module_id")
  lessonId    String?   @map("lesson_id")
  status      String    @default("not_started") // not_started|in_progress|completed
  completedAt DateTime? @map("completed_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  module Module  @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  lesson Lesson? @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, moduleId, lessonId])
  @@map("user_progress")
}

model UserQuizAttempt {
  id               String   @id @default(cuid())
  userId           String   @map("user_id")
  quizId           String   @map("quiz_id")
  score            Int
  maxScore         Int      @map("max_score")
  answers          Json
  completedAt      DateTime @default(now()) @map("completed_at")
  timeSpentSeconds Int      @map("time_spent_seconds")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@map("user_quiz_attempts")
}

model UserAchievement {
  id       String   @id @default(cuid())
  userId   String   @map("user_id")
  badgeSlug String  @map("badge_slug")
  earnedAt DateTime @default(now()) @map("earned_at")
  metadata Json?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeSlug])
  @@map("user_achievements")
}

model UserStreak {
  id               String   @id @default(cuid())
  userId           String   @unique @map("user_id")
  currentStreak    Int      @default(0) @map("current_streak")
  longestStreak    Int      @default(0) @map("longest_streak")
  lastActivityDate DateTime? @map("last_activity_date") @db.Date
  updatedAt        DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_streaks")
}
```

---

## 5. Web フロントエンド (Next.js 15)

```bash
cd apps
pnpx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir
cd web
pnpm add @reduxjs/toolkit react-redux react-markdown remark-gfm rehype-highlight
```

---

## 6. 環境変数

```bash
# .env.example
# Database
DATABASE_URL="postgresql://dev:dev_password@localhost:5432/learn_claude_code"

# JWT
JWT_SECRET="your-jwt-secret-at-least-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-at-least-32-chars"

# OAuth - Google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"

# OAuth - GitHub
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GITHUB_REDIRECT_URI="http://localhost:4000/api/auth/github/callback"

# OAuth - Microsoft (Phase 2)
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""
MICROSOFT_REDIRECT_URI="http://localhost:4000/api/auth/microsoft/callback"

# OAuth - Apple (Phase 2)
APPLE_CLIENT_ID=""
APPLE_TEAM_ID=""
APPLE_KEY_ID=""
APPLE_PRIVATE_KEY=""
APPLE_REDIRECT_URI="http://localhost:4000/api/auth/apple/callback"

# OAuth - LINE (Phase 2)
LINE_CLIENT_ID=""
LINE_CLIENT_SECRET=""
LINE_REDIRECT_URI="http://localhost:4000/api/auth/line/callback"

# Stripe (Phase 2)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_MONTHLY_ID=""
STRIPE_PRICE_YEARLY_ID=""

# RevenueCat (Phase 3)
REVENUECAT_API_KEY_APPLE=""
REVENUECAT_API_KEY_GOOGLE=""
REVENUECAT_WEBHOOK_SECRET=""

# Firebase (Phase 3)
FIREBASE_PROJECT_ID=""
FIREBASE_PRIVATE_KEY=""
FIREBASE_CLIENT_EMAIL=""

# App
APP_URL="http://localhost:3000"
API_URL="http://localhost:4000"
```

---

## 7. 開発ワークフロー

### 日常開発コマンド

```bash
# 全サービス起動
docker compose up -d          # PostgreSQL
pnpm turbo dev                # Web (3000) + API (4000) 同時起動

# DB 操作
cd apps/api
pnpm db:migrate               # マイグレーション作成 + 実行
pnpm db:generate              # Prisma Client 再生成
pnpm db:seed                  # コンテンツインポート

# ビルド・チェック
pnpm turbo build              # 全パッケージビルド
pnpm turbo lint               # 全パッケージ lint
pnpm turbo type-check         # 全パッケージ型チェック
```

### Git ブランチ戦略

```
main              # 本番リリース
├── develop       # 開発統合ブランチ
    ├── feature/* # 機能開発
    ├── fix/*     # バグ修正
    └── content/* # コンテンツ追加
```

### コミットメッセージ規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
style: コードスタイル変更（機能変更なし）
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・ツール変更
content: 教育コンテンツ追加・修正
```
