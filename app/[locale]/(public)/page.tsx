import { Hero } from '@/components/sections/home/hero';
import { TrustStrip } from '@/components/sections/home/trust-strip';
import { ServicesOverview } from '@/components/sections/home/services-overview';
import { FeaturedProjects } from '@/components/sections/home/featured-projects';
import { ProcessPreview } from '@/components/sections/home/process-preview';
import { LeadershipPreview } from '@/components/sections/home/leadership-preview';
import { InternationalPositioning } from '@/components/sections/home/international-positioning';
import { FinalCTA } from '@/components/sections/home/final-cta';
import { unstable_setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const [featured, leadership, processPreview] = await Promise.all([
    FeaturedProjects({ locale: params.locale as 'en' | 'bn' }),
    LeadershipPreview({ locale: params.locale as 'en' | 'bn' }),
    ProcessPreview({ locale: params.locale as 'en' | 'bn' }),
  ]);
  return (
    <>
      <Hero />
      <TrustStrip />
      <ServicesOverview />
      {featured}
      {processPreview}
      {leadership}
      <InternationalPositioning />
      <FinalCTA />
    </>
  );
}
