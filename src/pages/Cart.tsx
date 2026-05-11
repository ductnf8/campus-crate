import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, ArrowLeft, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  quantity: number;
  available: number;
}

// Cart storage: legacy was string[] of ids; new is { [id]: qty }
function readCart(): Record<string, number> {
  const raw = localStorage.getItem('stumarket_cart');
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) {
      const obj: Record<string, number> = {};
      v.forEach((id: string) => { obj[id] = (obj[id] || 0) + 1; });
      return obj;
    }
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}

function writeCart(cart: Record<string, number>) {
  localStorage.setItem('stumarket_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    const cart = readCart();
    const ids = Object.keys(cart);
    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('items')
      .select('id, title, price, image_url, quantity')
      .in('id', ids);
    const merged = (data || []).map(d => ({
      id: d.id,
      title: d.title,
      price: Number(d.price),
      image_url: d.image_url,
      available: d.quantity ?? 0,
      quantity: Math.min(cart[d.id] || 1, Math.max(d.quantity ?? 0, 1)),
    }));
    setItems(merged);
    setLoading(false);
  };

  useEffect(() => { loadCart(); }, []);

  const updateQty = (id: string, qty: number) => {
    const cart = readCart();
    if (qty <= 0) {
      delete cart[id];
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      cart[id] = qty;
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }
    writeCart(cart);
  };

  const removeItem = (id: string) => {
    updateQty(id, 0);
    toast.success('Đã xóa khỏi giỏ hàng');
  };

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (loading) {
    return <div className="container py-8"><div className="animate-pulse h-40 skeleton-shimmer rounded-2xl" /></div>;
  }

  return (
    <div className="container py-6 max-w-2xl space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium">
        <ArrowLeft className="h-4 w-4" /> Tiếp tục mua sắm
      </Link>

      <h1 className="text-2xl font-bold font-display flex items-center gap-3">
        <ShoppingCart className="h-6 w-6 text-primary" /> Giỏ hàng ({items.length})
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-lg text-foreground">Giỏ hàng trống</p>
          <p className="text-sm mt-1">Hãy thêm sản phẩm yêu thích vào giỏ!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map(item => {
              const outOfStock = item.available <= 0;
              return (
                <motion.div key={item.id} layout className="flex items-center gap-4 p-4 rounded-2xl border bg-card" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <Link to={`/item/${item.id}`} className="h-20 w-20 rounded-xl overflow-hidden bg-muted shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/item/${item.id}`} className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                      {item.title}
                    </Link>
                    <p className="text-primary font-extrabold font-display mt-1">{formatPrice(item.price)}</p>
                    {outOfStock ? (
                      <p className="text-xs text-destructive font-semibold mt-1">Sản phẩm đã hết hàng</p>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, Math.min(item.quantity + 1, item.available))}
                          disabled={item.quantity >= item.available}
                          className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <span className="text-xs text-muted-foreground ml-1">/ còn {item.available}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa khỏi giỏ hàng?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa "{item.title}" khỏi giỏ hàng?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeItem(item.id)} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {!outOfStock && (
                      <Button
                        size="sm"
                        className="rounded-lg bg-gradient-primary text-primary-foreground"
                        onClick={() => navigate(`/checkout/${item.id}?qty=${item.quantity}`)}
                      >
                        Mua
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">Tổng cộng:</span>
              <span className="font-extrabold text-primary font-display text-xl">{formatPrice(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
