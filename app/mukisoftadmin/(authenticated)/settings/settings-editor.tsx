'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { SiteSetting } from '@/lib/supabase/types';
import { useToast } from '@/components/admin/toast-provider';
import { ImageUploader } from '@/components/admin/image-uploader';

type FormState = {
  company_name: string;
  short_name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  founded_year: number;
  copyright_text: string;
  site_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  navbar_logo_url: string;
  navbar_logo_size: number;
  favicon_url: string;
};

const NAVBAR_LOGO_MIN = 16;
const NAVBAR_LOGO_MAX = 96;
const NAVBAR_LOGO_DEFAULT = 36;

function clampNavbarLogoSize(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return NAVBAR_LOGO_DEFAULT;
  return Math.min(NAVBAR_LOGO_MAX, Math.max(NAVBAR_LOGO_MIN, Math.round(n)));
}

function fromSetting(setting: SiteSetting | null): FormState {
  return {
    company_name: setting?.company_name ?? '',
    short_name: setting?.short_name ?? 'MukiSoft',
    tagline: setting?.tagline ?? '',
    description: setting?.description ?? '',
    email: setting?.email ?? '',
    phone: setting?.phone ?? '',
    location: setting?.location ?? '',
    website: setting?.website ?? '',
    founded_year: setting?.founded_year ?? new Date().getFullYear(),
    copyright_text: setting?.copyright_text ?? '',
    site_title: setting?.site_title ?? '',
    meta_description: setting?.meta_description ?? '',
    og_title: setting?.og_title ?? '',
    og_description: setting?.og_description ?? '',
    og_image: setting?.og_image ?? '',
    canonical_url: setting?.canonical_url ?? '',
    navbar_logo_url: setting?.navbar_logo_url ?? '',
    navbar_logo_size: clampNavbarLogoSize(setting?.navbar_logo_size ?? NAVBAR_LOGO_DEFAULT),
    favicon_url: setting?.favicon_url ?? '',
  };
}

