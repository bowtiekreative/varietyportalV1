/**
 * Qualification scoring and preliminary routing.
 *
 * Nine dimensions, 0–2 each (max 18), per the qualification framework.
 * The score selects a TIER; the symptom shape selects a ROUTE. They are
 * deliberately independent: a well-qualified buyer can still have an
 * evidence gap, and an unqualified buyer can still have a clear specialist need.
 */

import { AREA_TO_PROVIDERS, PROVIDERS } from './routes';

export type Answers = Record<string, string>;

export type Dimension = { id: string; label: string; score: 0 | 1 | 2; why: string };

export type Tier = 'A' | 'B' | 'C';
export type RouteId = 'regulated' | 'urgent' | 'evidence-gap' | 'specialist' | 'ambiguous';

export type Assessment = {
  dimensions: Dimension[];
  total: number;
  max: number;
  tier: Tier;
  route: RouteId;
  providerIds: string[];
  regulated: boolean;
};

const pick = <T,>(map: Record<string, T>, key: string, fallback: T): T =>
  Object.prototype.hasOwnProperty.call(map, key) ? map[key]! : fallback;

/* -- individual dimensions ------------------------------------------------- */

function costOfProblem(a: Answers): Dimension {
  const score = pick<0 | 1 | 2>(
    { 'lost-revenue': 2, 'customer-loss': 2, legal: 2, 'wasted-spend': 2, 'missed-timing': 1, fragility: 1, 'team-time': 1, burnout: 1, unknown: 0 },
    a.cost ?? '', 0,
  );
  return { id: 'cost', label: 'Cost of problem', score, why: score === 0 ? 'The cost of waiting is not yet quantified.' : 'The cost of waiting is material and named.' };
}

function urgency(a: Answers): Dimension {
  const score = pick<0 | 1 | 2>({ immediate: 2, '30': 2, '90': 1, year: 1, researching: 0 }, a.urgency ?? '', 0);
  return { id: 'urgency', label: 'Urgency', score, why: score === 0 ? 'No decision deadline is driving this.' : 'A decision window exists.' };
}

function authority(a: Answers): Dimension {
  const score = pick<0 | 1 | 2>({ 'i-decide': 2, shared: 2, board: 1, researcher: 0 }, a.authority ?? '', 0);
  return { id: 'authority', label: 'Decision authority', score, why: score === 0 ? 'The decision-maker is not in the conversation yet.' : 'A decision-maker is reachable.' };
}

function evidence(a: Answers): Dimension {
  // Weak measurement and "unknown" answers reduce the evidence available to diagnose with.
  let score: 0 | 1 | 2 = 2;
  if (a.outcome === 'unmeasured') score = 0;
  else if (a.symptom === 'unknown' || a.cost === 'unknown') score = 1;
  else if ((a.tried ?? '').trim().length < 60) score = 1;
  return { id: 'evidence', label: 'Evidence availability', score, why: score === 0 ? 'Measurement is too weak to tell what changed.' : score === 1 ? 'Some evidence exists but it is thin.' : 'There is enough history to reason from.' };
}

function complexity(a: Answers): Dimension {
  // Cross-functional problems are the ones the 216-path method is actually for.
  const crossSymptoms = ['unknown', 'conflicting', 'high-stakes', 'no-progress', 'key-person'];
  const score: 0 | 1 | 2 = a.area === 'multiple' || crossSymptoms.includes(a.symptom ?? '') ? 2 : a.symptom === 'workflow-fails' || a.symptom === 'ai-automation' ? 1 : 0;
  return { id: 'complexity', label: 'Cross-functional complexity', score, why: score === 2 ? 'The symptom spans more than one system.' : score === 1 ? 'The symptom touches process as well as output.' : 'The symptom appears contained to one area.' };
}

function priorAttempts(a: Answers): Dimension {
  const score = pick<0 | 1 | 2>({ nothing: 2, temporary: 2, conflicting: 2, tradeoff: 2, 'more-work': 1, stalled: 1, unmeasured: 1 }, a.outcome ?? '', 0);
  return { id: 'attempts', label: 'Prior failed attempts', score, why: score === 2 ? 'Previous solutions did not move the constraint — strong signal of misdiagnosis.' : 'Some attempts have been made.' };
}

