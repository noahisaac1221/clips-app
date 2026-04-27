'use client'

import type { AccountType } from '@/lib/types'

interface Props {
  value: AccountType
  onChange: (v: AccountType) => void
}

const accounts = [
  {
    id: 'male_motivation' as AccountType,
    label: 'Account A',
    sublabel: 'Male Motivation',
    description: 'Business · Investing · Discipline · High-performance',
    emoji: '⚡',
    accent: 'accent-a',
    ring: 'ring-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
    dot: 'bg-blue-500',
  },
  {
    id: 'female_nostalgia' as AccountType,
    label: 'Account B',
    sublabel: 'Nostalgic Female Fandom',
    description: 'Early YouTube · UK Creators · Boy Bands · 2010s',
    emoji: '✨',
    accent: 'accent-b',
    ring: 'ring-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-400/40',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
  },
]

export default function AccountSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        Select Account
      </label>
      <div className="grid grid-cols-2 gap-3">
        {accounts.map((a) => {
          const selected = value === a.id
          return (
            <button
              key={a.id}
              onClick={() => onChange(a.id)}
              className={`
                relative text-left p-4 rounded-xl border transition-all duration-200
                ${selected
                  ? `${a.bg} ${a.border} ring-1 ${a.ring}`
                  : 'bg-[#1c1c1c] border-[#2a2a2a] hover:border-[#3a3a3a]'
                }
              `}
            >
              {selected && (
                <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${a.dot}`} />
              )}
              <div className="text-2xl mb-2">{a.emoji}</div>
              <div className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${selected ? a.text : 'text-gray-500'}`}>
                {a.label}
              </div>
              <div className={`text-sm font-semibold mb-1 ${selected ? 'text-white' : 'text-gray-300'}`}>
                {a.sublabel}
              </div>
              <div className="text-xs text-gray-500">{a.description}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
