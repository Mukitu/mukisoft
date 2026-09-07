'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/supabase/admin-actions';
import type { AboutPage } from '@/lib/supabase/types';
import { useToast } from '@/components/admin/toast-provider';
import { RichTextEditor, RichTextRender } from '@/components/admin/rich-text-editor';

type FormState = {
  id?: number;
  title: string;
  subtitle: string;
  hero_description: string;
  who_we_are_title: string;
  who_we_are_content: string;
  mission: string;
  vision: string;
  values: string;
  story: string;
  capabilities: string;
  cta_title: string;
  cta_description: string;
  seo_title: string;
  seo_description: string;
  status: 'draft' | 'published';
};

function fromAbout(about: AboutPage | null): FormState {
  return {
    id: about?.id,
    title: about?.title ?? 'About MukiSoft Technology',
    subtitle: about?.subtitle ?? '',
    hero_description: about?.hero_description ?? '',
    who_we_are_title: about?.who_we_are_title ?? 'Who we are',
    who_we_are_content: about?.who_we_are_content ?? '',
    mission: about?.mission ?? '',
    vision: about?.vision ?? '',
    values: arrayToText(about?.values),
    story: arrayToText(about?.story),
    capabilities: arrayToText(about?.capabilities),
    cta_title: about?.cta_title ?? '',
    cta_description: about?.cta_description ?? '',
    seo_title: about?.seo_title ?? '',
    seo_description: about?.seo_description ?? '',
    status: (about?.status as 'draft' | 'published') ?? 'draft',
  };
}

function arrayToText(value: unknown): string {
  if (!value) return '';
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;
          if (typeof obj.title === 'string' && typeof obj.description === 'string') {
            return `${obj.title}::${obj.description}`;
          }
          return JSON.stringify(item);
        }
        return String(item);
      })
      .join('\n');
  }
  if (typeof value === 'string') return value;
  return '';
}

function textToJsonArray(text: string) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  return lines.map((line) => {
    if (line.includes('::')) {
      const [title, ...rest] = line.split('::');
      return { title: title.trim(), description: rest.join('::').trim() };
    }
    return { title: line, description: '' };
  });
}

