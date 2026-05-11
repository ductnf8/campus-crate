import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import HeroSection from '@/components/HeroSection';
import CategoryChips from '@/components/CategoryChips';
import FilterPanel from '@/components/FilterPanel';
import SuggestedProducts from '@/components/SuggestedProducts';
import AdBanner from '@/components/AdBanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

const PAGE_SIZE = 20;

interface Item {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  location: string | null;
  district: string | null;
  ward: string | null;
  created_at: string;
  views_count: number;
  is_featured: boolean;
  category: string | null;
  quantity: number;
}

export default function HomePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 0 : page;

    let query = supabase
      .from('items')
      .select('id, title, price, image_url, location, district, ward, created_at, views_count, is_featured, category, quantity')
      .eq('status', 'active')
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

    if (user) query = query.neq('user_id', user.id);
    if (search) query = query.ilike('title', `%${search}%`);
    if (category && category !== 'all') query = query.eq('category', category);
    if (location && location !== 'all') query = query.eq('location', location);
    if (district && district !== 'all') query = query.eq('district', district);
    if (ward && ward !== 'all') query = query.eq('ward', ward);
    if (priceMin) query = query.gte('price', Number(priceMin));
    if (priceMax) query = query.lte('price', Number(priceMax));

    switch (sortBy) {
      case 'price_asc': query = query.order('price', { ascending: true }); break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'popular': query = query.order('views_count', { ascending: false }); break;
      default: query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    }

    const { data } = await query;
    if (data) {
      setItems(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoading(false);
    if (reset) setPage(0);
  }, [search, category, location, district, ward, sortBy, priceMin, priceMax, page, user]);

  useEffect(() => {
    fetchItems(true);
  }, [search, category, location, district, ward, sortBy, priceMin, priceMax, user]);

  useEffect(() => {
    if (!user) return;
    supabase.from('favorites').select('item_id').eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setFavorites(new Set(data.map(f => f.item_id)));
      });
  }, [user]);

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

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchItems();
  };

  const clearFilters = () => {
    setCategory('');
    setLocation('');
    setDistrict('');
    setWard('');
    setSortBy('newest');
    setPriceMin('');
    setPriceMax('');
  };

  return (
    <div>
      <HeroSection searchValue={search} onSearchChange={setSearch} />

      <div className="container py-6 space-y-5">
        <SuggestedProducts />
        <CategoryChips selected={category} onSelect={setCategory} />

        <AdBanner position="home" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <h2 className="text-xl font-bold font-display tracking-tight">
              {category || 'Tất cả sản phẩm'}
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] bg-background text-sm h-9 rounded-xl shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="newest">🕐 Mới nhất</SelectItem>
              <SelectItem value="price_asc">💰 Giá tăng dần</SelectItem>
              <SelectItem value="price_desc">💰 Giá giảm dần</SelectItem>
              <SelectItem value="popular">🔥 Phổ biến nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sidebar layout: filter left, products right */}
        <div className="flex gap-6">
          {/* Left sidebar filter */}
          <div className="hidden md:block w-[260px] shrink-0">
            <div className="sticky top-20">
              <FilterPanel
                search={search} setSearch={setSearch}
                location={location} setLocation={setLocation}
                district={district} setDistrict={setDistrict}
                ward={ward} setWard={setWard}
                priceMin={priceMin} setPriceMin={setPriceMin}
                priceMax={priceMax} setPriceMax={setPriceMax}
                onClear={clearFilters}
              />
            </div>
          </div>

          {/* Mobile filter (collapsible) */}
          <div className="md:hidden w-full">
            <details className="group">
              <summary className="flex items-center gap-2 text-sm font-medium text-primary cursor-pointer list-none mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10">
                  🔍 Bộ lọc nâng cao
                </span>
              </summary>
              <div className="mb-4">
                <FilterPanel
                  search={search} setSearch={setSearch}
                  location={location} setLocation={setLocation}
                  district={district} setDistrict={setDistrict}
                  ward={ward} setWard={setWard}
                  priceMin={priceMin} setPriceMin={setPriceMin}
                  priceMax={priceMax} setPriceMax={setPriceMax}
                  onClear={clearFilters}
                />
              </div>
            </details>
          </div>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {loading && items.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-muted-foreground"
              >
                <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-10 w-10 opacity-40" />
                </div>
                <p className="text-lg font-semibold text-foreground">Chưa có sản phẩm nào</p>
                <p className="text-sm mt-1">Hãy thử thay đổi bộ lọc hoặc đăng bán ngay!</p>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    >
                      <ProductCard
                        {...item}
                        isFavorited={favorites.has(item.id)}
                        onToggleFavorite={user ? () => toggleFavorite(item.id) : undefined}
                      />
                    </motion.div>
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center pt-6">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Đang tải...' : <><ArrowDown className="h-4 w-4" /> Xem thêm</>}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