function capacity(a: Answers): Dimension {
  const score: 0 | 1 | 2 = a.symptom === 'key-person' ? 1 : a.authority === 'researcher' ? 0 : a.investment === 'u500' ? 1 : 2;
  return { id: 'capacity', label: 'Implementation capacity', score, why: score === 0 ? 'It is unclear who would implement a recommendation.' : score === 1 ? 'Capacity to implement looks constrained.' : 'There is plausible capacity to act on a recommendation.' };
}

function investment(a: Answers): Dimension {
  const score = pick<0 | 1 | 2>({ u500: 0, '500-1499': 1, '1500-4999': 2, '5000-14999': 2, '15000': 2, 'diagnose-first': 1 }, a.investment ?? '', 0);
  return { id: 'investment', label: 'Investment readiness', score, why: score === 0 ? 'Budget is below the range a structured assessment occupies.' : score === 1 ? 'Budget is undecided or modest.' : 'Budget is consistent with a structured assessment.' };
}

function willingness(a: Answers): Dimension {
  // Someone who arrives already certain of the solution is the hardest to help.
  const openSignals = ['unknown', 'conflicting', 'high-stakes', 'no-progress'];
  const score: 0 | 1 | 2 = openSignals.includes(a.symptom ?? '') ? 2 : a.outcome === 'conflicting' || a.outcome === 'temporary' ? 2 : a.symptom === 'ai-automation' ? 1 : 1;
  return { id: 'willingness', label: 'Willingness to test assumptions', score, why: score === 2 ? 'The framing is open — they are asking what is wrong, not only what to buy.' : 'The framing arrives with a preferred solution attached.' };
}

/* -- regulated detection ---------------------------------------------------- */

const REGULATED_PATTERN =
  /\b(lawsuit|litigat\w*|attorney|solicitor|legal counsel|malpractice|patient|clinical|diagnos(is|e|ed) of|prescription|medical|HIPAA|PHI|securities|SEC filing|audit(ed)? financial|tax (return|filing|evasion)|CRA |IRS |insurance claim|OSHA|workplace safety|licensure|regulat(or|ory) (body|filing|action))\b/i;

function detectRegulated(a: Answers): boolean {
  if (a.cost === 'legal') return true;
  const free = [a.expected, a.happened, a.tried].filter(Boolean).join(' \n ');
  return REGULATED_PATTERN.test(free);
}

/* -- route selection -------------------------------------------------------- */

function selectRoute(a: Answers, dims: Dimension[], regulated: boolean): RouteId {
  if (regulated) return 'regulated';

  const by = (id: string) => dims.find((d) => d.id === id)?.score ?? 0;

  // The cost of waiting requires human review before any automated conclusion.
  if (a.urgency === 'immediate' && by('cost') === 2) return 'urgent';

  // No usable evidence — a new solution would be bought blind.
  if (by('evidence') === 0) return 'evidence-gap';

  // Several plausible causes across systems: this is what the assessment is for.
  if (by('complexity') === 2 || a.outcome === 'conflicting') return 'ambiguous';

  // Contained symptom, evidence present, one discipline clearly implicated.
  if (by('complexity') === 0 && by('evidence') === 2) return 'specialist';

  return 'ambiguous';
}

function selectProviders(a: Answers, route: RouteId, tier: Tier): string[] {
  // No provider is shown where the honest recommendation is "not yet": an
  // evidence gap, a regulated matter, or a Tier C education route. Showing a
  // vendor beside "do not buy a large solution yet" contradicts the advice.
  if (route === 'evidence-gap' || route === 'regulated' || tier === 'C') return [];
  const ids = AREA_TO_PROVIDERS[a.area ?? ''] ?? [];
  const valid = new Set(PROVIDERS.map((p) => p.id));
  return ids.filter((id) => valid.has(id)).slice(0, route === 'specialist' ? 2 : 3);
}

/* -- public API ------------------------------------------------------------- */

export function assess(a: Answers): Assessment {
  const dimensions = [
    costOfProblem(a), urgency(a), authority(a), evidence(a), complexity(a),
    priorAttempts(a), capacity(a), investment(a), willingness(a),
  ];
  const total = dimensions.reduce((n, d) => n + d.score, 0);
  const max = dimensions.length * 2;
  const regulated = detectRegulated(a);

  // Tier A additionally requires that the buyer can actually act: authority
  // and capacity, not merely a high aggregate.
  const authorityScore = dimensions.find((d) => d.id === 'authority')!.score;
  const capacityScore = dimensions.find((d) => d.id === 'capacity')!.score;
  const costScore = dimensions.find((d) => d.id === 'cost')!.score;

  let tier: Tier;
  if (total >= 13 && authorityScore >= 1 && capacityScore >= 1 && costScore >= 1) tier = 'A';
  else if (total >= 8) tier = 'B';
  else tier = 'C';

  const route = selectRoute(a, dimensions, regulated);
  return { dimensions, total, max, tier, route, providerIds: selectProviders(a, route, tier), regulated };
}

