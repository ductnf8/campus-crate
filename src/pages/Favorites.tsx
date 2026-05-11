import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    supabase
      .from('favorites')
      .select('item_id, items(id, title, price, image_url, location, created_at, views_count, is_featured)')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          const mapped = data
            .filter(f => f.items)
            .map(f => {
              const item = Array.isArray(f.items) ? f.items[0] : f.items;
              return item;
            })
            .filter(Boolean);
          setItems(mapped);
          setFavIds(new Set(mapped.map((i: any) => i.id)));
        }
        setLoading(false);
      });
  }, [user, navigate]);

  const toggleFavorite = async (itemId: string) => {
    if (!user) return;
    await supabase.from('favorites').delete().eq('user_id', user.id).eq('item_id', itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
    setFavIds(prev => { const n = new Set(prev); n.delete(itemId); return n; });
  };

  return (
    <div className="container py-6">
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" /> Yêu thích ({items.length})
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Bạn chưa lưu sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(item => (
            <ProductCard
              key={item.id}
              {...item}
              isFavorited={favIds.has(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
