import { NextRequest } from 'next/server';

const SUPPORT_CONTEXT = `You are the NEXUS Dashboard Assistant, a helpful AI guide for a premium fintech analytics platform.
Your goal is to assist users with dashboard navigation, market data lookups, and analysis tools.
Actual features include:
1. Search: Find 500+ US stocks.
2. Compare: Side-by-side stock analysis.
3. Technical: RSI, SMA, and Bollinger Bands charts.
4. Copilot: AI-powered fundamental analysis chat.
5. News: Real-time market sentiment and feed.
6. Settings: Watchlist management and API status.

If a user asks about trading, deposits, wallets, or Bangladeshi stocks, clarify that NEXUS is an analytics and research dashboard, not a brokerage or trading app.
I can help with dashboard features, stock lookup, comparison, and technical analysis.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    if (!messages?.length) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400 });
    }

    const pollinationsMessages = [
      { role: "system", content: SUPPORT_CONTEXT },
      ...messages.map((m: any) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text
      }))
    ];

    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: pollinationsMessages, model: "openai" })
    });

    if (!res.ok) throw new Error('API Error');
    const text = await res.text();

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch AI' }), { status: 500 });
  }
}
