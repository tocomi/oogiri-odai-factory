# UI設計ドキュメント

## 概要
大喜利お題生成アプリのUI/UX設計について詳細に記載します。

## デザインコンセプト
- **シンプル**: 操作が直感的で分かりやすい
- **楽しさ**: 大喜利らしい明るく楽しい雰囲気
- **効率性**: 素早くお題を生成・確認できる
- **可読性**: お題が読みやすく、コピーしやすい

## カラーパレット

### プライマリカラー
```css
:root {
  --primary-50: #fef7ff;
  --primary-100: #fce7ff;
  --primary-200: #f8d1ff;
  --primary-300: #f2a9ff;
  --primary-400: #e971ff;
  --primary-500: #d946ef;  /* メインカラー */
  --primary-600: #c026d3;
  --primary-700: #a21caf;
  --primary-800: #86198f;
  --primary-900: #701a75;
}
```

### セカンダリカラー
```css
:root {
  --secondary-50: #f0f9ff;
  --secondary-100: #e0f2fe;
  --secondary-200: #bae6fd;
  --secondary-500: #0ea5e9;  /* アクセントカラー */
  --secondary-600: #0284c7;
}
```

### ニュートラルカラー
```css
:root {
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}
```

## レイアウト構造

### デスクトップ (1024px以上)
```
┌─────────────────────────────────────────────────┐
│                   Header                        │
├─────────────────────────────────────────────────┤
│  Control Panel                                  │
│  ┌─────────────┬─────────────┬─────────────┐    │
│  │ AI Selection│  Category   │ Difficulty  │    │
│  └─────────────┴─────────────┴─────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │         Generate Button                 │    │
│  └─────────────────────────────────────────┘    │
├─────────────────────────────────────────────────┤
│  Results Area                                   │
│  ┌─────────┬─────────┬─────────┐                │
│  │ OpenAI  │ Claude  │ Gemini  │                │
│  │ Cards   │ Cards   │ Cards   │                │
│  │         │         │         │                │
│  └─────────┴─────────┴─────────┘                │
└─────────────────────────────────────────────────┘
```

### タブレット (768px - 1023px)
```
┌─────────────────────────────────────────────────┐
│                   Header                        │
├─────────────────────────────────────────────────┤
│  Control Panel                                  │
│  ┌─────────────────┬─────────────────┐          │
│  │ AI Selection    │  Category       │          │
│  └─────────────────┴─────────────────┘          │
│  ┌─────────────────┬─────────────────┐          │
│  │ Difficulty      │ Generate Button │          │
│  └─────────────────┴─────────────────┘          │
├─────────────────────────────────────────────────┤
│  Results Area                                   │
│  ┌─────────────────┬─────────────────┐          │
│  │ OpenAI Cards    │ Claude Cards    │          │
│  └─────────────────┴─────────────────┘          │
│  ┌─────────────────┐                            │
│  │ Gemini Cards    │                            │
│  └─────────────────┘                            │
└─────────────────────────────────────────────────┘
```

### モバイル (767px以下)
```
┌─────────────────────────────────────────────────┐
│                   Header                        │
├─────────────────────────────────────────────────┤
│  Control Panel                                  │
│  ┌─────────────────────────────────────────┐    │
│  │         AI Selection                    │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │          Category                       │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │         Difficulty                      │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │       Generate Button                   │    │
│  └─────────────────────────────────────────┘    │
├─────────────────────────────────────────────────┤
│  Results Area                                   │
│  ┌─────────────────────────────────────────┐    │
│  │         OpenAI Cards                    │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │         Claude Cards                    │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │         Gemini Cards                    │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

## コンポーネント設計

### 1. Header Component
```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
}
```

**機能**:
- アプリケーションタイトル
- サブタイトル（説明文）
- ダークモード切り替え（将来実装）

### 2. Control Panel Component
```typescript
interface ControlPanelProps {
  onGenerate: (params: GenerateParams) => void;
  isLoading: boolean;
}

