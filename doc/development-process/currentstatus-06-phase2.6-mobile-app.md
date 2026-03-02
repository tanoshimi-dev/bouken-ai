# Phase 2.6: React Native CLI モバイルアプリ — 進捗レポート

**日付**: 2026-03-02
**ステータス**: 完了（100%）
**コミット**: 未コミット

---

## 概要

Phase 2.6 では、Learn Claude Code モノレポに React Native CLI モバイルアプリを追加した。既存の `shared-types`、`api-client`、`zod-schemas` パッケージを再利用し、Hono バックエンド API を消費する。OAuth ログイン（InAppBrowser + ディープリンク）、ダッシュボード、モジュール閲覧、レッスン表示、クイズ（MC/TF）、プロフィール/設定の全9画面を実装した。

---

## 完了した作業

### 1. バックエンド変更（3ファイル修正）

**1A. OAuth コールバックのモバイルディープリンク対応** (`sys/backend/api/src/routes/auth.ts`):
- `GET /:provider`: `?platform=mobile` クエリパラメータを検出し、`oauth_platform` Cookie に保存
- `GET /:provider/callback`: `oauth_platform=mobile` の場合、Cookie ではなく `learnclaudecode://auth/callback?access_token=...&refresh_token=...` にリダイレクト
- `POST /apple/callback`: 同上のモバイルディープリンクリダイレクト対応

**1B. リフレッシュエンドポイント拡張** (`sys/backend/api/src/routes/auth.ts`):
- `POST /refresh`: リクエストボディの `refresh_token` も受け付け（Cookie に加えて）
- レスポンスに `accessToken` と `refreshToken` を追加（Web 側は無視、後方互換）

**1C. MOBILE_SCHEME 環境変数** (`sys/backend/api/src/lib/env.ts`):
- `MOBILE_SCHEME: z.string().default('learnclaudecode')` を追加

**1D. ApiError エクスポート** (`sys/packages/api-client/src/index.ts`):
- `ApiError` クラスを api-client パッケージのエクスポートに追加（モバイルの 401 自動リトライで使用）

### 2. React Native プロジェクトセットアップ（6ファイル）

| ファイル | 内容 |
|---------|------|
| `package.json` | ワークスペース設定、依存関係（React Navigation, Redux Toolkit, Keychain, InAppBrowser 等） |
| `tsconfig.json` | `jsx: "react-native"`, ワークスペースパッケージの paths 設定 |
| `metro.config.js` | `watchFolders` でモノレポルート監視、`unstable_enableSymlinks` で pnpm 対応 |
| `babel.config.js` | `metro-react-native-babel-preset` + `module-resolver`（`@/` エイリアス） |
| `app.json` | `name: "LearnClaudeCode"` |
| `index.js` | `AppRegistry.registerComponent` エントリポイント |

### 3. テーマ（3ファイル）

| ファイル | 内容 |
|---------|------|
| `theme/colors.ts` | Web アプリの OKLch カラーシステムを HEX に変換。primary, accent, success, error, OAuth プロバイダー色 |
| `theme/spacing.ts` | `spacing`（xs=4 ~ xxl=48）、`borderRadius`（sm=6 ~ full=9999） |
| `theme/typography.ts` | Platform.select でフォントファミリー選択。h1, h2, h3, body, bodySmall, caption, button |

### 4. Redux Store（2ファイル）

| ファイル | 内容 |
|---------|------|
| `store/authSlice.ts` | Web 版と完全同一。`AuthState`（user, isAuthenticated, isLoading）、`setUser`, `clearUser`, `setLoading` |
| `store/index.ts` | `configureStore` + `RootState`, `AppDispatch` 型エクスポート |

### 5. 認証サービス + API クライアント（3ファイル）

| ファイル | 内容 |
|---------|------|
| `services/auth.service.ts` | `react-native-keychain` でトークン保存/読込/削除、InAppBrowser で OAuth フロー、`refreshAccessToken()` |
| `config/api.ts` | `createApiClient` + Proxy ラッパーで 401 自動リトライ（`ApiError` によるステータス判定） |
| `config/env.ts` | `API_URL`（iOS: localhost, Android: 10.0.2.2）、`MOBILE_SCHEME` |

