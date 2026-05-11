import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, ShoppingBag, Package, Truck, CheckCircle2, Clock, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const statusMeta: Record<string, { label: string; icon: any; cls: string }> = {
  pending: { label: 'Chờ xử lý', icon: Clock, cls: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  confirmed: { label: 'Đã xác nhận', icon: Package, cls: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  shipping: { label: 'Đang giao', icon: Truck, cls: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
  shipped: { label: 'Đã gửi hàng', icon: Truck, cls: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
  completed: { label: 'Hoàn tất', icon: CheckCircle2, cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  cancelled: { label: 'Đã hủy', icon: X, cls: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export default function MyPurchasesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) { navigate('/auth'); return; }
    const load = async () => {
      const { data } = await supabase.from('orders').select('*').eq('buyer_id', user.id).order('created_at', { ascending: false });
      if (!data || data.length === 0) { setOrders([]); setLoading(false); return; }
      const itemIds = [...new Set(data.map((o: any) => o.item_id))];
      const sellerIds = [...new Set(data.map((o: any) => o.seller_id))];
      const [{ data: items }, { data: sellers }] = await Promise.all([
        supabase.from('items').select('id, title, image_url, price').in('id', itemIds),
        supabase.from('profiles').select('id, name').in('id', sellerIds),
      ]);
      const itemMap = new Map((items || []).map(i => [i.id, i]));
      const sellerMap = new Map((sellers || []).map(s => [s.id, s]));
      setOrders(data.map((o: any) => ({ ...o, item: itemMap.get(o.item_id), seller: sellerMap.get(o.seller_id) })));
      setLoading(false);
    };
    load();
  }, [user, navigate]);

  const cancelOrder = async (id: string) => {
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
    if (error) { toast.error('Không thể hủy đơn'); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    toast.success('Đã hủy đơn hàng');
  };

  if (loading) {
    return <div className="container py-8 max-w-3xl"><div className="animate-pulse h-40 skeleton-shimmer rounded-2xl" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="container py-6 max-w-3xl space-y-5">
      <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium">
        <ArrowLeft className="h-4 w-4" /> Về trang cá nhân
      </Link>

      <h1 className="text-xl sm:text-2xl font-bold font-display flex items-center gap-2">
        <ShoppingBag className="h-6 w-6 text-primary" /> Đơn hàng đã mua
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="font-semibold">Bạn chưa có đơn hàng nào</p>
          <Link to="/" className="text-primary text-sm hover:underline mt-2 inline-block">Khám phá sản phẩm →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const s = statusMeta[o.status] || statusMeta.pending;
            const Icon = s.icon;
            const canCancel = !o.shipped_at && o.status !== 'shipped' && o.status !== 'completed' && o.status !== 'cancelled';
            return (
              <div key={o.id} className="rounded-2xl border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <Link to={o.item ? `/item/${o.item_id}` : '#'} className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-muted shrink-0">
                    {o.item?.image_url && <img src={o.item.image_url} alt="" className="h-full w-full object-cover" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <Link to={o.item ? `/item/${o.item_id}` : '#'} className="font-semibold text-sm line-clamp-2 hover:text-primary">
                        {o.item?.title || 'Sản phẩm đã bị xóa'}
                      </Link>
                      <Badge className={`gap-1 ${s.cls} border shrink-0`}>
                        <Icon className="h-3 w-3" /> {s.label}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Mã đơn: <span className="font-mono font-semibold text-foreground">#{o.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Người bán: {o.seller?.name || 'Ẩn danh'}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground gap-2 flex-wrap">
                      <span>SL: {o.quantity || 1} · {new Date(o.created_at).toLocaleDateString('vi-VN')}
                        {o.delivery_method === 'express' && (
                          <span className="ml-2 inline-flex items-center gap-1 text-amber-600 font-semibold"><Zap className="h-3 w-3" />Hỏa tốc</span>
                        )}
                      </span>
                      <span className="font-extrabold text-primary font-display text-base">{formatPrice(Number(o.total_price))}</span>
                    </div>
                    {o.shipped_at && (
                      <p className="text-xs text-emerald-600 mt-1">📦 Người bán đã gửi hàng: {new Date(o.shipped_at).toLocaleString('vi-VN')}</p>
                    )}
                    {canCancel && (
                      <div className="mt-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1.5 rounded-lg text-destructive hover:bg-destructive/10 border-destructive/30">
                              <X className="h-3.5 w-3.5" /> Hủy đơn
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hủy đơn hàng?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc muốn hủy đơn <span className="font-mono font-semibold">#{o.id.slice(0, 8).toUpperCase()}</span>? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Không, giữ đơn</AlertDialogCancel>
                              <AlertDialogAction onClick={() => cancelOrder(o.id)} className="bg-destructive hover:bg-destructive/90">
                                Có, hủy đơn
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
