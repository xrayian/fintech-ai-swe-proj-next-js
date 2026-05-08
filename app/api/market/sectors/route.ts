import { fetchSectors } from '@/lib/providers/orchestrator';

export async function GET() {
  try {
    const data = await fetchSectors();
    if (data.length) return Response.json(data);
    return Response.json({ error: "Sector data unavailable" }, { status: 503 });
  } catch {
    return Response.json({ error: "Sector data unavailable" }, { status: 503 });
  }
}
