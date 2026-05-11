import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ProductCard from '@/components/ProductCard';
import { Sparkles } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Item {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  location: string | null;
  created_at: string;
  views_count: number;
  is_featured: boolean;
  category: string | null;
  quantity?: number;
}

/**
 * Đồng bộ số cột / kích thước slide với lưới "Tất cả sản phẩm" (Index.tsx):
 * grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4
 */
const SLIDE_BASIS =
  'basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4';

export default function SuggestedProducts() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setFavorites(new Set(data.map((f) => f.item_id)));
      });
  }, [user]);

  const toggleFavorite = async (itemId: string) => {
    if (!user) return;
    const isFav = favorites.has(itemId);
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('item_id', itemId);
      setFavorites((prev) => {
        const n = new Set(prev);
        n.delete(itemId);
        return n;
      });
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, item_id: itemId });
      setFavorites((prev) => new Set(prev).add(itemId));
    }
  };

  useEffect(() => {
    let query = supabase
      .from('items')
      .select(
        'id, title, price, image_url, location, created_at, views_count, is_featured, category, quantity',
      )
      .eq('status', 'active')
      .gt('quantity', 0)
      .gte('views_count', 100)
      .order('views_count', { ascending: false })
      .limit(16);

    if (user) query = query.neq('user_id', user.id);

    query.then(({ data }) => {
      if (data) setItems(data);
    });
  }, [user]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold font-display tracking-tight">Gợi ý cho bạn</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Prev/next đứng ngoài luồng slide — không đè lên thẻ sản phẩm */}
      <Carousel opts={{ align: 'start', loop: false }} className="w-full">
        <div className="flex items-center gap-2 sm:gap-4">
          <CarouselPrevious
            className="static shrink-0 self-center !left-auto !right-auto !top-auto !translate-y-0 h-10 w-10 rounded-full border-2 border-primary/30 bg-card text-primary shadow-md hover:bg-primary hover:text-primary-foreground sm:h-11 sm:w-11"
            variant="outline"
          />
          <div className="min-w-0 flex-1">
            <CarouselContent className="-ml-4">
              {items.map((item) => (
                <CarouselItem key={item.id} className={SLIDE_BASIS}>
                  <ProductCard
                    {...item}
                    isFavorited={favorites.has(item.id)}
                    onToggleFavorite={user ? () => toggleFavorite(item.id) : undefined}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
          <CarouselNext
            className="static shrink-0 self-center !left-auto !right-auto !top-auto !translate-y-0 h-10 w-10 rounded-full border-2 border-primary/30 bg-card text-primary shadow-md hover:bg-primary hover:text-primary-foreground sm:h-11 sm:w-11"
            variant="outline"
          />
        </div>
      </Carousel>
    </div>
  );
}
