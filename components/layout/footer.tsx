import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { Container } from '@/components/ui/container';
import { company, socialLinks, COPYRIGHT_RANGE } from '@/lib/config/company';
import { type Locale } from '@/lib/i18n/config';

export async function Footer({ logoUrl, locale }: { logoUrl?: string; locale?: Locale } = {}) {
  const t = await getTranslations('footer');
  const foundedYear = company.foundedYear ?? COPYRIGHT_RANGE;
  return (
    <footer className="relative isolate overflow-hidden bg-ink-950 text-white">
      <div
        className="absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <div className="border-t border-white/10">
        <Container size="xl" className="py-6 md:py-7">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
            {/* LEFT — Logo + Brand */}
            <div className="flex items-center gap-3">
              <Logo variant="light" size="sm" src={logoUrl} invert />
              <div className="hidden h-8 w-px bg-white/10 md:block" aria-hidden />
              <p className="hidden text-[11px] leading-snug text-white/55 md:block md:max-w-[200px]">
                {company.tagline}
              </p>
            </div>

            {/* CENTER — Email · Phone · Location */}
            <ul className="flex flex-wrap items-center justify-start gap-x-6 gap-y-2 text-[12px] text-white/70 md:justify-center">
              <li className="flex items-center gap-1.5">
                <Icon name="mail" className="h-3.5 w-3.5 text-white/45" />
                <a
                  href={`mailto:${company.contact.email}`}
                  className="transition-colors hover:text-white"
                >
                  {company.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Icon name="phone" className="h-3.5 w-3.5 text-white/45" />
                <a
                  href={`tel:${company.contact.phone}`}
                  className="transition-colors hover:text-white"
                >
                  {company.contact.phoneDisplay ?? company.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Icon name="location" className="h-3.5 w-3.5 text-white/45" />
                <span className="text-white/55">{company.contact.location}</span>
              </li>
            </ul>

            {/* RIGHT — Copyright + Social */}
            <div className="flex flex-wrap items-center justify-start gap-x-5 gap-y-2 md:justify-end">
              <p className="text-[11px] text-white/45">
                {company.copyright ??
                  `© ${COPYRIGHT_RANGE} ${company.legalName}. ${t('rights')}`}
              </p>
              {socialLinks.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  {socialLinks.slice(0, 4).map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      aria-label={t('socialAria', { company: company.shortName, network: s.name })}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/25 hover:text-white"
                    >
                      <Icon name={s.icon as never} className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Sub-bottom: legal links, very subtle */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-white/5 pt-4 text-[11px] text-white/40 md:justify-between">
            <p className="text-white/40">
              {t('founded', { year: foundedYear })} · {t('headquarters', { country: company.contact.country })}
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="transition-colors hover:text-white/70">
                {t('privacy')}
              </Link>
              <span className="text-white/20" aria-hidden>·</span>
              <Link href="/terms-and-conditions" className="transition-colors hover:text-white/70">
                {t('terms')}
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
