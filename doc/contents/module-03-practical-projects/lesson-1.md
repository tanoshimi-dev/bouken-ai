# Webアプリケーション開発

## はじめに

このレッスンでは、Claude Codeを活用してReactベースのWebアプリケーションを一から構築する方法を体験します。タスク管理アプリを題材に、プロジェクトの初期化からコンポーネント開発、状態管理まで、実践的な開発フローを学びます。

## プロジェクトの初期化

まず、Claude Codeにプロジェクトの雛形を作成してもらいます。

```bash
# プロジェクトディレクトリの作成と移動
mkdir task-manager && cd task-manager

# Claude Codeを起動
claude

# プロジェクトの初期化を依頼
> Vite + React + TypeScriptでプロジェクトを初期化してください。
> Tailwind CSSも設定してください。
```

Claude Codeは以下のようなコマンドを実行してプロジェクトを作成します。

```bash
# Claude Codeが実行するコマンドの例
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## CLAUDE.mdの作成

プロジェクトの方針をClaude Codeに伝えるため、CLAUDE.mdを作成します。

```bash
> 以下の内容でCLAUDE.mdを作成してください:
>
> プロジェクト名: タスク管理アプリ
> 技術スタック: React 18, TypeScript, Vite, Tailwind CSS, Zustand
> コーディング規約:
> - 関数コンポーネントとhooksのみ使用
> - 型定義は厳密に行う（anyは禁止）
> - コンポーネントファイルにはPropsの型定義を含める
```

## 型定義の作成

アプリケーションの基盤となる型定義を作成します。

```bash
> タスク管理アプリの型定義をsrc/types/task.tsに作成してください。
>
> タスクには以下のプロパティが必要です:
> - id: ユニークID（string）
> - title: タスク名（string）
> - description: 説明（string、オプショナル）
> - status: 状態（'todo' | 'in_progress' | 'done'）
> - priority: 優先度（'low' | 'medium' | 'high'）
> - createdAt: 作成日時（Date）
> - updatedAt: 更新日時（Date）
```

Claude Codeが生成するコードの例:

```typescript
// src/types/task.ts
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
}
```

## 状態管理ストアの作成

```bash
> Zustandを使ってタスクの状態管理ストアを作成してください。
> src/stores/taskStore.tsに配置してください。
>
> 必要なアクション:
> - addTask: タスクの追加
> - updateTask: タスクの更新
> - deleteTask: タスクの削除
> - updateStatus: ステータスの変更
> - getFilteredTasks: ステータスでフィルタリング
```

生成されるコードの例:

```typescript
// src/stores/taskStore.ts
import { create } from 'zustand';
import { Task, CreateTaskInput, TaskStatus } from '../types/task';

interface TaskStore {
  tasks: Task[];
  addTask: (input: CreateTaskInput) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateStatus: (id: string, status: TaskStatus) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (input) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...input,
          id: crypto.randomUUID(),
          status: 'todo',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  updateStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, status, updatedAt: new Date() }
          : task
      ),
    })),
}));
```

## UIコンポーネントの開発

### タスクカードコンポーネント

```bash
> タスクカードコンポーネントをsrc/components/TaskCard.tsxに
> 作成してください。
> Tailwind CSSでスタイリングし、以下の機能を含めてください:
> - タスク名と説明の表示
> - 優先度のバッジ表示（色分け）
> - ステータス変更ボタン
> - 削除ボタン
```

### タスク入力フォーム

```bash
> タスク作成フォームをsrc/components/TaskForm.tsxに作成してください。
> React Hook Formを使用し、以下のフィールドを含めてください:
> - タスク名（必須、最大100文字）
> - 説明（任意、最大500文字）
> - 優先度（セレクトボックス）
> バリデーションエラーは各フィールドの下に赤字で表示してください。
```

### カンバンボード

```bash
> タスクをカンバン形式で表示するボードコンポーネントを
> src/components/TaskBoard.tsxに作成してください。
> 3つのカラム（未着手、進行中、完了）にタスクを振り分けて表示してください。
```

## 動作確認とデバッグ

```bash
# 開発サーバーの起動を依頼
> 開発サーバーを起動して動作確認してください。
> エラーがあれば修正してください。

# ビルドの確認
> プロダクションビルドを実行して、エラーがないか確認してください。
```

## 段階的な機能追加

基本機能が完成したら、Claude Codeに追加機能の実装を依頼します。

```bash
# ローカルストレージへの永続化
> タスクデータをlocalStorageに保存して、
> ページを再読み込みしてもデータが保持されるようにしてください。

# 検索・フィルタ機能
> タスクのタイトルと説明で検索できるフィルタ機能を追加してください。
> 優先度でのフィルタリングも可能にしてください。
```

## まとめ

このレッスンでは、Claude Codeを使ってReactアプリケーションを一から構築する方法を学びました。プロジェクトの初期化、型定義、状態管理、UIコンポーネントの開発まで、自然言語での指示だけで実用的なアプリケーションを作成できることを体験しました。次のレッスンでは、API開発とテストについて学びます。
