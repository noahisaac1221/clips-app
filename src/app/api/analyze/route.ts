import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { buildAnalysisPrompt } from '@/lib/prompts'
import type { AnalyzeRequest } from '@/lib/types'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Add it in your Cloudflare Pages environment variables.' },
      { status: 500 }
    )
  }

  let body: AnalyzeRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { account_type, transcript, video_title } = body

  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 })
  }
  if (account_type !== 'male_motivation' && account_type !== 'female_nostalgia') {
    return NextResponse.json({ error: 'account_type must be male_motivation or female_nostalgia' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey })
  const prompt = buildAnalysisPrompt(account_type, transcript, video_title ?? '')

  let rawText: string
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    })

    const block = message.content[0]
    if (block.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type from Claude' }, { status: 500 })
    }
    rawText = block.text
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Claude API error'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  // Extract JSON — Claude may wrap in ```json fences
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonString = fenceMatch ? fenceMatch[1] : rawText.match(/\{[\s\S]*\}/)?.[0]

  if (!jsonString) {
    return NextResponse.json(
      { error: 'Could not parse JSON from Claude response', raw: rawText.slice(0, 500) },
      { status: 500 }
    )
  }

  try {
    const result = JSON.parse(jsonString)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Malformed JSON from Claude', raw: jsonString.slice(0, 500) },
      { status: 500 }
    )
  }
}
