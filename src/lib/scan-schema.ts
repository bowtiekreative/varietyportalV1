/**
 * Problem Route Scan — the single source of truth for the intake.
 * The form, the validator and the scorer all read from here, so a question
 * can never drift between what is asked and what is scored.
 */

export type Choice = { value: string; label: string };

export type Field =
  | { kind: 'radio' | 'select'; name: string; label: string; help?: string; required: boolean; choices: Choice[] }
  | { kind: 'textarea'; name: string; label: string; help?: string; required: boolean; rows?: number; maxLength?: number }
  | { kind: 'text' | 'email' | 'tel' | 'url'; name: string; label: string; help?: string; required: boolean; autocomplete?: string; maxLength?: number }
  | { kind: 'checkbox'; name: string; label: string; help?: string; required: boolean };

export type Step = { id: string; title: string; intro: string; fields: Field[] };

export const SYMPTOMS: Choice[] = [
  { value: 'leads', label: 'We are not generating enough qualified leads' },
  { value: 'sales-inconsistent', label: 'Sales are inconsistent' },
  { value: 'offer-unclear', label: 'Customers do not understand the offer' },
  { value: 'website', label: 'The website is not producing results' },
  { value: 'no-progress', label: 'Marketing activity is not creating progress' },
  { value: 'workflow-fails', label: 'A workflow keeps failing' },
  { value: 'key-person', label: 'The business depends on a few people' },
  { value: 'ai-automation', label: 'We need AI or automation' },
  { value: 'new-market', label: 'We are entering a new market' },
  { value: 'high-stakes', label: 'We face a high-stakes decision' },
  { value: 'conflicting', label: 'We have conflicting recommendations' },
  { value: 'unknown', label: 'We do not know what the real problem is' },
];

export const AREAS: Choice[] = [
  { value: 'brand', label: 'Brand' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'website', label: 'Website' },
  { value: 'search', label: 'Search visibility' },
  { value: 'sales', label: 'Sales' },
  { value: 'customer', label: 'Customer experience' },
  { value: 'operations', label: 'Operations' },
  { value: 'technology', label: 'Technology' },
  { value: 'team', label: 'Team' },
  { value: 'finance', label: 'Finance' },
  { value: 'product', label: 'Product' },
  { value: 'environment', label: 'Physical environment' },
  { value: 'multiple', label: 'Multiple areas' },
];

export const OUTCOMES: Choice[] = [
  { value: 'nothing', label: 'Nothing changed' },
  { value: 'temporary', label: 'Results improved temporarily' },
  { value: 'tradeoff', label: 'One metric improved while another declined' },
  { value: 'more-work', label: 'The solution created more work' },
  { value: 'conflicting', label: 'We received conflicting advice' },
  { value: 'stalled', label: 'Implementation stalled' },
  { value: 'unmeasured', label: 'Measurement is too weak to know' },
];

export const COSTS: Choice[] = [
  { value: 'lost-revenue', label: 'Lost revenue' },
  { value: 'wasted-spend', label: 'Wasted spending' },
  { value: 'customer-loss', label: 'Customer loss' },
  { value: 'team-time', label: 'Team time' },
  { value: 'missed-timing', label: 'Missed timing' },
  { value: 'legal', label: 'Legal or compliance exposure' },
  { value: 'fragility', label: 'Operational fragility' },
  { value: 'burnout', label: 'Founder burnout' },
  { value: 'unknown', label: 'Unknown' },
];

export const URGENCY: Choice[] = [
  { value: 'immediate', label: 'Immediate' },
  { value: '30', label: 'Within 30 days' },
  { value: '90', label: 'Within 90 days' },
  { value: 'year', label: 'This year' },
  { value: 'researching', label: 'Researching' },
];

export const INVESTMENT: Choice[] = [
  { value: 'u500', label: 'Under $500' },
  { value: '500-1499', label: '$500 – $1,499' },
  { value: '1500-4999', label: '$1,500 – $4,999' },
  { value: '5000-14999', label: '$5,000 – $14,999' },
  { value: '15000', label: '$15,000+' },
  { value: 'diagnose-first', label: 'Need diagnosis before setting a budget' },
];

