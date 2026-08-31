import type { APIRoute } from 'astro';
import { scans } from '../../lib/db';
import { SEQUENCE, nextDelayDays } from '../../lib/nurture';
import { sendNurture } from '../../lib/email';
import { SITE } from '../../lib/site';

export const prerender = false;

/**
 * Cron-driven sender. Processes every enrolled scan whose next email is due.
 * Protected by CRON_SECRET; without it configured the endpoint refuses to run
 * rather than defaulting open.
 */
export const POST: APIRoute = async ({ request }) => {
  const secret = process.env.CRON_SECRET || '';
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';

  if (!secret) {
    return json({ error: 'CRON_SECRET is not configured' }, 503);
  }
  if (provided !== secret) {
    return json({ error: 'unauthorized' }, 401);
  }

  const col = await scans();
  if (!col) return json({ error: 'database unavailable' }, 503);

  const now = new Date();
  const due = await col
    .find({ 'nurture.enrolled': true, 'nurture.unsubscribed': { $ne: true }, 'nurture.nextAt': { $lte: now } })
    .limit(100)
    .toArray();

  let sent = 0;
  let finished = 0;
  const failures: string[] = [];

  for (const record of due) {
    const n = (record as any).nurture ?? {};
    const step = (n.step ?? 0) + 1;
    const email = SEQUENCE.find((e) => e.step === step);

    if (!email) {
      await col.updateOne({ token: record.token }, { $set: { 'nurture.completedAt': now, 'nurture.nextAt': null } });
      finished++;
      continue;
    }

    const result = await sendNurture({
      to: record.answers.email!,
      firstName: (record.answers.name ?? '').split(/\s+/)[0] || 'there',
      email,
      unsubscribeUrl: new URL(`/api/unsubscribe?token=${record.token}`, SITE.url).href,
    });

    if (!result.ok) {
      failures.push(`${record.token}:${result.error ?? 'unknown'}`);
      // Retry in a day rather than dropping the contact out of the sequence.
      await col.updateOne(
        { token: record.token },
        { $set: { 'nurture.nextAt': new Date(now.getTime() + 86_400_000) } },
      );
      continue;
    }

    const gap = nextDelayDays(step);
    await col.updateOne(
      { token: record.token },
      {
        $set: {
          'nurture.step': step,
          'nurture.lastSentAt': now,
          'nurture.nextAt': gap === null ? null : new Date(now.getTime() + gap * 86_400_000),
          ...(gap === null ? { 'nurture.completedAt': now } : {}),
        },
      },
    );
    sent++;
  }

  return json({ due: due.length, sent, finished, failures });
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
