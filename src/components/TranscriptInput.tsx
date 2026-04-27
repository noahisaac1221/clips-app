'use client'

import { useRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function TranscriptInput({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      onChange(text)
    }
    reader.readAsText(file)
    // reset so same file can be re-uploaded
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target?.result as string)
    reader.readAsText(file)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Transcript
        </label>
        <button
          onClick={() => fileRef.current?.click()}
          className="text-xs text-gray-400 hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-1.5 rounded-lg transition-colors"
        >
          Upload file
        </button>
        <input ref={fileRef} type="file" accept=".txt,.srt,.vtt,.md" onChange={handleFile} className="hidden" />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative"
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste your timestamped transcript here…\n\nAccepted formats:\n[00:00] text\n00:00:00 text\n(or drop a .txt / .srt file)`}
          rows={14}
          className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-y focus:outline-none focus:border-[#444] transition-colors font-mono leading-relaxed"
        />
        {!value && (
          <div className="absolute inset-0 flex items-end justify-end p-3 pointer-events-none">
            <span className="text-xs text-gray-700">drag & drop supported</span>
          </div>
        )}
      </div>

      {value && (
        <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
          <span>{value.split('\n').filter(Boolean).length} lines · {value.length.toLocaleString()} chars</span>
          <button
            onClick={() => onChange('')}
            className="hover:text-gray-400 transition-colors"
          >
            clear
          </button>
        </div>
      )}
    </div>
  )
}
