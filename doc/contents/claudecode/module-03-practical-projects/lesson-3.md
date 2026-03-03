# デバッグとリファクタリング

## はじめに

このレッスンでは、Claude Codeを活用してバグの発見と修正、コード品質の改善、そして自動リファクタリングを行う方法を学びます。実際の開発で遭遇する典型的な問題を題材に、効率的なデバッグとリファクタリングの手法を身につけましょう。

## エラーの分析と修正

### ランタイムエラーの調査

コードの実行中にエラーが発生した場合、Claude Codeにエラーメッセージを伝えて原因を調査してもらいます。

```bash
# エラーメッセージを共有して原因を調査
> 以下のエラーが発生しています。原因を調査して修正してください:
>
> TypeError: Cannot read properties of undefined (reading 'map')
>   at UserList (src/components/UserList.tsx:15:23)
>   at renderWithHooks (node_modules/react-dom/...)
```

Claude Codeは該当ファイルを読み込み、エラーの原因を分析します。

```typescript
// 問題のあるコード
const UserList: React.FC = () => {
  const { data } = useUsers();

  // data が undefined の可能性がある
  return (
    <ul>
      {data.map((user) => (  // ここでエラー発生
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

// Claude Codeによる修正後
const UserList: React.FC = () => {
  const { data, isLoading, error } = useUsers();

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました</p>;
  if (!data) return <p>データがありません</p>;

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

### 型エラーの修正

```bash
# TypeScriptの型エラーを修正
> TypeScriptのビルドで以下の型エラーが発生しています。
> すべて修正してください:
>
> src/api/client.ts:23:5 - error TS2345:
>   Argument of type 'string | undefined' is not assignable
>   to parameter of type 'string'.
```

### ロジックバグの発見

```bash
# テストの失敗からバグを追跡
> 以下のテストが失敗しています。原因を調べて修正してください:
>
> FAIL src/utils/__tests__/dateUtils.test.ts
>   ● formatRelativeDate › 昨日の日付に対して「昨日」と表示する
>     Expected: "昨日"
>     Received: "2日前"
>
> テストの期待値が正しいことを前提に、
> src/utils/dateUtils.tsの実装を修正してください。
```

## パフォーマンスの改善

### レンダリングパフォーマンス

```bash
# React のパフォーマンス問題を分析
> src/components/Dashboard.tsxが非常に遅いです。
> 以下の観点でパフォーマンスを分析してください:
>
> 1. 不要な再レンダリングが発生していないか
> 2. 重い計算がレンダリング中に実行されていないか
> 3. 大量のDOM要素が一度に描画されていないか
>
> 問題を特定したら、修正してください。
```

Claude Codeによる改善の例:

```typescript
// 改善前: 毎レンダリングでフィルタリングを実行
const Dashboard: React.FC = () => {
  const tasks = useTaskStore((state) => state.tasks);

  const completedTasks = tasks.filter(t => t.status === 'done');
  const pendingTasks = tasks.filter(t => t.status !== 'done');

  return (
    <div>
      <TaskList tasks={completedTasks} />
      <TaskList tasks={pendingTasks} />
    </div>
  );
};

// 改善後: useMemoでメモ化
const Dashboard: React.FC = () => {
  const tasks = useTaskStore((state) => state.tasks);

  const { completedTasks, pendingTasks } = useMemo(() => ({
    completedTasks: tasks.filter(t => t.status === 'done'),
    pendingTasks: tasks.filter(t => t.status !== 'done'),
  }), [tasks]);

  return (
    <div>
      <TaskList tasks={completedTasks} />
      <TaskList tasks={pendingTasks} />
    </div>
  );
};
```

### APIパフォーマンス

```bash
# N+1クエリ問題の解決
> src/api/tasks.tsのタスク一覧取得APIが遅いです。
> N+1クエリが発生していないか確認し、
> Prismaのincludeやjoinを使って最適化してください。
```

## コードリファクタリング

### 重複コードの統合

```bash
# 重複の検出と統合
> src/api/以下のファイルを分析して、重複しているコードを
> 特定してください。共通処理をsrc/utils/やsrc/middleware/に
> 抽出してリファクタリングしてください。
>
> 条件: 既存のテストが引き続き通ることを確認してください。
```

### 関数の分割

```bash
# 長い関数を分割
> src/services/orderService.tsのprocessOrder関数が
> 150行以上あり、複雑すぎます。
> 単一責任原則に従って、小さな関数に分割してください。
>
> 分割の方針:
> - バリデーション処理
> - 在庫チェック処理
> - 支払い処理
> - 通知処理
> それぞれ独立した関数にしてください。
```

リファクタリングの例:

```typescript
// リファクタリング前
async function processOrder(order: Order): Promise<OrderResult> {
  // 150行以上の処理...
}

// リファクタリング後
async function processOrder(order: Order): Promise<OrderResult> {
  await validateOrder(order);
  await checkInventory(order.items);
  const payment = await processPayment(order);
  await sendNotification(order, payment);
  return createOrderResult(order, payment);
}

async function validateOrder(order: Order): Promise<void> {
  // バリデーション処理
}

async function checkInventory(items: OrderItem[]): Promise<void> {
  // 在庫チェック処理
}

async function processPayment(order: Order): Promise<Payment> {
  // 支払い処理
}

async function sendNotification(order: Order, payment: Payment): Promise<void> {
  // 通知処理
}
```

### 設計パターンの適用

```bash
# デザインパターンを適用してリファクタリング
> src/services/notificationService.tsの通知処理を
> Strategyパターンを使ってリファクタリングしてください。
>
> 現在、if-elseで分岐している通知手段（メール、SMS、プッシュ通知）を
> 個別のStrategyクラスに分離してください。
> 新しい通知手段を追加しやすい設計にしてください。
```

## 安全なリファクタリングの手順

Claude Codeにリファクタリングを依頼する際の推奨手順です。

```bash
# ステップ1: 現状の分析
> まず、src/services/userService.tsの現在の構造を分析して、
> 問題点を一覧にしてください。

# ステップ2: テストの確認
> 既存のテストを実行して、すべて通ることを確認してください。
> テストが不足している場合は、先にテストを追加してください。

# ステップ3: リファクタリング計画
> 分析結果を基に、リファクタリング計画を提案してください。
> 各変更の影響範囲も教えてください。

# ステップ4: 段階的な実施
> 計画に従って、1つずつ変更を適用してください。
> 各変更後にテストを実行して、問題がないことを確認してください。

# ステップ5: 最終確認
> すべての変更が完了したら、全テストを実行し、
> ビルドも通ることを確認してください。
```

## コードレビューの依頼

```bash
# Pull Requestのレビューを依頼
> 現在のブランチの変更をレビューしてください。
> git diffの内容を分析し、以下の観点でフィードバックをください:
>
> - バグの可能性
> - セキュリティの懸念
> - パフォーマンスへの影響
> - テストの網羅性
> - コーディング規約への準拠
```

## まとめ

このレッスンでは、Claude Codeを使ったデバッグとリファクタリングの実践的な手法を学びました。エラーの分析と修正、パフォーマンスの改善、コードの品質向上まで、Claude Codeは開発のあらゆる段階で強力なサポートを提供します。重要なのは、リファクタリングを安全に行うためにテストを充実させ、段階的に変更を適用していくことです。これで実践プロジェクトモジュールの全レッスンが完了です。
