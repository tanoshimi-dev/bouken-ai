# 環境セットアップ

## はじめに

このレッスンでは、Claude Codeを使い始めるために必要な環境セットアップの手順を解説します。インストールからAPIキーの設定、ワークスペースの構成まで、ステップバイステップで進めていきます。

## 前提条件

Claude Codeを使用するには、以下の環境が必要です。

- **Node.js**: バージョン18以上
- **OS**: macOS、Linux、またはWindows（WSL2経由）
- **ターミナル**: bash、zshなどのシェル環境

### Node.jsのバージョン確認

```bash
# Node.jsのバージョンを確認
node --version
# v20.10.0 のような出力が表示されます

# npmのバージョンを確認
npm --version
```

Node.jsがインストールされていない場合は、公式サイトまたはnvmを使ってインストールしてください。

```bash
# nvmを使ったNode.jsのインストール（推奨）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

## Claude Codeのインストール

### npmを使ったインストール

```bash
# グローバルにインストール
npm install -g @anthropic-ai/claude-code

# インストールの確認
claude --version
```

### インストール後の初回起動

```bash
# 初回起動時にセットアップウィザードが表示されます
claude
```

初回起動時には、認証の設定が求められます。

## APIキーの設定

Claude Codeを使用するには、Anthropic APIキーが必要です。

### APIキーの取得方法

1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. アカウントを作成またはログイン
3. 「API Keys」セクションに移動
4. 「Create Key」をクリックして新しいキーを生成
5. 生成されたキーを安全な場所に保存

### APIキーの設定

```bash
# 環境変数として設定する方法
export ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxx"

# .bashrcや.zshrcに永続的に設定
echo 'export ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxx"' >> ~/.zshrc
source ~/.zshrc
```

**重要**: APIキーは機密情報です。Gitリポジトリにコミットしないよう注意してください。

```bash
# .gitignoreにAPIキーを含むファイルを追加
echo ".env" >> .gitignore
```

## ワークスペースの設定

### プロジェクトディレクトリでの起動

Claude Codeは起動したディレクトリのコンテキストを理解します。必ずプロジェクトのルートディレクトリで起動してください。

```bash
# プロジェクトディレクトリに移動
cd /path/to/your/project

# Claude Codeを起動
claude
```

### CLAUDE.mdファイルの作成

プロジェクトのルートに`CLAUDE.md`ファイルを作成すると、Claude Codeにプロジェクトの背景情報を提供できます。

```bash
# CLAUDE.mdの作成例
cat << 'EOF' > CLAUDE.md
# プロジェクト概要

このプロジェクトはReact + TypeScriptで構築されたWebアプリケーションです。

## 技術スタック
- フロントエンド: React 18, TypeScript
- バックエンド: Node.js, Express
- データベース: PostgreSQL

## 開発ルール
- コードはTypeScriptで記述する
- テストはJestを使用する
- コミットメッセージはConventional Commitsに従う
EOF
```

## 設定の確認

セットアップが正しく完了したか確認しましょう。

```bash
# Claude Codeの起動確認
claude --version

# 簡単なテスト
claude "Hello! 動作確認です。現在のディレクトリの内容を教えて。"
```

正常に動作すれば、カレントディレクトリのファイル一覧が表示されます。

## トラブルシューティング

### よくある問題と対処法

| 問題 | 対処法 |
|------|--------|
| `command not found: claude` | npmのグローバルパスを確認 |
| 認証エラー | APIキーが正しく設定されているか確認 |
| 権限エラー | sudoを使用するか、npmのprefixを変更 |

```bash
# npmのグローバルパスを確認
npm config get prefix

# パスが通っていない場合
export PATH="$(npm config get prefix)/bin:$PATH"
```

## まとめ

このレッスンでは、Claude Codeのインストールから初期設定までを学びました。環境が整ったら、次のレッスンで基本操作を実際に試してみましょう。
