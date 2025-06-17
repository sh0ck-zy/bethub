
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      // Send initial data or a heartbeat
      controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'));

      // Set up a dummy interval to send snapshots every 15 seconds
      // TODO (backend): Replace with actual Supabase Realtime subscription
      let counter = 0;
      const intervalId = setInterval(() => {
        counter++;
        const dummySnapshot = {
          matchId: id,
          snapshotTs: new Date().toISOString(),
          status: counter % 2 === 0 ? "LIVE" : "PRE",
          aiInsights: [{ id: "dummy", content: `Dummy insight ${counter}`, confidence: Math.random() }],
          stats: { dummyStat: counter },
        };
        controller.enqueue(encoder.encode(`event: analysis\ndata: ${JSON.stringify(dummySnapshot)}\n\n`));
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}


