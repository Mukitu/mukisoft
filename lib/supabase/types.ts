/**
 * Database types matching the SQL schema in supabase/migrations/0001_init_schema.sql.
 *
 * Hand-written so the project does not depend on the Supabase CLI to
 * generate types. Keep these in sync with the migration file.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AdminRole = 'admin' | 'editor';
export type PublishStatus = 'draft' | 'published';

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: number;
  company_name: string;
  short_name: string;
  tagline: string;
  description: string | null;
  email: string;
  phone: string;
  location: string;
  website: string;
  founded_year: number;
  copyright_text: string | null;
  site_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  navbar_logo_url: string | null;
  /**
   * Rendered height of the navbar logo in CSS pixels. Admins can
   * adjust this from the Brand assets section of the admin settings
   * page. Default 36; clamped to the 16–96 range by a CHECK
   * constraint in `supabase/migrations/0006_navbar_logo_size.sql`.
   */
  navbar_logo_size: number;
  favicon_url: string | null;
  updated_at: string;
  created_at: string;
}

export interface AboutPage {
  id: number;
  title: string;
  subtitle: string | null;
  hero_description: string | null;
  who_we_are_title: string | null;
  who_we_are_content: string | null;
  mission: string | null;
  vision: string | null;
  values: string | null;
  story: string | null;
  capabilities: string | null;
  cta_title: string | null;
  cta_description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: PublishStatus;
  updated_at: string;
  created_at: string;
}

export interface Leadership {
  id: string;
  name: string;
  position: string;
  short_bio: string | null;
  full_bio: string | null;
  education: string | null;
  university: string | null;
  professional_focus: string[] | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_focus: string;
  linkedin_url: string | null;
  github_url: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string | null;
  bio: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_focus: string;
  email: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  x_url: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessStep {
  id: string;
  step_number: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  icon: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Career {
  id: string;
  job_title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
  responsibilities: string[] | null;
  requirements: string[] | null;
  nice_to_have: string[] | null;
  application_email: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  industry: string | null;
  short_description: string | null;
  description: string | null;
  challenge: string | null;
  approach: string | null;
  solution: string | null;
  technology: string[] | null;
  outcome: string[] | null;
  image_url: string | null;
  alt_text: string | null;
  project_url: string | null;
  case_study_url: string | null;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  featured_image_alt: string | null;
  category_id: string | null;
  author_id: string | null;
  status: PublishStatus;
  is_featured: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostTag {
  post_id: string;
  tag_id: string;
}

export interface MediaAsset {
  id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  bucket: string;
  folder: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
}

/**
 * A company event shown on the public /gallery page. Image binaries are
 * stored in the `mukisoft-media` bucket; `cover_image_path` holds the
 * object path. A separate `gallery_images` table holds additional photos.
 */
export interface GalleryEvent {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  event_date: string | null;
  location: string | null;
  category: string | null;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  external_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  event_id: string;
  image_path: string;
  alt_text: string | null;
  caption: string | null;
  display_order: number;
  created_at: string;
}

/**
 * A research paper published by MukiSoft Technology.
 * `pdf_path` is the storage object path inside the `mukisoft-media` bucket.
 * `pdf_url` and `external_url` are absolute external links — none, one,
 * or both may be present.
 */
export interface ResearchPaper {
  id: string;
  title: string;
  slug: string;
  abstract: string | null;
  description: string | null;
  authors: string | null;
  author_member_id: string | null;
  publication_date: string | null;
  publication_type: string | null;
  category: string | null;
  journal_name: string | null;
  conference_name: string | null;
  doi: string | null;
  pdf_path: string | null;
  pdf_url: string | null;
  external_url: string | null;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  is_featured: boolean;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ResearchPaperAuthor {
  id: string;
  paper_id: string;
  name: string;
  affiliation: string | null;
  display_order: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUser;
        Insert: Partial<AdminUser> & {
          user_id: string;
          email: string;
          role: AdminRole;
        };
        Update: Partial<AdminUser>;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Partial<SiteSetting> & {
          company_name: string;
          short_name: string;
          tagline: string;
          email: string;
          phone: string;
          location: string;
          website: string;
          founded_year: number;
        };
        Update: Partial<SiteSetting>;
      };
      about_pages: {
        Row: AboutPage;
        Insert: Partial<AboutPage> & { title: string };
        Update: Partial<AboutPage>;
      };
      leadership: {
        Row: Leadership;
        Insert: Partial<Leadership> & { name: string; position: string };
        Update: Partial<Leadership>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Partial<TeamMember> & { name: string; role: string };
        Update: Partial<TeamMember>;
      };
      process_steps: {
        Row: ProcessStep;
        Insert: Partial<ProcessStep> & {
          step_number: string;
          title: string;
        };
        Update: Partial<ProcessStep>;
      };
      careers: {
        Row: Career;
        Insert: Partial<Career> & { job_title: string };
        Update: Partial<Career>;
      };
      portfolio_projects: {
        Row: PortfolioProject;
        Insert: Partial<PortfolioProject> & { title: string; slug: string };
        Update: Partial<PortfolioProject>;
      };
      blog_categories: {
        Row: BlogCategory;
        Insert: Partial<BlogCategory> & { name: string; slug: string };
        Update: Partial<BlogCategory>;
      };
      blog_tags: {
        Row: BlogTag;
        Insert: Partial<BlogTag> & { name: string; slug: string };
        Update: Partial<BlogTag>;
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Partial<BlogPost> & { title: string; slug: string };
        Update: Partial<BlogPost>;
      };
      blog_post_tags: {
        Row: BlogPostTag;
        Insert: Partial<BlogPostTag> & { post_id: string; tag_id: string };
        Update: Partial<BlogPostTag>;
      };
      media_assets: {
        Row: MediaAsset;
        Insert: Partial<MediaAsset> & {
          file_name: string;
          storage_path: string;
          public_url: string;
          bucket: string;
        };
        Update: Partial<MediaAsset>;
      };
      gallery_events: {
        Row: GalleryEvent;
        Insert: Partial<GalleryEvent> & { title: string; slug: string };
        Update: Partial<GalleryEvent>;
      };
      gallery_images: {
        Row: GalleryImage;
        Insert: Partial<GalleryImage> & { event_id: string; image_path: string };
        Update: Partial<GalleryImage>;
      };
      research_papers: {
        Row: ResearchPaper;
        Insert: Partial<ResearchPaper> & { title: string; slug: string };
        Update: Partial<ResearchPaper>;
      };
      research_paper_authors: {
        Row: ResearchPaperAuthor;
        Insert: Partial<ResearchPaperAuthor> & { paper_id: string; name: string };
        Update: Partial<ResearchPaperAuthor>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}