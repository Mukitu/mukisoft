import { Icon } from '@/components/ui/icon';

export type ContactIcon = 'mail' | 'phone' | 'linkedin' | 'github' | 'x';

/**
 * Pill-shaped link with an icon — used by team, founder, and about pages
 * to render email/phone/social contact shortcuts. `external` adds
 * target/rel attrs for safe cross-site links.
 */
export function ContactChip({
  href,
  icon,
  label,
  external = false,
}: {
  href: string;
  icon: ContactIcon;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer noopener' : undefined}
      className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700"
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      <span>{label}</span>
    </a>
  );
}
