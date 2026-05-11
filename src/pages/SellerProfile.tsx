import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { User, MapPin, GraduationCap, Calendar, ArrowLeft } from 'lucide-react';
import { timeAgo } from '@/lib/constants';

interface SellerData {
  id: string;
  name: string | null;
  avatar_url: string | null;
  university: string | null;
  bio: string | null;
  created_at: string;
}

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, university, bio, created_at')
        .eq('id', id)
        .maybeSingle();
      setSeller(profile);

      const { data: sellerItems } = await supabase
        .from('items')
        .select('id, title, price, image_url, location, created_at, views_count, is_featured, category')
        .eq('user_id', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (sellerItems) setItems(sellerItems);

      if (user) {
        const { data: favs } = await supabase
          .from('favorites')
          .select('item_id')
          .eq('user_id', user.id);
        if (favs) setFavorites(new Set(favs.map(f => f.item_id)));
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const toggleFavorite = async (itemId: string) => {
    if (!user) return;
    const isFav = favorites.has(itemId);
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('item_id', itemId);
      setFavorites(prev => { const n = new Set(prev); n.delete(itemId); return n; });
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, item_id: itemId });
      setFavorites(prev => new Set(prev).add(itemId));
    }
  };

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-32 skeleton-shimmer rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-semibold">Không tìm thấy người bán</p>
        <Link to="/" className="text-primary mt-3 inline-block font-medium hover:underline">← Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-4xl space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Link>

      {/* Seller card */}
      <div className="rounded-2xl border bg-card p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/10 shrink-0">
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold font-display">{seller.name || 'Ẩn danh'}</h1>
            {seller.university && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <GraduationCap className="h-4 w-4 text-primary" /> {seller.university}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="h-3.5 w-3.5" /> Tham gia {timeAgo(seller.created_at)}
            </p>
            {seller.bio && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{seller.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Seller items */}
      <div>
        <h2 className="text-lg font-bold font-display mb-4">Sản phẩm đang bán ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">Chưa có sản phẩm nào.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <ProductCard
                key={item.id}
                {...item}
                isFavorited={favorites.has(item.id)}
                onToggleFavorite={user ? () => toggleFavorite(item.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
