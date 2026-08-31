/**
 * The 6×6×6 morphological grid behind the Variety Routing Protocol.
 * These are the canonical axes of the engine — do not paraphrase them into
 * something that sounds better but means something else.
 */

export const INTERROGATIVES = [
  { id: 'who', label: 'Who', gloss: 'Which people, roles, teams or organisations are in the frame — and which were never named.' },
  { id: 'what', label: 'What', gloss: 'The object being acted on: the offer, the asset, the process, the decision.' },
  { id: 'where', label: 'Where', gloss: 'The channel, market, system or physical place the symptom appears in.' },
  { id: 'when', label: 'When', gloss: 'Sequence and timing — what came before, what is driving the deadline.' },
  { id: 'why', label: 'Why', gloss: 'The stated reason, and the reason that would have to be true instead.' },
  { id: 'how', label: 'How', gloss: 'The mechanism: how the work is actually performed, not how it is described.' },
];

export const MODIFIERS = [
  { id: 'direct', label: 'Direct', gloss: 'The stated or obvious reading.' },
  { id: 'opposite', label: 'Opposite', gloss: 'The exact antithesis of the stated reading.' },
  { id: 'other', label: 'Other', gloss: 'An unrelated paradigm entirely — outside the current framing.' },
  { id: 'keep-same', label: 'Keep Same', gloss: 'It did not change. That absence is itself the finding.' },
  { id: 'more-same', label: 'More Same', gloss: 'Amplified beyond the baseline.' },
  { id: 'less-same', label: 'Less Same', gloss: 'Diminished below the baseline.' },
];

export const SCALES = [
  { id: 'one', label: 'One', gloss: 'A single instance.' },
  { id: 'partial', label: 'Partial', gloss: 'Some, but not most.' },
  { id: 'many', label: 'Many', gloss: 'A majority, short of everything.' },
  { id: 'all', label: 'All', gloss: 'Without exception.' },
  { id: 'any', label: 'Any', gloss: 'At least one, unspecified which — the existence claim.' },
  { id: 'none', label: 'None', gloss: 'Zero. The null hypothesis.' },
];

/** Worked business readings — each traces to the axes above, nothing invented. */
export const WORKED = [
  {
    cell: 'Why × Opposite × All',
    symptom: '“Our leads dried up when the new site launched.”',
    direct: 'The redesign broke something and cost you leads.',
    reading:
      'Invert the causation and apply it universally: every lead source declined, and the redesign merely coincided. If all channels moved together, the cause sits above the website — pricing, category demand, or a change in who is searching.',
    test: 'Compare pre- and post-launch volume across every channel, not just organic.',
  },
  {
    cell: 'Who × Other × One',
    symptom: '“Sales and marketing keep blaming each other.”',
    direct: 'The two teams are misaligned and need a shared definition of a qualified lead.',
    reading:
      'Look outside both teams for a single unnamed actor. Often it is one person — a fulfilment lead, a finance approver, a single support rep — whose queue silently sets the real conversion ceiling.',
    test: 'Trace ten won and ten lost deals end to end and record every human who touched them.',
  },
  {
    cell: 'When × Keep Same × None',
    symptom: '“We have to decide before the end of the quarter.”',
    direct: 'The quarter-end deadline is driving the decision.',
    reading:
      'Nothing about the timing actually changed, and no real deadline exists. If the thesis rests on urgency that does not survive inspection, the correct move may be to spend another month gathering evidence rather than committing budget.',
    test: 'Name the specific consequence that occurs on the first day past the deadline.',
  },
  {
    cell: 'How × Less Same × Partial',
    symptom: '“The automation we installed made everything worse.”',
    direct: 'The automation was the wrong tool and should be removed.',
    reading:
      'The mechanism was right but executed weakly and only part-way. Not a bad decision — an unfinished one, which leaves a visible seam where the manual and automated halves meet. Incompetence and incompletion are real explanations and the grid forces you to consider them.',
    test: 'Map which steps were automated and which were left manual, then measure the handoff between them.',
  },
];

export const TOTAL = INTERROGATIVES.length * MODIFIERS.length * SCALES.length;
