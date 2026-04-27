import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClipOps — TikTok Clip Generator',
  description: 'Turn long-form video transcripts into viral TikTok clips with AI-powered analysis, scoring, and video rendering.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
