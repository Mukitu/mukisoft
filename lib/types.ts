export type Social = {
  linkedin?: string;
  x?: string;
  github?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
};

export type Company = {
  name: string;
  shortName: string;
  legalName: string;
  /**
   * Always-non-empty company name for places that REQUIRE a string
   * (OpenGraph siteName, JSON-LD `name` / `creator` / `publisher`,
   * document.title template, etc.). Falls back to the static default
   * "MukiSoft Technology" when the admin leaves `company_name` blank
   * so search engines and crawlers always see a real brand.
   */
  displayName: string;
  tagline: string;
  headline?: string;
  description: string;
  brandStatement: string;
  internationalStatement?: string;
  foundedYear: number;
  /** Optional override for the footer copyright line. When set, replaces the default `© {FOUNDED_YEAR}–{CURRENT_YEAR} {legalName}` pattern. */
  copyright?: string;
  founder: {
    name: string;
    role: string;
    shortRole?: string;
    bio: string;
    shortBio?: string;
    title?: string;
    photo: string;
    education?: {
      degree: string;
      university: string;
      status: string;
    };
    email?: string;
    phone?: string;
    phoneDisplay?: string;
    location?: string;
    focus?: string[];
    social: Social;
  };
  contact: {
    email: string;
    phone: string;
    phoneDisplay?: string;
    location: string;
    address: string;
    country: string;
    hours: string;
    website?: string;
  };
  social: Social;
};

export type IconName =
  | 'code'
  | 'web'
  | 'mobile'
  | 'software'
  | 'saas'
  | 'ai'
  | 'ml'
  | 'automation'
  | 'api'
  | 'design'
  | 'graphic'
  | 'seo'
  | 'marketing'
  | 'cloud'
  | 'ecommerce'
  | 'enterprise'
  | 'consulting'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'arrow-down-right'
  | 'check'
  | 'plus'
  | 'minus'
  | 'menu'
  | 'close'
  | 'chevron-down'
  | 'chevron-right'
  | 'mail'
  | 'phone'
  | 'location'
  | 'globe'
  | 'sparkles'
  | 'shield'
  | 'rocket'
  | 'users'
  | 'briefcase'
  | 'lightbulb'
  | 'star'
  | 'github'
  | 'linkedin'
  | 'x'
  | 'instagram'
  | 'youtube'
  | 'facebook';

export type Service = {
  slug: string;
  category: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  icon: IconName;
  benefits: string[];
  technologies: string[];
  process: string[];
  outcomes: string[];
};

export type ServiceCategory = {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  services: Service[];
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  industry: string;
  type: 'Web' | 'Mobile' | 'SaaS' | 'AI' | 'E-commerce' | 'Enterprise';
  shortDescription: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  technologies: string[];
  year: number;
  duration: string;
  teamSize: string;
  image: string;
  liveUrl?: string;
  caseStudySlug?: string;
  isDemo?: boolean;
};

export type CaseStudy = {
  slug: string;
  projectSlug: string;
  title: string;
  excerpt: string;
  sections: { title: string; content: string }[];
  highlights: { label: string; value: string }[];
  testimonial?: { quote: string; author: string; role: string };
};

export type Technology = {
  name: string;
  category: string;
  description?: string;
};

export type TechnologyCategory = {
  slug: string;
  title: string;
  description: string;
  items: Technology[];
};

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
  activities: string[];
  duration: string;
};

export type Industry = {
  slug: string;
  title: string;
  description: string;
  challenges: string[];
  solutions: string[];
  outcomes: string[];
  icon: IconName;
};

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  department: 'Leadership' | 'Engineering' | 'Design' | 'AI & Data' | 'Growth' | 'Operations';
  bio: string;
  photo: string;
  social?: Social;
};

export type FAQ = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export type NavItem = {
  label: string;
  href?: string;
  description?: string;
  children?: NavItem[];
};

export type Stat = {
  label: string;
  value: string;
  description?: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company?: string;
};

export type JobPosting = {
  slug: string;
  title: string;
  department: 'Engineering' | 'Design' | 'AI & Data' | 'Operations' | 'Growth';
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  description: string;
  responsibilities: string[];
  requirements: string[];
};

export type TimelineMilestone = {
  year: string;
  title: string;
  description: string;
};

export type CoreValue = {
  title: string;
  description: string;
  icon: IconName;
};