export function SettingsEditor({ initial }: { initial: SiteSetting | null }) {
  const router = useRouter();
  const { push } = useToast();
  const [form, setForm] = useState<FormState>(() => fromSetting(initial));
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /**
   * Required fields are NOT NULL in the schema. Trim values; if any
   * required field is empty, fail validation before hitting Supabase.
   *
   * `company_name` is intentionally NOT required: when blank, the
   * public site hides the brand-name text everywhere and just shows
   * the logo. Schema migration 0005 loosened the column to nullable.
   * Optional fields (description, SEO overrides, brand assets,
   * company_name) are stored as null when blank so the public site
   * falls back to its static defaults instead of being stuck on an
   * empty string.
   */
  function validate(): boolean {
    const next: typeof errors = {};
    const required: Array<keyof FormState> = [
      'short_name',
      'tagline',
      'email',
      'phone',
      'location',
      'website',
    ];
    for (const key of required) {
      const v = (form[key] as string | number).toString().trim();
      if (!v) next[key] = 'This field is required.';
    }
    const year = Number(form.founded_year);
    if (!Number.isFinite(year) || year < 1900 || year > 9999) {
      next.founded_year = 'Enter a valid 4-digit year.';
    }
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = 'That email looks invalid.';
    }
    if (form.website.trim() && !/^https?:\/\//.test(form.website.trim())) {
      next.website = 'Use a full URL starting with https://';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const handleSave = async () => {
    if (busy) return;
    if (!validate()) {
      push('Please fix the highlighted fields.', 'error');
      return;
    }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const trimOrNull = (v: string) => (v.trim().length > 0 ? v.trim() : null);
      const payload = {
        id: 1,
        company_name: trimOrNull(form.company_name),
        short_name: form.short_name.trim(),
        tagline: form.tagline.trim(),
        description: trimOrNull(form.description),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        website: form.website.trim(),
        founded_year: Number(form.founded_year),
        copyright_text: trimOrNull(form.copyright_text),
        site_title: trimOrNull(form.site_title),
        meta_description: trimOrNull(form.meta_description),
        og_title: trimOrNull(form.og_title),
        og_description: trimOrNull(form.og_description),
        og_image: trimOrNull(form.og_image),
        canonical_url: trimOrNull(form.canonical_url),
        navbar_logo_url: trimOrNull(form.navbar_logo_url),
        navbar_logo_size: clampNavbarLogoSize(form.navbar_logo_size),
        favicon_url: trimOrNull(form.favicon_url),
      };
      const { error } = await (supabase.from('site_settings') as any).upsert(payload);
      if (error) throw error;
      push('Settings saved.', 'success');
      router.refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-grid admin-grid-2" style={{ alignItems: 'start' }}>
      <div className="admin-card">
        <div className="admin-card-pad">
          <h3 className="admin-card-title">Company information</h3>
          <p className="admin-card-sub">Public website reads these values from the CMS.</p>
          <div className="admin-form">
            <div className="admin-form-row cols-2">
              <div className="admin-field">
                <label>Company name</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => update('company_name', e.target.value)}
                  style={errors.company_name ? { borderColor: 'var(--admin-danger)' } : undefined}
                />
                {errors.company_name ? (
                  <span className="help" style={{ color: 'var(--admin-danger)' }}>{errors.company_name}</span>
                ) : null}
              </div>
              <div className="admin-field">
                <label>Short name</label>
                <input
                  type="text"
                  value={form.short_name}
                  onChange={(e) => update('short_name', e.target.value)}
                  style={errors.short_name ? { borderColor: 'var(--admin-danger)' } : undefined}
                />
                {errors.short_name ? (
                  <span className="help" style={{ color: 'var(--admin-danger)' }}>{errors.short_name}</span>
                ) : null}
              </div>
            </div>
            <div className="admin-field">
              <label>Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => update('tagline', e.target.value)}
                style={errors.tagline ? { borderColor: 'var(--admin-danger)' } : undefined}
              />
              {errors.tagline ? (
                <span className="help" style={{ color: 'var(--admin-danger)' }}>{errors.tagline}</span>
              ) : null}
            </div>
            <div className="admin-field">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
            </div>
            <div className="admin-form-row cols-2">
              <div className="admin-field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  style={errors.email ? { borderColor: 'var(--admin-danger)' } : undefined}
                />
                {errors.email ? (
                  <span className="help" style={{ color: 'var(--admin-danger)' }}>{errors.email}</span>
                ) : null}
              </div>
              <div className="admin-field">
                <label>Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  style={errors.phone ? { borderColor: 'var(--admin-danger)' } : undefined}
                />
                {errors.phone ? (
                  <span className="help" style={{ color: 'var(--admin-danger)' }}>{errors.phone}</span>
                ) : null}
              </div>
            </div>
            <div className="admin-form-row cols-2">
              <div className="admin-field">
                <label>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  style={errors.location ? { borderColor: 'var(--admin-danger)' } : undefined}
                />
                {errors.location ? (
                  <span className="help" style={{ color: 'var(--admin-danger)' }}>{errors.location}</span>
                ) : null}
              </div>
              <div className="admin-field">
                <label>Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                  style={errors.website ? { borderColor: 'var(--admin-danger)' } : undefined}
                />
                {errors.website ? (
                  <span className="help" style={{ color: 'var(--admin-danger)' }}>{errors.website}</span>
                ) : null}
              </div>
            </div>
            <div className="admin-form-row cols-2">
              <div className="admin-field">
                <label>Founded year</label>
                <input
                  type="number"
                  value={form.founded_year}
                  onChange={(e) => update('founded_year', Number(e.target.value))}
                  style={errors.founded_year ? { borderColor: 'var(--admin-danger)' } : undefined}
                />
                {errors.founded_year ? (
                  <span className="help" style={{ color: 'var(--admin-danger)' }}>{errors.founded_year}</span>
                ) : null}
              </div>
              <div className="admin-field">
                <label>Copyright text</label>
                <input
                  type="text"
                  value={form.copyright_text}
                  onChange={(e) => update('copyright_text', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-pad">
          <h3 className="admin-card-title">SEO defaults</h3>
          <p className="admin-card-sub">Used as fallback values for site-wide SEO metadata.</p>
          <div className="admin-form">
            <div className="admin-field">
              <label>Site title</label>
              <input
                type="text"
                value={form.site_title}
                onChange={(e) => update('site_title', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Meta description</label>
              <textarea
                value={form.meta_description}
                onChange={(e) => update('meta_description', e.target.value)}
              />
            </div>
            <div className="admin-form-row cols-2">
              <div className="admin-field">
                <label>OG title</label>
                <input
                  type="text"
                  value={form.og_title}
                  onChange={(e) => update('og_title', e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label>OG description</label>
                <input
                  type="text"
                  value={form.og_description}
                  onChange={(e) => update('og_description', e.target.value)}
                />
              </div>
            </div>
            <div className="admin-form-row cols-2">
              <div className="admin-field">
                <label>OG image</label>
                <input
                  type="text"
                  value={form.og_image}
                  onChange={(e) => update('og_image', e.target.value)}
                  placeholder="/og.svg"
                />
              </div>
              <div className="admin-field">
                <label>Canonical URL</label>
                <input
                  type="url"
                  value={form.canonical_url}
                  onChange={(e) => update('canonical_url', e.target.value)}
                  placeholder="https://mukisoft.tech"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
        <div className="admin-card-pad">
          <h3 className="admin-card-title">Brand assets</h3>
          <p className="admin-card-sub">
            Upload the navbar logo and the browser favicon. Leave blank to keep the bundled defaults.
          </p>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Navbar logo</label>
              <ImageUploader
                folder="site"
                variant="logo"
                value={form.navbar_logo_url || null}
                altText=""
                showAlt={false}
                onChange={(next) => update('navbar_logo_url', next ?? '')}
              />
              <span className="help">
                Recommended: a wide horizontal logo on a transparent background (PNG or SVG).
                Aspect ratios around 4:1 to 6:1 work best in the navbar.
              </span>
              <div className="admin-field" style={{ marginTop: '0.75rem' }}>
                <label>
                  Logo size in navbar:&nbsp;
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {form.navbar_logo_size}px
                  </span>
                </label>
                <input
                  type="range"
                  min={NAVBAR_LOGO_MIN}
                  max={NAVBAR_LOGO_MAX}
                  step={2}
                  value={form.navbar_logo_size}
                  onChange={(e) => update('navbar_logo_size', Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--admin-accent, #4f46e5)' }}
                  aria-label="Navbar logo size in pixels"
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.7rem',
                    color: 'var(--admin-text-dim)',
                    marginTop: '0.15rem',
                  }}
                >
                  <span>{NAVBAR_LOGO_MIN}px · small</span>
                  <span>{NAVBAR_LOGO_DEFAULT}px · default</span>
                  <span>{NAVBAR_LOGO_MAX}px · large</span>
                </div>
                <NavbarLogoPreview
                  url={form.navbar_logo_url || null}
                  sizePx={form.navbar_logo_size}
                />
              </div>
            </div>
            <div className="admin-field">
              <label>Favicon</label>
              <ImageUploader
                folder="site"
                variant="favicon"
                value={form.favicon_url || null}
                altText=""
                showAlt={false}
                onChange={(next) => update('favicon_url', next ?? '')}
              />
              <span className="help">
                Recommended: a square image (PNG, ICO or SVG). 32×32 or 64×64 looks best in browser tabs.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
        <div className="admin-card-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="admin-meta-row">
            {initial?.updated_at ? (
              <span>Last updated {new Date(initial.updated_at).toLocaleString()}</span>
            ) : (
              <span>No settings saved yet.</span>
            )}
          </div>
          <button type="button" className="admin-btn primary" onClick={handleSave} disabled={busy}>
            {busy ? <span className="admin-spinner" /> : null}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Live preview of the navbar logo at the chosen pixel size. Mirrors
 * the public navbar's layout (sticky header, blurred white background,
 * logo on the left, CTA button on the right) so the admin can judge
 * the size against a real-looking chrome rather than a stripped
 * thumbnail.
 */
function NavbarLogoPreview({ url, sizePx }: { url: string | null; sizePx: number }) {
  const height = clampNavbarLogoSize(sizePx);
  return (
    <div
      style={{
        marginTop: '0.75rem',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid var(--admin-border)',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
      aria-label="Navbar preview"
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          borderBottom: '1px solid rgba(15, 17, 21, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minHeight: height }}>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="Navbar logo preview"
              style={{ height, width: 'auto', display: 'block' }}
            />
          ) : (
            // Fallback wordmark so the preview still conveys size even
            // when no logo has been uploaded yet.
            <span
              style={{
                fontFamily: 'var(--font-display, ui-serif, Georgia, serif)',
                fontWeight: 600,
                fontSize: Math.max(12, height * 0.5),
                letterSpacing: '-0.02em',
                color: 'var(--ink-900, #0f1115)',
              }}
            >
              MukiSoft
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'white',
            background: 'var(--ink-900, #0f1115)',
            borderRadius: 9999,
            padding: '6px 12px',
            whiteSpace: 'nowrap',
          }}
        >
          Start a Project
        </span>
      </div>
      <div
        style={{
          padding: '0.4rem 0.75rem',
          fontSize: '0.7rem',
          color: 'var(--admin-text-dim)',
          background: 'rgba(15, 17, 21, 0.02)',
        }}
      >
        Live preview · logo rendered at {height}px tall inside a 64px navbar
      </div>
    </div>
  );
}