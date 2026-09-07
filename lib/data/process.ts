import type { ProcessStep } from '@/lib/types';

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'Discovery',
    description:
      'We immerse ourselves in the business, the users and the operating reality — turning ambiguity into shared understanding and clear objectives.',
    activities: [
      'Stakeholder interviews & alignment',
      'Domain & market research',
      'User needs mapping',
      'Technical due diligence',
      'Constraints & risk inventory',
    ],
    duration: '1–2 weeks',
  },
  {
    number: '02',
    title: 'Strategy',
    description:
      'A clear product and technology strategy that aligns the work with measurable business outcomes — across scope, phasing and investment.',
    activities: [
      'Product strategy & positioning',
      'Roadmap & milestone definition',
      'Commercial & feasibility review',
      'Investment case alignment',
      'Success metrics definition',
    ],
    duration: '1–2 weeks',
  },
  {
    number: '03',
    title: 'Architecture',
    description:
      'Architectural foundations that age well — system design, integration patterns and a technical direction that supports long-term evolution.',
    activities: [
      'System & data architecture',
      'Integration & API strategy',
      'Security & compliance foundations',
      'Cloud & infrastructure topology',
      'AI & data layer design',
    ],
    duration: '1–2 weeks',
  },
  {
    number: '04',
    title: 'Product Design',
    description:
      'Research-led design that turns strategy into usable, accessible and trustworthy product experiences — supported by a durable design system.',
    activities: [
      'UX flows & wireframes',
      'Visual & interaction design',
      'Component & design system',
      'Accessibility & usability validation',
      'Engineering handoff',
    ],
    duration: '2–4 weeks',
  },
  {
    number: '05',
    title: 'Engineering',
    description:
      'Senior-led, iterative engineering — turning architecture and design into production-ready software that the team can evolve.',
    activities: [
      'Iterative engineering cadence',
      'Front-end, back-end & data implementation',
      'Integrations & APIs',
      'AI features & intelligent automation',
      'Continuous integration',
    ],
    duration: '4–12 weeks',
  },
  {
    number: '06',
    title: 'Quality Assurance',
    description:
      'Quality is engineered in — automated testing, performance budgets, accessibility checks and security review across the product.',
    activities: [
      'Unit, integration & end-to-end tests',
      'Performance & scalability verification',
      'Accessibility & usability review',
      'Security & threat review',
      'Release readiness review',
    ],
    duration: 'Ongoing',
  },
  {
    number: '07',
    title: 'Deployment',
    description:
      'A coordinated, low-risk deployment — from infrastructure to observability — designed for reliable production operation.',
    activities: [
      'Production deployment',
      'Observability & monitoring',
      'Operational runbooks',
      'Stakeholder enablement',
      'Go-to-market readiness',
    ],
    duration: '1–2 weeks',
  },
  {
    number: '08',
    title: 'Continuous Improvement',
    description:
      'Long-term partnership — measuring, learning and evolving the product as the market, the users and the business grow.',
    activities: [
      'Continuous improvement cycles',
      'Performance & reliability monitoring',
      'Roadmap evolution',
      'Capability expansion',
      'Long-term technical partnership',
    ],
    duration: 'Ongoing',
  },
];