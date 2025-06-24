# 🏭 大喜利ネタ工場

3つのAI（OpenAI、Claude、Gemini）が連携して、笑いのある大喜利ネタを工場のように大量生産するNext.jsアプリケーションです。

## 特徴

- **3つのAI連携**: OpenAI GPT、Claude、Geminiが同時に大喜利お題を生成
- **多様性**: 各AIの個性を活かした異なるアプローチのお題
- **カテゴリー別**: 日常、学校、職場など様々なシチュエーション
- **難易度調整**: 初心者から上級者まで対応
- **お気に入り機能**: 気に入ったお題を保存・管理

## 使用技術

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI APIs**: OpenAI API, Anthropic Claude API, Google Gemini API
- **Package Manager**: pnpm

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下のAPIキーを設定してください：

```bash
OPENAI_API_KEY=sk-proj-XXX
ANTHROPIC_API_KEY=sk-ant-XXX
GEMINI_API_KEY=XXX
```

### 3. 開発サーバーの起動

```bash
pnpm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いて確認してください。

## 開発コマンド

```bash
pnpm run dev          # 開発サーバー起動
pnpm run build        # プロダクションビルド
pnpm run start        # プロダクションサーバー起動
pnpm run check        # Biome によるコードチェック
```

## プロジェクト構造

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── openai/       # OpenAI エンドポイント
│   │   ├── claude/       # Claude エンドポイント
│   │   ├── gemini/       # Gemini エンドポイント
│   │   └── generate-all/ # 一括生成エンドポイント
│   ├── globals.css       # グローバルスタイル
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # メインページ
├── components/           # UIコンポーネント
├── lib/                  # AIクライアントとプロンプト
└── types/                # TypeScript型定義
```

## 詳細ドキュメント

- [設計ドキュメント](./docs/README.md) - アプリ概要、技術スタック、システム構成
- [API設計](./docs/api-design.md) - エンドポイント、データ型、プロンプト戦略
- [UI設計](./docs/ui-design.md) - レイアウト、コンポーネント、デザインシステム
- [Claude Code ガイド](./CLAUDE.md) - 開発者向けガイド

## ライセンス

MIT License