import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const db = await getDb();
  let dbState: 'connected' | 'unconfigured' | 'error' = 'unconfigured';
  if (process.env.MONGO_URL) {
    dbState = db ? 'connected' : 'error';
  }
  return new Response(JSON.stringify({ status: 'ok', db: dbState, ts: new Date().toISOString() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};
