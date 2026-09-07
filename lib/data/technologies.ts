import type { TechnologyCategory } from '@/lib/types';

/**
 * MukiSoft Technology's technology ecosystem.
 *
 * These are the engineering capabilities we bring to client work. We do
 * NOT claim official partnerships, certifications or vendor
 * relationships — these are simply the tools our engineers work with.
 */
export const technologyCategories: TechnologyCategory[] = [
  {
    slug: 'frontend',
    title: 'Frontend',
    description:
      'Modern, accessible and performant interfaces — built with the tools engineering teams love.',
    items: [
      { name: 'React', category: 'Frontend' },
      { name: 'Next.js', category: 'Frontend' },
      { name: 'TypeScript', category: 'Frontend' },
      { name: 'JavaScript', category: 'Frontend' },
      { name: 'Tailwind CSS', category: 'Frontend' },
      { name: 'HTML5 & CSS3', category: 'Frontend' },
    ],
  },
  {
    slug: 'backend',
    title: 'Backend',
    description:
      'Robust server-side systems — from lightweight APIs to high-throughput distributed backends.',
    items: [
      { name: 'Node.js', category: 'Backend' },
      { name: 'Express', category: 'Backend' },
      { name: 'NestJS', category: 'Backend' },
      { name: 'Python', category: 'Backend' },
      { name: 'Django', category: 'Backend' },
      { name: 'FastAPI', category: 'Backend' },
      { name: 'GraphQL', category: 'Backend' },
      { name: 'REST APIs', category: 'Backend' },
    ],
  },
  {
    slug: 'database',
    title: 'Database',
    description:
      'Pragmatic data modelling and storage — relational, document and vector where they fit best.',
    items: [
      { name: 'MongoDB', category: 'Database' },
      { name: 'PostgreSQL', category: 'Database' },
      { name: 'MySQL', category: 'Database' },
      { name: 'Redis', category: 'Database' },
      { name: 'Supabase', category: 'Database' },
      { name: 'Vector databases', category: 'Database' },
    ],
  },
  {
    slug: 'mobile',
    title: 'Mobile',
    description:
      'Native and cross-platform mobile engineering for Android, iOS and beyond.',
    items: [
      { name: 'React Native', category: 'Mobile' },
      { name: 'Expo', category: 'Mobile' },
      { name: 'Flutter', category: 'Mobile' },
      { name: 'Kotlin', category: 'Mobile' },
      { name: 'Swift', category: 'Mobile' },
    ],
  },
  {
    slug: 'ai-ml',
    title: 'AI & ML',
    description:
      'Applied AI and machine learning capabilities — grounded in real production use cases.',
    items: [
      { name: 'Modern AI APIs', category: 'AI & ML' },
      { name: 'LLM integration', category: 'AI & ML' },
      { name: 'Prompt engineering', category: 'AI & ML' },
      { name: 'Retrieval-augmented generation', category: 'AI & ML' },
      { name: 'Vector search', category: 'AI & ML' },
      { name: 'Python', category: 'AI & ML' },
      { name: 'LangChain', category: 'AI & ML' },
    ],
  },
  {
    slug: 'cloud',
    title: 'Cloud',
    description:
      'Reliable, observable and cost-aware cloud architecture on the leading platforms.',
    items: [
      { name: 'Vercel', category: 'Cloud' },
      { name: 'Netlify', category: 'Cloud' },
      { name: 'AWS', category: 'Cloud' },
      { name: 'Google Cloud', category: 'Cloud' },
      { name: 'Docker', category: 'Cloud' },
      { name: 'Serverless functions', category: 'Cloud' },
    ],
  },
  {
    slug: 'devops',
    title: 'DevOps',
    description:
      'Engineering practices and tooling that let teams ship safely and confidently.',
    items: [
      { name: 'GitHub', category: 'DevOps' },
      { name: 'GitHub Actions', category: 'DevOps' },
      { name: 'CI/CD pipelines', category: 'DevOps' },
      { name: 'Monitoring and logging', category: 'DevOps' },
    ],
  },
  {
    slug: 'design',
    title: 'Design',
    description:
      'Tools and workflows for design systems, prototyping and engineering handoff.',
    items: [
      { name: 'Figma', category: 'Design' },
      { name: 'Design systems', category: 'Design' },
      { name: 'Prototyping', category: 'Design' },
    ],
  },
];

export function getAllTechnologies() {
  return technologyCategories.flatMap((c) => c.items.map((i) => ({ ...i, categorySlug: c.slug })));
}