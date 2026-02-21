# CLAUDE.md - プロジェクト開発ガイドライン

このファイルは、本プロジェクトの開発における規約・ガイドラインをまとめたものです。
Claude Code をはじめとする AI アシスタントや開発者が作業を行う際は、必ず本ガイドラインに従ってください。

---

## 1. 単体テスト（Unit Tests）

### 1.1 テストの記述義務

- すべての機能実装に対して、単体テストを必ず記述すること。
- テストはソースコードと同じリポジトリ内で管理し、対応するソースファイルとの関連が明確になるディレクトリ構成にすること。
  - 例: `src/services/user.ts` → `tests/services/user.test.ts`
  - 例: `src/utils/calc.py` → `tests/utils/test_calc.py`

### 1.2 ビルド時の自動実行

- テストはビルドプロセスの一部として自動実行されるように構成すること。
- CI/CD パイプライン（GitHub Actions 等）でもテストを自動実行すること。
- テストが失敗した場合、ビルドは失敗として扱うこと。
- 設定例（言語・フレームワークに応じて適切な方法を選択）:
  - **Node.js (package.json)**:
    ```json
    {
      "scripts": {
        "build": "npm run test && tsc",
        "test": "jest"
      }
    }
    ```
  - **Python (pyproject.toml / Makefile)**:
    ```makefile
    build: test
        python -m build

    test:
        pytest tests/
    ```
  - **Go**:
    ```makefile
    build: test
        go build ./...

    test:
        go test ./...
    ```

### 1.3 テストへのコメント記述

- 各テストユニット（テスト関数・テストケース）には、**何をテストしているかが明確にわかるコメント**を必ず付与すること。
- コメントには以下の情報を含めること:
  - テスト対象の機能・メソッド名
  - テストの目的（正常系/異常系/境界値など）
  - 期待される振る舞いの概要
- 例:
  ```typescript
  // テスト対象: UserService.createUser
  // 目的: 正常系 - 有効なユーザーデータでユーザーが正常に作成されることを検証
  // 期待結果: ユーザーオブジェクトが返却され、DBに保存される
  test('有効なデータでユーザーを作成できる', async () => {
    // ...
  });

  // テスト対象: UserService.createUser
  // 目的: 異常系 - メールアドレスが重複している場合にエラーが発生することを検証
  // 期待結果: DuplicateEmailError がスローされる
  test('重複メールアドレスでエラーが発生する', async () => {
    // ...
  });
  ```
- Python の場合:
  ```python
  # テスト対象: UserService.create_user
  # 目的: 正常系 - 有効なユーザーデータでユーザーが正常に作成されることを検証
  # 期待結果: ユーザーオブジェクトが返却され、DBに保存される
  def test_create_user_with_valid_data(self):
      ...
  ```

---

## 2. ドキュメント（使い方ドキュメント）

### 2.1 README.md の必須記載事項

プロジェクトの `README.md` には、以下の項目を**必ず**含めること。

#### 2.1.1 アプリケーション概要

- アプリケーションがどのようなものであるかを説明する。
- 目的、主な機能、対象ユーザーを明記する。
- 記載例:
  ```markdown
  ## アプリケーション概要
  本アプリケーションは〇〇を目的とした△△システムです。
  主な機能:
  - 機能A: 〇〇の管理
  - 機能B: △△の処理
  - 機能C: □□の出力
  ```

#### 2.1.2 アプリケーションの実行方法

- ローカル環境での起動手順を記載する。
- 前提条件（必要なランタイム、ツールのバージョン等）を明記する。
- Docker を使った起動方法も併記する。
- 記載例:
  ```markdown
  ## 実行方法

  ### 前提条件
  - Node.js >= 20.x
  - npm >= 10.x

  ### ローカル実行
  npm install
  npm run build
  npm start

  ### Docker 実行
  docker compose up -d
  ```

#### 2.1.3 環境変数一覧

