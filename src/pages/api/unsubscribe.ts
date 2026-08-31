import type { APIRoute } from 'astro';
import { scans } from '../../lib/db';

export const prerender = false;

/** One-click unsubscribe from the nurture sequence. Never affects the scan record itself. */
export const GET: APIRoute = async ({ url }) => {
  const token = url.searchParams.get('token') ?? '';
  const col = await scans();
  if (token && col) {
    await col.updateOne(
      { token },
      { $set: { 'nurture.unsubscribed': true, 'nurture.unsubscribedAt': new Date(), 'nurture.nextAt': null } },
    );
  }

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Unsubscribed | Variety Portal</title><style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07090D;color:#C5C7CE;
font-family:Inter,system-ui,sans-serif;line-height:1.7;padding:24px}
.box{max-width:480px;background:#0B0E14;border:1px solid rgba(245,247,250,.15);border-radius:24px;padding:40px}
h1{color:#F5F7FA;font-size:26px;letter-spacing:-.03em;margin:0 0 16px;line-height:1.2}
p{margin:0 0 20px}a{color:#8AA6F2}
</style></head><body><div class="box">
<h1>You are unsubscribed.</h1>
<p>You will not receive further emails in the series. This does not affect your Problem Route Scan or any conversation already in progress.</p>
<p><a href="/">Return to Variety Portal</a></p>
</div></body></html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
