import type { Company, Social } from '@/lib/types';
import type { SiteSetting } from '@/lib/supabase/types';
import { assetPaths } from '@/lib/config/assets';

/**
 * MukiSoft Technology — central company configuration.
 *
 * The `company` export below is a Proxy backed by the static defaults
 * declared further down. The proxy delegates reads through
 * `currentSettings` so that the public layout can override any field
 * from Supabase `site_settings` without changing 90+ call sites.
 *
 * Flow:
 *   1. `app/(public)/layout.tsx` calls `fetchSiteSettings()` and passes
 *      the result to `setCompanySettings(settings)` once per request.
 *   2. Every subsequent read of `company.name`, `company.tagline`,
 *      `company.contact.email`, etc. in server components picks up
 *      the database value if set, otherwise the static default.
 *
 * Update one field in admin Site Settings → every page reflects it.
 *
 * On its own this Proxy does NOT add behaviour that requires editing
 * call sites. Existing `import { company } from '@/lib/config/company'`
 * and `company.name` references work unchanged.
 */

// ============================================================
// Static, hardcoded defaults. Used only when Supabase is unavailable
// (env not configured, fetch failed, or settings row missing).
// ============================================================

/** Official business contact email. */
export const CONTACT_EMAIL = 'mukitunishat@gmail.com';

/** Official telephone (E.164 — no spaces or dashes). */
export const CONTACT_PHONE = '+8809638957563';

/** Official headquarters. */
export const CONTACT_LOCATION = 'Puthia, Rajshahi, Bangladesh';

/** Official website domain. */
export const DOMAIN = 'mukisoft.tech';

/** Official founding year. Used site-wide for "since 2021" positioning and the copyright range. */
export const FOUNDED_YEAR = 2021;

/** Current calendar year, computed once at module load. */
export const CURRENT_YEAR = new Date().getFullYear();

/** Copyright string in the form "© 2021–2026". When the current year is still the founding year, just shows that single year. */
export const COPYRIGHT_RANGE =
  CURRENT_YEAR > FOUNDED_YEAR ? `${FOUNDED_YEAR}–${CURRENT_YEAR}` : `${FOUNDED_YEAR}`;

/**
 * Default company object. The Proxy below reads from this whenever
 * `currentSettings` is null or when the requested field is not in
 * the settings row.
 */
const defaults: Company = {
  name: 'MukiSoft Technology',
  shortName: 'MukiSoft',
  legalName: 'MukiSoft Technology',
  displayName: 'MukiSoft Technology',
  tagline: 'Software, AI and SaaS engineering for businesses that take technology seriously.',
  headline: 'Software engineering, built to last.',
  description:
    'MukiSoft Technology is a Bangladesh-based software engineering firm building custom software, AI features and SaaS products for businesses.',
  foundedYear: FOUNDED_YEAR,
  brandStatement:
    'MukiSoft Technology engineers modern software, AI-powered solutions and digital products that help businesses and organisations turn ambitious ideas into reliable, scalable technology.',
  internationalStatement:
    'A Bangladesh engineering team serving clients worldwide — async-first, with overlap hours that respect time zones.',
  founder: {
    name: 'Mukitu Islam Nishat',
    role: 'Founder & Chief Executive Officer',
    shortRole: 'Founder & CEO',
    bio:
      'Mukitu Islam Nishat is the Founder and Chief Executive Officer of MukiSoft Technology, where he provides strategic and technical leadership across the organisation\'s software engineering, platform development and technology direction. He works at the intersection of modern software development, AI-powered applications, SaaS product engineering and business requirements.',
    shortBio:
      'Founder & CEO of MukiSoft Technology, providing strategic and technical leadership across the organisation\'s engineering, platform and technology direction.',
    title:
      'Founder & Chief Executive Officer · MukiSoft Technology',
    photo: assetPaths.founder.primary,
    education: {
      degree: 'B.Sc. in Computer Science & Engineering',
      university: 'North Bengal International University, Rajshahi, Bangladesh',
      status: 'Ongoing',
    },
    email: CONTACT_EMAIL,
    phone: CONTACT_PHONE,
    location: CONTACT_LOCATION,
    focus: [
      'Software Architecture',
      'Platform Development',
      'Full Stack Development',
      'AI-Powered Applications',
      'SaaS Product Development',
      'Technology Strategy',
    ],
    social: {},
  },
  contact: {
    email: CONTACT_EMAIL,
    phone: CONTACT_PHONE,
    location: CONTACT_LOCATION,
    address: CONTACT_LOCATION,
    country: 'Bangladesh',
    hours: 'Sunday — Thursday · 09:00–18:00 (BST, UTC+6)',
    website: `https://${DOMAIN}`,
  },
  social: {} as Social,
};

