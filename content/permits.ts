import type { Nationality, PermitRule, StateSlug } from '@/types/content';

/**
 * Permit rules per (state, nationality[, area]).
 *
 * EVERY RECORD IS UNVERIFIED. Rules for Northeast India change often (protected-
 * area rules for foreign nationals have been relaxed and re-imposed in recent
 * years). Seeded from the design mock-up; the owner must check each record
 * against the official portal, then set verified: true and lastVerified.
 */

const CHECK_PORTAL = 'Unverified — confirm on the official portal';
const ID_DOCS_IN = ['Government photo ID (Aadhaar, passport, voter ID or driving licence)', 'Recent passport-size photo'];
const ID_DOCS_FX = ['Passport', 'Valid Indian visa (or OCI card)', 'Passport-size photos', 'Itinerary through a registered tour operator'];

const ISSUER: Record<StateSlug, string> = {
  assam: '—',
  meghalaya: '—',
  tripura: '—',
  'arunachal-pradesh': 'Government of Arunachal Pradesh',
  nagaland: 'Government of Nagaland',
  manipur: 'Government of Manipur',
  mizoram: 'Government of Mizoram',
  sikkim: 'Sikkim Tourism & Civil Aviation Department, via registered operators',
};

const URLS: Partial<Record<StateSlug, string>> = {
  'arunachal-pradesh': 'https://eilp.arunachal.gov.in',
  nagaland: 'https://ilp.nagaland.gov.in',
  manipur: 'https://manipurilponline.mn.gov.in',
  mizoram: 'https://ilp.mizoram.gov.in',
  sikkim: 'https://www.sikkimtourism.gov.in',
};

function none(state: StateSlug, nationality: Nationality, notes?: string): PermitRule {
  return {
    state,
    nationality,
    required: false,
    permitType: 'None',
    issuedBy: '—',
    feeText: 'No fee',
    documents: nationality === 'indian' ? ['Carry photo ID'] : ['Passport and valid visa / OCI card'],
    validity: '—',
    processing: '—',
    notes,
    verified: false,
  };
}

function ilp(state: StateSlug, notes: string): PermitRule {
  return {
    state,
    nationality: 'indian',
    required: true,
    permitType: 'ILP',
    issuedBy: ISSUER[state],
    feeText: CHECK_PORTAL,
    documents: ID_DOCS_IN,
    validity: 'Varies by permit type — check the portal',
    processing: 'Usually online; allow a few days',
    applyUrl: URLS[state],
    sourceUrl: URLS[state],
    notes,
    verified: false,
  };
}

function foreign(state: StateSlug, nationality: 'foreign' | 'oci', type: PermitRule['permitType'], notes: string): PermitRule {
  return {
    state,
    nationality,
    required: type !== 'None',
    permitType: type,
    issuedBy: ISSUER[state],
    feeText: CHECK_PORTAL,
    documents: ID_DOCS_FX,
    validity: 'Varies — check the portal',
    processing: 'Through a registered tour operator; allow at least a week',
    applyUrl: URLS[state],
    sourceUrl: URLS[state],
    notes,
    verified: false,
  };
}

const FX_CHANGES = 'Rules for foreign nationals change — we confirm registration requirements for your dates.';

function bothForeign(state: StateSlug, type: PermitRule['permitType'], notes: string): PermitRule[] {
  return [
    foreign(state, 'foreign', type, notes),
    foreign(state, 'oci', type, `${notes} OCI cardholders are generally treated as foreign nationals for permits.`),
  ];
}

export const PERMITS: PermitRule[] = [
  // Assam — no permit
  none('assam', 'indian'),
  none('assam', 'foreign', 'No entry permit; foreign nationals register at their hotel as usual.'),
  none('assam', 'oci'),

  // Meghalaya — no permit
  none('meghalaya', 'indian'),
  none('meghalaya', 'foreign'),
  none('meghalaya', 'oci'),

  // Tripura — no permit
  none('tripura', 'indian'),
  none('tripura', 'foreign'),
  none('tripura', 'oci'),

  // Arunachal Pradesh
  ilp('arunachal-pradesh', 'Inner Line Permit required. Apply online through the state e-ILP portal before travel.'),
  ...bothForeign('arunachal-pradesh', 'PAP', 'Protected Area Permit required for foreign nationals.'),

  // Nagaland
  ilp('nagaland', 'Inner Line Permit required. Available online for domestic tourists.'),
  ...bothForeign('nagaland', 'PAP', FX_CHANGES),

  // Manipur
  ilp('manipur', 'Inner Line Permit required for non-residents.'),
  ...bothForeign('manipur', 'PAP', FX_CHANGES),

  // Mizoram
  ilp('mizoram', 'Inner Line Permit required. Check current rules before travel.'),
  ...bothForeign('mizoram', 'PAP', FX_CHANGES),

  // Sikkim — no general entry permit for Indians; protected sub-areas
  none(
    'sikkim',
    'indian',
    'No entry permit for Indian citizens, but protected areas (North Sikkim, Tsomgo, Nathula) need area permits via a registered operator.',
  ),
  ...['Tsomgo lake & Nathula', 'North Sikkim (Lachung, Lachen, Gurudongmar)'].map<PermitRule>((area) => ({
    state: 'sikkim',
    area,
    nationality: 'indian',
    required: true,
    permitType: 'Protected Area',
    issuedBy: ISSUER.sikkim,
    feeText: CHECK_PORTAL,
    documents: ID_DOCS_IN,
    validity: 'Issued for the travel dates',
    processing: 'Through a Sikkim-registered operator; usually 1 day',
    applyUrl: URLS.sikkim,
    sourceUrl: URLS.sikkim,
    notes: 'Arranged by your registered tour operator in Gangtok.',
    verified: false,
  })),
  ...bothForeign('sikkim', 'RAP', 'Restricted Area Permit, booked through a Sikkim-registered agent; groups of two or more for protected areas.'),
];

export function permitsFor(state: StateSlug, nationality: Nationality): PermitRule[] {
  return PERMITS.filter((p) => p.state === state && p.nationality === nationality);
}

/** The single headline rule for a state (the record without a sub-area). */
export function headlinePermit(state: StateSlug, nationality: Nationality): PermitRule | undefined {
  return PERMITS.find((p) => p.state === state && p.nationality === nationality && !p.area);
}

export const NATIONALITY_LABELS: Record<Nationality, string> = {
  indian: 'An Indian citizen',
  foreign: 'A foreign national',
  oci: 'An OCI cardholder',
};
