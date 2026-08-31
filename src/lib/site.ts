/** Canonical site configuration. Never invent a business fact here (seo.invented-facts). */

export const SITE = {
  name: 'Variety Portal',
  /** Header contract: first word in ink, second word in accent. */
  nameParts: ['VARIETY', 'PORTAL'] as const,
  domain: 'varietyportal.com',
  url: import.meta.env.PUBLIC_SITE_URL || 'https://varietyportal.com',
  tagline: 'One Problem. 216 Possible Paths. One Recommended Next Move.',
  category: 'Business Problem Routing',
  mechanism: 'The Variety Routing Protocol™',
  /** Contact — set from environment so nothing is invented at build time. */
  contactEmail: import.meta.env.PUBLIC_CONTACT_EMAIL || 'hello@varietyportal.com',
  /** External scheduler (Cal.com / Calendly / etc). When unset the on-site
   *  booking request form is used instead — we never link to a URL we cannot verify. */
  bookingUrl: import.meta.env.PUBLIC_BOOKING_URL || '',
  studio: {
    name: 'Bow Tie Kreative',
    url: 'https://bowtiekreative.com',
  },
} as const;

/** Canonical brand assets — rule brand.seal-asset. Never a custom mark. */
export const BRAND = {
  sealDark: 'https://designsystem.bowtiekreative.com/brand/btk-seal-white.png',
  sealLight: 'https://designsystem.bowtiekreative.com/brand/btk-seal.png',
  shield: 'https://designsystem.bowtiekreative.com/brand/btk-shield-white.png',
  favicon16: 'https://designsystem.bowtiekreative.com/brand/favicon-16.png',
  favicon32: 'https://designsystem.bowtiekreative.com/brand/favicon-32.png',
  favicon48: 'https://designsystem.bowtiekreative.com/brand/favicon-48.png',
  appleTouch: 'https://designsystem.bowtiekreative.com/brand/apple-touch-icon-180.png',
  icon192: 'https://designsystem.bowtiekreative.com/brand/icon-192.png',
  icon512: 'https://designsystem.bowtiekreative.com/brand/icon-512.png',
  maskable: 'https://designsystem.bowtiekreative.com/brand/maskable-512.png',
} as const;

/** The single header CTA. The contract permits exactly one. */
export const HEADER_CTA = { label: 'Route My Problem', href: '/scan' } as const;

/** Every destination lives in the mega menu — inline nav links are forbidden. */
export const MENU: { group: string; items: { label: string; href: string; note: string }[] }[] = [
  {
    group: 'The Method',
    items: [
      { label: 'How It Works', href: '/how-it-works', note: 'The seven stages of the Variety Routing Protocol' },
      { label: 'The 216-Path Method', href: '/216-path-method', note: '6 interrogatives × 6 modifiers × 6 scales' },
      { label: 'Problems We Route', href: '/problems-we-route', note: 'Symptoms, and the constraints hiding behind them' },
    ],
  },
  {
    group: 'Engagements',
    items: [
      { label: 'Problem Route Scan', href: '/scan', note: 'Free · about 5 minutes · no instant sales pitch' },
      { label: '216-Path Assessment', href: '/assessment', note: 'Human-reviewed diagnosis and recommended first move' },
      { label: 'Sample Decision Brief', href: '/sample-decision-brief', note: 'See the output before you commit' },
    ],
  },
  {
    group: 'The Portfolio',
    items: [
      { label: 'Affiliated Companies', href: '/affiliated-companies', note: 'Where the work gets routed, and how we disclose it' },
      { label: 'Relationship Disclosure', href: '/disclosure', note: 'Our standing statement on affiliation and referral' },
      { label: 'Book a Routing Consultation', href: '/book', note: 'Bring the problem, leave the preferred solution' },
    ],
  },
];