// ============================================================
// Per-request settings cache. Set by the public layout once per
// request, then read through the Proxy below.
// ============================================================

/**
 * Sentinel used to differentiate "cache has never been written this
 * request" (`UNSET`) from "fetch ran and found no row" (`null`). Without
 * this, `ensureCompanySettings` cannot tell the layout-seeded case
 * apart from the empty-DB case, and every page would re-fetch.
 */
const UNSET: unique symbol = Symbol('company.currentSettings.unset');
type SettingsSlot = typeof UNSET | SiteSetting | null;

let currentSettings: SettingsSlot = UNSET;
let resolvedCache: Company | null = null;

/**
 * Replace the per-request company settings cache. Called by
 * `app/(public)/layout.tsx` (and any other root that wants to
 * override defaults for its subtree) at the very start of a render.
 *
 * Pass `null` to fall back to the static defaults.
 */
export function setCompanySettings(settings: SiteSetting | null): void {
  currentSettings = settings;
  resolvedCache = null;
}

/**
 * Read the current settings cache. Exposed for callers that need to
 * know whether a value came from the database or the defaults.
 */
export function getCompanySettings(): SiteSetting | null {
  return currentSettings === UNSET ? null : currentSettings;
}

/**
 * `true` once the per-request cache has been written (even if the
 * stored value is `null` because the DB row was missing). Use this
 * instead of `getCompanySettings() !== null` to decide whether to
 * re-fetch — `null` is a valid cached value.
 */
export function hasCompanySettings(): boolean {
  return currentSettings !== UNSET;
}

/**
 * Pure helper. Returns a fully-populated `Company` for the given
 * settings row, falling back to the static defaults for any field
 * not present in the database. Safe to call without arguments.
 *
 * Memoized on the current `currentSettings` slot so the Proxy below
 * does not rebuild the whole object on every property read.
 */
/**
 * Formats a phone number for display by inserting a single space
 * after the country code. Best-effort: if no recognizable country
 * code prefix is present, returns the input unchanged.
 *
 * Used to derive `company.contact.phoneDisplay` from the DB row
 * since `site_settings` only stores the E.164 form (`phone`).
 */
function formatPhoneDisplay(raw: string): string {
  const trimmed = raw.trim();
  const m = /^(\+\d{1,3})(\d+)$/.exec(trimmed);
  return m ? `${m[1]} ${m[2]}` : trimmed;
}

export function resolveCompany(settings: SiteSetting | null | undefined = getCompanySettings()): Company {
  if (!settings) return defaults;

  // Pull overrides from the settings row. Treat empty strings as
  // "not set" so the defaults stay authoritative when the admin
  // clears a field rather than supplying a value.
  const pick = (fromDb: string | null | undefined, fallback: string): string => {
    const v = (fromDb ?? '').trim();
    return v.length > 0 ? v : fallback;
  };

  const resolvedPhone = pick(settings.phone, defaults.contact.phone);
  // `name` is intentionally NOT given a fallback when blank — the
  // admin may run a logo-only brand and we honour that. `displayName`
  // is the non-empty form for metadata/JSON-LD sites that require one.
  const resolvedName = pick(settings.company_name, '');
  const resolvedDisplayName = resolvedName || defaults.name;

  return {
    ...defaults,
    name: resolvedName,
    displayName: resolvedDisplayName,
    shortName: pick(settings.short_name, defaults.shortName),
    legalName: pick(settings.company_name, defaults.legalName),
    tagline: pick(settings.tagline, defaults.tagline),
    description: pick(settings.description, defaults.description),
    foundedYear: Number.isFinite(settings.founded_year) && settings.founded_year > 0
      ? settings.founded_year
      : defaults.foundedYear,
    copyright: (settings.copyright_text ?? '').trim() || undefined,
    contact: {
      ...defaults.contact,
      email: pick(settings.email, defaults.contact.email),
      phone: resolvedPhone,
      phoneDisplay: formatPhoneDisplay(resolvedPhone),
      location: pick(settings.location, defaults.contact.location),
      address: pick(settings.location, defaults.contact.address),
      website: pick(settings.website, defaults.contact.website ?? `https://${DOMAIN}`),
    },
  };
}

