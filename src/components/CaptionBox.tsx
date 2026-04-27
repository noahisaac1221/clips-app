'use client'

import { useState } from 'react'
import type { Caption } from '@/lib/types'

interface Props {
  captions: Caption[]
  accountType: 'male_motivation' | 'female_nostalgia'
}

export default function CaptionBox({ captions, accountType }: Props) {
  const [selected, setSelected] = useState(0)
  const [copied, setCopied] = useState(false)

  const current = captions[selected]
  if (!current) return null

  const fullText = `${current.text}\n\n${current.hashtags.join(' ')}`

  const copy = async () => {
    await navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const accent = accountType === 'male_motivation' ? 'blue' : 'purple'
  const tabActive = accent === 'blue'
    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    : 'bg-purple-500/20 text-purple-400 border-purple-400/40'

  return (
    <div className="mt-4 bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Caption Options
        </span>
        <div className="flex gap-1.5">
          {captions.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                selected === i
                  ? tabActive
                  : 'text-gray-500 border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-200 leading-relaxed mb-3">{current.text}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {current.hashtags.map((tag) => (
          <span
            key={tag}
            className={`text-xs px-2 py-0.5 rounded-full border ${
              accent === 'blue'
                ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                : 'text-purple-400 border-purple-400/30 bg-purple-500/10'
            }`}
          >
            {tag.startsWith('#') ? tag : `#${tag}`}
          </span>
        ))}
      </div>

      <button
        onClick={copy}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
          copied
            ? 'bg-green-500/20 text-green-400 border border-green-500/40'
            : accent === 'blue'
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-purple-500 hover:bg-purple-600 text-white'
        }`}
      >
        {copied ? '✓ Copied to clipboard' : 'Copy caption + hashtags'}
      </button>
    </div>
  )
}
