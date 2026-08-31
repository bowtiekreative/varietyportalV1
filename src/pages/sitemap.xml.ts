import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

/** Indexable routes only. Result pages and the booking confirmation are noindex. */
const ROUTES: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/scan', priority: '0.9', changefreq: 'monthly' },
  { path: '/assessment', priority: '0.9', changefreq: 'monthly' },
  { path: '/216-path-method', priority: '0.8', changefreq: 'monthly' },
  { path: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
  { path: '/problems-we-route', priority: '0.8', changefreq: 'monthly' },
  { path: '/sample-decision-brief', priority: '0.7', changefreq: 'monthly' },
  { path: '/affiliated-companies', priority: '0.7', changefreq: 'monthly' },
  { path: '/book', priority: '0.6', changefreq: 'monthly' },
  { path: '/disclosure', priority: '0.4', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (r) => `  <url>
    <loc>${new URL(r.path, SITE.url).href}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