export function AboutEditor({ initial }: { initial: AboutPage | null }) {
  const router = useRouter();
  const { push } = useToast();
  const [form, setForm] = useState<FormState>(() => fromAbout(initial));
  const [busy, setBusy] = useState<null | 'save' | 'publish'>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = (status: 'draft' | 'published') => ({
    title: form.title.trim() || 'About MukiSoft Technology',
    subtitle: form.subtitle || null,
    hero_description: form.hero_description || null,
    who_we_are_title: form.who_we_are_title || null,
    who_we_are_content: form.who_we_are_content || null,
    mission: form.mission || null,
    vision: form.vision || null,
    values: textToJsonArray(form.values),
    story: textToJsonArray(form.story),
    capabilities: textToJsonArray(form.capabilities),
    cta_title: form.cta_title || null,
    cta_description: form.cta_description || null,
    seo_title: form.seo_title || null,
    seo_description: form.seo_description || null,
    status,
  });

  const handleSave = async (status: 'draft' | 'published') => {
    if (busy) return;
    setBusy(status === 'published' ? 'publish' : 'save');
    try {
      const payload = buildPayload(status);
      if (form.id) {
        await adminApi.update('about_pages', String(form.id), payload);
      } else {
        const created = (await adminApi.create('about_pages', payload)) as { id: number };
        setForm((prev) => ({ ...prev, id: created.id, status }));
      }
      push(status === 'published' ? 'About page published.' : 'Draft saved.', 'success');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save About page.';
      push(message, 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="admin-grid admin-grid-2" style={{ alignItems: 'start' }}>
      <div className="admin-card">
        <div className="admin-card-pad">
          <h3 className="admin-card-title">Editor</h3>
          <p className="admin-card-sub">All changes are saved with timestamps. Publish to make them live.</p>
          <div className="admin-form">
            <div className="admin-form-row cols-2">
              <div className="admin-field">
                <label htmlFor="about-title">Title</label>
                <input
                  id="about-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="about-subtitle">Subtitle</label>
                <input
                  id="about-subtitle"
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => update('subtitle', e.target.value)}
                />
              </div>
            </div>
            <div className="admin-field">
              <label htmlFor="about-hero">Hero description</label>
              <textarea
                id="about-hero"
                value={form.hero_description}
                onChange={(e) => update('hero_description', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="about-who-title">Who we are — title</label>
              <input
                id="about-who-title"
                type="text"
                value={form.who_we_are_title}
                onChange={(e) => update('who_we_are_title', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="about-who">Who we are — content</label>
              <RichTextEditor
                id="about-who"
                value={form.who_we_are_content}
                onChange={(v) => update('who_we_are_content', v)}
                placeholder="Two or three paragraphs describing the company."
              />
            </div>
            <div className="admin-form-row cols-2">
              <div className="admin-field">
                <label htmlFor="about-mission">Mission</label>
                <textarea
                  id="about-mission"
                  value={form.mission}
                  onChange={(e) => update('mission', e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="about-vision">Vision</label>
                <textarea
                  id="about-vision"
                  value={form.vision}
                  onChange={(e) => update('vision', e.target.value)}
                />
              </div>
            </div>
            <div className="admin-field">
              <label htmlFor="about-values">Values (one per line, use Title::Description)</label>
              <textarea
                id="about-values"
                value={form.values}
                onChange={(e) => update('values', e.target.value)}
                placeholder={"Innovation::Bringing modern engineering to every engagement\nIntegrity::Communicating honestly"}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="about-story">Story milestones (one per line, use Year::Title::Description)</label>
              <textarea
                id="about-story"
                value={form.story}
                onChange={(e) => update('story', e.target.value)}
                placeholder={'2021::Foundation::MukiSoft Technology was founded.'}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="about-capabilities">Capabilities (one per line, use Title::Description)</label>
              <textarea
                id="about-capabilities"
                value={form.capabilities}
                onChange={(e) => update('capabilities', e.target.value)}
                placeholder={'Software Engineering::Production-grade software systems'}
              />
            </div>
            <div className="admin-form-row cols-2">
              <div className="admin-field">
                <label htmlFor="about-cta-title">CTA — title</label>
                <input
                  id="about-cta-title"
                  type="text"
                  value={form.cta_title}
                  onChange={(e) => update('cta_title', e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="about-cta-desc">CTA — description</label>
                <input
                  id="about-cta-desc"
                  type="text"
                  value={form.cta_description}
                  onChange={(e) => update('cta_description', e.target.value)}
                />
              </div>
            </div>
            <div className="admin-form-row cols-2">
              <div className="admin-field">
                <label htmlFor="about-seo-title">SEO title</label>
                <input
                  id="about-seo-title"
                  type="text"
                  value={form.seo_title}
                  onChange={(e) => update('seo_title', e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="about-seo-desc">SEO description</label>
                <input
                  id="about-seo-desc"
                  type="text"
                  value={form.seo_description}
                  onChange={(e) => update('seo_description', e.target.value)}
                />
              </div>
            </div>
            <div className="admin-toolbar" style={{ marginTop: '0.5rem' }}>
              <div className="left">
                <span className="admin-pill">
                  {form.status === 'published' ? 'Status: Published' : 'Status: Draft'}
                </span>
                {initial?.updated_at ? (
                  <span className="admin-pill">
                    Last updated {new Date(initial.updated_at).toLocaleString()}
                  </span>
                ) : null}
              </div>
              <div className="right">
                <a href="/about" target="_blank" rel="noreferrer noopener" className="admin-btn ghost">
                  Preview public page
                </a>
                <button type="button" className="admin-btn" onClick={() => handleSave('draft')} disabled={!!busy}>
                  {busy === 'save' ? <span className="admin-spinner" /> : null}
                  Save Draft
                </button>
                <button
                  type="button"
                  className="admin-btn primary"
                  onClick={() => handleSave('published')}
                  disabled={!!busy}
                >
                  {busy === 'publish' ? <span className="admin-spinner" /> : null}
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-pad">
          <h3 className="admin-card-title">Preview</h3>
          <p className="admin-card-sub">Approximate render of the published content.</p>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{form.title}</h2>
          {form.subtitle ? (
            <p style={{ color: 'var(--admin-text-muted)', margin: '0 0 1rem' }}>{form.subtitle}</p>
          ) : null}
          {form.who_we_are_content ? (
            <>
              <h4 style={{ margin: '1rem 0 0.5rem' }}>{form.who_we_are_title}</h4>
              <RichTextRender value={form.who_we_are_content} />
            </>
          ) : null}
          {form.mission ? (
            <>
              <h4 style={{ margin: '1rem 0 0.5rem' }}>Mission</h4>
              <RichTextRender value={form.mission} />
            </>
          ) : null}
          {form.vision ? (
            <>
              <h4 style={{ margin: '1rem 0 0.5rem' }}>Vision</h4>
              <RichTextRender value={form.vision} />
            </>
          ) : null}
          {form.values ? (
            <>
              <h4 style={{ margin: '1rem 0 0.5rem' }}>Values</h4>
              <RichTextRender value={form.values} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}