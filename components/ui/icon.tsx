import type { IconName } from '@/lib/types';

type IconProps = React.SVGProps<SVGSVGElement> & {
  name: IconName;
  className?: string;
};

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.6,
};

export function Icon({ name, className = 'h-5 w-5', ...props }: IconProps) {
  switch (name) {
    case 'code':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="m9 8-5 4 5 4" />
          <path d="m15 8 5 4-5 4" />
          <path d="m13 6-2 12" />
        </svg>
      );
    case 'web':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 4v5" />
        </svg>
      );
    case 'mobile':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <rect x="6" y="2" width="12" height="20" rx="2.5" />
          <path d="M11 18h2" />
        </svg>
      );
    case 'software':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M4 6h16v12H4z" />
          <path d="M4 10h16" />
          <path d="M8 14h2" />
        </svg>
      );
    case 'saas':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M7 17a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 11a4 4 0 0 1 0 8H7Z" />
        </svg>
      );
    case 'ai':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <path d="m5.6 5.6 2.1 2.1" />
          <path d="m16.3 16.3 2.1 2.1" />
          <path d="m5.6 18.4 2.1-2.1" />
          <path d="m16.3 7.7 2.1-2.1" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case 'ml':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M4 20V8" />
          <path d="M10 20V4" />
          <path d="M16 20v-8" />
          <path d="M2 20h20" />
        </svg>
      );
    case 'automation':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M12 4v4" />
          <path d="M12 16v4" />
          <path d="M4 12h4" />
          <path d="M16 12h4" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case 'api':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M4 7h16" />
          <path d="M4 17h16" />
          <path d="M9 7v10" />
          <path d="M15 7v10" />
        </svg>
      );
    case 'design':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M4 20h16" />
          <path d="M6 20V8l6-4 6 4v12" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
    case 'graphic':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18" />
          <path d="M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case 'seo':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case 'marketing':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M3 11v2l11 5V6L3 11Z" />
          <path d="M14 8a4 4 0 0 1 0 8" />
        </svg>
      );
    case 'cloud':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M7 17a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 11a4 4 0 0 1 0 8H7Z" />
        </svg>
      );
    case 'ecommerce':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M3 5h2l3 12h11l2-8H7" />
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
        </svg>
      );
    case 'enterprise':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M4 21V7l8-4 8 4v14" />
          <path d="M9 21v-6h6v6" />
          <path d="M9 11h.01M12 11h.01M15 11h.01" />
        </svg>
      );
    case 'consulting':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4" />
          <path d="M12 17h.01" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case 'arrow-up-right':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
      );
    case 'arrow-down-right':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M7 7 17 17" />
          <path d="M17 8v9h-9" />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="m5 12 4 4L19 7" />
        </svg>
      );
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case 'minus':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M5 12h14" />
        </svg>
      );
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      );
    case 'close':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 7 9-7" />
        </svg>
      );
    case 'phone':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M5 4h4l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case 'location':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M12 21s-7-7.4-7-12a7 7 0 1 1 14 0c0 4.6-7 12-7 12Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case 'globe':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a13 13 0 0 1 0 18" />
          <path d="M12 3a13 13 0 0 0 0 18" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
          <path d="m6 6 2.5 2.5" />
          <path d="m15.5 15.5 2.5 2.5" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
        </svg>
      );
    case 'rocket':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M14 4c4 0 6 2 6 6 0 3-2 6-6 9-4-3-6-6-6-9 0-4 2-6 6-6Z" />
          <path d="M9 15c-3 1-4 4-4 6 2 0 5-1 6-4" />
          <circle cx="14" cy="10" r="1.5" />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <circle cx="9" cy="9" r="3.5" />
          <path d="M3 20a6 6 0 0 1 12 0" />
          <circle cx="17" cy="10" r="3" />
          <path d="M15 20a5 5 0 0 1 6-4" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          <path d="M3 13h18" />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="M9 18h6" />
          <path d="M10 21h4" />
          <path d="M12 3a6 6 0 0 0-4 10c1 1 1.5 1.5 1.5 3h5c0-1.5.5-2 1.5-3a6 6 0 0 0-4-10Z" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <path d="m12 3 2.7 6 6.3.5-4.8 4.2 1.4 6.3L12 16.9 6.4 20l1.4-6.3L3 9.5l6.3-.5L12 3Z" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props}>
          <path
            fill="currentColor"
            d="M12 1.5A10.5 10.5 0 0 0 1.5 12c0 4.6 3 8.6 7.2 10 .5.1.7-.2.7-.5v-2c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.3-.3-4.7-1.2-4.7-5.2 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1a10 10 0 0 1 5.5 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.7 1.1 2.9 0 4-2.4 4.9-4.7 5.2.4.3.7 1 .7 2v3c0 .3.2.6.7.5 4.2-1.4 7.2-5.4 7.2-10A10.5 10.5 0 0 0 12 1.5Z"
          />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props}>
          <path
            fill="currentColor"
            d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9.5h4V21H3V9.5Zm6 0h4v1.6a4.3 4.3 0 0 1 3.9-2.1c4.2 0 5 2.8 5 6.4V21h-4v-5.2c0-1.3-.1-3-1.8-3s-2.1 1.4-2.1 2.9V21H9V9.5Z"
          />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props}>
          <path
            fill="currentColor"
            d="M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.4L4.7 21H1.5l7.5-8.6L1 2h6.6l4.5 5.9L17.5 3Zm-1.1 16.2h1.7L7.7 4.7H5.9l10.5 14.5Z"
          />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <rect x="3" y="3" width="18" height="18" rx="4.5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props}>
          <path
            fill="currentColor"
            d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5A3 3 0 0 0 2.4 7.2C2 9.1 2 12 2 12s0 2.9.4 4.8a3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1C22 14.9 22 12 22 12s0-2.9-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"
          />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" className={className} {...props}>
          <path
            fill="currentColor"
            d="M13 22v-9h3l.5-3.5H13V7.5c0-1 .3-1.7 1.7-1.7H17V2.7A23 4 0 0 0 14.5 2.5C12 2.5 10.4 4 10.4 6.7v2.8H7.4V13h3v9h2.6Z"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} {...props} {...stroke}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}