### 6. Hooks（4ファイル）

| ファイル | 内容 |
|---------|------|
| `hooks/useAuth.ts` | マウント時に Keychain からトークン読込 → `getMe()` → Redux 更新。失敗時はリフレッシュ試行 |
| `hooks/useApi.ts` | Web 版と同等 + `refetch()` 関数追加（`refreshKey` state による再取得） |
| `hooks/useAppDispatch.ts` | `useDispatch.withTypes<AppDispatch>()` |
| `hooks/useAppSelector.ts` | `useSelector.withTypes<RootState>()` |

### 7. ナビゲーション（7ファイル）

| ファイル | 内容 |
|---------|------|
| `navigation/types.ts` | 全スタック/タブの型定義（`RootStackParamList`, `MainTabsParamList`, `ModuleStackParamList` 等） |
| `navigation/RootNavigator.tsx` | `isLoading` → LoadingScreen / `!isAuthenticated` → AuthStack / else → MainTabs |
| `navigation/AuthStack.tsx` | LoginScreen のみ |
| `navigation/MainTabs.tsx` | Bottom tabs: Home, Modules, Profile |
| `navigation/HomeStack.tsx` | HomeScreen |
| `navigation/ModuleStack.tsx` | ModuleList → ModuleDetail → Lesson、ModuleDetail → Quiz → QuizResults |
| `navigation/ProfileStack.tsx` | Profile → Settings |

### 8. 共通コンポーネント（6ファイル）

| コンポーネント | 内容 |
|-------------|------|
| `LoadingScreen` | フルスクリーン ActivityIndicator |
| `ErrorView` | エラーメッセージ + リトライボタン |
| `ProgressBar` | View ベース（灰色背景 + カラー塗り潰し） |
| `Card` | `StyleProp<ViewStyle>` 対応の border + shadow ラッパー |
| `MarkdownRenderer` | `react-native-markdown-display` でレッスン Markdown 表示。コードブロック、引用、テーブル対応 |
| `MultipleChoiceCard` | 問題テキスト + 選択肢ボタン（A/B/C/D）+ 正誤表示。MC/TF 兼用 |

### 9. 画面（9ファイル）

| 画面 | Web 対応物 | 主要データ/機能 |
|------|-----------|---------------|
| `LoginScreen` | LoginForm | 5つの OAuth プロバイダーボタン（Google, GitHub, Microsoft, Apple, LINE） |
| `HomeScreen` | DashboardContent | OverallProgress + StreakInfo + モジュール別進捗カード |
| `ModuleListScreen` | ModulesContent | FlatList で ModuleWithProgress カード一覧 |
| `ModuleDetailScreen` | ModuleDetailContent | レッスン一覧（完了状態ドット付き）+ クイズ一覧（難易度バッジ） |
| `LessonScreen` | LessonContent | MarkdownRenderer + 完了ボタン + 前/次ナビゲーション |
| `QuizScreen` | QuizContent | MC/TF 問題のみ表示（仕様どおり）、MultipleChoiceCard 使用 |
| `QuizResultsScreen` | QuizResultsContent | スコア表示（合格/不合格カード）+ 問題別正誤 + 解説 |
| `ProfileScreen` | ProfileContent | アバター、ユーザー情報、進捗統計、バッジ一覧、ログアウト |
| `SettingsScreen` | SettingsContent | 5プロバイダーのリンク/アンリンク管理 |

### 10. エントリポイント + ネイティブ設定（3ファイル）

| ファイル | 内容 |
|---------|------|
| `src/App.tsx` | Provider (Redux) + SafeAreaProvider + NavigationContainer (linking 設定) + ディープリンクハンドラー |
| `ios/LearnClaudeCode/Info.plist` | `CFBundleURLSchemes: learnclaudecode`、`NSAllowsLocalNetworking: true` |
| `android/app/src/main/AndroidManifest.xml` | `intent-filter` で `learnclaudecode://` スキーム対応、`launchMode: singleTask` |

---

## 設計判断

