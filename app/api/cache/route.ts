import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  try {
    const candleDir = path.join(process.cwd(), 'data', 'candles');
    let cleared = 0;

    if (fs.existsSync(candleDir)) {
      const files = fs.readdirSync(candleDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(candleDir, file));
          cleared++;
        }
      }
    }

    return Response.json({ ok: true, cleared });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
