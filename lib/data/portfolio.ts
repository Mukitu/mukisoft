import type { Project, CaseStudy } from '@/lib/types';
import { assetPaths } from '@/lib/config/assets';

/**
 * Selected work showcases the engineering, design and product thinking
 * MukiSoft Technology brings to a brief of this type. Each project is a
 * reference build used to illustrate our craft, architecture patterns
 * and approach — they are not tied to a specific named client.
 */
export const projects: Project[] = [
  {
    slug: 'novacart-ecommerce',
    title: 'NovaCart Commerce Platform',
    category: 'Web Development',
    industry: 'E-commerce',
    type: 'E-commerce',
    shortDescription:
      'A modern headless commerce storefront with personalised merchandising and edge-ready performance.',
    description:
      'A reference commerce build illustrating a headless commerce architecture designed for conversion, performance and brand storytelling at international scale.',
    challenge:
      'Replace a legacy monolithic storefront suffering from slow pages, brittle releases and limited personalisation across markets and devices.',
    solution:
      'We designed and engineered a headless commerce experience on Next.js with edge-rendered product pages, a headless checkout, and an AI-assisted merchandising surface.',
    results: [
      'Reference architecture for modern commerce brands',
      'Edge-rendered product detail pages across markets',
      'Headless checkout with flexible payment integrations',
      'AI-assisted merchandising surface for personalisation',
    ],
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'Tailwind CSS'],
    year: new Date().getFullYear(),
    duration: '14 weeks',
    teamSize: 'Cross-functional product team',
    image: assetPaths.portfolio.byIndex(1),
    caseStudySlug: 'novacart-case-study',
  },
  {
    slug: 'finlytics-dashboard',
    title: 'Finlytics Analytics Platform',
    category: 'Web Development',
    industry: 'Finance',
    type: 'SaaS',
    shortDescription:
      'A SaaS analytics dashboard for finance teams — built for speed, depth and decision-making.',
    description:
      'A reference SaaS analytics platform illustrating a modern financial dashboard with real-time charts, custom reports and exportable artefacts for finance teams.',
    challenge:
      'Finance teams struggle with tools that are slow, opaque and difficult to extend without engineering support — limiting the speed of decisions.',
    solution:
      'We designed and engineered a dashboard with a clean information architecture, performance-first data grids and a flexible report builder suitable for multi-tenant SaaS.',
    results: [
      'Reference architecture for finance-grade dashboards',
      'Real-time data visualisation patterns at scale',
      'Multi-tenant foundations with role-aware access',
      'Exportable reporting for stakeholder workflows',
    ],
    technologies: ['Next.js', 'PostgreSQL', 'TypeScript'],
    year: new Date().getFullYear() - 1,
    duration: '12 weeks',
    teamSize: 'Cross-functional product team',
    image: assetPaths.portfolio.byIndex(2),
    caseStudySlug: 'finlytics-case-study',
  },
  {
    slug: 'carecompanion-mobile',
    title: 'CareCompanion Mobile',
    category: 'Mobile App Development',
    industry: 'Healthcare',
    type: 'Mobile',
    shortDescription:
      'A cross-platform patient companion app with secure messaging, scheduling and AI assistance.',
    description:
      'A reference mobile product showcasing secure healthcare patterns: encrypted messaging, appointment scheduling and AI-driven patient guidance grounded in context.',
    challenge:
      'Healthcare teams need a secure, accessible companion app that supports patients between visits without overwhelming clinicians or risking data exposure.',
    solution:
      'A cross-platform mobile application with secure messaging, appointment booking, and an AI assistant grounded in patient context and consent.',
    results: [
      'Mobile-first healthcare UX patterns',
      'Privacy-conscious architecture by default',
      'AI assistance grounded in user consent and data',
      'Cross-platform engineering for reach',
    ],
    technologies: ['React Native', 'TypeScript'],
    year: new Date().getFullYear() - 1,
    duration: '10 weeks',
    teamSize: 'Cross-functional product team',
    image: assetPaths.portfolio.byIndex(3),
  },
  {
    slug: 'edusphere-platform',
    title: 'EduSphere Learning Platform',
    category: 'SaaS & Digital Products',
    industry: 'Education',
    type: 'SaaS',
    shortDescription:
      'A modern learning platform with courses, assessments and AI tutoring built in.',
    description:
      'A reference learning platform illustrating the architecture for a multi-tenant SaaS in education — courses, assessments, analytics and AI tutoring grounded in material.',
    challenge:
      'Build a flexible learning platform that works for independent educators as well as institutions, with strong analytics and consistent learner experience.',
    solution:
      'A multi-tenant SaaS architecture with a thoughtful content model, learner analytics and AI-assisted tutoring grounded in course material and outcomes.',
    results: [
      'Multi-tenant SaaS foundations',
      'AI tutoring architecture with content grounding',
      'Analytics-ready data model for educators',
      'Scalable content and assessment framework',
    ],
    technologies: ['Next.js', 'PostgreSQL', 'TypeScript'],
    year: new Date().getFullYear(),
    duration: '16 weeks',
    teamSize: 'Cross-functional product team',
    image: assetPaths.portfolio.byIndex(4),
  },
  {
    slug: 'logiq-fleet',
    title: 'LogiQ Fleet Operations',
    category: 'AI & Machine Learning',
    industry: 'Logistics',
    type: 'Enterprise',
    shortDescription:
      'An AI-assisted fleet operations platform with predictive routing and driver analytics.',
    description:
      'A reference enterprise platform illustrating how AI can be applied to fleet operations — predictive routing, anomaly detection and operational dashboards.',
    challenge:
      'Fleet operators rely on fragmented tools that produce too much data and too little actionable insight, limiting day-to-day operational decisions.',
    solution:
      'A unified operational layer with predictive routing, anomaly detection and role-aware dashboards built for operations teams and field users.',
    results: [
      'Predictive routing patterns for fleet operations',
      'Operator-grade UX for high-frequency use',
      'Scalable data model for telemetry and events',
      'Role-aware dashboards across operations teams',
    ],
    technologies: ['Python', 'Next.js', 'PostgreSQL'],
    year: new Date().getFullYear() - 1,
    duration: '14 weeks',
    teamSize: 'Cross-functional product team',
    image: assetPaths.portfolio.byIndex(5),
  },
  {
    slug: 'brandkit-identity',
    title: 'BrandKit Identity System',
    category: 'UI/UX & Product Design',
    industry: 'SaaS',
    type: 'Web',
    shortDescription:
      'A scalable identity and design system for a B2B SaaS entering new markets.',
    description:
      'A reference brand and design system project showcasing scalable visual identity, component libraries and usage guidelines for scaling teams.',
    challenge:
      'A scaling SaaS needs an identity and design system that works across markets, surfaces and product teams — without becoming a bottleneck.',
    solution:
      'A modular visual identity with a component-driven design system, usage guidelines and clear governance for cross-team adoption.',
    results: [
      'Scalable brand foundations across markets',
      'Reusable component library',
      'Governance model for cross-team adoption',
      'Design tokens for engineering alignment',
    ],
    technologies: ['Figma', 'Design Tokens'],
    year: new Date().getFullYear(),
    duration: '8 weeks',
    teamSize: 'Cross-functional product team',
    image: assetPaths.portfolio.byIndex(6),
  },
  {
    slug: 'agritech-marketplace',
    title: 'AgriTech Marketplace',
    category: 'Web Development',
    industry: 'Agriculture',
    type: 'SaaS',
    shortDescription:
      'A reference digital marketplace connecting farmers, cooperatives and buyers — with offline-first field tools and intelligent pricing.',
    description:
      'A demo digital marketplace illustrating the architecture for a modern agricultural platform — connecting producers, cooperatives and buyers with offline-ready field tools, intelligent pricing and accessible mobile UX.',
    challenge:
      'Agricultural supply chains rely on fragmented tools that do not work in low-connectivity environments, leaving producers and buyers without reliable digital infrastructure.',
    solution:
      'We designed and engineered an offline-first marketplace platform with intelligent pricing surfaces, role-aware access for producers, cooperatives and buyers, and a mobile experience built for low-bandwidth environments.',
    results: [
      'Offline-first marketplace architecture',
      'Intelligent pricing and matchmaking surfaces',
      'Role-aware access for producers, cooperatives and buyers',
      'Mobile UX optimised for low-bandwidth environments',
    ],
    technologies: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    year: new Date().getFullYear(),
    duration: '14 weeks',
    teamSize: 'Cross-functional product team',
    image: assetPaths.portfolio.byIndex(7),
  },
];

