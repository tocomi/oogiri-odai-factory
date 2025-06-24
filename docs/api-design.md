# API設計ドキュメント

## 概要
大喜利お題生成アプリのAPI設計について詳細に記載します。

## エンドポイント一覧

### 1. OpenAI API エンドポイント
**URL**: `/api/openai`  
**Method**: POST

#### Request Body
```typescript
interface OpenAIRequest {
  category?: string;           // お題のカテゴリ
  difficulty?: 'easy' | 'medium' | 'hard';  // 難易度
  count: number;              // 生成するお題の数 (1-10)
  customPrompt?: string;      // カスタムプロンプト
}
```

#### Response
```typescript
interface OpenAIResponse {
  success: boolean;
  data?: {
    odais: string[];          // 生成されたお題の配列
    source: 'openai';
    model: string;            // 使用したモデル名
    tokens?: number;          // 使用トークン数
  };
  error?: string;
}
```

### 2. Claude API エンドポイント
**URL**: `/api/claude`  
**Method**: POST

#### Request Body
```typescript
interface ClaudeRequest {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count: number;
  customPrompt?: string;
}
```

#### Response
```typescript
interface ClaudeResponse {
  success: boolean;
  data?: {
    odais: string[];
    source: 'claude';
    model: string;
    tokens?: number;
  };
  error?: string;
}
```

### 3. Gemini API エンドポイント
**URL**: `/api/gemini`  
**Method**: POST

#### Request Body
```typescript
interface GeminiRequest {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count: number;
  customPrompt?: string;
}
```

#### Response
```typescript
interface GeminiResponse {
  success: boolean;
  data?: {
    odais: string[];
    source: 'gemini';
    model: string;
    tokens?: number;
  };
  error?: string;
}
```

### 4. 一括生成 API エンドポイント
**URL**: `/api/generate-all`  
**Method**: POST

#### Request Body
```typescript
interface GenerateAllRequest {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count: number;              // 各AIから生成する数
  customPrompt?: string;
}
```

#### Response
```typescript
interface GenerateAllResponse {
  success: boolean;
  data?: {
    openai: string[];
    claude: string[];
    gemini: string[];
    totalCount: number;
  };
  errors?: {
    openai?: string;
    claude?: string;
    gemini?: string;
  };
}
```

## カテゴリ一覧

```typescript
const CATEGORIES = {
  daily: '日常生活',
  situation: 'シチュエーション',
  wordplay: '言葉遊び',
  current: '時事・トレンド',
  character: 'キャラクター・人物',
  place: '場所・風景',
  object: '物・道具',
  emotion: '感情・気持ち',
  fantasy: 'ファンタジー',
  food: '食べ物',
  work: '仕事・職業',
  family: '家族・人間関係'
} as const;
```

## 難易度設定

### easy (初心者向け)
- シンプルで分かりやすいお題
- 一般的な知識で答えられる
- 答えやすい構造

### medium (中級者向け)
- 少し考える必要があるお題
- ひねりが効いている
- 創造性が求められる

### hard (上級者向け)
- 高度な発想力が必要
- 複雑な設定や制約
- 専門知識を活用できる

## プロンプト設計

### 基本プロンプト構造
```typescript
const BASE_PROMPT = `
あなたは大喜利のお題を作る専門家です。
以下の条件に従って、面白くて創造的なお題を生成してください。

条件:
- カテゴリ: {category}
- 難易度: {difficulty}
- 生成数: {count}個

要求事項:
1. 各お題は独立していて、重複しないこと
2. 回答者の創造性を刺激するような内容
3. 適度な制約がありつつも、幅広い回答が可能
4. 日本語として自然で理解しやすい
5. 不適切な内容を含まない

出力形式:
お題のみを改行区切りで出力してください。番号や説明は不要です。
`;
```

### AI別特化プロンプト

#### OpenAI向け
```typescript
const OPENAI_SPECIFIC = `
論理的で構造化された大喜利のお題を作成してください。
明確な設定と分かりやすいルールを持つお題を重視してください。
`;
```

#### Claude向け
```typescript
const CLAUDE_SPECIFIC = `
創造的で文学的な表現を使った大喜利のお題を作成してください。
言葉の美しさや詩的な要素を重視してください。
`;
```

#### Gemini向け
```typescript
const GEMINI_SPECIFIC = `
現代的でトレンドを反映した大喜利のお題を作成してください。
最新の話題や社会情勢を取り入れた内容を重視してください。
`;
```

## エラーハンドリング

### エラーコード一覧
- `INVALID_REQUEST`: リクエストパラメータが不正
- `API_KEY_MISSING`: API キーが設定されていない
- `API_RATE_LIMIT`: API レート制限に達した
- `API_ERROR`: AI API からエラーが返された
- `PARSING_ERROR`: AI の回答をパースできなかった
- `NETWORK_ERROR`: ネットワークエラー

### エラーレスポンス例
```typescript
{
  success: false,
  error: "API_RATE_LIMIT",
  message: "API rate limit exceeded. Please try again later.",
  retryAfter?: number  // 再試行可能になるまでの秒数
}
```

## セキュリティ

### API キー管理
- 環境変数での管理
- サーバーサイドでのみ使用
- クライアントに露出しない

### レート制限
- 1分間に最大30リクエスト
- IPアドレス単位での制限
- 429ステータスコードでの応答

### バリデーション
- リクエストパラメータの型チェック
- 文字数制限（お題は最大200文字）
- 不適切な内容のフィルタリング