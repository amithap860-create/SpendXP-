/**
 * POST /api/chat
 *
 * Connects to the SpendXP Fin Educator assistant via OpenAI Assistants API.
 * The assistant has a vector store with financial education content attached.
 *
 * ENV VARS (add to Vercel → Settings → Environment Variables):
 *   OPENAI_API_KEY   — from your Inspirit AI dashboard
 *   ASSISTANT_ID     — asst_7eC7qPZz0xusBLL9wuCxEweC
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Vercel timeout — assistant runs can take a few seconds

export async function POST(req: NextRequest) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.ASSISTANT_ID || 'asst_7eC7qPZz0xusBLL9wuCxEweC';

  if (!openaiKey) {
    return NextResponse.json(
      { error: 'AI Educator is not configured yet. Check back soon!' },
      { status: 503 }
    );
  }

  let body: { message?: string; threadId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { message, threadId } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // Limit message length to prevent abuse
  if (message.length > 1000) {
    return NextResponse.json({ error: 'Message too long (max 1000 characters)' }, { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${openaiKey}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2',
  };

  try {
    // ── Step 1: Create or reuse a thread ─────────────────────────────────────
    let activeThreadId = threadId;
    if (!activeThreadId) {
      const threadRes = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      if (!threadRes.ok) {
        const err = await threadRes.json();
        console.error('[Chat API] Thread creation failed:', err);
        return NextResponse.json({ error: 'Could not start conversation' }, { status: 500 });
      }
      const thread = await threadRes.json();
      activeThreadId = thread.id;
    }

    // ── Step 2: Add user message to thread ────────────────────────────────────
    const msgRes = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ role: 'user', content: message.trim() }),
    });
    if (!msgRes.ok) {
      console.error('[Chat API] Message add failed:', await msgRes.json());
      return NextResponse.json({ error: 'Could not send message' }, { status: 500 });
    }

    // ── Step 3: Run the assistant and poll until complete ─────────────────────
    const runRes = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        assistant_id: assistantId,
        // Optional: override system instructions for SpendXP context
        additional_instructions:
          'You are the SpendXP Fin Educator — a friendly, clear, and encouraging financial literacy guide for people aged 8–25. Keep answers concise, practical, and jargon-free. Use examples relevant to everyday life. Avoid being preachy. If a question is off-topic, gently redirect to financial topics.',
      }),
    });
    if (!runRes.ok) {
      console.error('[Chat API] Run creation failed:', await runRes.json());
      return NextResponse.json({ error: 'AI run failed' }, { status: 500 });
    }
    const run = await runRes.json();
    const runId = run.id;

    // ── Poll for completion (max 25s to stay within Vercel timeout) ───────────
    let status = run.status;
    let elapsed = 0;
    while (status !== 'completed' && status !== 'failed' && status !== 'cancelled' && elapsed < 25000) {
      await new Promise(r => setTimeout(r, 800));
      elapsed += 800;
      const pollRes = await fetch(
        `https://api.openai.com/v1/threads/${activeThreadId}/runs/${runId}`,
        { headers }
      );
      if (!pollRes.ok) break;
      const pollData = await pollRes.json();
      status = pollData.status;
    }

    if (status !== 'completed') {
      return NextResponse.json(
        { error: 'The AI took too long to respond. Please try again.' },
        { status: 504 }
      );
    }

    // ── Step 4: Retrieve the assistant's reply ────────────────────────────────
    const messagesRes = await fetch(
      `https://api.openai.com/v1/threads/${activeThreadId}/messages?limit=1&order=desc`,
      { headers }
    );
    if (!messagesRes.ok) {
      return NextResponse.json({ error: 'Could not retrieve response' }, { status: 500 });
    }
    const messagesData = await messagesRes.json();
    const reply: string =
      messagesData.data?.[0]?.content?.[0]?.text?.value || 'Sorry, I could not generate a response.';

    return NextResponse.json({ reply, threadId: activeThreadId });
  } catch (err) {
    console.error('[Chat API] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
