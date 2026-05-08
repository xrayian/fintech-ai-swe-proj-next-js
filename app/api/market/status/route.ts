export async function GET() {
  const checkFinnhub = async (): Promise<boolean> => {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${process.env.FINNHUB_API_KEY}`,
        { signal: AbortSignal.timeout(5000) }
      );
      return res.ok;
    } catch { return false; }
  };

  if (await checkFinnhub()) return Response.json({ online: true, source: 'finnhub' });
  return Response.json({ online: false, source: null });
}