- 使用可能な環境変数の一覧を、値の例とともに記載する。
- 必須/任意の区別、デフォルト値、説明を含めること。
- 記載例:
  ```markdown
  ## 環境変数

  | 変数名 | 必須 | デフォルト値 | 説明 | 値の例 |
  |--------|------|-------------|------|--------|
  | `PORT` | No | `3000` | アプリケーションのリッスンポート | `8080` |
  | `DATABASE_URL` | Yes | - | データベース接続文字列 | `postgresql://user:pass@localhost:5432/mydb` |
  | `LOG_LEVEL` | No | `info` | ログレベル | `debug`, `info`, `warn`, `error` |
  | `API_KEY` | Yes | - | 外部APIキー | `sk-xxxxxxxxxxxx` |
  ```

#### 2.1.4 データの永続化

- データがどこに、どのような形式で永続化されるかを明記する。
- データベースの種類、ファイルストレージのパス、キャッシュの保存先等を記載する。
- 記載例:
  ```markdown
  ## データの永続化

  ### データベース
  - 種類: PostgreSQL
  - 保存場所: `DATABASE_URL` で指定されたデータベース
  - 主要テーブル: `users`, `orders`, `products`

  ### ファイルストレージ
  - 保存先: `./data/uploads/`
  - 形式: アップロードされたファイルがそのまま保存される

  ### キャッシュ
  - 種類: Redis
  - 保存場所: `REDIS_URL` で指定されたRedisインスタンス
  - TTL: 3600秒（デフォルト）
  ```

---

## 3. Docker 対応

### 3.1 Dockerfile

- マルチステージビルドを使用し、イメージサイズを最小化すること。
- 本番用のベースイメージには軽量なイメージ（`alpine`, `slim` 等）を使用すること。
- `.dockerignore` を作成し、不要なファイルをイメージに含めないこと。
- セキュリティのため、非 root ユーザーで実行すること。
- 構成例:
  ```dockerfile
  # ビルドステージ
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  # 実行ステージ
  FROM node:20-alpine AS runner
  WORKDIR /app
  RUN addgroup -g 1001 -S appgroup && \
      adduser -S appuser -u 1001 -G appgroup
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/package.json ./
  USER appuser
  EXPOSE 3000
  CMD ["node", "dist/index.js"]
  ```

### 3.2 docker-compose.yaml

- アプリケーションと依存サービス（DB、キャッシュ等）を定義すること。
- 環境変数は `.env` ファイルから読み込む構成にすること。
- ヘルスチェックを設定すること。
- ボリュームを使ってデータを永続化すること。
- 構成例:
  ```yaml
  services:
    app:
      build: .
      ports:
        - "${PORT:-3000}:3000"
      env_file:
        - .env
      depends_on:
        db:
          condition: service_healthy
      healthcheck:
        test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
        interval: 30s
        timeout: 10s
        retries: 3

    db:
      image: postgres:16-alpine
      environment:
        POSTGRES_DB: ${DB_NAME:-myapp}
        POSTGRES_USER: ${DB_USER:-postgres}
        POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
      volumes:
        - db-data:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
        interval: 10s
        timeout: 5s
        retries: 5

  volumes:
    db-data:
  ```

### 3.3 GitHub Actions による Docker ビルド

- Docker イメージのビルドとプッシュを行う GitHub Actions ワークフローを作成すること。
- ワークフローは `.github/workflows/docker-build.yml` に配置すること。
- 以下のトリガーを設定すること:
  - `main` ブランチへのプッシュ時
  - タグのプッシュ時（リリース用）
  - Pull Request 時（ビルド検証のみ）
- 構成例:
  ```yaml
  name: Docker Build and Push

  on:
    push:
      branches: [main]
      tags: ['v*']
    pull_request:
      branches: [main]

  jobs:
    build:
      runs-on: ubuntu-latest
      permissions:
        contents: read
        packages: write
      steps:
        - uses: actions/checkout@v4

        - uses: docker/setup-buildx-action@v3

        - uses: docker/login-action@v3
          if: github.event_name != 'pull_request'
          with:
            registry: ghcr.io
            username: ${{ github.actor }}
            password: ${{ secrets.GITHUB_TOKEN }}

        - uses: docker/metadata-action@v5
          id: meta
          with:
            images: ghcr.io/${{ github.repository }}
            tags: |
              type=ref,event=branch
              type=semver,pattern={{version}}
              type=sha

        - uses: docker/build-push-action@v5
          with:
            context: .
            push: ${{ github.event_name != 'pull_request' }}
            tags: ${{ steps.meta.outputs.tags }}
            labels: ${{ steps.meta.outputs.labels }}
            cache-from: type=gha
            cache-to: type=gha,mode=max
  ```

---

## 4. Kubernetes 対応

### 4.1 Kubernetes マニフェスト（YAML）

- Kubernetes 用のマニフェストファイルを `k8s/` ディレクトリに配置すること。
- 最低限、以下のリソースを定義すること:
  - **Deployment**: アプリケーションのデプロイ定義
  - **Service**: アプリケーションへのネットワークアクセス定義
  - **ConfigMap**: 環境変数などの設定情報
  - **Secret**: 機密情報（DB パスワード、API キー等）
  - **Ingress**（必要に応じて）: 外部からのアクセスルーティング
- リソース制限（resources.requests / resources.limits）を必ず設定すること。
- ヘルスチェック（livenessProbe / readinessProbe）を必ず設定すること。
- ディレクトリ構成例:
  ```
  k8s/
  ├── namespace.yaml
  ├── configmap.yaml
  ├── secret.yaml
  ├── deployment.yaml
  ├── service.yaml
  └── ingress.yaml
  ```
- Deployment 構成例:
  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: myapp
    labels:
      app: myapp
  spec:
    replicas: 2
    selector:
      matchLabels:
        app: myapp
    template:
      metadata:
        labels:
          app: myapp
      spec:
        containers:
          - name: myapp
            image: ghcr.io/org/myapp:latest
            ports:
              - containerPort: 3000
            envFrom:
              - configMapRef:
                  name: myapp-config
              - secretRef:
                  name: myapp-secret
            resources:
              requests:
                memory: "128Mi"
                cpu: "100m"
              limits:
                memory: "256Mi"
                cpu: "500m"
            livenessProbe:
              httpGet:
                path: /health
                port: 3000
              initialDelaySeconds: 15
              periodSeconds: 20
            readinessProbe:
              httpGet:
                path: /health
                port: 3000
              initialDelaySeconds: 5
              periodSeconds: 10
  ```

