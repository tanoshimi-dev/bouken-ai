# API開発とテスト

## はじめに

このレッスンでは、Claude Codeを活用してREST APIを開発し、テストを作成する方法を学びます。Express.jsとTypeScriptを使ったAPI構築、Jestによるテスト作成、そしてAPIのドキュメント生成まで、実践的なバックエンド開発フローを体験します。

## プロジェクトのセットアップ

```bash
# プロジェクトの作成
mkdir api-project && cd api-project
claude

# 初期化の依頼
> Express.js + TypeScriptのAPIプロジェクトを初期化してください。
> 以下のパッケージも含めてください:
> - zod（バリデーション）
> - prisma（ORM）
> - jest + ts-jest（テスト）
> - supertest（APIテスト）
>
> tsconfig.jsonは厳密モードで設定してください。
```

## APIエンドポイントの設計

まず、Claude Codeにエンドポイントの設計を依頼します。

```bash
> タスク管理APIのエンドポイントを設計してください。
> RESTfulな設計原則に従い、以下のリソースを扱います:
>
> ユーザー:
> - GET /api/users - ユーザー一覧
> - POST /api/users - ユーザー作成
> - GET /api/users/:id - ユーザー詳細
>
> タスク:
> - GET /api/tasks - タスク一覧（フィルタ対応）
> - POST /api/tasks - タスク作成
> - GET /api/tasks/:id - タスク詳細
> - PUT /api/tasks/:id - タスク更新
> - DELETE /api/tasks/:id - タスク削除
>
> src/routes/以下にルーターファイルを作成してください。
```

## データベーススキーマの作成

```bash
> Prismaのスキーマファイルを作成してください。
> 以下のモデルを含めてください:
>
> User: id, email, name, createdAt
> Task: id, title, description, status, priority, userId, createdAt, updatedAt
>
> UserとTaskは1対多のリレーションです。
```

Claude Codeが生成するスキーマの例:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  tasks     Task[]
  createdAt DateTime @default(now())
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  status      String   @default("todo")
  priority    String   @default("medium")
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## バリデーションの実装

```bash
> Zodを使ったリクエストバリデーションを実装してください。
> src/validators/以下に配置してください。
>
> タスク作成のバリデーション:
> - title: 必須、1-100文字
> - description: オプショナル、最大500文字
> - status: 'todo' | 'in_progress' | 'done' のいずれか
> - priority: 'low' | 'medium' | 'high' のいずれか
> - userId: 必須、UUID形式
```

生成されるコードの例:

```typescript
// src/validators/taskValidator.ts
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内です'),
  description: z.string().max(500, '説明は500文字以内です').optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  userId: z.string().uuid('有効なユーザーIDを指定してください'),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
```

## エラーハンドリングの実装

```bash
> 共通のエラーハンドリングミドルウェアを作成してください。
> src/middleware/errorHandler.tsに配置してください。
>
> 以下のエラータイプに対応してください:
> - バリデーションエラー（400）
> - 認証エラー（401）
> - リソース未検出（404）
> - サーバー内部エラー（500）
>
> レスポンスは統一されたJSON形式で返してください。
```

## テストの作成

テストの作成はClaude Codeの得意分野です。

### ユニットテスト

```bash
> タスクバリデーションのユニットテストを作成してください。
> src/validators/__tests__/taskValidator.test.tsに配置してください。
>
> 以下のケースをテストしてください:
> - 正常な入力でバリデーションが通ること
> - タイトルが空の場合にエラーになること
> - タイトルが100文字を超える場合にエラーになること
> - 無効なステータス値でエラーになること
> - 無効なUUID形式でエラーになること
```

生成されるテストコードの例:

```typescript
// src/validators/__tests__/taskValidator.test.ts
import { createTaskSchema } from '../taskValidator';

describe('createTaskSchema', () => {
  const validInput = {
    title: 'テストタスク',
    description: 'テストの説明',
    status: 'todo' as const,
    priority: 'medium' as const,
    userId: '550e8400-e29b-41d4-a716-446655440000',
  };

  test('正常な入力でバリデーションが通ること', () => {
    const result = createTaskSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  test('タイトルが空の場合にエラーになること', () => {
    const result = createTaskSchema.safeParse({
      ...validInput,
      title: '',
    });
    expect(result.success).toBe(false);
  });

  test('タイトルが100文字を超える場合にエラーになること', () => {
    const result = createTaskSchema.safeParse({
      ...validInput,
      title: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
  });
});
```

### API統合テスト

```bash
> supertestを使ったAPI統合テストを作成してください。
> src/routes/__tests__/tasks.test.tsに配置してください。
>
> 以下のエンドポイントをテストしてください:
> - POST /api/tasks - タスク作成
> - GET /api/tasks - タスク一覧取得
> - GET /api/tasks/:id - タスク詳細取得
> - PUT /api/tasks/:id - タスク更新
> - DELETE /api/tasks/:id - タスク削除
>
> 各テストはデータベースを初期化してから実行してください。
```

### テストの実行

```bash
# テストの実行を依頼
> すべてのテストを実行して結果を確認してください。
> 失敗しているテストがあれば修正してください。

# カバレッジの確認
> テストカバレッジを確認して、カバレッジが低い箇所を
> 教えてください。追加のテストが必要であれば作成してください。
```

## APIドキュメントの生成

```bash
> このAPIのドキュメントを生成してください。
> 各エンドポイントについて、リクエスト形式、
> レスポンス形式、エラーレスポンスを記載してください。
```

## まとめ

このレッスンでは、Claude Codeを使ってREST APIの設計から実装、テスト作成までの一連の流れを学びました。Claude Codeは特にテストの作成において非常に強力で、バリデーション、エラーケース、統合テストなど、幅広いテストシナリオを効率的に生成できます。次のレッスンでは、デバッグとリファクタリングのテクニックを学びます。
