import type { APIRoute } from 'astro';
import { scans, bookings } from '../../../lib/db';

export const prerender = false;

/**
 * Operator endpoint, shared-secret authenticated.
 *
 * GET    — list recent scans (contact, tier, route) for review.
 * DELETE — remove one scan or booking by token.
 *
 * Deletion is not a convenience: the privacy page commits to honouring
 * access and erasure requests, so there has to be a way to actually do it.
 * Send `Content-Type: application/json` — without a content-type Astro's CSRF
 * middleware rejects the request as a cross-site form post.
 */

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET || '';
  if (!secret) return false;
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  return provided === secret;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const GET: APIRoute = async ({ request, url }) => {
  if (!authorised(request)) return json({ error: 'unauthorized' }, 401);
  const col = await scans();
  if (!col) return json({ error: 'database unavailable' }, 503);

  const limit = Math.min(Number(url.searchParams.get('limit') ?? 25), 100);
  const rows = await col.find({}, { sort: { createdAt: -1 }, limit }).toArray();

  return json({
    count: rows.length,
    scans: rows.map((r) => ({
      token: r.token,
      createdAt: r.createdAt,
      company: r.answers.company,
      name: r.answers.name,
      email: r.answers.email,
      tier: r.assessment.tier,
      route: r.assessment.route,
      score: `${r.assessment.total}/${r.assessment.max}`,
      regulated: r.assessment.regulated,
      nurture: (r as any).nurture?.enrolled ?? false,
    })),
  });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  if (!authorised(request)) return json({ error: 'unauthorized' }, 401);

  const token = url.searchParams.get('token');
  if (!token) return json({ error: 'token query parameter is required' }, 400);

  const scanCol = await scans();
  const bookingCol = await bookings();
  if (!scanCol || !bookingCol) return json({ error: 'database unavailable' }, 503);

  const scanResult = await scanCol.deleteOne({ token });
  const bookingResult = await bookingCol.deleteMany({ $or: [{ token }, { scanToken: token }] });

  return json({
    token,
    scansDeleted: scanResult.deletedCount,
    bookingsDeleted: bookingResult.deletedCount,
  });
};
