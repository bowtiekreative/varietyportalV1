import { defineMiddleware } from 'astro:middleware';

/**
 * Security response headers.
 *
 * The CSP is written to match what this site actually loads, not to look
 * strict: brand assets come from the design-system CDN, and GA4 (when a
 * measurement id is configured) needs googletagmanager plus an analytics
 * connect target. 'unsafe-inline' is required for scripts because Astro emits
 * inline module bootstrapping and the consent defaults must run before the tag.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: https://designsystem.bowtiekreative.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline' https://designsystem.bowtiekreative.com",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();

  // Only decorate documents and manifests; leave asset responses alone.
  const type = response.headers.get('content-type') ?? '';
  const isDocument = type.includes('text/html');

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  );

  if (isDocument) {
    response.headers.set('Content-Security-Policy', CSP);
    response.headers.set('X-Frame-Options', 'DENY');
  }

  return response;
});
