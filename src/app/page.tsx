'use client'

import { useState, useRef } from 'react'
import AccountSelector from '@/components/AccountSelector'
import TranscriptInput from '@/components/TranscriptInput'
import ClipCard from '@/components/ClipCard'
import VideoProcessor from '@/components/VideoProcessor'
import type { AccountType, AnalysisResult, ClipCandidate } from '@/lib/types'

type Step = 'setup' | 'analyzing' | 'results'

export default function Home() {
  const [accountType, setAccountType] = useState<AccountType>('female_nostalgia')
  const [videoTitle, setVideoTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [step, setStep] = useState<Step>('setup')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [selectedClip, setSelectedClip] = useState<ClipCandidate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const renderRef = useRef<HTMLDivElement>(null)

  const isAccA = accountType === 'male_motivation'
  const accentText = isAccA ? 'text-blue-400' : 'text-purple-400'
  const accentBg = isAccA ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'
  const accentBorder = isAccA ? 'border-blue-500/40' : 'border-purple-400/40'

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Please paste or upload a transcript before analyzing.')
      return
    }
    setError(null)
    setStep('analyzing')
    setResult(null)
    setSelectedClip(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_type: accountType,
          transcript,
          video_title: videoTitle,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`)
      }

      setResult(data)
      setStep('results')
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('setup')
    }
  }

  const handleSelectClip = (clip: ClipCandidate) => {
    setSelectedClip(clip)
    setTimeout(() => renderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const handleReset = () => {
    setStep('setup')
    setResult(null)
    setSelectedClip(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Nav */}
      <nav className="border-b border-[#1e1e1e] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-black text-white">
            CO
          </div>
          <div>
            <span className="font-bold text-white tracking-tight">ClipOps</span>
            <span className="text-xs text-gray-600 ml-2">TikTok Clip Generator</span>
          </div>
        </div>
        {step !== 'setup' && (
          <button
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-gray-300 border border-[#2a2a2a] hover:border-[#3a3a3a] px-3 py-1.5 rounded-lg transition-colors"
          >
            ← New session
          </button>
        )}
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* ── SETUP PANEL ── */}
        {step !== 'results' && (
          <div className="space-y-6">
            {step === 'setup' && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                    Find your best clips
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Paste a timestamped transcript → AI scans and ranks every viral-ready moment → render + download.
                  </p>
                </div>

                <AccountSelector value={accountType} onChange={setAccountType} />

                {/* Video title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                    Video title <span className="text-gray-600 font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Dan and Phil — DRAW MY LIFE 2013"
                    className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#444] transition-colors"
                  />
                </div>

                <TranscriptInput value={transcript} onChange={setTranscript} />

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!transcript.trim()}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed ${accentBg}`}
                >
                  Find best clips →
                </button>

                {/* How it works */}
                <div className="border border-[#1e1e1e] rounded-xl p-5 mt-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">How it works</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                      { n: '1', label: 'Paste transcript', sub: 'Any timestamped format' },
                      { n: '2', label: 'AI ranks clips', sub: 'Scored on 4 virality signals' },
                      { n: '3', label: 'Download + post', sub: 'Caption ready to copy' },
                    ].map((item) => (
                      <div key={item.n}>
                        <div className={`w-7 h-7 rounded-full border ${accentBorder} ${accentText} text-xs font-bold flex items-center justify-center mx-auto mb-2`}>
                          {item.n}
                        </div>
                        <div className="text-xs font-semibold text-gray-300 mb-0.5">{item.label}</div>
                        <div className="text-xs text-gray-600">{item.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Analyzing state */}
            {step === 'analyzing' && (
              <div className="text-center py-24">
                <div className="relative inline-flex mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${isAccA ? 'bg-blue-500/20' : 'bg-purple-500/20'} flex items-center justify-center`}>
                    <div className={`w-8 h-8 rounded-xl ${isAccA ? 'bg-blue-500' : 'bg-purple-500'} pulse-glow`} />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Scanning transcript…</h2>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Claude is reading every line, scoring virality signals, and ranking the best clip windows.
                  Usually takes 20–40 seconds.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── RESULTS ── */}
        {step === 'results' && result && (
          <div ref={resultsRef}>
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {result.top_clips.length} clip{result.top_clips.length !== 1 ? 's' : ''} found
                </h2>
                {videoTitle && (
                  <p className="text-sm text-gray-500 mt-0.5 truncate max-w-sm">{videoTitle}</p>
                )}
              </div>
              <div className={`text-xs px-3 py-1.5 rounded-full border ${accentBorder} ${accentText} font-semibold`}>
                {isAccA ? 'Account A' : 'Account B'}
              </div>
            </div>

            {/* AI notes */}
            {result.notes && (
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 mb-6 text-sm text-gray-400 leading-relaxed">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-600 block mb-1">
                  AI notes
                </span>
                {result.notes}
              </div>
            )}

            {/* Clip cards */}
            <div className="space-y-5">
              {result.top_clips.map((clip) => (
                <ClipCard
                  key={clip.rank}
                  clip={clip}
                  accountType={accountType}
                  isSelected={selectedClip?.rank === clip.rank}
                  onSelect={() => handleSelectClip(clip)}
                />
              ))}
            </div>

            {/* Render panel */}
            {selectedClip && (
              <div ref={renderRef} className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`text-xs font-bold uppercase tracking-widest ${accentText}`}>
                    Clip #{selectedClip.rank} selected
                  </div>
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                </div>
                <VideoProcessor clip={selectedClip} accountType={accountType} />
              </div>
            )}

            {/* New session footer */}
            <div className="mt-10 text-center">
              <button
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-300 transition-colors"
              >
                ← Start a new session
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
