export type AccountType = 'male_motivation' | 'female_nostalgia'

export interface Caption {
  option: number
  text: string
  hashtags: string[]
}

export interface ClipCandidate {
  rank: number
  start_time: string
  end_time: string
  hook_strength: number
  emotional_payoff: number
  shareability: number
  niche_fit: number
  total_score: number
  reason: string
  transcript_excerpt: string
  cut_notes: string
  captions: Caption[]
}

export interface AnalysisResult {
  account_type: AccountType
  video_title: string
  top_clips: ClipCandidate[]
  notes: string
}

export interface AnalyzeRequest {
  account_type: AccountType
  transcript: string
  video_title?: string
}
