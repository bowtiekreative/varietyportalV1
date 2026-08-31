# Variety Portal

The business-problem diagnosis and routing funnel for **varietyportal.com**.

> One Problem. 216 Possible Paths. One Recommended Next Move.

Variety Portal is the neutral front door to Ryan Perez's portfolio. It does not
compete with the specialist companies — it qualifies, diagnoses, sequences and
routes work to them, or away from all of them when that is the honest answer.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro 5 (`output: 'static'` + Node adapter) | Marketing routes prerender to HTML for SEO; only the form handlers and result pages are server-rendered. No SPA shell for crawlers to miss. |
| Runtime | Node 22 | Single container, no separate API service. |
| Store | MongoDB 7 | Scans, bookings and nurture state. Stack-private — no Traefik route. |
| Cron | alpine + crond | Daily nurture send, defined in the compose file. |
| Email | Emailit v2 | Confirmations, internal alerts and the nurture sequence. |
| Design | [LAKA Design System](https://api.designsystem.bowtiekreative.com) v4.3 | Authority, not suggestion. `POST /v1/validate` returns **CLEAR** on all three gates. |

## Routes

| Path | Rendering | Purpose |
|---|---|---|
| `/` | static | Homepage — position, protocol, symptoms, offers, FAQ |
| `/how-it-works` | static | The seven stages of the Variety Routing Protocol |
| `/216-path-method` | static | The 6×6×6 grid, its axes, and worked readings |
| `/problems-we-route` | static | Symptoms and the constraints behind them |
| `/assessment` | static | 216-Path Business Assessment sales page |
| `/sample-decision-brief` | static | Illustrative sample output (labelled as constructed) |
| `/affiliated-companies` | static | Full routing table with affiliation disclosed |
| `/disclosure`, `/privacy` | static | Trust and policy |
| `/scan` | **server** | Problem Route Scan — intake, validation, scoring |
| `/scan/route/[token]` | **server** | Preliminary route (noindex, per-visitor) |
| `/book` | **server** | Routing consultation request |
| `/api/health` | server | Liveness + database state |
| `/api/nurture` | server | Cron-driven nurture sender |
| `/api/unsubscribe` | server | One-click unsubscribe |

## How the funnel works

1. **Scan** — six steps, progressive enhancement. Without JavaScript it is one
   long form that submits normally; with JavaScript it becomes a stepper.
   Validation is always server-side.
2. **Score** — nine dimensions at 0–2 (max 18) in `src/lib/scoring.ts`.
3. **Tier and route are independent.** The score picks a tier (A/B/C); the
   symptom shape picks a route (evidence-gap / specialist / ambiguous / urgent /
   regulated). A well-qualified buyer can still have an evidence gap.
4. **Result page** shows the visitor their own score table — the qualification
   framework is disclosed, not hidden.
5. **Book a call** is the terminal action. There is no payment step.

### Deliberate constraints

- **Tier C and evidence-gap routes show no providers.** Putting a vendor beside
  "do not buy a large solution yet" would contradict the advice.
- **Regulated matters** (detected from `cost=legal` or a keyword scan of the
  free text) route to a licensed professional and never to a provider.
- **Nurture is opt-in only.** An unchecked box means no marketing sequence ever.

## Environment

Copy `.env.example`. Note which values are baked at **build** time:

| Variable | When | Notes |
|---|---|---|
| `PUBLIC_SITE_URL` | build | Inlined into the bundle. Changing it needs a rebuild. |
| `PUBLIC_GA_MEASUREMENT_ID` | build | Must match `G-XXXXXX`. **Blank loads no tag at all** — never invent one. |
| `PUBLIC_CONTACT_EMAIL`, `PUBLIC_BOOKING_URL` | build | Blank booking URL = the on-site request form is used. |
| `ALLOWED_HOSTS` | build | Extra hostnames to trust. See the warning below. |
| `MONGO_URL`, `MONGO_DB` | runtime | |
| `EMAILIT_API_KEY`, `EMAIL_FROM`, `EMAIL_INTERNAL_TO` | runtime | |
| `CRON_SECRET` | runtime | Without it `/api/nurture` refuses to run. |

### ⚠️ `security.allowedDomains` is load-bearing

Astro derives `Astro.url` from a validated Host header. With an empty
`allowedDomains` it falls back to `localhost`, and the built-in CSRF check then
**403s every form POST from the real domain**. `astro.config.mjs` lists
`varietyportal.com` and `www.varietyportal.com` explicitly. Adding a new domain
means adding it there (or via `ALLOWED_HOSTS`) and rebuilding.

### ⚠️ Emailit sending domain

`varietyportal.com` is **not** a verified Emailit sending domain.
`bowtiekreative.com` is (SPF + DKIM ok). `EMAIL_FROM` therefore uses
`routing@bowtiekreative.com`. To send as `@varietyportal.com`, add and verify
the domain in Emailit first, then change the variable.

## The nurture cron

A `vp-cron` service in the compose stack calls the sender daily at 14:00 UTC.
The schedule lives in `docker-compose.yml` rather than the Dokploy UI so it is
versioned with the code it drives.

To run it by hand, `POST /api/nurture` sends whatever is due, one email per
contact per run.

```bash
curl -X POST https://varietyportal.com/api/nurture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRON_SECRET"
```

The `Content-Type: application/json` header is **required** — without a
content-type Astro's CSRF middleware rejects the request as a cross-site form
post. Run it daily.

## Local development

```bash
npm install
docker run -d --name vp-mongo -p 27017:27017 mongo:7
MONGO_URL=mongodb://127.0.0.1:27017 npm run dev
```

## Deployment

Dokploy compose stack, project **Variety Portal**. Service names are
stack-prefixed (`vp-web`, `vp-mongo`) because Dokploy's shared
`dokploy-network` assigns a network alias equal to the compose service name —
a bare `web` or `backend` collides with other stacks on the same host.
`vp-mongo` stays on the stack-private `default` network only.

## Design system

Run before any visual change:

```bash
curl https://api.designsystem.bowtiekreative.com/v1/rules
curl "https://api.designsystem.bowtiekreative.com/v1/contrast?foreground=%23XXXXXX&background=%2307090D&font_size_px=16"
```

The rule set grows over time — re-resolve rather than trusting this README.
Accent `#3F6EE9` is 4.38:1 on canvas and is **never** used for text below 24px
normal / 18.66px bold. Text on accent is `#FFFFFF`, never `#F5F7FA`.

## Known audit findings

`POST /v1/audit/site` reports two categories that are not defects in this repo:

- **`design-system.asset-unversioned` (block, ×11).** The audit wants shared CSS
  at a content-hashed immutable URL. The design system publishes `laka.css` at
  an unversioned path with only an etag, so a hashed URL has to come from that
  CDN. Removing the embed to clear it just re-triggers
  `design-system.shared-css-missing`, which is also blocking — the two rules
  cannot both be satisfied from here.
- **`analytics.missing` / `analytics.form-events` (warn).** Deliberate: no GA4
  property has been supplied, and inventing a measurement id would violate
  `seo.invented-facts`. Set `PUBLIC_GA_MEASUREMENT_ID` to a real `G-XXXXXXX`
  and rebuild; the consent-gated tag and the named funnel events are already
  wired and clear both findings.

`POST /v1/validate` returns **CLEAR** on all three gates.