### 4.2 Helm チャート

- Helm チャートを `helm/<アプリ名>/` ディレクトリに配置すること。
- `helm create` で生成されるデフォルト構成をベースに、プロジェクトに合わせてカスタマイズすること。
- `values.yaml` でカスタマイズ可能なパラメータを定義し、環境（dev / staging / prod）ごとに値を切り替えられるようにすること。
- ディレクトリ構成例:
  ```
  helm/
  └── myapp/
      ├── Chart.yaml
      ├── values.yaml
      ├── values-dev.yaml
      ├── values-staging.yaml
      ├── values-prod.yaml
      └── templates/
          ├── _helpers.tpl
          ├── deployment.yaml
          ├── service.yaml
          ├── configmap.yaml
          ├── secret.yaml
          ├── ingress.yaml
          ├── hpa.yaml
          └── NOTES.txt
  ```
- `values.yaml` に定義すべき主要パラメータ:
  - `replicaCount`: レプリカ数
  - `image.repository`: コンテナイメージのリポジトリ
  - `image.tag`: コンテナイメージのタグ
  - `image.pullPolicy`: イメージのプルポリシー
  - `service.type`: Service のタイプ（ClusterIP / NodePort / LoadBalancer）
  - `service.port`: Service のポート
  - `ingress.enabled`: Ingress の有効/無効
  - `resources`: リソース制限
  - `env`: 環境変数
- 構成例（values.yaml）:
  ```yaml
  replicaCount: 2

  image:
    repository: ghcr.io/org/myapp
    tag: "latest"
    pullPolicy: IfNotPresent

  service:
    type: ClusterIP
    port: 80
    targetPort: 3000

  ingress:
    enabled: false
    className: nginx
    hosts:
      - host: myapp.example.com
        paths:
          - path: /
            pathType: Prefix

  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "500m"

  env:
    LOG_LEVEL: "info"
    PORT: "3000"

  secrets:
    DATABASE_URL: ""
    API_KEY: ""

  autoscaling:
    enabled: false
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 80
  ```

---

## 5. 全体チェックリスト

新しい機能を実装した際は、以下のチェックリストを確認すること:

- [ ] 単体テストが記述されている
- [ ] 各テストに内容を示すコメントが付与されている
- [ ] テストがビルド時に自動実行される構成になっている
- [ ] すべてのテストがパスしている
- [ ] README.md が更新されている（必須4項目を含む）
- [ ] Dockerfile が存在し、正常にビルドできる
- [ ] docker-compose.yaml が存在し、`docker compose up` で起動できる
- [ ] GitHub Actions の Docker ビルドワークフローが存在する
- [ ] Kubernetes マニフェストが `k8s/` に配置されている
- [ ] Helm チャートが `helm/<アプリ名>/` に配置されている
- [ ] 環境変数の変更がある場合、README.md の環境変数一覧が更新されている
