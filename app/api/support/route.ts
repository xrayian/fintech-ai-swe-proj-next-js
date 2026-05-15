import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const SUPPORT_SYSTEM_PROMPT = `You are the NEXUS Assistant, a helpful AI guide for a premium fintech analytics dashboard called NEXUS.

Your role is to help users navigate the dashboard and understand its features. Be friendly, concise, and direct.

Available features:
1. **Dashboard** — Market KPIs (S&P 500, VIX, Fear & Greed), top movers, sector heatmap
2. **Search** — Look up 500+ US equities by symbol or company name
3. **Compare** — Side-by-side stock comparison with radar charts and fundamental metrics
4. **Technical** — RSI, SMA (20/50), and Bollinger Bands charts for any supported ticker
5. **AI Copilot** — AI-powered fundamental analysis with live data and investment scorecards
6. **News** — Real-time headlines with market sentiment (Fear & Greed scoring)
7. **Settings** — Manage your watchlist and check API key status

Important: NEXUS is an analytics and research dashboard, NOT a brokerage. We do not support trading, deposits, wallets, or fund transfers.

Rules:
- Be helpful and friendly, but concise.
- Use **bold** for feature names and key terms.
- If asked about something outside NEXUS's scope, politely clarify what we do.
- Keep responses under 150 words unless asked for detail.
- Do not make up features or capabilities.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = await request.json();
  if (!messages?.length) {
    return new Response(JSON.stringify({ error: 'No messages provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const contents = messages.map((m: any) => ({
    role: m.role === 'bot' ? 'model' : m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents,
    config: {
      systemInstruction: SUPPORT_SYSTEM_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        for await (const chunk of response) {
          const text = chunk.text;
          if (!text) continue;
          const payload = JSON.stringify({
            candidates: [{ content: { parts: [{ text }], role: 'model' } }],
          });
          controller.enqueue(enc.encode(`data: ${payload}\n\n`));
        }
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
