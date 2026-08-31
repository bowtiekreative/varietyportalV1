import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /

# Result pages are per-visitor and carry noindex; keep them crawlable so the
# directive is actually read (rule seo.robots-noindex).
Disallow:

Sitemap: ${new URL('/sitemap.xml', SITE.url).href}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