1. **InAppBrowser + ディープリンク方式** — `react-native-inappbrowser-reborn` の `openAuth()` を使用。SFAuthenticationSession (iOS) / Chrome Custom Tabs (Android) を活用し、セキュアな OAuth フローを実現。フォールバックとして外部ブラウザへの `Linking.openURL` も用意
2. **Keychain によるトークン保存** — `react-native-keychain` で `access_token` + `refresh_token` を暗号化保存。インメモリキャッシュで同期アクセスも提供
3. **Proxy ベースの 401 自動リトライ** — `apiClient` を Proxy でラップし、401 レスポンス時に自動で `refreshAccessToken()` → リトライ。全 API メソッドに透過的に適用
4. **MC/TF のみ対応** — 仕様どおり、モバイルでは `multiple_choice` と `true_false` のみ表示。`code_completion`、`ordering`、`scenario` はフィルタリング
5. **リフレッシュエンドポイントの後方互換** — レスポンスに `accessToken`/`refreshToken` を追加しただけで、既存の Cookie ベース認証は変更なし。Web アプリは新フィールドを無視
6. **Platform.select による API URL** — Android エミュレータは `10.0.2.2` でホストの localhost にアクセス。iOS シミュレータは `localhost` を直接使用
7. **Style 配列パターン** — TypeScript のリテラル型制約に対応するため、スタイルの spread ではなく RN の配列構文 `[styles.base, condition && styles.variant]` を採用

---

## ファイル変更サマリー

### 新規作成（37ファイル）

| カテゴリ | ファイル数 | パス |
|---------|----------|------|
| プロジェクト設定 | 6 | `mobile/{package.json, tsconfig.json, metro.config.js, babel.config.js, app.json, index.js}` |
| テーマ | 3 | `mobile/src/theme/{colors, spacing, typography}.ts` |
| Store | 2 | `mobile/src/store/{index, authSlice}.ts` |
| サービス/設定 | 3 | `mobile/src/{services/auth.service, config/api, config/env}.ts` |
| Hooks | 4 | `mobile/src/hooks/{useAuth, useApi, useAppDispatch, useAppSelector}.ts` |
| ナビゲーション | 7 | `mobile/src/navigation/{types, RootNavigator, AuthStack, MainTabs, HomeStack, ModuleStack, ProfileStack}.{ts,tsx}` |
| 共通コンポーネント | 6 | `mobile/src/components/{common/*, content/*, quiz/*}` |
| 画面 | 9 | `mobile/src/screens/{auth, home, modules, quiz, profile}/*` |
| エントリ + ネイティブ | 3 | `mobile/src/App.tsx`, `mobile/ios/*/Info.plist`, `mobile/android/*/AndroidManifest.xml` |

### 修正（3ファイル）

| ファイル | 変更内容 |
|---------|---------|
| `sys/backend/api/src/lib/env.ts` | `MOBILE_SCHEME` 環境変数追加 |
| `sys/backend/api/src/routes/auth.ts` | OAuth コールバックのモバイルディープリンク対応 + リフレッシュエンドポイントのボディ対応 |
| `sys/packages/api-client/src/index.ts` | `ApiError` エクスポート追加 |

---

## 依存関係（主要）

| パッケージ | 用途 |
|-----------|------|
| `react-native` ^0.78.0 | React Native フレームワーク |
| `@react-navigation/native` + `native-stack` + `bottom-tabs` | ナビゲーション |
| `react-native-screens` + `react-native-safe-area-context` | ナビゲーション補助 |
| `@reduxjs/toolkit` + `react-redux` | 状態管理（Web と同一パターン） |
| `react-native-keychain` | セキュアトークン保存 |
| `react-native-inappbrowser-reborn` | OAuth InAppBrowser フロー |
| `react-native-markdown-display` | レッスン Markdown レンダリング |
| `react-native-syntax-highlighter` | コードブロックシンタックスハイライト |
| `@learn-claude-code/api-client` | ワークスペース共有 API クライアント |
| `@learn-claude-code/shared-types` | ワークスペース共有型定義 |

---

## アーキテクチャ図

