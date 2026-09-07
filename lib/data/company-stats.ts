import type { Stat, CoreValue, JobPosting } from '@/lib/types';

/**
 * Qualitative operating characteristics shown on the home page.
 *
 * Numbers and rankings are deliberately replaced with descriptive
 * positioning. We do not fabricate metrics.
 */
export const stats: Stat[] = [
  { label: 'Modern Engineering', value: 'Production-ready', description: 'Maintainable, observable, secure' },
  { label: 'Business-Focused', value: 'Outcome-led', description: 'Anchored in business outcomes' },
  { label: 'Scalable Architecture', value: 'Built to grow', description: 'Designed for long-term evolution' },
  { label: 'Long-Term Thinking', value: 'Relationship-first', description: 'Optimised for trust and durability' },
];

/**
 * Company values. Used on the About page and anywhere we explain how
 * MukiSoft Technology operates.
 */
export const coreValues: CoreValue[] = [
  {
    title: 'Innovation',
    description:
      'We bring modern engineering and emerging technology to every engagement — adopting what works, not what is fashionable.',
    icon: 'lightbulb',
  },
  {
    title: 'Integrity',
    description:
      'We communicate honestly, set realistic expectations, and treat every engagement as a long-term relationship.',
    icon: 'shield',
  },
  {
    title: 'Quality',
    description:
      'We treat software engineering as a craft — clean architecture, rigorous testing and an obsession with long-term maintainability.',
    icon: 'star',
  },
  {
    title: 'Ownership',
    description:
      'We take ownership of outcomes, not just deliverables — staying close to the work until it succeeds.',
    icon: 'briefcase',
  },
  {
    title: 'Customer Focus',
    description:
      'Every decision is anchored in the customer outcome. We measure success by the value we create, not the hours we bill.',
    icon: 'users',
  },
  {
    title: 'Continuous Learning',
    description:
      'We invest in learning so our clients benefit from the latest thinking, methods and tools in modern software.',
    icon: 'sparkles',
  },
  {
    title: 'Long-Term Thinking',
    description:
      'We optimise for relationships and products that last across years — not for the easiest outcome today.',
    icon: 'rocket',
  },
];

/**
 * Open positions (editable). When team expansion is real, replace these
 * with actual postings.
 */
export const jobPostings: JobPosting[] = [
  {
    slug: 'senior-frontend-engineer',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote · International',
    type: 'Full-time',
    description:
      'Help us ship world-class web experiences for international clients using React, Next.js and TypeScript.',
    responsibilities: [
      'Build production-grade UI in Next.js and TypeScript',
      'Partner with design on accessible component systems',
      'Mentor engineers and contribute to architecture decisions',
      'Continuously improve performance and DX',
    ],
    requirements: [
      '5+ years building production web applications',
      'Deep React and TypeScript expertise',
      'Experience with Next.js or similar frameworks',
      'Strong sense of UI craft and accessibility',
    ],
  },
  {
    slug: 'senior-product-designer',
    title: 'Senior Product Designer',
    department: 'Design',
    location: 'Remote · International',
    type: 'Full-time',
    description:
      'Lead product design for ambitious clients — from discovery to polished UI and design systems.',
    responsibilities: [
      'Run end-to-end design for client engagements',
      'Build and evolve design systems',
      'Conduct user research and validation',
      'Partner closely with engineering and product',
    ],
    requirements: [
      '5+ years designing digital products',
      'Strong portfolio of shipped work',
      'Fluency in modern design tools',
      'Comfort with research and facilitation',
    ],
  },
  {
    slug: 'ai-engineer',
    title: 'Applied AI Engineer',
    department: 'AI & Data',
    location: 'Remote · International',
    type: 'Full-time',
    description:
      'Ship reliable, evaluation-driven AI features into real products — copilots, agents, retrieval and beyond.',
    responsibilities: [
      'Design and ship AI features in production',
      'Build evaluation and monitoring frameworks',
      'Partner with product and engineering',
      'Stay close to the evolving AI ecosystem',
    ],
    requirements: [
      'Hands-on experience with modern AI APIs',
      'Strong engineering fundamentals',
      'Bias for shipping and measuring',
      'Curiosity and rigour',
    ],
  },
];