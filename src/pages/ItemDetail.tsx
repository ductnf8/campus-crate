import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, timeAgo } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdBanner from '@/components/AdBanner';
import ProductCard from '@/components/ProductCard';
import { ArrowLeft, Clock, Eye, Heart, MapPin, Phone, ShoppingCart, User, Share2, ShieldCheck, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SellerProfile {
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
  university: string | null;
  bio: string | null;
}

interface ItemRow {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  address_detail: string | null;
  location: string | null;
  district: string | null;
  ward: string | null;
  category: string | null;
  status: string;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  user_id: string;
  quantity: number;
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<ItemRow | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      // Increment view count first
      await supabase.rpc('increment_view_count', { item_id: id });

      const { data: itemData } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (itemData) {
        const row = itemData as ItemRow;
        setItem({
          ...row,
          address_detail: row.address_detail ?? null,
          district: row.district,
          ward: row.ward,
        });

        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, avatar_url, phone, university, bio')
          .eq('id', itemData.user_id)
          .maybeSingle();
        setSeller(profileData as SellerProfile);

        if (itemData.category) {
          const { data: related } = await supabase
            .from('items')
            .select('id, title, price, image_url, location, created_at, views_count, is_featured, category')
            .eq('status', 'active')
            .eq('category', itemData.category)
            .neq('id', id)
            .limit(4);
          if (related) setRelatedItems(related);
        }
      }
      setLoading(false);
    };
    load();

    if (user) {
      supabase.from('favorites').select('id').eq('user_id', user.id).eq('item_id', id).maybeSingle()
        .then(({ data }) => setIsFav(!!data));
    }
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user || !id) return;
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('item_id', id);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, item_id: id });
    }
    setIsFav(!isFav);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép link!');
  };

  const handleAddToCart = () => {
    if (!item) return;
    if (item.quantity <= 0) { toast.error('Sản phẩm đã hết hàng'); return; }
    let cart: Record<string, number> = {};
    try {
      const raw = localStorage.getItem('stumarket_cart');
      if (raw) {
        const v = JSON.parse(raw);
        if (Array.isArray(v)) v.forEach((id: string) => { cart[id] = (cart[id] || 0) + 1; });
        else if (v && typeof v === 'object') cart = v;
      }
    } catch {}
    if (cart[item.id]) { toast.info('Sản phẩm đã có trong giỏ hàng'); return; }
    cart[item.id] = 1;
    localStorage.setItem('stumarket_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const locationParts = [item?.address_detail, item?.location, item?.district, item?.ward].filter(Boolean);
  const fullLocation = locationParts.join(', ');

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 skeleton-shimmer w-1/4 rounded-lg" />
          <div className="aspect-video skeleton-shimmer rounded-2xl" />
          <div className="h-8 skeleton-shimmer w-3/4 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-20 text-center">
        <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Eye className="h-10 w-10 text-muted-foreground opacity-40" />
        </div>
        <p className="text-lg font-semibold">Không tìm thấy sản phẩm</p>
        <Link to="/" className="text-primary mt-3 inline-block font-medium hover:underline">← Về trang chủ</Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-6 space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl overflow-hidden border bg-card" style={{ boxShadow: 'var(--shadow-card)' }}>
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="w-full max-h-[520px] object-contain bg-muted" />
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">Không có ảnh</div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                {item.is_featured && (
                  <Badge className="bg-gradient-hero text-featured-foreground border-0 shadow-sm gap-1 rounded-lg px-3 py-1">
                    <Flame className="h-3 w-3" /> HOT
                  </Badge>
                )}
                <h1 className="text-2xl font-bold font-display leading-tight">{item.title}</h1>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={handleShare} className="p-2.5 rounded-xl border-2 hover:bg-muted transition-colors">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </button>
                {user && (
                  <button onClick={toggleFavorite} className="p-2.5 rounded-xl border-2 hover:bg-muted transition-colors">
                    <Heart className={`h-5 w-5 ${isFav ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                  </button>
                )}
              </div>
            </div>

            <p className="text-3xl font-extrabold text-primary font-display">{formatPrice(item.price)}</p>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Còn lại:</span>
              {item.quantity > 0 ? (
                <span className="font-semibold text-foreground">{item.quantity} sản phẩm</span>
              ) : (
                <span className="font-semibold text-destructive">Hết hàng</span>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddToCart} disabled={item.quantity <= 0} variant="outline" className="flex-1 rounded-xl border-2 border-primary text-primary hover:bg-primary/10 gap-2 font-semibold h-12 disabled:opacity-50">
                <ShoppingCart className="h-5 w-5" /> Thêm vào giỏ
              </Button>
              <Button
                disabled={item.quantity <= 0}
                className="flex-1 rounded-xl bg-gradient-primary text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 font-semibold h-12 text-base disabled:opacity-50"
                onClick={() => {
                  if (!user) { navigate('/auth'); return; }
                  navigate(`/checkout/${item.id}`);
                }}
              >
                {item.quantity <= 0 ? 'Hết hàng' : 'Mua ngay'}
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {fullLocation && (
                <span className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                  <MapPin className="h-4 w-4 text-primary" /> {fullLocation}
                </span>
              )}
              {item.category && (
                <span className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">{item.category}</span>
              )}
              <span className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                <Clock className="h-4 w-4" /> {timeAgo(item.created_at)}
              </span>
              <span className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                <Eye className="h-4 w-4" /> {item.views_count} lượt xem
              </span>
            </div>

            <div className="pt-5 border-t space-y-4">
              <h2 className="font-semibold text-lg font-display">Mô tả chi tiết</h2>
              {fullLocation && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Địa chỉ</p>
                    <p className="text-muted-foreground">{fullLocation}</p>
                  </div>
                </div>
              )}
              {item.description ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Chưa có mô tả chi tiết.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h3 className="font-semibold font-display flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-primary" /> Người bán
            </h3>
            <Link to={`/seller/${item.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/10">
                {seller?.avatar_url ? (
                  <img src={seller.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold">{seller?.name || 'Ẩn danh'}</p>
                {seller?.university && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3 w-3 text-success" /> {seller.university}
                  </p>
                )}
              </div>
            </Link>
            {seller?.bio && <p className="text-sm text-muted-foreground">{seller.bio}</p>}
            {seller?.phone && (
              <a href={`tel:${seller.phone}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:opacity-90 transition-opacity">
                <Phone className="h-4 w-4" /> {seller.phone}
              </a>
            )}
          </div>

          <div className="rounded-2xl border bg-accent/50 p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-accent-foreground">
              <ShieldCheck className="h-4 w-4" /> Mẹo an toàn
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• Gặp trực tiếp tại nơi công cộng</li>
              <li>• Kiểm tra sản phẩm trước khi thanh toán</li>
              <li>• Không chuyển khoản trước cho người lạ</li>
            </ul>
          </div>

          <AdBanner position="detail" />
        </div>
      </div>

      {relatedItems.length > 0 && (
        <div className="pt-8 border-t">
          <h2 className="font-bold text-xl font-display mb-4">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedItems.map(ri => <ProductCard key={ri.id} {...ri} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
}