/* -- presentation copy for each preliminary route --------------------------- */

export const ROUTE_COPY: Record<RouteId, { eyebrow: string; heading: string; body: string; next: string }> = {
  'evidence-gap': {
    eyebrow: 'PRELIMINARY ROUTE · EVIDENCE',
    heading: 'You may need better evidence before a new solution.',
    body: 'Your answers indicate that measurement is currently too weak to prove what changed. Buying a solution now means you would not be able to tell whether it worked. The cheaper first move is a measurement, research or small-test step that produces evidence within weeks.',
    next: 'We will recommend the smallest measurement step that would make the next decision provable.',
  },
  specialist: {
    eyebrow: 'PRELIMINARY ROUTE · SPECIALIST',
    heading: 'Your problem appears ready for a specialist review.',
    body: 'The symptom is contained, the evidence exists and one discipline is clearly implicated. You may not need a full assessment — a direct specialist review is likely the efficient path.',
    next: 'We will confirm the discipline and introduce the appropriate provider, with any affiliation disclosed before engagement.',
  },
  ambiguous: {
    eyebrow: 'PRELIMINARY ROUTE · ASSESSMENT',
    heading: 'The symptom has multiple plausible causes.',
    body: 'Your answers point at more than one candidate constraint, across more than one system. This is the case the 216-Path Business Assessment exists for: expand the alternative explanations, eliminate the poor fits, and identify which single move should come first.',
    next: 'We will scope a 216-Path Business Assessment and confirm the decision question before any work begins.',
  },
  urgent: {
    eyebrow: 'PRELIMINARY ROUTE · PRIORITY REVIEW',
    heading: 'The cost of waiting requires human review.',
    body: 'You have named an immediate deadline alongside a material cost of waiting. We will not hand you an automated conclusion on a decision of that weight.',
    next: 'A person will review your scan and contact you to arrange a priority routing consultation.',
  },
  regulated: {
    eyebrow: 'PRELIMINARY ROUTE · QUALIFIED PROFESSIONAL',
    heading: 'Part of this needs a qualified licensed professional.',
    body: 'Your answers touch a legal, medical, financial, safety or otherwise regulated matter. Variety Portal can route the business-system aspects of your situation, but it does not substitute for regulated professional advice and will not attempt to.',
    next: 'A person will review which parts we can route and which require a licensed professional, and tell you plainly where the line falls.',
  },
};

export const TIER_COPY: Record<Tier, { eyebrow: string; heading: string; body: string; cta: string; href: string }> = {
  A: {
    eyebrow: 'YOUR PROBLEM IS READY FOR STRUCTURED DIAGNOSIS',
    heading: 'Let’s determine the first move before you fund the next solution.',
    body: 'Your answers indicate a meaningful problem, enough urgency and sufficient decision readiness for the 216-Path Business Assessment.',
    cta: 'Book my routing consultation',
    href: '/book',
  },
  B: {
    eyebrow: 'WE NEED TO REVIEW THE BEST STARTING POINT',
    heading: 'The problem matters, but the next diagnostic step is not yet clear.',
    body: 'A person will review whether you need a focused evidence-gathering step, a Problem Route Scan follow-up or a full assessment. We would rather spend a week getting that right than sell you the wrong engagement today.',
    cta: 'View a sample decision brief',
    href: '/sample-decision-brief',
  },
  C: {
    eyebrow: 'DO NOT BUY A LARGE SOLUTION YET',
    heading: 'Your best next move is more clarity, not more vendors.',
    body: 'Nothing in your answers justifies a large purchase right now, and we are not going to manufacture a reason. Start with the material on symptoms, constraints, evidence and intervention sequencing.',
    cta: 'Learn how to diagnose the constraint',
    href: '/how-it-works',
  },
};

/** Funnel state transitions — every one names the analytics event that proves it. */
export const FUNNEL_EVENTS = {
  scanStart: 'scan_start',
  scanStep: 'scan_step',
  scanSubmit: 'scan_submit',
  scanComplete: 'scan_complete',
  routeViewed: 'route_viewed',
  bookingStart: 'booking_start',
  bookingSubmit: 'booking_submit',
} as const;
