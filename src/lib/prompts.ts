import type { AIProvider, Category, Difficulty } from '@/types'

interface Technique {
  name: string
  description: string
  example: string
}

const TECHNIQUES: Technique[] = [
  {
    name: '微妙ランキング',
    description:
      'ランキングの上位ではなく「下位」に該当する条件を問うパターン。「ありそうだけど、少ない回答」を想像させる。',
    example:
      '医者にアンケート。「医者人生の中で一度は言ってみたいセリフ」第87位は？',
  },
  {
    name: 'オクシモロン',
    description:
      '意味が矛盾する言葉を並べる手法。固定観念に相反する形容詞で二項対立の先にある発想を誘発。',
    example: '危険だけど居心地が良いカフェとは？',
  },
  {
    name: '既存物語の拡張',
    description:
      '童話や映画など既存のストーリーの続きや発展的な設定について問う。',
    example: '13日の金曜日に暴れ回るジェイソン。14日の土曜日は何をしてる？',
  },
  {
    name: 'プラスワン',
    description: '既存のラインナップに+1を加える問い。',
    example: '相撲の決まり手が1つ増えて八十三手になりました。何ですか？',
  },
  {
    name: '不要機能',
    description: '常識的に考えて「必要のない」機能について想像させる。',
    example: '最新型洗濯機。「この機能いる？」どんな機能？',
  },
  {
    name: '境界ギリギリ',
    description: 'AとBのカテゴリの境界、価値の曖昧な領域について問う。',
    example:
      '格安航空会社。「そこまでするなら格安じゃなくていいよ！」どんなの？',
  },
  {
    name: '極端化',
    description: 'ある価値や意味を極端に誇張する文脈を設定。',
    example: 'もったいないオバケが怒り狂ったもったいない事とは？',
  },
  {
    name: '有名人リアクション',
    description:
      '具体的な有名人のリアクションを設定し、その原因について想像させる。',
    example: '',
  },
  {
    name: '何が起きる？',
    description:
      '普段はやらないアクションをとった際に「何が起こるか？」と想像させる。',
    example: 'バスの降車ボタン7回連打すると何が起きる？',
  },
]

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function buildTechniquesSection(techniques: Technique[]): string {
  return techniques
    .map((t, i) => {
      const example = t.example ? `\n例：${t.example}` : ''
      return `### ${i + 1}. ${t.name}\n${t.description}${example}`
    })
    .join('\n\n')
}

const AI_PROMPTS: Record<AIProvider, string> = {
  openai: `
あなたの強みを活かし、以下の点を意識してお題を作成してください：
- 論理的な構造や意外性のある状況設定を活かしたお題
- シュールで不条理な面白さがあるお題
- 具体的な数字や条件を使った、思わず考え込むお題
`,
  claude: `
あなたの強みを活かし、以下の点を意識してお題を作成してください：
- 言葉の響きや韻を活かした、語感の良いお題
- 人間の機微や心理の隙をつくお題
- 比喩や擬人法を使った、情景が浮かぶお題
`,
  gemini: `
あなたの強みを活かし、以下の点を意識してお題を作成してください：
- テンポが良く、口に出して読みたくなるお題
- 身近なあるあるネタを新鮮な角度で切り取ったお題
- ポップで親しみやすく、誰でもすぐ答えたくなるお題
`,
}

