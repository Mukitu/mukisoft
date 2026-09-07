/**
 * Registry of which fields on which entity types are translatable.
 *
 * Single source of truth for both:
 *   - the public fetchers (which fields to substitute with translations), and
 *   - the admin UI (which fields to render per-row translation controls for).
 *
 * Adding a translatable field = add it here.
 *
 * Special array fields (e.g. `responsibilities`, `requirements`, `technology`,
 * `outcome`, `professional_focus`, `tags`) are JSON-stringified into one
 * translation row so we can cache them as a single text blob.
 */
export const TRANSLATABLE_FIELDS = {
  blog_post: [
    'title',
    'excerpt',
    'content',
    'seo_title',
    'seo_description',
    'og_title',
    'og_description',
    'featured_image_alt',
  ],
  blog_category: ['name', 'description'],
  blog_tag: ['name'],
  portfolio_project: [
    'title',
    'short_description',
    'description',
    'challenge',
    'approach',
    'solution',
    'outcome',
    'industry',
    'category',
    'alt_text',
    'technology',
  ],
  gallery_event: [
    'title',
    'short_description',
    'description',
    'location',
    'category',
    'cover_image_alt',
  ],
  gallery_image: ['caption', 'alt_text'],
  research_paper: [
    'title',
    'abstract',
    'description',
    'publication_type',
    'category',
    'journal_name',
    'conference_name',
    'cover_image_alt',
  ],
  service_category: ['name', 'description'],
  service: ['name', 'short_description', 'description'],
  leadership_member: [
    'name',
    'position',
    'short_bio',
    'full_bio',
    'education',
    'university',
    'professional_focus',
    'image_alt',
  ],
  team_member: ['name', 'role', 'department', 'bio', 'image_alt'],
  process_step: ['title', 'short_description', 'full_description'],
  career_role: [
    'job_title',
    'department',
    'location',
    'employment_type',
    'description',
    'responsibilities',
    'requirements',
    'nice_to_have',
  ],
  about_page: [
    'title',
    'subtitle',
    'hero_description',
    'who_we_are_title',
    'who_we_are_content',
    'mission',
    'vision',
    'values',
    'story',
    'capabilities',
    'cta_title',
    'cta_description',
    'seo_title',
    'seo_description',
  ],
  site_setting: [
    'tagline',
    'description',
    'location',
    'copyright_text',
    'site_title',
    'meta_description',
    'og_title',
    'og_description',
  ],
} as const;

export type TranslatableEntityType = keyof typeof TRANSLATABLE_FIELDS;
export type TranslatableField<T extends TranslatableEntityType> =
  (typeof TRANSLATABLE_FIELDS)[T][number];

/**
 * Some entity types use a different DB table name than the entity key we
 * use in the `translations` registry. This maps the registry key to the
 * actual Supabase table name.
 */
export const ENTITY_TABLE_MAP: Record<TranslatableEntityType, string> = {
  blog_post: 'blog_posts',
  blog_category: 'blog_categories',
  blog_tag: 'blog_tags',
  portfolio_project: 'portfolio_projects',
  gallery_event: 'gallery_events',
  gallery_image: 'gallery_images',
  research_paper: 'research_papers',
  service_category: 'service_categories',
  service: 'services',
  leadership_member: 'leadership',
  team_member: 'team_members',
  process_step: 'process_steps',
  career_role: 'careers',
  about_page: 'about_pages',
  site_setting: 'site_settings',
};

/**
 * JSON-encoded array fields. These are stored in the DB as text[] but we
 * treat them as one translation row (the array joined with newlines) so
 * LibreTranslate can translate the whole list as one chunk.
 */
export const ARRAY_FIELDS: Record<string, readonly string[]> = {
  portfolio_project: ['technology', 'outcome'],
  leadership_member: ['professional_focus'],
  career_role: ['responsibilities', 'requirements', 'nice_to_have'],
};

export function isTranslatableEntity(value: string): value is TranslatableEntityType {
  return value in TRANSLATABLE_FIELDS;
}

export function getTranslatableFields(entityType: TranslatableEntityType): readonly string[] {
  return TRANSLATABLE_FIELDS[entityType] ?? [];
}

export function isArrayField(entityType: string, field: string): boolean {
  return (ARRAY_FIELDS[entityType] ?? []).includes(field);
}
