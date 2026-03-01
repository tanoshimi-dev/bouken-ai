# Phase 2: Core Features — 開発計画

**期間目安:** 4-6 weeks
**前提:** Phase 1 (MVP) 完了
**目標:** 全認証プロバイダー + Web課金 + Playground + Mobile基本版

---

## 2.1 OAuth 全プロバイダー対応 + アカウントリンク

### 2.1.1 追加プロバイダー

- [ ] Microsoft OAuth 2.0 (`arctic` で設定)
  - Azure AD アプリ登録
  - `GET /api/auth/microsoft` + `/callback`
- [ ] Apple Sign In (`arctic` で設定)
  - Apple Developer 設定（Service ID, Key）
  - `GET /api/auth/apple` + `/callback`
  - email 非公開ケースの処理
- [ ] LINE Login (`arctic` で設定)
  - LINE Developers チャネル作成
  - `GET /api/auth/line` + `/callback`
  - email 非公開ケースの処理

### 2.1.2 アカウントリンク機能

- [ ] `POST /api/auth/link/:provider` — 既存アカウントに別プロバイダーを連携
  - 認証済みユーザーが別プロバイダーの OAuth フローを実行
  - `oauth_accounts` にレコード追加
  - 同一 email のアカウントが既に存在する場合の競合処理
- [ ] `DELETE /api/auth/link/:provider` — プロバイダー連携解除
  - 最低1つのプロバイダーは必須（最後の1つは解除不可）
- [ ] Web UI: 設定画面にプロバイダー連携管理セクション追加

---

## 2.2 Stripe Billing (Web サブスクリプション)

### 2.2.1 Stripe 環境構築

- [ ] Stripe アカウント設定
- [ ] 商品 + 料金プラン作成:
  - Pro 月額: ¥500/月
  - Pro 年額: ¥4,800/年（20%割引）
