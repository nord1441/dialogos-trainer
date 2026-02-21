# Dialogos Trainer

## アプリケーション概要

Dialogos Trainerは、AIが生成する多様なペルソナとの会話を通じて、コミュニケーションスキルを磨くためのトレーニングアプリケーションです。

主な機能:
- **ペルソナ自動生成**: 年齢・性別・職業・性格・話し方が異なる多様な一般人ペルソナをシステムが自動生成
- **シャッフル会話**: ペルソナをランダムに選択してセッションを開始し、様々なタイプの人物とのコミュニケーションを練習
- **チャット履歴**: 会話の履歴を保存・閲覧し、過去のやりとりを振り返り可能
- **マルチLLMプロバイダー対応**: Anthropic (Claude)、OpenAI、Google Gemini、Ollama の4つのLLMプロバイダーに対応
- **設定画面**: APIエンドポイント・認証情報・モデル選択をブラウザ上のUIから設定可能
- **接続テスト**: 各プロバイダーへの接続状態をワンクリックで確認

対象ユーザー:
- コミュニケーションスキルを向上させたい方
- 多様な相手との会話パターンを練習したい方
- 接客・営業・カウンセリングなど対人スキルのトレーニングを行いたい方

## 実行方法

### 前提条件
- Node.js >= 20.x
- npm >= 10.x
- いずれかのLLM APIキー（Anthropic / OpenAI / Gemini）、またはOllamaのローカル環境

### ローカル実行

```bash
# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIキーなどを設定

# ビルド（テスト自動実行含む）
npm run build

# アプリケーション起動
npm start
```

開発モード（ホットリロード付き）:
```bash
# バックエンド開発サーバー
npm run dev

# フロントエンド開発サーバー（別ターミナル）
npm run dev:client
```

### Docker 実行

```bash
# 環境変数ファイルの準備
cp .env.example .env
# .envファイルを編集

# Docker Compose で起動
docker compose up -d

# ログ確認
docker compose logs -f app
```

ブラウザで `http://localhost:3000` を開いてアプリケーションにアクセスします。

## 環境変数

| 変数名 | 必須 | デフォルト値 | 説明 | 値の例 |
|--------|------|-------------|------|--------|
| `HOST` | No | `0.0.0.0` | アプリケーションの待受ホスト | `127.0.0.1` |
| `PORT` | No | `3000` | アプリケーションの待受ポート | `8080` |
| `DB_PATH` | No | `./data/dialogos.db` | SQLiteデータベースファイルのパス | `/app/data/dialogos.db` |
| `ANTHROPIC_API_KEY` | No | - | Anthropic APIキー | `sk-ant-api03-xxxx` |
| `ANTHROPIC_BASE_URL` | No | `https://api.anthropic.com` | Anthropic APIエンドポイント | `https://api.anthropic.com` |
| `OPENAI_API_KEY` | No | - | OpenAI APIキー | `sk-xxxx` |
| `OPENAI_BASE_URL` | No | `https://api.openai.com/v1` | OpenAI APIエンドポイント | `https://api.openai.com/v1` |
| `GEMINI_API_KEY` | No | - | Google Gemini APIキー | `AIzaSyxxxx` |
| `GEMINI_BASE_URL` | No | `https://generativelanguage.googleapis.com` | Gemini APIエンドポイント | `https://generativelanguage.googleapis.com` |
| `OLLAMA_BASE_URL` | No | `http://localhost:11434` | OllamaサーバーのURL | `http://localhost:11434` |

環境変数は `.env` ファイル、またはアプリケーション内の設定画面からも変更できます。設定画面で変更した値はデータベースに保存され、環境変数の値より優先されます。

## データの永続化

### データベース
- 種類: SQLite
- 保存場所: `DB_PATH` 環境変数で指定されたパス（デフォルト: `./data/dialogos.db`）
- 主要テーブル:
  - `personas` - 自動生成されたペルソナ情報
  - `sessions` - チャットセッション
  - `messages` - 会話メッセージ履歴
  - `settings` - アプリケーション設定

### Docker環境でのデータ永続化
- `docker-compose.yaml` で `app-data` ボリュームが定義されており、データベースファイルが永続化されます
- Kubernetes環境では `PersistentVolumeClaim` によりデータが永続化されます

## Kubernetes デプロイ

```bash
# マニフェストを使用
kubectl apply -f k8s/

# Helmを使用
helm install dialogos-trainer helm/dialogos-trainer/

# 環境別のvaluesを使用
helm install dialogos-trainer helm/dialogos-trainer/ -f helm/dialogos-trainer/values-prod.yaml
```