export const AUTHORITY: Choice[] = [
  { value: 'i-decide', label: 'I decide' },
  { value: 'shared', label: 'I share the decision' },
  { value: 'board', label: 'Leadership or board decides' },
  { value: 'researcher', label: 'I am researching for the decision-maker' },
];

export const STEPS: Step[] = [
  {
    id: 'symptom',
    title: 'The symptom',
    intro: 'Start with what you can actually see. We will test later whether it is the real constraint.',
    fields: [
      { kind: 'radio', name: 'symptom', label: 'What is happening?', required: true, choices: SYMPTOMS },
      { kind: 'radio', name: 'area', label: 'Where does the symptom appear?', required: true, choices: AREAS },
    ],
  },
  {
    id: 'gap',
    title: 'The gap',
    intro: 'The distance between what you expected and what happened is where the diagnosis begins.',
    fields: [
      { kind: 'textarea', name: 'expected', label: 'What result did you expect?', required: true, rows: 4, maxLength: 2000 },
      { kind: 'textarea', name: 'happened', label: 'What happened instead?', required: true, rows: 4, maxLength: 2000 },
    ],
  },
  {
    id: 'history',
    title: 'What you have already tried',
    intro: 'Agencies, consultants, tools, hires, campaigns and internal changes. Failed attempts are evidence, not embarrassment.',
    fields: [
      { kind: 'textarea', name: 'tried', label: 'What have you tried?', help: 'Include agencies, consultants, tools, hires, campaigns and internal changes.', required: true, rows: 5, maxLength: 3000 },
      { kind: 'radio', name: 'outcome', label: 'What best describes the result?', required: true, choices: OUTCOMES },
    ],
  },
  {
    id: 'stakes',
    title: 'The stakes',
    intro: 'A problem with no cost of waiting rarely justifies a paid diagnosis. We would rather tell you that early.',
    fields: [
      { kind: 'radio', name: 'cost', label: 'What is the cost of waiting?', required: true, choices: COSTS },
      { kind: 'radio', name: 'urgency', label: 'How urgent is the decision?', required: true, choices: URGENCY },
    ],
  },
  {
    id: 'readiness',
    title: 'Decision readiness',
    intro: 'This determines the route, not the price. There is no obligation attached to any answer.',
    fields: [
      { kind: 'radio', name: 'investment', label: 'Investment readiness', required: true, choices: INVESTMENT },
      { kind: 'radio', name: 'authority', label: 'Decision authority', required: true, choices: AUTHORITY },
    ],
  },
  {
    id: 'contact',
    title: 'Where to send the route',
    intro: 'A person reviews every scan before anything is sent. You will not be added to an automated sales sequence without opting in.',
    fields: [
      { kind: 'text',  name: 'name', label: 'Name', required: true, autocomplete: 'name', maxLength: 120 },
      { kind: 'text',  name: 'company', label: 'Company', required: true, autocomplete: 'organization', maxLength: 160 },
      { kind: 'text',  name: 'role', label: 'Role', required: false, autocomplete: 'organization-title', maxLength: 120 },
      { kind: 'email', name: 'email', label: 'Work email', required: true, autocomplete: 'email', maxLength: 200 },
      { kind: 'tel',   name: 'phone', label: 'Phone', help: 'Optional. Only used if the route calls for a priority conversation.', required: false, autocomplete: 'tel', maxLength: 40 },
      { kind: 'url',   name: 'website', label: 'Website', help: 'Optional. Include https://', required: false, autocomplete: 'url', maxLength: 200 },
      {
        kind: 'checkbox',
        name: 'consent_nurture',
        label: 'Send me the six-part series on diagnosing the constraint',
        help: 'Optional, and unrelated to your scan result. One email at a time, unsubscribe in any of them. Leaving this unchecked changes nothing about the route you receive.',
        required: false,
      },
    ],
  },
];

export const ALL_FIELDS: Field[] = STEPS.flatMap((s) => s.fields);

export function labelFor(name: string, value: string): string {
  const field = ALL_FIELDS.find((f) => f.name === name);
  if (field && 'choices' in field) {
    return field.choices.find((c) => c.value === value)?.label ?? value;
  }
  return value;
}
