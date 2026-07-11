# X-Clone

XをモチーフにしたSNS Webアプリケーションです。ユーザー登録・ログインから投稿・いいね・リポスト・返信まで、SNSの基本機能を実装しています。

## デモ

**URL:** https://x-clone-peach-two.vercel.app

## 機能一覧

- ユーザー登録・ログイン・ログアウト（JWT認証）
- 投稿作成・削除
- タイムライン表示（新しい順）
- いいね（トグル・ハートの色変更）
- リポスト（トグル）
- 返信機能（誰への返信か表示）
- 投稿日時の相対表示（〇分前・〇時間前）

## 技術スタック

### フロントエンド
| 技術 | バージョン |
|------|-----------|
| React | 19 |
| TypeScript | 6 |
| Tailwind CSS | 3 |
| React Router | 7 |
| Vite | 8 |

### バックエンド
| 技術 | バージョン |
|------|-----------|
| Node.js | 20 |
| Express | 5 |
| MySQL2 | 3 |
| JWT（jsonwebtoken） | 9 |
| bcryptjs | 2 |

### インフラ・デプロイ
| 用途 | サービス |
|------|---------|
| フロントエンド | Vercel |
| バックエンド | Railway |
| データベース | Railway（MySQL 9） |
| ローカル開発 | Docker / Docker Compose |

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│              ユーザー                    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         フロントエンド（Vercel）          │
│         React + TypeScript              │
└────────────────┬────────────────────────┘
                 │ HTTP / REST API
┌────────────────▼────────────────────────┐
│         バックエンド（Railway）           │
│         Express.js                      │
└────────────────┬────────────────────────┘
                 │ Private Networking
┌────────────────▼────────────────────────┐
│         データベース（Railway）           │
│         MySQL                           │
└─────────────────────────────────────────┘
```

## ディレクトリ構成

```
x-clone/
├── frontend/                # フロントエンド
│   ├── src/
│   │   ├── components/
│   │   │   ├── PostCard.tsx  # 投稿カード
│   │   │   └── PostForm.tsx  # 投稿フォーム
│   │   ├── pages/
│   │   │   ├── Login.tsx     # ログイン画面
│   │   │   ├── Register.tsx  # 登録画面
│   │   │   └── Timeline.tsx  # タイムライン画面
│   │   ├── types/
│   │   │   └── index.ts      # 型定義
│   │   └── App.tsx           # ルーティング
│   └── vercel.json
├── backend/                 # バックエンド
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js       # 認証API
│   │   │   └── posts.js      # 投稿API
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT認証ミドルウェア
│   │   ├── db.js             # DB接続
│   │   └── index.js          # エントリーポイント
│   ├── init.sql              # テーブル定義
│   └── Dockerfile
└── docker-compose.yml
```

## データベース設計

```
users
  ├── id（PK）
  ├── username（UNIQUE）
  ├── email（UNIQUE）
  ├── password（ハッシュ化）
  └── created_at

posts
  ├── id（PK）
  ├── content（280文字以内）
  ├── user_id（FK → users.id）
  ├── parent_id（FK → posts.id / 返信の場合）
  └── created_at

likes
  ├── id（PK）
  ├── user_id（FK → users.id）
  ├── post_id（FK → posts.id）
  └── UNIQUE KEY（user_id, post_id）

reposts
  ├── id（PK）
  ├── user_id（FK → users.id）
  ├── post_id（FK → posts.id）
  └── UNIQUE KEY（user_id, post_id）
```

## API設計

| メソッド | エンドポイント | 説明 | 認証 |
|--------|--------------|------|------|
| POST | /api/auth/register | ユーザー登録 | 不要 |
| POST | /api/auth/login | ログイン | 不要 |
| GET | /api/posts/get | 投稿一覧取得 | 必要 |
| POST | /api/posts/post | 投稿作成 | 必要 |
| DELETE | /api/posts/:id | 投稿削除 | 必要 |
| POST | /api/posts/:id/like | いいね | 必要 |
| POST | /api/posts/:id/repost | リポスト | 必要 |
| POST | /api/posts/:id/reply | 返信 | 必要 |
| GET | /api/posts/:id/replies | 返信一覧取得 | 必要 |

## ローカルでの起動方法

### 必要な環境
- Docker
- Docker Compose

### 手順

```bash
# リポジトリをクローン
git clone https://github.com/tasa1/x-clone.git
cd x-clone

# Dockerで起動
docker-compose up --build
```

ブラウザで `http://localhost:5173` にアクセスしてください。

## 認証フロー

```
1. ユーザーが登録・ログイン
2. サーバーがJWTトークンを発行
3. フロントがlocalStorageにトークンを保存
4. 以降のリクエストにAuthorizationヘッダーでトークンを付与
5. サーバーがトークンを検証してユーザーを識別
```

## 開発者

- GitHub: [@tasa1](https://github.com/tasa1)
