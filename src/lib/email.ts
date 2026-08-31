/**
 * Transactional email via the Emailit v2 API.
 * Credentials come from the environment only (rule analytics.no-secrets).
 * A failed send is logged and swallowed: losing the email must never lose
 * the submission the visitor already made.
 */

const API_URL = (process.env.EMAILIT_URL || 'https://api.emailit.com/v2/').replace(/\/$/, '');
const API_KEY = process.env.EMAILIT_API_KEY || '';
const FROM = process.env.EMAIL_FROM || '';
const INTERNAL_TO = process.env.EMAIL_INTERNAL_TO || '';

export type SendResult = { ok: boolean; error?: string };

async function send(to: string, subject: string, text: string, html: string): Promise<SendResult> {
  if (!API_KEY || !FROM) {
    console.warn('[email] not configured — skipping send to', to);
    return { ok: false, error: 'not-configured' };
  }
  try {
    const res = await fetch(`${API_URL}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      // Emailit v2 takes `to` as an array of recipients.
      body: JSON.stringify({ from: FROM, to: [to], subject, text, html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[email] send failed', res.status, body.slice(0, 400));
      return { ok: false, error: `http-${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error('[email] send threw:', (err as Error).message);
    return { ok: false, error: 'exception' };
  }
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(heading: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#07090D;padding:32px 16px;font-family:Inter,Helvetica,Arial,sans-serif;color:#C5C7CE;line-height:1.7">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px" cellpadding="0" cellspacing="0"><tr><td
  style="background:#0B0E14;border:1px solid rgba(245,247,250,0.15);border-radius:16px;padding:32px">
  <p style="margin:0 0 24px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(245,247,250,0.55)">Variety Portal</p>
  <h1 style="margin:0 0 20px;color:#F5F7FA;font-size:24px;line-height:1.25;letter-spacing:-0.02em">${esc(heading)}</h1>
  ${bodyHtml}
</td></tr>
<tr><td style="padding:24px 8px;font-size:12px;color:rgba(245,247,250,0.55)">
  Variety Portal — business problem routing.<br>
  Powered by <a href="https://bowtiekreative.com" style="color:#8AA6F2">Bow Tie Kreative</a>.
</td></tr></table></td></tr></table></body></html>`;
}

/** Confirmation to the person who submitted the scan. */
export function sendScanConfirmation(opts: {
  to: string;
  firstName: string;
  company: string;
  routeNextStep: string;
  resultUrl: string;
}): Promise<SendResult> {
  const text = `Hi ${opts.firstName},

We received the Problem Route Scan for ${opts.company}.

We will review the symptom, prior attempts, cost of waiting, urgency and decision readiness before recommending the next diagnostic route.

${opts.routeNextStep}

Your preliminary route: ${opts.resultUrl}

If an affiliated company is recommended, the relationship will be disclosed.

— Variety Portal`;

  const html = wrap('We received your problem route', `
  <p style="margin:0 0 16px">Hi ${esc(opts.firstName)},</p>
  <p style="margin:0 0 16px">We received the Problem Route Scan for <strong style="color:#F5F7FA">${esc(opts.company)}</strong>.</p>
  <p style="margin:0 0 16px">We will review the symptom, prior attempts, cost of waiting, urgency and decision readiness before recommending the next diagnostic route.</p>
  <p style="margin:0 0 24px;border-left:2px solid #3F6EE9;padding-left:16px">${esc(opts.routeNextStep)}</p>
  <p style="margin:0 0 28px">
    <a href="${esc(opts.resultUrl)}" style="display:inline-block;background:#3F6EE9;color:#FFFFFF;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:600">View your preliminary route</a>
  </p>
  <p style="margin:0;font-size:14px;color:rgba(245,247,250,0.55)">If an affiliated company is recommended, the relationship will be disclosed before any engagement.</p>`);

  return send(opts.to, 'Variety Portal received your problem route', text, html);
}

/** Internal notification so a human can review before anything is sold. */
export function sendInternalScanAlert(opts: {
  tier: string;
  route: string;
  total: number;
  max: number;
  regulated: boolean;
  answers: Record<string, string>;
  resultUrl: string;
}): Promise<SendResult> {
  if (!INTERNAL_TO) return Promise.resolve({ ok: false, error: 'no-internal-recipient' });

  const rows = Object.entries(opts.answers)
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:rgba(245,247,250,0.55);vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#C5C7CE">${esc(String(v)).slice(0, 800)}</td></tr>`)
    .join('');

  const subject = `[Scan] Tier ${opts.tier} · ${opts.route}${opts.regulated ? ' · REGULATED' : ''} · ${opts.answers.company ?? 'unknown'}`;
  const text = `Tier ${opts.tier} — route ${opts.route} — score ${opts.total}/${opts.max}${opts.regulated ? ' — REGULATED MATTER' : ''}\n\n${Object.entries(opts.answers).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${opts.resultUrl}`;

  const html = wrap(`Tier ${opts.tier} scan — ${opts.route}`, `
  <p style="margin:0 0 20px">Score <strong style="color:#F5F7FA">${opts.total}/${opts.max}</strong>${opts.regulated ? ' · <strong style="color:#F0938C">Regulated matter — needs a licensed professional</strong>' : ''}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">${rows}</table>
  <p style="margin:24px 0 0"><a href="${esc(opts.resultUrl)}" style="color:#8AA6F2">Open the route the visitor saw</a></p>`);

  return send(INTERNAL_TO, subject, text, html);
}

/** Booking request — routed to a human, no calendar is auto-confirmed. */
export function sendBookingAlert(opts: {
  name: string; email: string; company: string; context: string; scanToken?: string;
}): Promise<SendResult> {
  if (!INTERNAL_TO) return Promise.resolve({ ok: false, error: 'no-internal-recipient' });
  const text = `Booking request\n\nName: ${opts.name}\nEmail: ${opts.email}\nCompany: ${opts.company}\nScan: ${opts.scanToken ?? '—'}\n\n${opts.context}`;
  const html = wrap('Routing consultation request', `
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">
    <tr><td style="padding:6px 12px 6px 0;color:rgba(245,247,250,0.55)">Name</td><td style="color:#C5C7CE">${esc(opts.name)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:rgba(245,247,250,0.55)">Email</td><td style="color:#C5C7CE">${esc(opts.email)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:rgba(245,247,250,0.55)">Company</td><td style="color:#C5C7CE">${esc(opts.company)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:rgba(245,247,250,0.55)">Scan</td><td style="color:#C5C7CE">${esc(opts.scanToken ?? '—')}</td></tr>
  </table>
  <p style="margin:20px 0 0;white-space:pre-wrap">${esc(opts.context)}</p>`);
  return send(INTERNAL_TO, `[Booking] ${opts.company} — ${opts.name}`, text, html);
}

export function sendBookingConfirmation(opts: { to: string; firstName: string }): Promise<SendResult> {
  const text = `Hi ${opts.firstName},

We received your request for a routing consultation. A person reviews every request — you will hear back with times, not an automated calendar loop.

Before we speak, have these ready: what changed, the result you expected, what happened instead, what has already been tried, any relevant data, who the decision-makers are, the cost of waiting, and your constraints on time, budget and implementation.

Please do not send passwords, confidential customer data, privileged legal documents or regulated personal information.

— Variety Portal`;
  const html = wrap('Your routing consultation request', `
  <p style="margin:0 0 16px">Hi ${esc(opts.firstName)},</p>
  <p style="margin:0 0 16px">We received your request. A person reviews every one — you will hear back with times, not an automated calendar loop.</p>
  <p style="margin:0 0 12px;color:#F5F7FA;font-weight:600">Before we speak, have these ready:</p>
  <ul style="margin:0 0 20px;padding-left:20px">
    <li>What changed</li><li>The result you expected</li><li>What happened instead</li>
    <li>What has already been tried</li><li>Relevant data</li><li>Decision-makers</li>
    <li>Cost of waiting</li><li>Constraints on time, budget and implementation</li>
  </ul>
  <p style="margin:0;font-size:14px;color:rgba(245,247,250,0.55)">Please do not send passwords, confidential customer data, privileged legal documents or regulated personal information.</p>`);
  return send(opts.to, 'Variety Portal — routing consultation request received', text, html);
}

/** One email from the opt-in nurture sequence. Always carries an unsubscribe link. */
export function sendNurture(opts: {
  to: string;
  firstName: string;
  email: { subject: string; preheader: string; paragraphs: string[]; ctaLabel: string; ctaPath: string };
  unsubscribeUrl: string;
}): Promise<SendResult> {
  const site = process.env.PUBLIC_SITE_URL || 'https://varietyportal.com';
  const ctaUrl = new URL(opts.email.ctaPath, site).href;

  const text = `Hi ${opts.firstName},

${opts.email.paragraphs.join('\n\n')}

${opts.email.ctaLabel}: ${ctaUrl}

—
Unsubscribe: ${opts.unsubscribeUrl}`;

  const body = opts.email.paragraphs
    .map((t) => `<p style="margin:0 0 16px">${esc(t)}</p>`)
    .join('');

  const html = wrap(opts.email.subject, `
  <p style="margin:0 0 16px">Hi ${esc(opts.firstName)},</p>
  ${body}
  <p style="margin:24px 0 28px">
    <a href="${esc(ctaUrl)}" style="display:inline-block;background:#3F6EE9;color:#FFFFFF;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:600">${esc(opts.email.ctaLabel)}</a>
  </p>
  <p style="margin:0;font-size:12px;color:rgba(245,247,250,0.55)">
    You asked for this series when you completed a Problem Route Scan.
    <a href="${esc(opts.unsubscribeUrl)}" style="color:#8AA6F2">Unsubscribe</a>.
  </p>`);

  return send(opts.to, opts.email.subject, text, html);
}
