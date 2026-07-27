<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# 大喜利お題生成アプリ - エージェントガイド

OpenAI GPT、Claude、Geminiの3つのAIで大喜利のお題を生成するNext.jsアプリケーション。

## 設計ドキュメント

- **[メイン設計](./docs/README.md)** - アプリ概要、技術スタック、システム構成
- **[API設計](./docs/api-design.md)** - エンドポイント、データ型、プロンプト戦略
- **[UI設計](./docs/ui-design.md)** - レイアウト、コンポーネント、デザインシステム

## 開発コマンド

```bash
pnpm run dev          # 開発サーバー起動
pnpm run build        # プロダクションビルド
pnpm run check        # Biome によるコードチェック
pnpm run check-types  # 型チェック
```

## 環境変数

`.env.local` に各AIプロバイダのAPIキーを設定（`.env.sample` 参照）。
APIキーはサーバーサイドのみで扱い、クライアントに露出させないこと。

## 開発時の注意

- 修正後は必ず `pnpm run check` を実行してコードの整合性を確認してください。
