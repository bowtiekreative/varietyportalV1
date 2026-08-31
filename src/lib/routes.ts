/**
 * The routing table from the LAKA/funnel strategy: diagnosed constraint → likely route.
 * `affiliated: true` means the relationship MUST be disclosed wherever this is shown.
 */

export type Provider = {
  id: string;
  name: string;
  constraint: string;
  discipline: string;
  affiliated: boolean;
  icon: string;
};

export const PROVIDERS: Provider[] = [
  { id: 'brand-savant',   name: 'Brand Savant',                    constraint: 'Brand positioning or identity',   discipline: 'Brand intelligence',          affiliated: true, icon: 'compass' },
  { id: 'growthpoints',   name: 'Bow Tie Kreative GrowthPoints',   constraint: 'Growth execution across channels', discipline: 'Adaptive growth execution',   affiliated: true, icon: 'trend' },
  { id: 'web-dev-calgary',name: 'Web Dev Calgary',                 constraint: 'Calgary website and local demand', discipline: 'Websites and local demand',   affiliated: true, icon: 'pin' },
  { id: 'all-inclusive',  name: 'All Inclusive Websites',          constraint: 'Website accessibility',            discipline: 'Digital accessibility',       affiliated: true, icon: 'access' },
  { id: 'housesmart',     name: 'HouseSmart',                      constraint: 'Smart-home planning',              discipline: 'Smart-home intelligence',     affiliated: true, icon: 'home' },
  { id: 'goose-caboose',  name: 'Goose Caboose',                   constraint: 'Search and customer-intent gaps',  discipline: 'Search-intent analysis',      affiliated: true, icon: 'search' },
  { id: 'digital-stem',   name: 'Digital Stem Cell',               constraint: 'Marketing-system weakness',        discipline: 'Marketing diagnostics',       affiliated: true, icon: 'pulse' },
  { id: 'laka',           name: 'LAKA',                            constraint: 'Alternative strategy generation',  discipline: 'Strategy generation',         affiliated: true, icon: 'grid' },
  { id: 'pex-pcc',        name: 'PEX / PCC',                       constraint: 'Execution or environmental forecasting', discipline: 'Forecasting',            affiliated: true, icon: 'radar' },
  { id: 'external',       name: 'A disclosed external specialist', constraint: 'Specialized need outside the portfolio', discipline: 'Sourced independently',  affiliated: false, icon: 'link' },
];

/** The standing disclosure. Reproduced verbatim wherever routing is discussed. */
export const DISCLOSURE =
  'Variety Portal evaluates multiple paths. When we recommend a company affiliated with Variety Portal, we disclose that relationship. When an outside specialist is a better fit, we can recommend or help source one. Referral or commercial relationships are disclosed before engagement.';

/** Symptom area → candidate providers, used to shape the preliminary route. */
export const AREA_TO_PROVIDERS: Record<string, string[]> = {
  brand: ['brand-savant', 'laka'],
  marketing: ['digital-stem', 'growthpoints'],
  website: ['web-dev-calgary', 'all-inclusive', 'growthpoints'],
  search: ['goose-caboose'],
  sales: ['growthpoints', 'digital-stem'],
  customer: ['brand-savant', 'growthpoints'],
  operations: ['laka', 'pex-pcc'],
  technology: ['laka', 'pex-pcc'],
  team: ['laka'],
  finance: ['pex-pcc'],
  product: ['brand-savant', 'laka'],
  environment: ['housesmart'],
  multiple: ['laka', 'pex-pcc'],
};
