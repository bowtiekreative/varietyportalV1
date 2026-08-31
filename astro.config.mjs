// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

const site = process.env.PUBLIC_SITE_URL || 'https://varietyportal.com';

/**
 * Hosts this app will trust in the Host / X-Forwarded-Host headers.
 *
 * This is NOT optional. Astro derives `Astro.url` from these; with an empty
 * list it falls back to `localhost`, and the built-in CSRF check then rejects
 * every form POST from the real domain with a 403. Traefik terminates TLS and
 * forwards the true host, so both the apex and www must be listed here.
 */
const hosts = new Set(['varietyportal.com', 'www.varietyportal.com', 'localhost', '127.0.0.1']);
try {
  hosts.add(new URL(site).hostname);
} catch { /* keep the defaults if PUBLIC_SITE_URL is malformed */ }
for (const h of (process.env.ALLOWED_HOSTS || '').split(',')) {
  const trimmed = h.trim();
  if (trimmed) hosts.add(trimmed);
}

export default defineConfig({
  site,
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  server: { port: Number(process.env.PORT) || 4321, host: true },
  security: {
    checkOrigin: true,
    // Protocol and port are intentionally unconstrained: matching is by host.
    allowedDomains: [...hosts].map((hostname) => ({ hostname })),
  },
  vite: {
    build: { cssCodeSplit: false },
  },
});
