# Phase 3: Advanced Features — 開発計画

**期間目安:** 4-6 weeks
**前提:** Phase 2 (Core Features) 完了
**目標:** Mobile課金 + 通知システム + オフライン + 詳細分析

---

## 3.1 RevenueCat 統合 (Mobile サブスクリプション)

### 3.1.1 環境構築

- [ ] RevenueCat プロジェクト作成
- [ ] Apple App Store Connect:
  - In-App Purchase 商品作成（Pro 月額 / 年額）
  - Shared Secret 設定
  - RevenueCat に接続
- [ ] Google Play Console:
  - 定期購入商品作成（Pro 月額 / 年額）
  - RevenueCat に接続
- [ ] RevenueCat Webhook URL 設定 (`POST /api/webhooks/revenuecat`)
- [ ] 環境変数追加: `REVENUECAT_API_KEY_APPLE`, `REVENUECAT_API_KEY_GOOGLE`, `REVENUECAT_WEBHOOK_SECRET`

### 3.1.2 Mobile SDK 統合

- [ ] `react-native-purchases` (RevenueCat SDK) インストール + 設定
- [ ] iOS: StoreKit 2 設定 + Capability 追加
- [ ] Android: Google Play Billing Library 設定
- [ ] SDK 初期化（アプリ起動時に RevenueCat ユーザー ID をバックエンド user_id と紐付け）
- [ ] 購入フロー:
  - `Purchases.getOfferings()` でプラン取得
  - `Purchases.purchasePackage()` でストア購入画面表示
  - 購入完了 → RevenueCat Webhook → バックエンド更新
- [ ] リストア処理 (`Purchases.restorePurchases()`)

### 3.1.3 API — RevenueCat Webhook

- [ ] `POST /api/webhooks/revenuecat` 実装:
  - 認証ヘッダー検証
  - イベント処理:
    - `INITIAL_PURCHASE` → 新規サブスク作成
    - `RENEWAL` → `current_period_end` 延長
    - `BILLING_ISSUE` → `status` を `past_due` に
    - `CANCELLATION` → `status` を `canceled` に
    - `EXPIRATION` → `status` を `expired` に
  - `billing_events` にログ記録

### 3.1.4 クロスプラットフォーム課金状態同期

- [ ] `subscriptions` テーブルの `platform` フィールドで課金元を管理
- [ ] どのプラットフォームで課金しても `GET /api/billing/status` で統一された状態を返却
- [ ] Mobile アプリ起動時に API から課金状態を確認し、ローカルキャッシュと同期

### 3.1.5 Mobile UI — サブスクリプション

- [ ] Paywall 画面:
  - Free / Pro プラン比較
  - 月額 / 年額トグル
  - 「購入」→ App Store / Play Store 購入シート表示
- [ ] Module 4 以降アクセス時の Paywall 表示
- [ ] 設定画面にサブスク管理セクション:
  - 現在のプラン・次回請求日表示
  - 「Apple / Google で管理」→ OS 設定へ遷移

---

## 3.2 Module 9-12 コンテンツ追加

- [ ] Module 9: MCP サーバー（3-4レッスン + クイズ）
- [ ] Module 10: Skills & Plugins（3レッスン + クイズ）
- [ ] Module 11: IDE連携（3レッスン + クイズ）
- [ ] Module 12: 実践プロジェクト（4-5レッスン + クイズ）
- [ ] 各モジュールに Scenario-Based / Ordering 問題を含める

---

## 3.3 プッシュ通知システム (Mobile)

### 3.3.1 Firebase Cloud Messaging セットアップ

- [ ] Firebase プロジェクト作成
- [ ] iOS: APNs 証明書 / Key 設定 + Firebase 接続
- [ ] Android: `google-services.json` 配置
- [ ] `@react-native-firebase/messaging` インストール + 設定
- [ ] 通知権限リクエストフロー

### 3.3.2 プッシュトークン管理

- [ ] `POST /api/push-tokens` — FCM トークン登録
  - ログイン後 + トークン更新時に送信
- [ ] `DELETE /api/push-tokens` — トークン削除（ログアウト時）
- [ ] 複数デバイス対応（同一ユーザーで複数トークン保持）

### 3.3.3 通知送信バックエンド

- [ ] Firebase Admin SDK セットアップ (`firebase-admin`)
- [ ] 通知送信サービス (`services/notification.service.ts`):
  - リマインダー通知（スケジュール実行 — cron / node-cron）
  - ストリーク警告通知（その日未学習 → 夕方に通知）
  - バッジ獲得通知（即時）
  - 新コンテンツ通知（管理者トリガー）
  - クイズリトライ促し（不合格から3日経過）
- [ ] バッチ送信対応（リマインダーは大量送信になるため）

### 3.3.4 In-App 通知システム

- [ ] `notifications` テーブルは Phase 1 で作成済み
- [ ] API エンドポイント:
  - `GET /api/notifications` — 通知一覧（未読優先、ページネーション）
  - `PATCH /api/notifications/:id/read` — 既読にする
  - `POST /api/notifications/read-all` — 全件既読
  - `GET /api/notifications/unread-count` — 未読件数
- [ ] Mobile UI:
  - ヘッダーにベルアイコン + 未読バッジ
  - 通知一覧画面（未読/既読の視覚的区別）
  - タップで対象画面へ遷移

### 3.3.5 通知設定

