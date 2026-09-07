import type { Locale } from '@/lib/i18n/config';
import type { ServiceCategory } from '@/lib/types';
import { serviceCategoriesBn } from './services.bn';

export const serviceCategories: ServiceCategory[] = [
  {
    slug: 'software-development',
    title: 'Software Engineering',
    description:
      'Custom & enterprise software — engineered around your operations, integrated with your systems, and built to evolve with your business.',
    icon: 'software',
    services: [
      {
        slug: 'custom-software',
        category: 'Software Engineering',
        title: 'Custom Software Development',
        shortDescription:
          'Purpose-built software tailored to your workflows, systems and long-term ambitions.',
        detailedDescription:
          'We design and engineer bespoke software for organisations whose off-the-shelf tools no longer fit. Our senior engineers translate complex business logic into maintainable, secure and high-performing systems — built on modern architectures, documented thoroughly, and delivered with the rigour required to operate for years, not months.',
        icon: 'code',
        benefits: [
          'Tailored to your exact workflows and edge cases',
          'Clean, documented code your team can own',
          'Vendor independence — full IP and code ownership',
          'Architecture designed to scale from day one',
          'Senior engineers end-to-end, not a hand-off',
        ],
        technologies: [
          'TypeScript',
          'Node.js',
          'Python',
          'PostgreSQL',
          'Redis',
          'Docker',
          'Kubernetes',
        ],
        process: [
          'Discovery & domain mapping with stakeholders',
          'Solution architecture and technical design',
          'Iterative engineering in two-week cycles',
          'Automated quality assurance and code review',
          'Deployment, observability and team handover',
          'Long-term support and evolution',
        ],
        outcomes: [
          'Operations that scale without scaling headcount',
          'Faster, more confident decision-making',
          'Lower total cost of ownership over time',
          'A platform your team is proud to build on',
        ],
      },
      {
        slug: 'enterprise-software',
        category: 'Software Engineering',
        title: 'Enterprise Software Engineering',
        shortDescription:
          'Mission-critical enterprise platforms — built for security, compliance and the realities of operating at scale.',
        detailedDescription:
          'We partner with enterprises to modernise legacy estates and engineer new strategic platforms — from internal ERP integrations and customer portals to data-intensive operational systems. Every engagement is grounded in security, observability and the operational maturity your IT and compliance teams require.',
        icon: 'enterprise',
        benefits: [
          'Robust security, RBAC and audit-ready architecture',
          'Clean integration with existing systems and data',
          'High-availability, fault-tolerant design',
          'Compliance-aware engineering (SOC 2, ISO 27001, GDPR)',
          'Clear technical documentation and runbooks',
        ],
        technologies: [
          'Node.js',
          'Python',
          'Java',
          'PostgreSQL',
          'Kafka',
          'Kubernetes',
          'Terraform',
        ],
        process: [
          'Stakeholder alignment and security review',
          'Technical due diligence on the existing estate',
          'Target architecture and migration roadmap',
          'Phased delivery with measurable milestones',
          'Operate, observe and harden in production',
          'Long-term partnership with SLA-backed support',
        ],
        outcomes: [
          'A modernised technology estate with clear ownership',
          'Reduced operational and security risk',
          'A documented roadmap your board and team trust',
          'Engineering capacity that compounds, not churns',
        ],
      },
    ],
  },
  {
    slug: 'web-development',
    title: 'Web Platforms',
    description:
      'Marketing websites, dashboards and full-stack web applications — engineered for performance, accessibility and long-term maintainability.',
    icon: 'web',
    services: [
      {
        slug: 'modern-web-applications',
        category: 'Web Platforms',
        title: 'Modern Web Applications',
        shortDescription:
          'High-performance web applications for SaaS products, dashboards and internal platforms.',
        detailedDescription:
          'We build production-grade web applications — from real-time dashboards and SaaS platforms to complex internal tooling. Every product is engineered for performance, accessibility and long-term maintainability, using a modern component-driven architecture that your team can evolve after handover.',
        icon: 'web',
        benefits: [
          'Lightning-fast UX across every device',
          'SEO-friendly, accessible architecture by default',
          'Component-driven UI your team can extend',
          'Cloud-native deployment and observability',
        ],
        technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
        process: [
          'Product discovery and requirements mapping',
          'Information architecture and UX flows',
          'Component-driven build with design system',
          'API and third-party integrations',
          'Release, observability and iteration',
        ],
        outcomes: [
          'Improved conversion and retention',
          'Engineering velocity that compounds',
          'Reduced infrastructure overhead',
        ],
      },
      {
        slug: 'corporate-websites',
        category: 'Web Platforms',
        title: 'Corporate & Marketing Websites',
        shortDescription:
          'Premium corporate and marketing websites engineered for credibility, conversion and growth.',
        detailedDescription:
          'We design and build corporate websites for international brands — balancing storytelling, conversion architecture and performance. The result is a digital flagship that earns trust from the first click and supports your marketing and sales teams for years.',
        icon: 'web',
        benefits: [
          'Premium brand presentation',
          'Conversion-optimised information architecture',
          'Internationalisation and multi-region ready',
          'Performance-first architecture (Core Web Vitals)',
          'Editor-friendly CMS for non-technical teams',
        ],
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Headless CMS'],
        process: [
          'Brand and messaging workshop',
          'Information architecture and content model',
          'Design system build',
          'Engineering, QA and content migration',
          'Launch, analytics and ongoing optimisation',
        ],
        outcomes: [
          'Stronger brand authority in the market',
          'Higher inbound enquiry quality',
          'Faster content operations for your team',
        ],
      },
      {
        slug: 'full-stack-engineering',
        category: 'Web Platforms',
        title: 'Full-Stack Engineering',
        shortDescription:
          'Senior full-stack engineers delivering the front-end, back-end and everything between.',
        detailedDescription:
          'We bring senior full-stack engineering to your roadmap — covering front-end, API design, data modelling, infrastructure and the operational glue required to ship consistently. One accountable team across the stack.',
        icon: 'code',
        benefits: [
          'Single accountable team across the stack',
          'Predictable, senior-led delivery cadence',
          'Deep architectural thinking from day one',
          'Knowledge transfer built into every sprint',
        ],
        technologies: ['Next.js', 'Node.js', 'PostgreSQL', 'TypeScript', 'Cloud'],
        process: [
          'Team and roadmap alignment',
          'Architecture, planning and technical design',
          'Iterative delivery in short cycles',
          'Documentation and knowledge transfer',
        ],
        outcomes: [
          'Predictable engineering velocity',
          'A cleaner, more maintainable codebase',
          'Faster product iteration overall',
        ],
      },
    ],
  },
  {
    slug: 'mobile-development',
    title: 'Mobile Applications',
    description:
      'Native and cross-platform mobile applications — designed for performance, polish and the realities of long-term product operation.',
    icon: 'mobile',
    services: [
      {
        slug: 'android-apps',
        category: 'Mobile Applications',
        title: 'Android Apps',
        shortDescription:
          'Native Android applications engineered for the modern Android platform.',
        detailedDescription:
          'We design and engineer Android applications with native performance, thoughtful UX and a strong foundation for long-term iteration across phones, tablets and foldables. Built on modern Kotlin and Jetpack Compose with an eye on battery, accessibility and Play Store quality.',
        icon: 'mobile',
        benefits: [
          'Native performance on the latest Android APIs',
          'Material Design 3 system for visual consistency',
          'Tablet, foldable and large-screen support',
          'Deep platform and OEM integrations',
        ],
        technologies: ['Kotlin', 'Jetpack Compose', 'Coroutines', 'Room'],
        process: [
          'UX and platform analysis',
          'Native design system in Compose',
          'Iterative engineering with CI',
          'Internal testing and pre-launch QA',
          'Play Store launch and rollout strategy',
        ],
        outcomes: [
          'Reliable release cadence',
          'Strong Play Store performance',
          'Excellent long-term user retention',
        ],
      },
      {
        slug: 'ios-apps',
        category: 'Mobile Applications',
        title: 'iOS Apps',
        shortDescription:
          'Polished iOS applications built on Swift and Apple platform guidelines.',
        detailedDescription:
          'We craft iOS applications that feel at home on the platform — focused on clarity, performance and the details that make a premium Apple-quality experience. Privacy, accessibility and battery efficiency are first-class engineering concerns.',
        icon: 'mobile',
        benefits: [
          'Swift-native engineering throughout',
          'Apple Human Interface Guidelines compliance',
          'Privacy-first architecture by design',
          'Optimised for performance and battery life',
        ],
        technologies: ['Swift', 'SwiftUI', 'Combine', 'Core Data'],
        process: [
          'Platform and accessibility audit',
          'SwiftUI design and components',
          'Engineering, QA and instrumentation',
          'TestFlight validation with real users',
          'App Store launch and ASO support',
        ],
        outcomes: [
          'High App Store ratings and reviews',
          'Loyal, retained user base',
          'Predictable maintenance and updates',
        ],
      },
      {
        slug: 'cross-platform-apps',
        category: 'Mobile Applications',
        title: 'Cross-Platform Apps',
        shortDescription:
          'Single codebase, native feel — cross-platform apps for iOS and Android.',
        detailedDescription:
          'When speed-to-market and consistency matter, we engineer cross-platform applications with React Native or Flutter — balancing platform fidelity with engineering efficiency. The right call when both stores need the same feature parity shipped quickly.',
        icon: 'mobile',
        benefits: [
          'Faster time-to-market across both stores',
          'Shared codebase, lower maintenance cost',
          'Native-quality UX on both platforms',
          'Predictable, parallel release cadence',
        ],
        technologies: ['React Native', 'Flutter', 'TypeScript', 'Dart'],
        process: [
          'Platform parity design',
          'Shared architecture and components',
          'Iterative build with platform parity tests',
          'Beta testing on TestFlight and Play Console',
          'Coordinated launch and updates',
        ],
        outcomes: [
          'Lower engineering cost per release',
          'Consistent experience across platforms',
          'Predictable, simultaneous updates',
        ],
      },
    ],
  },
  {
    slug: 'ai-ml',
    title: 'AI & Machine Learning',
    description:
      'Applied AI and machine learning solutions — from intelligent automation to AI-powered digital products.',
    icon: 'ai',
    services: [
      {
        slug: 'ai-applications',
        category: 'AI & Machine Learning',
        title: 'AI Applications',
        shortDescription:
          'AI-powered applications, copilots and intelligent features built into your software.',
        detailedDescription:
          'We design and engineer AI-powered applications — using modern AI capabilities to deliver real product value, not just demos. From AI assistants to intelligent automation, we ship AI that works in production.',
        icon: 'ai',
        benefits: [
          'Production-ready AI features',
          'Cost-aware architectures',
          'Evaluation & safety built in',
          'Clear UX boundaries',
        ],
        technologies: ['OpenAI APIs', 'Anthropic', 'LangChain', 'Vector databases'],
        process: [
          'Use-case discovery',
          'Architecture design',
          'Prototype & evaluate',
          'Production engineering',
          'Continuous improvement',
        ],
        outcomes: [
          'New product capabilities',
          'Faster internal workflows',
          'Defensible product moat',
        ],
      },
      {
        slug: 'ai-automation',
        category: 'AI & Machine Learning',
        title: 'AI Automation',
        shortDescription:
          'Workflow automation powered by AI — turning manual operations into reliable systems.',
        detailedDescription:
          'We automate business workflows using AI agents, language models and integration platforms — bringing measurable efficiency to sales, support and operations.',
        icon: 'automation',
        benefits: [
          'Reduced manual work',
          'Reliable, observable systems',
          'Integration with existing tools',
          'Cost predictable at scale',
        ],
        technologies: ['OpenAI APIs', 'Anthropic', 'Workflow platforms'],
        process: [
          'Process mapping',
          'Automation architecture',
          'Build & test',
          'Deploy & monitor',
          'Optimise & expand',
        ],
        outcomes: [
          'Hours saved weekly',
          'Lower error rates',
          'Happier teams',
        ],
      },
      {
        slug: 'machine-learning',
        category: 'AI & Machine Learning',
        title: 'Machine Learning',
        shortDescription:
          'Machine learning systems for prediction, classification and recommendation.',
        detailedDescription:
          'For problems with structured data and clear evaluation metrics, we build machine learning systems that move from notebook to production reliably.',
        icon: 'ml',
        benefits: [
          'Measurable model accuracy',
          'Robust evaluation',
          'Production deployment',
          'Ongoing monitoring',
        ],
        technologies: ['Python', 'PyTorch', 'TensorFlow', 'scikit-learn'],
        process: [
          'Problem framing',
          'Data exploration',
          'Modelling & evaluation',
          'Deployment',
          'Monitoring & retraining',
        ],
        outcomes: [
          'Predictive capability',
          'Data-driven decisions',
          'Competitive differentiation',
        ],
      },
      {
        slug: 'ai-assistants',
        category: 'AI & Machine Learning',
        title: 'AI Assistants & Chatbots',
        shortDescription:
          'Conversational AI assistants for sales, support and internal knowledge.',
        detailedDescription:
          'We build AI assistants grounded in your real data — designed to answer accurately, escalate gracefully and integrate with the tools your team already uses.',
        icon: 'ai',
        benefits: [
          '24/7 customer response',
          'Grounded in your data',
          'Human handoff ready',
          'Multi-channel deployment',
        ],
        technologies: ['OpenAI APIs', 'Vector databases', 'TypeScript'],
        process: [
          'Knowledge source mapping',
          'Conversation design',
          'Build & evaluation',
          'Integration & launch',
          'Iterate on insights',
        ],
        outcomes: [
          'Faster customer response',
          'Lower support cost',
          'Improved customer satisfaction',
        ],
      },
      {
        slug: 'ai-integrations',
        category: 'AI & Machine Learning',
        title: 'AI Integrations',
        shortDescription:
          'Integrate AI capabilities into your existing products, platforms and workflows.',
        detailedDescription:
          'We help you bring AI capabilities into existing software — adding intelligent features, automation and data-driven insights without rebuilding from scratch.',
        icon: 'automation',
        benefits: [
          'Faster time-to-value',
          'Works with your existing stack',
          'Safe, scoped rollouts',
          'Incremental capability',
        ],
        technologies: ['OpenAI APIs', 'Vector databases', 'Workflow platforms'],
        process: [
          'Capability audit',
          'Integration design',
          'Pilot & evaluate',
          'Production rollout',
          'Ongoing improvement',
        ],
        outcomes: [
          'Modernised existing products',
          'New revenue opportunities',
          'Improved user experience',
        ],
      },
    ],
  },
  {
    slug: 'saas-digital-products',
    title: 'SaaS & Digital Products',
    description:
      'Build, scale and operate subscription-based digital products with strong unit economics.',
    icon: 'saas',
    services: [
      {
        slug: 'mvp-development',
        category: 'SaaS & Digital Products',
        title: 'MVP Development',
        shortDescription:
          'Senior product engineering to validate your idea and ship a market-ready MVP fast.',
        detailedDescription:
          'We partner with founders to scope, design and ship minimum viable products that hold up under real-world use — without compromising on architecture, design or quality.',
        icon: 'rocket',
        benefits: [
          'Fast, focused delivery',
          'Production-quality foundations',
          'Investor-ready craftsmanship',
          'Iteration-ready architecture',
        ],
        technologies: ['Next.js', 'TypeScript', 'PostgreSQL'],
        process: [
          'Product discovery',
          'MVP scoping',
          'Iterative build',
          'Launch readiness',
          'Product iteration',
        ],
        outcomes: [
          'Faster product-market fit',
          'Confident fundraising',
          'Healthy technical foundations',
        ],
      },
      {
        slug: 'saas-scaling',
        category: 'SaaS & Digital Products',
        title: 'SaaS Scaling & Optimization',
        shortDescription:
          'Scale a SaaS product beyond launch — performance, reliability and growth.',
        detailedDescription:
          'For SaaS products past their initial release, we help with performance, reliability, cost optimisation and the operational foundations required to grow confidently.',
        icon: 'rocket',
        benefits: [
          'Predictable performance',
          'Cost-aware scaling',
          'Operational maturity',
          'Engineering velocity',
        ],
        technologies: ['Next.js', 'Node.js', 'PostgreSQL', 'Cloud platforms'],
        process: [
          'Operational audit',
          'Improvement roadmap',
          'Targeted engineering',
          'Continuous optimisation',
        ],
        outcomes: [
          'Predictable unit economics',
          'Improved reliability',
          'Confident scaling',
        ],
      },
    ],
  },
  {
    slug: 'design',
    title: 'UI/UX & Product Design',
    description:
      'Design that earns trust — from product UI to brand systems that scale across surfaces and markets.',
    icon: 'design',
    services: [
      {
        slug: 'ui-ux',
        category: 'UI/UX & Product Design',
        title: 'UI/UX Design',
        shortDescription:
          'User-centred product design for web, mobile and complex enterprise software.',
        detailedDescription:
          'We design product experiences that are clear, useful and visually compelling — grounded in research, validated with users and ready to ship.',
        icon: 'design',
        benefits: [
          'Research-led design',
          'Usability & accessibility',
          'Component-driven systems',
          'Engineered for handoff',
        ],
        technologies: ['Figma', 'Notion'],
        process: [
          'Discovery & research',
          'IA & user flows',
          'Wireframes & prototypes',
          'Visual design',
          'Handoff & support',
        ],
        outcomes: [
          'Higher task completion',
          'Lower support load',
          'Stronger brand consistency',
        ],
      },
      {
        slug: 'product-design',
        category: 'UI/UX & Product Design',
        title: 'Product Design',
        shortDescription:
          'End-to-end product design partnerships for ambitious teams.',
        detailedDescription:
          'We embed as product design partners — running research, design and validation cycles aligned with your engineering and growth roadmap.',
        icon: 'design',
        benefits: [
          'Embedded partnership',
          'Outcomes-focused design',
          'Continuous validation',
          'Strategic design thinking',
        ],
        technologies: ['Figma', 'Notion'],
        process: [
          'Roadmap alignment',
          'Continuous discovery',
          'Design sprints',
          'Build–measure–learn',
        ],
        outcomes: [
          'Improved retention',
          'Faster shipping',
          'Clearer product decisions',
        ],
      },
      {
        slug: 'brand-identity',
        category: 'UI/UX & Product Design',
        title: 'Brand Identity',
        shortDescription:
          'Brand identity systems built to scale across products, markets and surfaces.',
        detailedDescription:
          'We create brand identities grounded in strategy — from positioning to visual systems and guidelines that survive real-world use.',
        icon: 'design',
        benefits: [
          'Strategic foundation',
          'Scalable visual system',
          'Clear usage guidelines',
          'Cross-surface consistency',
        ],
        technologies: ['Figma'],
        process: [
          'Brand strategy',
          'Visual exploration',
          'Identity refinement',
          'System & guidelines',
          'Launch support',
        ],
        outcomes: [
          'Memorable brand presence',
          'Internal alignment',
          'Marketing efficiency',
        ],
      },
    ],
  },
  {
    slug: 'ecommerce-solutions',
    title: 'E-commerce Solutions',
    description:
      'Modern commerce experiences that earn trust and convert — from headless storefronts to enterprise retail.',
    icon: 'ecommerce',
    services: [
      {
        slug: 'headless-commerce',
        category: 'E-commerce Solutions',
        title: 'Headless Commerce',
        shortDescription:
          'Modern headless commerce platforms built for performance and flexibility.',
        detailedDescription:
          'We build headless commerce experiences — pairing fast, flexible storefronts with reliable backends, payments and fulfilment.',
        icon: 'ecommerce',
        benefits: [
          'Conversion-focused UX',
          'Reliable store performance',
          'Flexible payment options',
          'Marketing-friendly stack',
        ],
        technologies: ['Next.js', 'TypeScript', 'Stripe', 'Shopify'],
        process: [
          'Commerce strategy',
          'Storefront & catalogue design',
          'Integration & checkout',
          'Performance tuning',
          'Growth experiments',
        ],
        outcomes: [
          'Increased conversion rate',
          'Higher average order value',
          'Lower support overhead',
        ],
      },
      {
        slug: 'enterprise-retail',
        category: 'E-commerce Solutions',
        title: 'Enterprise Retail',
        shortDescription:
          'Enterprise retail platforms with custom integrations and global reach.',
        detailedDescription:
          'For larger retailers, we engineer commerce platforms with custom integrations, multi-region support and the operational maturity required at scale.',
        icon: 'ecommerce',
        benefits: [
          'Multi-region support',
          'Custom integrations',
          'Operational maturity',
          'Engineering rigour',
        ],
        technologies: ['Next.js', 'Node.js', 'Cloud platforms'],
        process: [
          'Stakeholder alignment',
          'Platform strategy',
          'Phased delivery',
          'Long-term partnership',
        ],
        outcomes: [
          'Modernised commerce stack',
          'Reduced operational risk',
          'Improved customer experience',
        ],
      },
    ],
  },
  {
    slug: 'growth',
    title: 'SEO & Digital Growth',
    description:
      'Performance-driven growth services — combining SEO, content and conversion optimisation to build compounding inbound revenue.',
    icon: 'marketing',
    services: [
      {
        slug: 'seo',
        category: 'SEO & Digital Growth',
        title: 'SEO',
        shortDescription:
          'Technical and content SEO that compounds — built on real engineering, not shortcuts.',
        detailedDescription:
          'We deliver SEO programmes rooted in technical excellence — clean architecture, fast pages, structured data and content that earns links and ranks.',
        icon: 'seo',
        benefits: [
          'Technical foundations',
          'Content-led growth',
          'International SEO',
          'Transparent reporting',
        ],
        technologies: ['Next.js', 'Schema.org', 'Analytics'],
        process: [
          'Technical audit',
          'Keyword & content strategy',
          'On-page optimisation',
          'Measurement & iteration',
        ],
        outcomes: [
          'Higher organic traffic',
          'Better qualified leads',
          'Long-term traffic moat',
        ],
      },
      {
        slug: 'digital-marketing',
        category: 'SEO & Digital Growth',
        title: 'Digital Marketing',
        shortDescription:
          'Performance marketing and content strategy for ambitious B2B and SaaS brands.',
        detailedDescription:
          'We build digital marketing programmes that align paid, organic and lifecycle channels around clear commercial outcomes.',
        icon: 'marketing',
        benefits: [
          'Channel-agnostic strategy',
          'Creative that converts',
          'Lifecycle automation',
          'Clear attribution',
        ],
        technologies: ['Analytics platforms', 'Marketing automation'],
        process: [
          'Audit & planning',
          'Campaign design',
          'Launch & optimise',
          'Scale & reporting',
        ],
        outcomes: [
          'Lower customer acquisition cost',
          'Higher pipeline volume',
          'Predictable growth',
        ],
      },
      {
        slug: 'conversion-optimisation',
        category: 'SEO & Digital Growth',
        title: 'Conversion Optimization',
        shortDescription:
          'Experiment-led CRO programmes that turn more visitors into customers.',
        detailedDescription:
          'We run structured experimentation programmes — from analytics and research to A/B tests and personalisation — to lift conversion across your funnel.',
        icon: 'marketing',
        benefits: [
          'Research-led roadmap',
          'Continuous experimentation',
          'Cross-functional alignment',
          'Compounding wins',
        ],
        technologies: ['Analytics', 'A/B testing platforms'],
        process: [
          'Analytics & research',
          'Hypothesis backlog',
          'Test & learn',
          'Scale winners',
        ],
        outcomes: [
          'Higher conversion rate',
          'Improved ROI',
          'Better user insights',
        ],
      },
    ],
  },
  {
    slug: 'automation-integrations',
    title: 'Automation & Integrations',
    description:
      'Connect your tools, automate your workflows and unlock operational leverage across the business.',
    icon: 'automation',
    services: [
      {
        slug: 'business-automation',
        category: 'Automation & Integrations',
        title: 'Business Automation',
        shortDescription:
          'Identify and automate the workflows consuming your team&rsquo;s time.',
        detailedDescription:
          'We audit, design and automate business workflows — combining modern tools with AI to deliver reliable, measurable outcomes.',
        icon: 'automation',
        benefits: [
          'Measurable time savings',
          'Reduced error rates',
          'Auditable workflows',
          'Scalable operations',
        ],
        technologies: ['Python', 'Node.js', 'Workflow platforms', 'AI APIs'],
        process: [
          'Process audit',
          'Automation design',
          'Build & test',
          'Measure & improve',
        ],
        outcomes: [
          'Lower operational cost',
          'Happier teams',
          'Predictable output',
        ],
      },
      {
        slug: 'system-integration',
        category: 'Automation & Integrations',
        title: 'System Integration',
        shortDescription:
          'Connect the systems your business runs on — reliably and at scale.',
        detailedDescription:
          'We integrate CRMs, ERPs, payment systems and internal platforms — designing data flows that are observable, secure and resilient.',
        icon: 'api',
        benefits: [
          'Unified data',
          'Reliable workflows',
          'Reduced manual work',
          'Auditable integrations',
        ],
        technologies: ['Node.js', 'Python', 'Webhooks', 'Message queues'],
        process: [
          'Discovery mapping',
          'Integration design',
          'Build & test',
          'Monitor & maintain',
        ],
        outcomes: [
          'Cleaner operations',
          'Improved data quality',
          'Lower integration risk',
        ],
      },
    ],
  },
  {
    slug: 'cloud-technology',
    title: 'Cloud & Technology Solutions',
    description:
      'Reliable, secure and cost-aware cloud architecture — the engineering foundations your business depends on.',
    icon: 'cloud',
    services: [
      {
        slug: 'cloud-architecture',
        category: 'Cloud & Technology Solutions',
        title: 'Cloud Architecture',
        shortDescription:
          'Cloud architecture, migration and optimisation on modern cloud platforms.',
        detailedDescription:
          'We architect, migrate and operate cloud infrastructure — from greenfield platforms to legacy modernisation — with a bias for cost efficiency and reliability.',
        icon: 'cloud',
        benefits: [
          'Reliable architecture',
          'Cost-aware design',
          'Security & compliance',
          'Operational excellence',
        ],
        technologies: ['AWS', 'Google Cloud', 'Kubernetes', 'Terraform'],
        process: [
          'Discovery & assessment',
          'Architecture',
          'Migration / build',
          'Operate & optimise',
        ],
        outcomes: [
          'Lower cloud spend',
          'Higher reliability',
          'Faster delivery',
        ],
      },
      {
        slug: 'api-development',
        category: 'Cloud & Technology Solutions',
        title: 'API Development',
        shortDescription:
          'Robust, well-documented APIs that power products and integrations.',
        detailedDescription:
          'We design and build APIs for internal systems, partner integrations and public developer surfaces — with strong contracts, observability and versioning.',
        icon: 'api',
        benefits: [
          'Clear, versioned contracts',
          'Observability built-in',
          'Developer-friendly docs',
          'Security first',
        ],
        technologies: ['Node.js', 'GraphQL', 'REST', 'OpenAPI'],
        process: [
          'API design',
          'Implementation',
          'Documentation',
          'Observability',
          'Versioning',
        ],
        outcomes: [
          'Reliable integrations',
          'Faster partner onboarding',
          'Reduced incidents',
        ],
      },
      {
        slug: 'technology-consulting',
        category: 'Cloud & Technology Solutions',
        title: 'Technology Consulting',
        shortDescription:
          'Senior technology guidance for strategic decisions, roadmaps and architecture.',
        detailedDescription:
          'For teams facing important technology decisions, we provide senior consulting — covering strategy, architecture review, vendor selection and roadmap planning.',
        icon: 'consulting',
        benefits: [
          'Senior perspective',
          'Decision frameworks',
          'Reduced risk',
          'Aligned stakeholders',
        ],
        technologies: ['Strategy', 'Architecture review'],
        process: [
          'Discovery',
          'Diagnosis',
          'Recommendations',
          'Implementation support',
        ],
        outcomes: [
          'Clearer strategy',
          'Better decisions',
          'Reduced risk',
        ],
      },
    ],
  },
];

/**
 * Return the service categories for the given locale. Bangla is hand-
 * translated; English is the canonical source.
 */
export function getServiceCategories(locale: Locale = 'en'): ServiceCategory[] {
  if (locale === 'bn') return serviceCategoriesBn;
  return serviceCategories;
}

export function getServiceBySlug(slug: string, locale: Locale = 'en') {
  const categories = getServiceCategories(locale);
  for (const category of categories) {
    const service = category.services.find((s) => s.slug === slug);
    if (service) return { category, service };
  }
  return null;
}

export function getCategoryBySlug(slug: string, locale: Locale = 'en') {
  return getServiceCategories(locale).find((c) => c.slug === slug) ?? null;
}

export function getAllServiceSlugs() {
  return serviceCategories.flatMap((c) => c.services.map((s) => s.slug));
}

export function getAllCategorySlugs() {
  return serviceCategories.map((c) => c.slug);
}