- [ ] Webhook エンドポイント設定（Stripe Dashboard）
- [ ] 環境変数追加: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY_ID`, `STRIPE_PRICE_YEARLY_ID`

### 2.2.2 DB スキーマ追加

- [ ] `subscriptions` テーブルマイグレーション
- [ ] `billing_events` テーブルマイグレーション

### 2.2.3 API 実装

- [ ] `GET /api/billing/status` — 現在のサブスク状態返却
  - `{ plan, status, billingPeriod, currentPeriodEnd }`
- [ ] `POST /api/billing/checkout` — Stripe Checkout Session 作成
  - リクエスト: `{ priceId: 'monthly' | 'yearly' }`
  - レスポンス: `{ checkoutUrl }`
  - `success_url` / `cancel_url` 設定
- [ ] `POST /api/billing/portal` — Stripe Customer Portal URL 取得
  - プラン変更・解約・請求書確認用
- [ ] `POST /api/webhooks/stripe` — Webhook 受信
  - 署名検証 (`stripe.webhooks.constructEvent`)
  - イベント処理:
    - `checkout.session.completed` → 新規サブスク作成
    - `invoice.paid` → `current_period_end` 延長
    - `invoice.payment_failed` → `status` を `past_due` に
    - `customer.subscription.deleted` → `status` を `canceled` に
  - `billing_events` にログ記録

### 2.2.4 コンテンツアクセス制御

- [ ] 認証ミドルウェアに `plan` 情報追加
- [ ] コンテンツアクセス制御ミドルウェア作成:
  - Free ユーザー: Module 1-3 のみアクセス可
  - Pro ユーザー: 全 Module アクセス可
  - Module 4 以降のレッスン/クイズ取得時に `plan` チェック → Free なら 403
- [ ] API レスポンスに `requiredPlan` フィールド追加（Module 一覧用）

### 2.2.5 Web UI — サブスクリプション

- [ ] サブスクリプション画面 (`/subscription`):
  - Free / Pro プラン比較表
  - 月額 / 年額トグル
  - 「アップグレード」ボタン → Stripe Checkout へ
- [ ] Paywall UI:
  - Module 4 以降にアクセス時、ロック表示 + アップグレード誘導
  - モジュール一覧で Free / Pro バッジ表示
- [ ] 購入完了画面（Stripe Checkout から戻った後）
- [ ] 設定画面にサブスク管理セクション:
  - 現在のプラン表示
  - 次回請求日
  - 「プラン管理」→ Stripe Customer Portal へ

---

## 2.3 Module 4-8 コンテンツ追加

- [ ] Module 4: Git連携（3-4レッスン + クイズ）
- [ ] Module 5: チェックポイント & リワインド（3レッスン + クイズ）
- [ ] Module 6: スラッシュコマンド（3レッスン + クイズ）
- [ ] Module 7: サブエージェント（3-4レッスン + クイズ）
- [ ] Module 8: Hooks（3-4レッスン + クイズ）
- [ ] 全クイズタイプ対応:
  - Code Completion（穴埋め）問題の追加
  - Ordering（並び替え）問題の追加
  - Scenario-Based 問題の追加

### 2.3.1 追加クイズタイプ実装

- [ ] Code Completion UI:
  - コードブロック表示 + 入力フィールド
  - 部分一致 or 正規表現マッチでの正答判定
- [ ] Ordering UI:
  - ドラッグ&ドロップで並び替え（Web: `@dnd-kit/sortable`）
  - 正しい順序との比較
- [ ] Scenario-Based UI:
  - シナリオ説明 + 複数選択肢
  - 詳細な解説表示

---

## 2.4 Code Playground

### 2.4.1 ターミナルシミュレータ (Web)

- [ ] Monaco Editor 統合 (`@monaco-editor/react`)
- [ ] Claude Code CLI シミュレータ:
  - プロンプト表示 (`$`)
  - 基本コマンドの認識と模擬レスポンス
  - Tab 補完シミュレーション
  - コマンド履歴（上下キー）
- [ ] 分割ビュー（左: レッスン解説、右: エディタ/ターミナル）

### 2.4.2 CLAUDE.md エディタ

- [ ] テンプレート選択（基本 / プロジェクト用 / チーム用）
- [ ] Monaco Editor でリアルタイム編集
- [ ] バリデーション:
  - Markdown 構文チェック
  - 推奨セクション（Memory, Preferences, Project Rules）の存在確認
- [ ] プレビュー表示

### 2.4.3 Config Builder

- [ ] Hook Builder:
  - GUI フォーム → YAML 出力
  - イベント選択（PreToolUse, PostToolUse 等）
  - コマンド入力
  - バリデーション
- [ ] 「コピー」ボタンで設定をクリップボードにコピー
- [ ] ユーザースニペット保存 API:
  - `POST /api/playground/snippets`
  - `GET /api/playground/templates`

---

## 2.5 Achievement System

### 2.5.1 DB + API

- [ ] `user_achievements` テーブルは Phase 1 で作成済み
- [ ] `user_streaks` テーブルマイグレーション
- [ ] バッジ判定ロジック (サービス層):
  - レッスン完了時にバッジ条件チェック
  - クイズ完了時にスコア系バッジチェック
  - ログイン時にストリーク更新
- [ ] `GET /api/achievements` — 獲得済みバッジ一覧
- [ ] `GET /api/achievements/available` — 未獲得バッジ + 進捗
- [ ] `GET /api/progress/streaks` — ストリーク情報

### 2.5.2 Web UI

- [ ] プロフィール画面に Achievement Gallery 追加
- [ ] バッジ獲得時のアニメーション / モーダル
- [ ] ストリークカウンター（ダッシュボード + プロフィール）

---

## 2.6 React Native CLI モバイル版（基本機能）

### 2.6.1 プロジェクトセットアップ

- [ ] `apps/mobile` に React Native CLI プロジェクト作成
- [ ] TypeScript 設定
- [ ] パッケージ参照設定 (`shared-types`, `zod-schemas`, `api-client`)
- [ ] ナビゲーション設定 (`@react-navigation/native` + Stack + Bottom Tabs)
- [ ] Redux Toolkit ストア設定

### 2.6.2 認証

- [ ] OAuth ログイン画面（Google / GitHub / Microsoft / Apple / LINE）
- [ ] `react-native-keychain` で JWT 保存
- [ ] `react-native-inappbrowser-reborn` で OAuth WebView フロー
- [ ] 自動トークンリフレッシュ

### 2.6.3 基本画面

- [ ] ホーム（ダッシュボード）画面:
  - 進捗概要（コンパクト円グラフ）
  - 現在のモジュールカード
  - ストリークカウンター
- [ ] モジュール一覧画面（カードリスト）
- [ ] モジュール詳細画面（レッスン一覧）
- [ ] レッスン表示画面:
  - `react-native-markdown-display` でレンダリング
  - `react-native-syntax-highlighter` でコードハイライト
- [ ] クイズ画面（Multiple Choice / True/False）
- [ ] クイズ結果画面
- [ ] プロフィール画面
- [ ] 設定画面

---

## 2.7 Web 追加機能

- [ ] キーボードショートカット (`J/K` でレッスン移動、`1-4` でクイズ回答、`Ctrl+Enter` で送信)
- [ ] レッスン画面に目次サイドバー + 2カラムレイアウト
- [ ] コードブロックにコピーボタン追加

---

## Phase 2 完了基準

- [ ] 5つの OAuth プロバイダー全てでログイン可能
- [ ] アカウントリンク（複数プロバイダー連携）が動作する
- [ ] Stripe で Pro プランを購入でき、Module 4以降にアクセスできる
- [ ] Free ユーザーは Module 4 以降で Paywall が表示される
- [ ] Module 4-8 のコンテンツが閲覧・学習できる
- [ ] 全5種類のクイズタイプが動作する
- [ ] Code Playground（ターミナル + CLAUDE.md エディタ + Config Builder）が動作する
- [ ] バッジ・ストリーク・Achievement が動作する
- [ ] React Native モバイル版で基本的な学習フローが動作する