interface GenerateParams {
  selectedAIs: AIProvider[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
}
```

**機能**:
- AI選択（複数選択可能）
- カテゴリ選択
- 難易度選択
- 生成数指定
- 生成ボタン

### 3. AI Selector Component
```typescript
interface AISelectorProps {
  selectedAIs: AIProvider[];
  onSelectionChange: (ais: AIProvider[]) => void;
}

type AIProvider = 'openai' | 'claude' | 'gemini' | 'all';
```

**デザイン**:
- チェックボックス形式
- AI名とアイコン表示
- 「すべて選択」オプション

### 4. Category Selector Component
```typescript
interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}
```

**デザイン**:
- ドロップダウン形式
- カテゴリアイコン付き
- 説明文表示

### 5. Odai Card Component
```typescript
interface OdaiCardProps {
  odai: string;
  source: AIProvider;
  onCopy: () => void;
  onRegenerate: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
}
```

**デザイン**:
```
┌─────────────────────────────────────────────────┐
│ ┌─────────┐  Odai Text Here                 ⭐ │
│ │ AI Icon │  Lorem ipsum dolor sit amet...      │
│ └─────────┘                                     │
│                                                 │
│               ┌────────┬────────┬────────┐      │
│               │  Copy  │ Regen  │ Fav    │      │
│               └────────┴────────┴────────┘      │
└─────────────────────────────────────────────────┘
```

### 6. Results Area Component
```typescript
interface ResultsAreaProps {
  results: {
    openai: string[];
    claude: string[];
    gemini: string[];
  };
  isLoading: boolean;
  onCopy: (text: string) => void;
  onRegenerate: (source: AIProvider, index: number) => void;
}
```

**機能**:
- AI別タブ表示
- カード形式での結果表示
- ローディング状態表示
- 空状態の表示

## インタラクション設計

### 1. 生成フロー
1. **設定選択**: AI、カテゴリ、難易度を選択
2. **生成開始**: 「生成する」ボタンをクリック
3. **ローディング**: 各AIからの応答を待機
4. **結果表示**: 順次カードが表示される
5. **アクション**: コピー、再生成、お気に入り

### 2. アニメーション
- **カード出現**: 下から上へフェードイン
- **ローディング**: スケルトンアニメーション
- **ボタンホバー**: 色変化とスケール
- **コピー成功**: 一時的な成功メッセージ

### 3. フィードバック
- **成功**: 緑色のトースト通知
- **エラー**: 赤色のトースト通知
- **ローディング**: スピナーとプログレスバー
- **空状態**: イラスト付きの案内メッセージ

## アクセシビリティ

### 1. キーボード操作
- Tab キーによるフォーカス移動
- Enter キーによるボタン実行
- Escape キーによるモーダル閉じる

### 2. スクリーンリーダー対応
- 適切な ARIA ラベル
- 見出し構造（h1, h2, h3）
- 状態変化の読み上げ

### 3. カラーコントラスト
- WCAG 2.1 AA 基準準拠
- 4.5:1 以上のコントラスト比
- 色だけに依存しない情報伝達

## レスポンシブデザイン

### ブレークポイント
```css
/* Mobile */
@media (max-width: 767px) { ... }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }

/* Large Desktop */
@media (min-width: 1280px) { ... }
```

### 可変要素
- フォントサイズ: clamp() 関数使用
- 余白: レスポンシブ単位 (rem, %)
- グリッド: CSS Grid の auto-fit
- カード幅: 最小幅と最大幅の設定

## パフォーマンス最適化

### 1. 画像最適化
- WebP 形式の使用
- 適切なサイズ設定
- lazy loading の実装

### 2. CSS最適化
- Critical CSS のインライン化
- 不要なスタイルの削除
- CSS Modules の使用

### 3. JavaScript最適化
- コード分割
- 遅延読み込み
- バンドルサイズの最適化