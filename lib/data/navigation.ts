import type { NavItem } from '@/lib/types';

export const primaryNavigation: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Company',
    children: [
      { label: 'About', href: '/about', description: 'Who we are and what we believe' },
      { label: 'Leadership', href: '/founder', description: 'The leadership behind MukiSoft' },
      { label: 'Team', href: '/team', description: 'The people behind the technology' },
      { label: 'Our Process', href: '/process', description: 'How MukiSoft delivers' },
      { label: 'Careers', href: '/careers', description: 'Building a career with us' },
    ],
  },
  {
    label: 'Capabilities',
    children: [
      {
        label: 'Software Engineering',
        href: '/services/software-development',
        description:
          'Custom platforms, internal systems and enterprise applications engineered for your operations.',
      },
      {
        label: 'Web Platforms',
        href: '/services/web-development',
        description:
          'Marketing websites, dashboards and full-stack web applications built for scale.',
      },
      {
        label: 'Mobile Applications',
        href: '/services/mobile-development',
        description:
          'Native iOS and Android apps, plus cross-platform builds with shared codebases.',
      },
      {
        label: 'AI & Machine Learning',
        href: '/services/ai-ml',
        description:
          'Applied AI features, intelligent automation and production machine learning systems.',
      },
      {
        label: 'SaaS & Digital Products',
        href: '/services/saas-digital-products',
        description:
          'Multi-tenant SaaS, MVPs and subscription products with billing and analytics baked in.',
      },
      {
        label: 'Product Design',
        href: '/services/design',
        description:
          'Research-led product UI/UX, design systems and brand identity for digital teams.',
      },
      {
        label: 'E-commerce Solutions',
        href: '/services/ecommerce-solutions',
        description:
          'Headless storefronts, payments and fulfilment for modern commerce brands.',
      },
      {
        label: 'Automation & Integrations',
        href: '/services/automation-integrations',
        description:
          'Workflow automation and reliable integrations across the systems your business runs on.',
      },
      {
        label: 'Cloud & Technology',
        href: '/services/cloud-technology',
        description:
          'Cloud architecture, DevOps, APIs and senior technology consulting for growing teams.',
      },
      {
        label: 'SEO & Digital Growth',
        href: '/services/growth',
        description:
          'Technical SEO, content and conversion programmes that build compounding inbound revenue.',
      },
    ],
  },
  {
    label: 'Work',
    children: [
      { label: 'Selected Work', href: '/portfolio', description: 'Our portfolio across categories' },
      { label: 'Our Process', href: '/process', description: 'How MukiSoft delivers' },
      { label: 'Company Gallery', href: '/gallery', description: 'Events, moments & company activities' },
      {
        label: 'Research & Publications',
        href: '/research',
        description: 'Research papers and publications by MukiSoft',
      },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const footerNavigation = {
  company: [
    { label: 'About', href: '/about' },
    { label: 'Leadership', href: '/founder' },
    { label: 'Team', href: '/team' },
    { label: 'Our Process', href: '/process' },
    { label: 'Careers', href: '/careers' },
  ],
  capabilities: [
    { label: 'Software Engineering', href: '/services/software-development' },
    { label: 'Web Platforms', href: '/services/web-development' },
    { label: 'Mobile Applications', href: '/services/mobile-development' },
    { label: 'AI & Machine Learning', href: '/services/ai-ml' },
    { label: 'SaaS & Digital Products', href: '/services/saas-digital-products' },
    { label: 'Product Design', href: '/services/design' },
    { label: 'E-commerce Solutions', href: '/services/ecommerce-solutions' },
    { label: 'Automation & Integrations', href: '/services/automation-integrations' },
    { label: 'Cloud & Technology', href: '/services/cloud-technology' },
    { label: 'SEO & Digital Growth', href: '/services/growth' },
  ],
  industries: [
    { label: 'About MukiSoft', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Insights', href: '/blog' },
  ],
  resources: [
    { label: 'Selected Work', href: '/portfolio' },
    { label: 'Our Process', href: '/process' },
    { label: 'Company Gallery', href: '/gallery' },
    { label: 'Research & Publications', href: '/research' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact MukiSoft', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  ],
};