export const caseStudies: CaseStudy[] = [
  {
    slug: 'novacart-case-study',
    projectSlug: 'novacart-ecommerce',
    title: 'NovaCart — A headless commerce storefront',
    excerpt:
      'How a modern headless commerce architecture unlocks speed, personalisation and brand storytelling for ambitious commerce brands.',
    sections: [
      {
        title: 'Challenge',
        content:
          'A direct-to-consumer brand needed a flagship storefront that could combine premium storytelling with reliable, fast commerce. The legacy stack was brittle, slow to release and impossible to personalise at the edge.',
      },
      {
        title: 'Approach',
        content:
          'We designed a headless architecture on Next.js with edge-rendered product pages, a flexible checkout, and a merchandising surface driven by clean data. Visual identity was rebuilt around a modern editorial system that the brand team could evolve independently.',
      },
      {
        title: 'Solution',
        content:
          'A modular commerce platform with a component-driven storefront, a headless checkout that supports regional payment options, and a merchandising surface designed to support personalisation without compromising page performance.',
      },
      {
        title: 'Technology',
        content:
          'Next.js with edge rendering for product pages, TypeScript across the stack, Stripe for payment orchestration, and Tailwind CSS for the design system. The data layer was modelled to keep catalogue, content and merchandising cleanly separated.',
      },
      {
        title: 'Implementation',
        content:
          'Delivered in iterative engineering cycles — design system and storefront first, then checkout and payments, then merchandising and analytics. Each cycle produced working software that the team could test and validate in production-equivalent environments.',
      },
      {
        title: 'Outcome',
        content:
          'A demonstrable storefront that combines performance, design quality and personalisation — suitable as a reference architecture for ambitious commerce brands entering modern digital markets.',
      },
    ],
    highlights: [
      { label: 'Stack', value: 'Next.js · TypeScript' },
      { label: 'Type', value: 'E-commerce · Headless' },
      { label: 'Engagement', value: 'Discovery to deployment' },
    ],
  },
  {
    slug: 'finlytics-case-study',
    projectSlug: 'finlytics-dashboard',
    title: 'Finlytics — A SaaS analytics platform',
    excerpt:
      'Building a dashboard experience finance teams actually want to use — fast, flexible and export-friendly.',
    sections: [
      {
        title: 'Challenge',
        content:
          'Finance teams spend too much time wrestling with tools that are slow and opaque. We set out to design a dashboard experience that prioritises clarity, depth and the ability to share findings across an organisation.',
      },
      {
        title: 'Approach',
        content:
          'We engaged with finance workflows end-to-end and built an information architecture that surfaces what matters first. Performance was treated as a product requirement, not an afterthought — every chart and grid had to feel instant.',
      },
      {
        title: 'Solution',
        content:
          'A dashboard with a strong information architecture, performant data grids, and a flexible report builder suited to multi-tenant SaaS — with export and sharing flows that work for finance leadership, analysts and operations.',
      },
      {
        title: 'Technology',
        content:
          'Next.js on the front end, PostgreSQL for the analytical store, and TypeScript end-to-end. The architecture was designed to keep heavy aggregations away from the user-facing surface and serve the dashboard through role-aware APIs.',
      },
      {
        title: 'Implementation',
        content:
          'Iterative delivery: information architecture and core dashboard first, then report builder, then exports and sharing. Each cycle was validated with finance workflow tests before the next layer was added.',
      },
      {
        title: 'Outcome',
        content:
          'A demonstrable analytics product that balances power and clarity — a useful reference for any team building internal SaaS tools that have to earn daily use from demanding audiences.',
      },
    ],
    highlights: [
      { label: 'Stack', value: 'Next.js · PostgreSQL' },
      { label: 'Type', value: 'SaaS · Analytics' },
      { label: 'Engagement', value: 'Discovery to deployment' },
    ],
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug) ?? null;
}

export function getCaseStudyBySlug(slug: string) {
  return caseStudies.find((c) => c.slug === slug) ?? null;
}

export function getCaseStudyByProjectSlug(projectSlug: string) {
  return caseStudies.find((c) => c.projectSlug === projectSlug) ?? null;
}