export const CATEGORY_PROMPTS = {
  daily:
    '日常生活の何気ない場面や出来事を題材にした大喜利のお題を作成してください。家事、通勤、買い物、食事など、誰もが経験する日常的な状況を面白く捉えたお題にしてください。',

  situation:
    '特定のシチュエーションや状況設定を明確にした大喜利のお題を作成してください。「〜な時」「〜な場面で」といった具体的な場面設定があるお題にしてください。',

  wordplay:
    '言葉遊びを活用した大喜利のお題を作成してください。ダジャレ、語呂合わせ、同音異義語、回文など、言葉の音や意味の面白さを活かせるお題にしてください。',

  current:
    '時事問題や最新のトレンド、流行を題材にした大喜利のお題を作成してください。ニュース、SNSの話題、新しい技術、社会現象などを取り入れたお題にしてください。',

  character:
    'キャラクターや人物を題材にした大喜利のお題を作成してください。有名人、歴史上の人物、アニメキャラクター、職業の人など、人物の特徴を活かしたお題にしてください。',

  place:
    '場所や風景を題材にした大喜利のお題を作成してください。観光地、建物、自然、都市など、場所の特徴や雰囲気を活かしたお題にしてください。',

  object:
    '物や道具を題材にした大喜利のお題を作成してください。日用品、電化製品、文房具、食器など、物の形や用途の面白さを活かしたお題にしてください。',

  emotion:
    '感情や気持ち、心境を表現する大喜利のお題を作成してください。喜び、悲しみ、怒り、驚き、恥ずかしさなど、感情の微妙な変化や表現を活かしたお題にしてください。',

  fantasy:
    'ファンタジーや空想的な世界を題材にした大喜利のお題を作成してください。魔法、ドラゴン、異世界、超能力など、現実離れした設定を活かしたお題にしてください。',

  food: '食べ物や料理を題材にした大喜利のお題を作成してください。食材、調理法、食事の場面、グルメなど、食に関する様々な要素を活かしたお題にしてください。',

  work: '仕事や職業を題材にした大喜利のお題を作成してください。会社員、職人、接客業、専門職など、職業の特徴や仕事場面を活かしたお題にしてください。',

  family:
    '家族や人間関係を題材にした大喜利のお題を作成してください。親子、夫婦、兄弟、友人、恋人など、人間関係の微妙さや温かさを活かしたお題にしてください。',
} as const

export const DIFFICULTY_PROMPTS = {
  easy: '初心者でも答えやすい、シンプルで分かりやすいお題にしてください。一般的な知識で回答でき、答えの方向性が想像しやすいお題にしてください。',

  medium:
    '少し考える必要がある、適度にひねりの効いたお題にしてください。創造性が求められつつも、極端に難しくない程度の発想力で答えられるお題にしてください。',

  hard: '高度な発想力や創造性が必要な、上級者向けのお題にしてください。複雑な設定や制約があり、独創的なアイデアが求められるお題にしてください。',
} as const

export function buildPrompt({
  category,
  difficulty,
  count = 5,
  customPrompt,
  aiProvider,
}: {
  category?: Category
  difficulty?: Difficulty
  count: number
  customPrompt?: string
  aiProvider: AIProvider
}): string {
  // 9つのテクニックからランダムに4つ選択
  const selectedTechniques = pickRandom(TECHNIQUES, 4)
  const techniquesSection = buildTechniquesSection(selectedTechniques)

  let prompt = `
あなたは大喜利のお題を作る専門家です。
以下の条件に従って、面白くて創造的なお題を生成してください。

## 良いお題を作るコツ（以下のテクニックを参考にしてください）

${techniquesSection}

## 要求事項:
1. 各お題は独立していて、重複しないこと
2. 回答者の創造性を刺激するような内容
3. 適度な制約がありつつも、幅広い回答が可能
4. 日本語として自然で理解しやすい
5. 不適切な内容を含まない
6. 大喜利らしいユーモアと発想の余地がある
7. 上記のテクニックのいずれかを活用したお題にする
8. ありきたりなパターンは避け、意外性のある切り口を重視する

出力形式:
お題のみを改行区切りで出力してください。番号や説明は不要です。
`

  // AI別のプロンプトを追加
  prompt += `\n${AI_PROMPTS[aiProvider]}`

  // カテゴリが指定されている場合
  if (category && CATEGORY_PROMPTS[category]) {
    prompt += `\n\n【カテゴリ指定】\n${CATEGORY_PROMPTS[category]}`
  }

  // 難易度が指定されている場合
  if (difficulty && DIFFICULTY_PROMPTS[difficulty]) {
    prompt += `\n\n【難易度設定】\n${DIFFICULTY_PROMPTS[difficulty]}`
  }

  // カスタムプロンプト（キーワード）が指定されている場合
  if (customPrompt) {
    prompt += `\n\n【キーワード指定】\n以下のキーワードやテーマを含めた、またはそれに関連するお題を作成してください：「${customPrompt}」`
  }

  // 生成数を指定
  prompt += `\n\n${count}個のお題を生成してください。`

  return prompt
}

export function parseOdaiResponse(response: string): string[] {
  // 改行で分割し、空行や番号付きの行を処理
  const lines = response
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // 番号や記号を除去 (例: "1. ", "・", "- ")
      return line
        .replace(/^[\d]+[.)]\s*/, '')
        .replace(/^[・\-*]\s*/, '')
        .replace(/^[\d]+\s*/, '')
        .trim()
    })
    .filter((line) => line.length > 0 && line.length <= 200) // 空行と長すぎる行を除外

  return lines
}
