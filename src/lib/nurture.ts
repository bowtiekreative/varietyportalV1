/**
 * The six-part nurture sequence.
 *
 * Enrolment is opt-in only (the scan's `consent_nurture` checkbox). Every send
 * carries an unsubscribe link, and the sequence never pitches before at least
 * four qualification facts are known — which the scan always establishes
 * (rule funnel.qualify-first).
 */

export type NurtureEmail = {
  step: number;
  /** Days after the previous email. */
  delayDays: number;
  subject: string;
  preheader: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaPath: string;
};

export const SEQUENCE: NurtureEmail[] = [
  {
    step: 1,
    delayDays: 1,
    subject: 'The symptom is not always the problem',
    preheader: 'Low traffic can be four different problems wearing the same costume.',
    paragraphs: [
      'Low traffic can be a visibility problem. It can also be a positioning problem, an offer problem, weak proof, or a deliberate market mismatch.',
      'The visible symptom tells you where to investigate — not automatically what to buy.',
    ],
    ctaLabel: 'Start the Problem Route Scan',
    ctaPath: '/scan',
  },
  {
    step: 2,
    delayDays: 3,
    subject: 'Why every vendor sees a different problem',
    preheader: 'Expertise is valuable after the route is clear. Before that, it is a bias.',
    paragraphs: [
      'Specialists interpret problems through the tools they know. That expertise is genuinely valuable — after the route is clear.',
      'Before choosing a specialist, compare the alternative explanations and define what evidence would prove or disprove each of them.',
    ],
    ctaLabel: 'See the 216-Path Method',
    ctaPath: '/216-path-method',
  },
  {
    step: 3,
    delayDays: 4,
    subject: 'The right solution can still come at the wrong time',
    preheader: 'Sequence decides whether good work creates progress or waste.',
    paragraphs: [
      'A new website may be necessary — but not before the offer is clear. Automation may help — but not before the process works manually. More leads may matter — but not before sales can respond.',
      'Sequence determines whether good work creates progress or waste.',
    ],
    ctaLabel: 'Find the first move',
    ctaPath: '/how-it-works',
  },
  {
    step: 4,
    delayDays: 4,
    subject: 'You may not need the complete transformation',
    preheader: 'The goal of diagnosis is the smallest sufficient intervention.',
    paragraphs: [
      'The goal of diagnosis is not to create the largest scope. It is to find the smallest intervention capable of producing useful evidence.',
      'If the evidence changes the diagnosis, the route changes — before more budget is committed.',
    ],
    ctaLabel: 'Explore the business assessment',
    ctaPath: '/assessment',
  },
  {
    step: 5,
    delayDays: 5,
    subject: 'Three consultants. Three answers. Now what?',
    preheader: 'Ask what would have to be true, not who sounds most confident.',
    paragraphs: [
      'Compare recommendations by the assumptions they make, the evidence they use, the result they predict, the cost of reversal and the time to proof.',
      'Do not ask only, “Which expert sounds confident?” Ask, “What would have to be true for this recommendation to work?”',
    ],
    ctaLabel: 'Request a decision brief',
    ctaPath: '/assessment',
  },
  {
    step: 6,
    delayDays: 5,
    subject: 'Ready to route the problem?',
    preheader: 'Bring the symptom, the attempts, the evidence and the cost of waiting.',
    paragraphs: [
      'Bring the symptom, previous attempts, evidence, cost of waiting and decision constraints.',
      'Variety Portal will expand the possible paths, eliminate poor fits and recommend what should happen first — including the possibility that the answer is “not yet”.',
    ],
    ctaLabel: 'Route my business problem',
    ctaPath: '/scan',
  },
];

export function nextDelayDays(step: number): number | null {
  const next = SEQUENCE.find((e) => e.step === step + 1);
  return next ? next.delayDays : null;
}
