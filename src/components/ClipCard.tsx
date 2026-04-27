'use client'

import type { ClipCandidate, AccountType } from '@/lib/types'
import CaptionBox from './CaptionBox'

interface Props {
  clip: ClipCandidate
  accountType: AccountType
  isSelected: boolean
  onSelect: () => void
}

const scoreLabels: Record<string, string> = {
  hook_strength: 'Hook',
  emotional_payoff: 'Payoff',
  shareability: 'Share',
  niche_fit: 'Niche fit',
}

function ScoreBar({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: 'blue' | 'purple'
}) {
  const pct = Math.round((value / 10) * 100)
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-gray-300">{value}/10</span>
      </div>
      <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            accent === 'blue' ? 'bg-blue-500' : 'bg-purple-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function ClipCard({ clip, accountType, isSelected, onSelect }: Props) {
  const accent = accountType === 'male_motivation' ? 'blue' : 'purple'
  const pctScore = Math.round((clip.total_score / 40) * 100)

  const ringColor = accent === 'blue' ? 'ring-blue-500 border-blue-500/40' : 'ring-purple-400 border-purple-400/40'
  const badgeColor = accent === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
  const btnColor = accent === 'blue'
    ? 'bg-blue-500 hover:bg-blue-600 text-white'
    : 'bg-purple-500 hover:bg-purple-600 text-white'
  const selectedBtnColor = accent === 'blue'
    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 cursor-default'
    : 'bg-purple-500/20 text-purple-400 border border-purple-400/40 cursor-default'

  return (
    <div
      className={`bg-[#1c1c1c] border rounded-2xl p-5 transition-all duration-200 ${
        isSelected
          ? `${ringColor} ring-1`
          : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg ${badgeColor} flex items-center justify-center text-xs font-bold text-white`}>
            #{clip.rank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-semibold text-gray-200">
                {clip.start_time} → {clip.end_time}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {durationLabel(clip.start_time, clip.end_time)}
            </div>
          </div>
        </div>

        {/* Total score ring */}
        <div className="text-center">
          <div className={`text-2xl font-black ${accent === 'blue' ? 'text-blue-400' : 'text-purple-400'}`}>
            {clip.total_score}
          </div>
          <div className="text-xs text-gray-600">/40</div>
        </div>
      </div>

      {/* Score bars */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-4">
        {(['hook_strength', 'emotional_payoff', 'shareability', 'niche_fit'] as const).map((key) => (
          <ScoreBar
            key={key}
            label={scoreLabels[key]}
            value={clip[key]}
            accent={accent}
          />
        ))}
      </div>

      {/* Transcript excerpt */}
      {clip.transcript_excerpt && (
        <blockquote className="border-l-2 border-[#3a3a3a] pl-3 mb-3">
          <p className="text-sm text-gray-400 italic leading-relaxed line-clamp-2">
            "{clip.transcript_excerpt}"
          </p>
        </blockquote>
      )}

      {/* Reason */}
      <p className="text-sm text-gray-300 mb-3 leading-relaxed">{clip.reason}</p>

      {/* Cut notes */}
      {clip.cut_notes && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2.5 mb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-600">
              ✂ Edit notes
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{clip.cut_notes}</p>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={onSelect}
        disabled={isSelected}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all mb-1 ${
          isSelected ? selectedBtnColor : btnColor
        }`}
      >
        {isSelected ? '✓ Selected for rendering' : 'Select this clip'}
      </button>

      {/* Captions — always visible */}
      {clip.captions?.length > 0 && (
        <CaptionBox captions={clip.captions} accountType={accountType} />
      )}
    </div>
  )
}

function durationLabel(start: string, end: string): string {
  try {
    const toSec = (t: string) => {
      const parts = t.split(':').map(Number)
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
      return parts[0] * 60 + parts[1]
    }
    const diff = toSec(end) - toSec(start)
    if (diff <= 0) return ''
    const m = Math.floor(diff / 60)
    const s = diff % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  } catch {
    return ''
  }
}
