import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { GalleryEvent, GalleryImage } from '@/lib/supabase/types';
import { GalleryManager } from './gallery-manager';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const supabase = createSupabaseServerClient();
  const { data: eventsData } = await (supabase.from('gallery_events') as any)
    .select('*')
    .order('display_order', { ascending: true })
    .order('event_date', { ascending: false, nullsFirst: false });

  // Fetch images for all events in a single round-trip.
  const { data: imagesData } = await (supabase.from('gallery_images') as any)
    .select('*')
    .order('display_order', { ascending: true });

  const imagesByEvent = ((imagesData ?? []) as GalleryImage[]).reduce<Record<string, GalleryImage[]>>(
    (acc, img) => {
      const list = acc[img.event_id] ?? [];
      list.push(img);
      acc[img.event_id] = list;
      return acc;
    },
    {},
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Company Gallery</h2>
          <p>Manage company events, workshops, conferences and gallery photos.</p>
        </div>
      </div>
      <GalleryManager
        initialEvents={(eventsData as GalleryEvent[] | null) ?? []}
        initialImagesByEvent={imagesByEvent}
      />
    </div>
  );
}