```
┌─────────────────────────────────────────────────────────┐
│                      App.tsx                            │
│  Provider (Redux) → SafeAreaProvider → NavigationContainer │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │            RootNavigator                          │   │
│  │  isLoading? → LoadingScreen                       │   │
│  │  !auth?    → AuthStack (LoginScreen)              │   │
│  │  auth?     → MainTabs                             │   │
│  │              ├─ HomeTab    → HomeStack             │   │
│  │              ├─ ModulesTab → ModuleStack           │   │
│  │              └─ ProfileTab → ProfileStack          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Redux Store  │  │ Auth Service │  │  API Client   │  │
│  │  (authSlice)  │  │ (Keychain)   │  │ (Proxy+401)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │  Hono Backend   │
                   │  /api/auth/*    │
                   │  /api/modules/* │
                   │  /api/quizzes/* │
                   │  /api/progress/*│
                   └─────────────────┘
```

---

## 認証フロー（モバイル）

```
1. LoginScreen
   └─ authService.loginWithProvider('google')
      └─ InAppBrowser.openAuth(API_URL/api/auth/google?platform=mobile)

2. Backend: GET /api/auth/google?platform=mobile
   ├─ oauth_platform=mobile Cookie 保存
   └─ Google OAuth にリダイレクト

3. Google OAuth 完了
   └─ Backend: GET /api/auth/google/callback
      ├─ oauth_platform=mobile を検出
      └─ リダイレクト: learnclaudecode://auth/callback?access_token=...&refresh_token=...

4. InAppBrowser がディープリンクをキャッチ
   └─ authService がトークンをパース → Keychain に保存

5. apiClient.getMe() → Redux setUser()
   └─ RootNavigator が isAuthenticated を検出 → MainTabs 表示
```

---

## スコープ外（仕様どおり）

- ダークモード切替
- プッシュ通知 / オフラインサポート
- プレイグラウンド / サンドボックス
- ordering / code_completion / scenario クイズタイプ（MC + TF のみ）
- 実績ギャラリー（プロフィールでの基本表示のみ）
- カスタムフォント / アニメーション

---

## ビルド構成に関する注意事項

### React バージョンピニング

`react` は `"19.0.0"` と厳密にピニングする必要がある。`^19.0.0` だと pnpm が `19.2.4` 等にリゾルブし、`react-native@0.78` 内蔵のレンダラーとバージョン不一致で実行時クラッシュする（黒画面 + `Incompatible React versions` エラー）。

### New Architecture 無効化

`android/gradle.properties` で `newArchEnabled=false` に設定。`react-native-safe-area-context` の C++ コンパイルエラー（Yoga API 変更）を回避するため。

### androidx.browser バージョン強制

`android/app/build.gradle` で `resolutionStrategy { force 'androidx.browser:browser:1.8.0' }` を設定。`react-native-inappbrowser-reborn` の推移的依存が `androidx.browser:1.10.0-alpha04`（compileSdk 36 要求）を解決してしまうのを防止。

### pnpm モノレポ devDependencies

React Native CLI は多くのパッケージを暗黙的に要求する。pnpm は strict なので、以下を `devDependencies` に明示的に追加:
- `@react-native-community/cli`, `cli-platform-android`, `cli-platform-ios`
- `@react-native/babel-preset`, `@react-native/codegen`, `@react-native/community-cli-plugin`
- `@react-native/gradle-plugin`, `@react-native/metro-config`, `@react-native/typescript-config`

---

## 検証手順

1. `pnpm install`（モノレポルート）— ワークスペースパッケージ解決成功 ✅
2. `pnpm --filter mobile type-check` — TypeScript コンパイルエラーなし ✅
3. Metro バンドラーが `pnpm --filter mobile dev` でエラーなく起動 ✅
4. Android エミュレータでアプリ起動 ✅（`npx react-native run-android --port 20006`）
5. OAuth ログインフロー（InAppBrowser → ディープリンクコールバック → トークン保存）
6. ダッシュボードに進捗/ストリークデータ表示
7. モジュール一覧 → モジュール詳細 → レッスン → コンテンツ正常表示
8. クイズ MC/TF → 送信 → 結果画面
9. プロフィールにユーザー情報と統計表示
10. 設定でプロバイダーリンク/アンリンク

---

## 参考資料

- 設計仕様書: `doc/development/02-phase2-core.md`（セクション 2.6）
- Phase 2.5 進捗レポート: `doc/development-process/currentstatus-05-phase2.3-content-quiztypes.md`
