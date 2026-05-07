export async function GET() {
  const fhKey = process.env.FINNHUB_API_KEY;
  if (!fhKey) {
    return Response.json({ online: false, source: null });
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${fhKey}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      return Response.json({ online: true, source: 'finnhub' });
    }
    if (res.status === 429) {
      const avKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (avKey) {
        const avRes = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${avKey}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (avRes.ok) {
          const body = await avRes.json();
          if (body?.['Global Quote']?.['05. price']) {
            return Response.json({ online: true, source: 'alpha-vantage' });
          }
        }
      }
    }
    return Response.json({ online: false, source: null });
  } catch {
    return Response.json({ online: false, source: null });
  }
}
