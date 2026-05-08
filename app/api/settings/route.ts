export async function GET() {
  return Response.json({
    finnhub: !!process.env.FINNHUB_API_KEY,
    finnhub2: !!process.env.FINNHUB_API_KEY_2,
    alphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY,
    alphaVantage2: !!process.env.ALPHA_VANTAGE_API_KEY_2,
    alphaVantage3: !!process.env.ALPHA_VANTAGE_API_KEY_3,
    alphaVantage4: !!process.env.ALPHA_VANTAGE_API_KEY_4,
    gemini: !!process.env.GEMINI_API_KEY,
  });
}
