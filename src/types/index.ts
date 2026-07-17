export type AIProvider = 'openai' | 'claude' | 'gemini'

export interface GeneratedOdai {
  id: string
  text: string
  source: AIProvider
  technique?: string
}

export type FeedbackType = 'like' | 'dislike' | 'copy' | 'skip'

export interface FeedbackRequest {
  odaiId: string
  type: FeedbackType
}

export interface FeedbackResponse {
  success: boolean
  eventId?: number
  error?: string
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Category =
  | 'daily' // 日常生活
  | 'situation' // シチュエーション
  | 'wordplay' // 言葉遊び
  | 'current' // 時事・トレンド
  | 'character' // キャラクター・人物
  | 'place' // 場所・風景
  | 'object' // 物・道具
  | 'emotion' // 感情・気持ち
  | 'fantasy' // ファンタジー
  | 'food' // 食べ物
  | 'work' // 仕事・職業
  | 'family' // 家族・人間関係

export interface CategoryInfo {
  id: Category
  name: string
  description: string
  icon: string
}

export interface OdaiRequest {
  category?: Category
  difficulty?: Difficulty
  count: number
  customPrompt?: string
}

export interface OdaiResponse {
  success: boolean
  data?: {
    odais: GeneratedOdai[]
    source: AIProvider
    model: string
    tokens?: number
  }
  error?: string
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'daily',
    name: '日常生活',
    description: '普段の生活に関するお題',
    icon: '🏠',
  },
  {
    id: 'situation',
    name: 'シチュエーション',
    description: '特定の状況設定のお題',
    icon: '🎭',
  },
  {
    id: 'wordplay',
    name: '言葉遊び',
    description: 'ダジャレや言葉の面白さを活かすお題',
    icon: '🎪',
  },
  {
    id: 'current',
    name: '時事・トレンド',
    description: '最新の話題や流行を取り入れたお題',
    icon: '📱',
  },
  {
    id: 'character',
    name: 'キャラクター・人物',
    description: '人物やキャラクターに関するお題',
    icon: '👤',
  },
  {
    id: 'place',
    name: '場所・風景',
    description: '場所や風景に関するお題',
    icon: '🌍',
  },
  {
    id: 'object',
    name: '物・道具',
    description: '物や道具を使ったお題',
    icon: '🔧',
  },
  {
    id: 'emotion',
    name: '感情・気持ち',
    description: '感情や心境を表現するお題',
    icon: '💭',
  },
  {
    id: 'fantasy',
    name: 'ファンタジー',
    description: '空想的で非現実的なお題',
    icon: '🧙‍♂️',
  },
  {
    id: 'food',
    name: '食べ物',
    description: '料理や食材に関するお題',
    icon: '🍽️',
  },
  {
    id: 'work',
    name: '仕事・職業',
    description: '職業や仕事に関するお題',
    icon: '💼',
  },
  {
    id: 'family',
    name: '家族・人間関係',
    description: '家族や人間関係に関するお題',
    icon: '👨‍👩‍👧‍👦',
  },
]