// ============================================================
// Public `company` export — Proxy that resolves through
// currentSettings on every read.
// ============================================================

/**
 * Public read-only view of the company configuration.
 *
 * Backed by `resolveCompany(currentSettings)` so that any read
 * (`company.name`, `company.contact.email`, etc.) reflects the
 * latest Supabase `site_settings` row that the layout cached.
 * `resolveCompany` is memoized, so per-property reads do not rebuild
 * the resolved object.
 *
 * Existing call sites — including 90+ direct property reads across
 * 30 files — continue to work without modification.
 */
export const company: Company = new Proxy({} as Company, {
  get(_target, key) {
    if (resolvedCache === null) {
      resolvedCache = resolveCompany(getCompanySettings());
    }
    return (resolvedCache as unknown as Record<string | symbol, unknown>)[key as string];
  },
}) as Company;

/**
 * Single shared social profile list.
 *
 * Intentionally empty — we never fabricate LinkedIn, GitHub or X URLs.
 * Social profiles will be added to this array once the official handles
 * are provided.
 */
export const socialLinks: { name: string; href: string; icon: string }[] = [];

export const ctas = {
  primary: { label: 'Start a Project', href: '/contact' },
  secondary: { label: 'Explore Our Work', href: '/portfolio' },
  discuss: { label: 'Discuss Your Project', href: '/contact' },
  team: { label: 'Contact Our Team', href: '/contact' },
  services: { label: 'Explore Our Capabilities', href: '/services' },
  process: { label: 'See Our Process', href: '/process' },
} as const;

export type CtaKey = keyof typeof ctas;

/**
 * Corporate history milestones. Years and phase titles are real;
 * descriptions describe the company narrative without inventing
 * specific events, deals, hires or metrics.
 */
export const companyHistory = [
  {
    year: '2021',
    title: 'Foundation',
    description: 'Founded as a software engineering firm in Rajshahi, Bangladesh.',
  },
  {
    year: '2022 — 2023',
    title: 'Capability Expansion',
    description: 'Engineering practice broadened across web platforms, software systems and digital products.',
  },
  {
    year: '2024 — 2025',
    title: 'Product & AI Focus',
    description: 'Extended work into SaaS products, AI-powered applications and automation.',
  },
  {
    year: '2026',
    title: 'International Direction',
    description: 'Operating as an international, remote-first engineering team serving clients across time zones.',
  },
] as const;

/**
 * Corporate capability statements shown in place of fabricated
 * statistics. Each describes a real engineering capability without
 * inventing numbers, clients or rankings.
 */
export const capabilityStatements = [
  {
    label: 'Software Engineering',
    description: 'Production-grade web and backend systems',
  },
  {
    label: 'AI & Intelligent Systems',
    description: 'Applied AI features and integrations',
  },
  {
    label: 'Digital Product Development',
    description: 'End-to-end product engineering',
  },
  {
    label: 'Enterprise Solutions',
    description: 'Internal tools and business software',
  },
  {
    label: 'Cloud & Modern Infrastructure',
    description: 'Observable, reliable deployment',
  },
  {
    label: 'Design & Digital Experience',
    description: 'Research-led interface design',
  },
] as const;
