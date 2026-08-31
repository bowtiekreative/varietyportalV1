/**
 * Icon system — one stroke weight (1.5), one 24px grid, currentColor throughout.
 * Rule visual.icons-required: feature grids, steps and categories are paired
 * with an icon. Never two metaphors for the same concept.
 */

export const ICONS: Record<string, string> = {
  // --- diagnosis / method -------------------------------------------------
  stethoscope: '<path d="M5 3v6a5 5 0 0 0 10 0V3"/><path d="M3 3h4M13 3h4"/><path d="M10 14v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="10" r="2.2"/>',
  decompose: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  route: '<circle cx="5" cy="5" r="2.4"/><circle cx="19" cy="19" r="2.4"/><path d="M7.4 5H14a4 4 0 0 1 0 8H10a4 4 0 0 0 0 8h6.6"/>',
  review: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
  // --- symptoms -----------------------------------------------------------
  magnet: '<path d="M6 3v9a6 6 0 0 0 12 0V3"/><path d="M6 8h4M14 8h4"/><path d="M2 3h4M18 3h4"/>',
  monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8.5 21h7M12 17v4"/>',
  cpu: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M10 1.5v2M14 1.5v2M10 20.5v2M14 20.5v2M1.5 10h2M1.5 14h2M20.5 10h2M20.5 14h2"/>',
  handoff: '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/><path d="M9.5 9.5 14.5 14.5"/><path d="M4 20c0-2 1.5-3.5 3.5-3.5M20 4c0 2-1.5 3.5-3.5 3.5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.4 9.2a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.4-2.6 4"/><circle cx="12" cy="17.3" r="1" fill="currentColor" stroke="none"/>',
  // --- providers ----------------------------------------------------------
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  access: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="7.6" r="1.3" fill="currentColor" stroke="none"/><path d="M7.5 10.4h9M12 10.9v4.1M12 15l-2.2 3.6M12 15l2.2 3.6"/>',
  home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z"/><path d="M9.5 21v-6h5v6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  pulse: '<path d="M2.5 12h4l2.5-6 4 12 2.5-6h6"/>',
  radar: '<path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7.5a4.5 4.5 0 1 0 4.5 4.5"/><path d="M12 12 20 4"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
  link: '<path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.6 6.2"/><path d="M14 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.4-1.4"/>',
  // --- ui -----------------------------------------------------------------
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  arrow: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  close: '<path d="M5 5 19 19M19 5 5 19"/>',
  menu: '<path d="M3.5 7h17M3.5 12h17M3.5 17h17"/>',
  alert: '<path d="M12 3.5 22 20H2L12 3.5Z"/><path d="M12 10v4.2"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>',
  shield: '<path d="M12 3l8 3v5.5c0 4.6-3.3 8.4-8 9.5-4.7-1.1-8-4.9-8-9.5V6l8-3Z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.4 2"/>',
  scale: '<path d="M12 3.5v17M5 7h14"/><path d="M5 7 2.5 13a2.5 2.5 0 0 0 5 0L5 7Z"/><path d="M19 7l-2.5 6a2.5 2.5 0 0 0 5 0L19 7Z"/><path d="M8.5 20.5h7"/>',
  document: '<path d="M6 2.5h7.5L19 8v13.5H6z"/><path d="M13.5 2.5V8H19"/><path d="M9 13h7M9 17h5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
};

export type IconName = keyof typeof ICONS;
