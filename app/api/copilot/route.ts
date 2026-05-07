import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { extractEntities, buildContext } from '@/lib/copilot-context';

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

  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
  const entities = extractEntities(lastUserMsg?.content || '');
  const context = buildContext(entities);

  const contents = messages.map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents,
    config: {
      systemInstruction: context,
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
