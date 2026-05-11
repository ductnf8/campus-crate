import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Ad {
  id: string;
  title: string;
  image_url: string | null;
  link: string | null;
}

export default function AdBanner({ position }: { position: 'home' | 'detail' }) {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    supabase
      .from('ads')
      .select('id, title, image_url, link')
      .eq('position', position)
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) setAds(data);
      });
  }, [position]);

  if (ads.length === 0) return null;

  const ad = ads[Math.floor(Math.random() * ads.length)];

  return (
    <div className="rounded-lg overflow-hidden border bg-card">
      <a href={ad.link || '#'} target="_blank" rel="noopener noreferrer" className="block">
        {ad.image_url ? (
          <img src={ad.image_url} alt={ad.title} className="w-full h-auto object-cover" loading="lazy" />
        ) : (
          <div className="h-20 bg-muted flex items-center justify-center text-sm text-muted-foreground">
            📢 {ad.title}
          </div>
        )}
      </a>
    </div>
  );
}
