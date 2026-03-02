# バックエンド API E2E テスト

バックエンド API の E2E テストを実行する手順。Vitest + Hono `app.request()` を使い、実際の DB に対してフルフローを検証する。

---

## 前提条件

- PostgreSQL が起動していること
- `sys/backend/api/.env` に `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` 等が設定されていること
- seed データがインポート済みであること（`pnpm db:seed`）

---

## テスト実行

```bash
cd sys
pnpm --filter api test
```

単一パッケージディレクトリから実行する場合:

```bash
cd sys/backend/api
pnpm test
```

### ウォッチモード

ファイル変更を監視して自動再実行:

```bash
pnpm --filter api test:watch
```

---

## テストケース一覧

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

---

## アーキテクチャ

```
vitest
  └── e2e.test.ts
        ├── helpers.ts        テストユーザー作成・JWT発行・リクエストヘルパー
        └── app.ts            Hono app（serve() なしでインポート可能）
              ├── routes/*
              ├── middleware/*
              └── lib/prisma   → PostgreSQL（実DB）
```

- **app.ts**: Hono app のセットアップ（ミドルウェア・ルート登録）を `index.ts` から分離。テストから直接インポートして `app.request()` で呼び出す
- **helpers.ts**: Prisma でテストユーザーを直接作成し、`jose` で JWT を発行。`afterAll` でテストデータをクリーンアップ
- **実DB使用**: モックではなく実際の PostgreSQL に接続し、seed 済みコンテンツに対してテスト

---

## ファイル構成

| ファイル | 役割 |
|---------|------|
| `sys/backend/api/vitest.config.ts` | Vitest 設定 |
| `sys/backend/api/src/app.ts` | Hono app（テストからインポート可能） |
| `sys/backend/api/src/__tests__/helpers.ts` | テストユーティリティ |
| `sys/backend/api/src/__tests__/e2e.test.ts` | E2E テストスイート |

---

## トラブルシューティング

### "No seeded modules found"

seed データが未投入。以下を実行:

```bash
cd sys
pnpm --filter api db:seed
```

### Prisma 接続エラー

```bash
# .env の DATABASE_URL を確認
cat sys/backend/api/.env | grep DATABASE_URL

# PostgreSQL が起動しているか確認
docker compose ps
```

### テストユーザーが残る場合

テストが途中で強制終了した場合、`__e2e_test_` プレフィックスのユーザーが DB に残ることがある。Prisma Studio で確認・削除:

```bash
cd sys
pnpm --filter api db:studio
```