- [ ] `notification_settings` テーブルは Phase 1 で作成済み
- [ ] API エンドポイント:
  - `GET /api/notification-settings`
  - `PUT /api/notification-settings`
- [ ] Mobile UI — 通知設定画面:
  - 学習リマインダー ON/OFF + 時刻 + 曜日
  - ストリーク警告 ON/OFF + 時刻
  - バッジ獲得通知 ON/OFF
  - 新コンテンツ通知 ON/OFF
  - クイズリトライ促し ON/OFF

---

## 3.4 Mobile 追加機能

### 3.4.1 オフラインモード

- [ ] レッスンデータのローカルキャッシュ機構:
  - `AsyncStorage` or `MMKV` でレッスン content_md を保存
  - モジュール単位でダウンロード
  - キャッシュ有効期限管理
- [ ] オフライン時の動作:
  - キャッシュ済みレッスンは閲覧可能
  - クイズは回答可能（オンライン復帰時に送信）
  - 進捗記録はローカルキュー → オンライン復帰時に同期
- [ ] ダウンロード管理 UI:
  - モジュールごとのダウンロードボタン
  - ダウンロード済み / 未ダウンロード表示
  - ストレージ使用量表示

### 3.4.2 スワイプ式クイズ

- [ ] True/False 問題を左右スワイプで回答
- [ ] `react-native-gesture-handler` + `react-native-reanimated` でスワイプアニメーション
- [ ] 正解/不正解のカードフリップアニメーション

### 3.4.3 触覚フィードバック

- [ ] `react-native-haptic-feedback` インストール
- [ ] 正解時: 成功バイブレーション
- [ ] 不正解時: エラーバイブレーション
- [ ] ボタンタップ時: 軽いフィードバック

### 3.4.4 フラッシュカード復習

- [ ] 各レッスンの要点をフラッシュカード化:
  - フロント: 質問 or キーワード
  - バック: 回答 or 説明
- [ ] スワイプで「覚えた」/「もう一度」を仕分け
- [ ] Spaced Repetition 的な復習スケジュール（簡易版）
- [ ] API: フラッシュカードデータ取得 + 学習状態保存

---

## 3.5 Web 追加機能

### 3.5.1 学習ダッシュボード（詳細分析）

- [ ] 正答率推移グラフ（モジュール別、時系列）
- [ ] 弱点分野の可視化（カテゴリ別正答率）
- [ ] 時間帯別学習量チャート
- [ ] グラフライブラリ: `recharts` or `chart.js`

### 3.5.2 公開プロフィール

- [ ] 公開プロフィール URL (`/profile/:userId`)
- [ ] 表示内容:
  - ユーザー名 + アバター
  - 獲得バッジ一覧
  - 完了モジュール
  - 学習ストリーク
- [ ] OGP メタタグ（SNS シェア時のプレビュー）
- [ ] 公開/非公開トグル（設定画面）

### 3.5.3 Playground — Config Builder ツール群

- [ ] Subagent Designer:
  - YAML frontmatter + Markdown 本文のビジュアルエディタ
  - name, description, tools, model のフォーム入力
  - プレビュー + バリデーション
- [ ] MCP Config Generator:
  - プロバイダー選択（GitHub, Slack, Drive 等）
  - 設定値入力フォーム
  - `settings.json` 形式で出力

---

## 3.6 Skill Radar Chart

- [ ] 6カテゴリの定義:
  1. 基本操作 (Module 1-2)
  2. CLAUDE.md (Module 3)
  3. Git連携 (Module 4-5)
  4. コマンド & 拡張 (Module 6, 10)
  5. エージェント & Hooks (Module 7-8)
  6. MCP & IDE (Module 9, 11)
- [ ] カテゴリ別スコア計算ロジック（クイズ成績 + 進捗から算出）
- [ ] レーダーチャート描画（Web: `recharts`, Mobile: `react-native-svg`）

---

## 3.7 ランキング機能

- [ ] API: ランキング取得エンドポイント
  - 総合スコア順
  - ストリーク順
  - 週間 / 月間 / 全期間
- [ ] Web / Mobile UI:
  - ランキング一覧画面
  - 自分の順位表示
  - トップ10 + 自分の前後5人

---

## 3.8 多言語対応 (i18n)

- [ ] Web: `next-intl` or `next-i18next` 導入
- [ ] Mobile: `react-i18next` + `i18next` 導入
- [ ] 翻訳ファイル構成 (`locales/ja.json`, `locales/en.json`)
- [ ] 言語切替 UI（設定画面）
- [ ] コンテンツの多言語化は Phase 4 以降（UI テキストのみ先行対応）

---

## Phase 3 完了基準

- [ ] iOS / Android でストア課金（RevenueCat）が動作する
- [ ] Web で Stripe 購入 → Mobile で Pro 有効（クロスプラットフォーム同期）
- [ ] 全12モジュールのコンテンツが完成・閲覧可能
- [ ] プッシュ通知（リマインダー、ストリーク警告、バッジ獲得）が動作する
- [ ] In-App 通知が動作し、通知設定が変更可能
- [ ] オフラインモードでキャッシュ済みレッスンが閲覧可能
- [ ] スワイプ式クイズ + 触覚フィードバックが動作する
- [ ] Web の学習ダッシュボード・公開プロフィールが動作する
- [ ] Skill Radar Chart が表示される
- [ ] 日本語/英語の UI 切替が動作する
