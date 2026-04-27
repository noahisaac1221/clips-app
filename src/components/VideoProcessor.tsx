'use client'

import { useState, useRef, useEffect } from 'react'
import type { ClipCandidate, AccountType } from '@/lib/types'

interface Props {
  clip: ClipCandidate
  accountType: AccountType
}

type RenderMode = 'trim' | 'vertical'
type Stage = 'idle' | 'loading-ffmpeg' | 'rendering' | 'done' | 'error'

function timeToSeconds(t: string): number {
  const parts = t.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return 0
}

export default function VideoProcessor({ clip, accountType }: Props) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [renderMode, setRenderMode] = useState<RenderMode>('vertical')
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const ffmpegRef = useRef<import('@ffmpeg/ffmpeg').FFmpeg | null>(null)

  const accent = accountType === 'male_motivation' ? 'blue' : 'purple'
  const btnBase = accent === 'blue'
    ? 'bg-blue-500 hover:bg-blue-600'
    : 'bg-purple-500 hover:bg-purple-600'

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl)
    }
  }, [outputUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setVideoFile(f)
      setOutputUrl(null)
      setStage('idle')
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f?.type.startsWith('video/')) {
      setVideoFile(f)
      setOutputUrl(null)
      setStage('idle')
      setError(null)
    }
  }

  const render = async () => {
    if (!videoFile) return
    setStage('loading-ffmpeg')
    setProgress(0)
    setError(null)
    setOutputUrl(null)

    try {
      // Dynamically import to avoid SSR issues
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util')

      if (!ffmpegRef.current) {
        ffmpegRef.current = new FFmpeg()
      }
      const ffmpeg = ffmpegRef.current

      if (!ffmpeg.loaded) {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
      }

      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(Math.round(p * 100))
      })

      setStage('rendering')
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))

      const startSec = timeToSeconds(clip.start_time)
      const endSec = timeToSeconds(clip.end_time)
      const duration = endSec - startSec

      let args: string[]

      if (renderMode === 'trim') {
        args = [
          '-ss', String(startSec),
          '-t', String(duration),
          '-i', 'input.mp4',
          '-c', 'copy',
          'output.mp4',
        ]
      } else {
        // 9:16 vertical with blurred bars
        args = [
          '-ss', String(startSec),
          '-t', String(duration),
          '-i', 'input.mp4',
          '-filter_complex',
          '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=luma_radius=40:luma_power=3:chroma_radius=40:chroma_power=3[bg];' +
          '[0:v]scale=1080:-2:force_original_aspect_ratio=decrease[fg];' +
          '[bg][fg]overlay=(W-w)/2:(H-h)/2[out]',
          '-map', '[out]',
          '-map', '0:a?',
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-c:a', 'aac',
          '-movflags', '+faststart',
          'output.mp4',
        ]
      }

      await ffmpeg.exec(args)

      const data = await ffmpeg.readFile('output.mp4')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = new Blob([data as any], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      setOutputUrl(url)
      setStage('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Render failed')
      setStage('error')
    }
  }

  const downloadName = `clipops_${clip.start_time.replace(/:/g, '-')}_${clip.end_time.replace(/:/g, '-')}.mp4`

  return (
    <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-5">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Render Clip
      </h3>

      {/* Video upload zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !videoFile && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors mb-4 ${
          videoFile
            ? 'border-[#3a3a3a] bg-[#141414]'
            : 'border-[#2a2a2a] hover:border-[#3a3a3a] cursor-pointer'
        }`}
      >
        {videoFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-200 truncate max-w-xs">{videoFile.name}</div>
                <div className="text-xs text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</div>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setVideoFile(null); setOutputUrl(null); setStage('idle') }}
              className="text-gray-600 hover:text-gray-400 text-lg"
            >
              ✕
            </button>
          </div>
        ) : (
          <div>
            <div className="text-3xl mb-2">📁</div>
            <p className="text-sm text-gray-400 mb-1">Drop your video file here</p>
            <p className="text-xs text-gray-600">or click to browse · MP4, MOV, MKV</p>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" />

      {/* Render mode selector */}
      <div className="flex gap-2 mb-4">
        {(['vertical', 'trim'] as RenderMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setRenderMode(mode)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
              renderMode === mode
                ? accent === 'blue'
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-purple-500/20 border-purple-400/40 text-purple-400'
                : 'border-[#2a2a2a] text-gray-500 hover:text-gray-300'
            }`}
          >
            {mode === 'vertical' ? '📱 9:16 Vertical (TikTok)' : '✂️ Trim only'}
          </button>
        ))}
      </div>

      {/* Clip info */}
      <div className="bg-[#141414] rounded-lg px-3 py-2.5 mb-4 text-xs text-gray-400 flex items-center justify-between">
        <span>Clip window</span>
        <span className="font-mono font-semibold text-gray-200">
          {clip.start_time} → {clip.end_time}
        </span>
      </div>

      {/* Progress bar */}
      {(stage === 'loading-ffmpeg' || stage === 'rendering') && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{stage === 'loading-ffmpeg' ? 'Loading video engine…' : `Rendering… ${progress}%`}</span>
          </div>
          <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${accent === 'blue' ? 'bg-blue-500' : 'bg-purple-400'} ${stage === 'loading-ffmpeg' ? 'pulse-glow w-full' : ''}`}
              style={stage === 'rendering' ? { width: `${progress}%` } : undefined}
            />
          </div>
          {stage === 'rendering' && progress < 5 && (
            <p className="text-xs text-gray-600 mt-1.5">
              Large files can take a few minutes — this runs entirely in your browser.
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {stage === 'error' && error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Render button */}
      {stage !== 'done' && (
        <button
          onClick={render}
          disabled={!videoFile || stage === 'loading-ffmpeg' || stage === 'rendering'}
          className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${btnBase}`}
        >
          {stage === 'loading-ffmpeg' ? 'Loading engine…'
            : stage === 'rendering' ? `Rendering… ${progress}%`
            : 'Render clip'}
        </button>
      )}

      {/* Download */}
      {stage === 'done' && outputUrl && (
        <div className="space-y-3">
          <video
            src={outputUrl}
            controls
            className="w-full rounded-xl border border-[#2a2a2a] max-h-72 object-contain bg-black"
          />
          <a
            href={outputUrl}
            download={downloadName}
            className={`block w-full py-3 rounded-xl text-sm font-semibold text-white text-center transition-all ${btnBase}`}
          >
            ⬇ Download rendered clip
          </a>
          <button
            onClick={() => { setStage('idle'); setOutputUrl(null) }}
            className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Render again
          </button>
        </div>
      )}
    </div>
  )
}
