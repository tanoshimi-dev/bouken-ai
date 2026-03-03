# Phase 4: Growth — 開発計画

**期間目安:** 継続的
**前提:** Phase 3 (Advanced Features) 完了
**目標:** エンゲージメント向上 + 拡張機能 + コミュニティ

---

## 4.1 Mobile — ホーム画面ウィジェット

### 4.1.1 iOS ウィジェット (WidgetKit)

- [ ] Swift で WidgetKit Extension 作成
- [ ] 表示内容:
  - 今日の進捗（完了レッスン数 / 目標）
  - ストリーク日数
  - 次のレッスンタイトル
- [ ] サイズ: Small / Medium 対応
- [ ] React Native から Swift へのデータ共有 (`App Groups` + `UserDefaults`)
- [ ] ウィジェットタップ → アプリの該当画面へ遷移

### 4.1.2 Android ウィジェット

- [ ] Kotlin で AppWidget 作成
- [ ] 表示内容: iOS と同等
- [ ] サイズ: 2x1 / 4x1 対応
- [ ] React Native からのデータ共有 (`SharedPreferences`)
- [ ] ウィジェットタップ → アプリの該当画面へ遷移

---

## 4.2 Mobile — クイックアクション

- [ ] iOS: `UIApplicationShortcutItem` 設定
  - 「前回の続き」→ 最後のレッスン画面
  - 「今日のクイズ」→ 未完了クイズへ
- [ ] Android: App Shortcuts 設定
  - 同等の2アクション
- [ ] `react-native-quick-actions` 統合
- [ ] ディープリンク処理

---

## 4.3 Mobile — SNS シェア機能

- [ ] バッジ獲得・モジュール完了時のシェアカード画像生成:
  - `react-native-view-shot` でコンポーネントを画像化
  - or サーバーサイドで OGP 画像生成
- [ ] シェア対象:
  - バッジ獲得（バッジ画像 + アプリ名 + ユーザー名）
  - モジュール完了（完了証デザイン）
  - ストリーク達成（日数 + カレンダー表示）
- [ ] `react-native-share` で SNS 共有シート表示
- [ ] シェア先: Twitter/X, LINE, Instagram Stories

---

## 4.4 Web — PDF エクスポート

- [ ] レッスンの PDF 出力:
  - `@react-pdf/renderer` or サーバーサイド `puppeteer`
  - Markdown → スタイル付き PDF
  - コードブロックのシンタックスハイライト保持
- [ ] チートシート PDF:
  - モジュールごとの要点まとめを A4 1枚に整形
  - Claude Code コマンド一覧表
- [ ] ダウンロードボタン（レッスン画面 + Playground）

---

## 4.5 Web — diff ビューア

- [ ] Git連携レッスン（Module 4）用:
  - 変更前 / 後のコードを side-by-side 表示
  - `react-diff-viewer-continued` or Monaco diff editor
- [ ] 行ごとの追加 / 削除 / 変更のハイライト
- [ ] ステージング / コミットの概念をビジュアルに説明

---

## 4.6 コミュニティ機能（ディスカッション）

### 4.6.1 DB スキーマ

- [ ] `discussions` テーブル:
  - `id`, `user_id`, `module_id` (nullable), `title`, `body`, `created_at`, `updated_at`
- [ ] `discussion_replies` テーブル:
  - `id`, `discussion_id`, `user_id`, `body`, `created_at`, `updated_at`
- [ ] `discussion_likes` テーブル:
  - `discussion_id`, `user_id`, `created_at`

### 4.6.2 API

- [ ] `GET /api/discussions` — ディスカッション一覧（ページネーション、モジュールフィルタ）
- [ ] `POST /api/discussions` — 新規投稿
- [ ] `GET /api/discussions/:id` — 詳細 + リプライ
- [ ] `POST /api/discussions/:id/replies` — リプライ投稿
- [ ] `POST /api/discussions/:id/like` — いいね

### 4.6.3 UI

- [ ] ディスカッション一覧画面
- [ ] ディスカッション詳細 + リプライスレッド
- [ ] 新規投稿フォーム（Markdown 対応）
- [ ] モジュールページからのリンク（「質問する」ボタン）
- [ ] モデレーション機能（通報、管理者削除）

---

## 4.7 ユーザー投稿クイズ

- [ ] クイズ作成フォーム（問題文、選択肢、正答、解説）
- [ ] レビュー / 承認フロー（管理者確認後に公開）
- [ ] ユーザー投稿クイズセクション（コミュニティクイズ）
- [ ] 投稿者へのクレジット表示

---

## 4.8 Claude Code 新機能の追加教材

- [ ] Claude Code のリリースノート追跡プロセス確立
- [ ] 新機能発表時のコンテンツ追加フロー:
  1. 新機能の調査・検証
  2. レッスン Markdown 作成
  3. クイズ JSON 作成
  4. コンテンツインポーター実行
  5. レビュー → 公開
- [ ] 「新着」バッジ表示（追加後2週間）

---

## 4.9 管理者ダッシュボード（内部ツール）

- [ ] ユーザー管理（一覧、検索、サブスク状態確認）
- [ ] コンテンツ管理（モジュール / レッスン / クイズの公開状態切替）
- [ ] アナリティクス:
  - DAU / WAU / MAU
  - モジュール別完了率
  - クイズ正答率分布
  - サブスク転換率
  - チャーン率
- [ ] 通知一括送信（新コンテンツ告知等）

---

## Phase 4 完了基準（段階的）

各機能は独立してリリース可能。優先度に応じて順次実装:

**高優先度:**
- [ ] SNS シェア機能が動作する
- [ ] PDF エクスポートが動作する
- [ ] diff ビューアが動作する

**中優先度:**
- [ ] ホーム画面ウィジェット（iOS / Android）が動作する
- [ ] クイックアクションが動作する
- [ ] 管理者ダッシュボードが動作する

**低優先度（エンゲージメント効果を見て判断）:**
- [ ] コミュニティ機能が動作する
- [ ] ユーザー投稿クイズが動作する
