# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

レシート読み込み家計簿 Web アプリ。レシート画像を Claude API（Haiku）でOCR解析し、商品・金額・カテゴリを自動抽出して家計管理を行う。

## Architecture

```
kakeibo-app/
├── client/          # Vite + React フロントエンド
│   ├── src/
│   │   ├── components/
│   │   │   ├── ReceiptUpload.jsx   # 画像アップロード UI
│   │   │   ├── ExpenseList.jsx     # 支出一覧
│   │   │   ├── CategoryPieChart.jsx
│   │   │   └── MonthlyBarChart.jsx
│   │   └── App.jsx
│   └── vite.config.js             # /api へのプロキシ設定
└── server/          # Express + Node.js バックエンド
    ├── index.js                   # Claude API 呼び出しエンドポイント
    └── .env                       # ANTHROPIC_API_KEY（Git 管理外）
```

**データフロー:** ブラウザ → Express (`POST /api/analyze`) → Claude API → JSON レスポンス → React state → localStorage

- フロントエンドからは API キーを直接使わない。必ず Express 経由で Claude API を呼ぶ。
- データは localStorage に永続化（`kakeibo_expenses` キー）。
- Claude モデルは `claude-haiku-4-5`（`claude-haiku-4-5-20251001`）を使用。

## Commands

### 開発起動（両方同時に起動が必要）

```bash
# バックエンド（server/）
cd server && npm run dev      # nodemon で起動、ポート 3001

# フロントエンド（client/）
cd client && npm run dev      # Vite で起動、ポート 5173
```

### ビルド

```bash
cd client && npm run build    # dist/ に出力
```

### 依存パッケージのインストール

```bash
cd server && npm install
cd client && npm install
```

## Environment Variables

`server/.env` に以下を設定（`.gitignore` で除外済み）:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

## Git Rules

**コードを変更するたびに必ず GitHub にプッシュする。**

毎回の変更後に以下を実行:

```bash
git add <変更ファイル>
git commit -m "変更内容を端的に説明するメッセージ"
git push
```

- コミットを溜めて一括プッシュしない。論理的な1単位の変更ごとに即プッシュする。
- `.env` ファイルは絶対にコミットしない。
- リモート: `https://github.com/yikeda-pixel/kakeibo-app.git`（ブランチ: `main`）
