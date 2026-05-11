import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Inbox, Package, Loader2, Truck, History, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface OrderRow {
  id: string;
  item_id: string;
  created_at: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  message: string | null;
  delivery_method: string;
  payment_method: string;
  status: string;
  total_price: number;
  quantity?: number;
  shipped_at?: string | null;
  item: { title: string } | null;
  buyer: { name: string | null; email: string | null } | null;
}

const deliveryLabel = (m: string) => m === 'express' ? 'Hỏa tốc' : m === 'standard' ? 'Giao nhanh' : m;
const paymentLabel = (m: string) => m === 'cod' ? 'COD' : m === 'bank_transfer' ? 'Chuyển khoản' : m;
const statusLabel = (s: string) => ({ pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', shipping: 'Đang giao', shipped: 'Đã gửi hàng', completed: 'Hoàn tất', cancelled: 'Đã hủy' } as any)[s] || s;

export default function SellerOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) { navigate('/auth'); return; }
    const load = async () => {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (!ordersData || ordersData.length === 0) { setOrders([]); setLoading(false); return; }

      const itemIds = [...new Set(ordersData.map(o => o.item_id))];
      const buyerIds = [...new Set(ordersData.map(o => o.buyer_id))];
      const [{ data: items }, { data: buyers }] = await Promise.all([
        supabase.from('items').select('id, title').in('id', itemIds),
        supabase.from('profiles').select('id, name, email').in('id', buyerIds),
      ]);

      const itemMap = new Map((items || []).map(i => [i.id, i]));
      const buyerMap = new Map((buyers || []).map(b => [b.id, b]));

      setOrders(ordersData.map((o: any) => ({
        ...o,
        item: itemMap.get(o.item_id) ? { title: itemMap.get(o.item_id)!.title } : null,
        buyer: buyerMap.get(o.buyer_id) ? { name: buyerMap.get(o.buyer_id)!.name, email: buyerMap.get(o.buyer_id)!.email } : null,
      })));
      setLoading(false);
    };
    load();
  }, [user, navigate]);

  const markShipped = async (id: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'shipped', shipped_at: new Date().toISOString() } as any)
      .eq('id', id);
    if (error) { toast.error('Không thể cập nhật'); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'shipped', shipped_at: new Date().toISOString() } : o));
    toast.success('Đã đánh dấu đã gửi hàng');
  };

  const exportExcel = () => {
    if (orders.length === 0) { toast.error('Không có đơn hàng để xuất'); return; }
    const rows = orders.map((o, idx) => ({
      'STT': idx + 1,
      'Mã đơn': o.id.slice(0, 8),
      'Ngày đặt': new Date(o.created_at).toLocaleString('vi-VN'),
      'Sản phẩm': o.item?.title || '—',
      'Khách hàng': o.buyer?.name || '—',
      'Email khách': o.buyer?.email || '—',
      'Tên người nhận': o.recipient_name,
      'SĐT': o.recipient_phone,
      'Địa chỉ': o.recipient_address,
      'Lời nhắn': o.message || '',
      'Giao hàng': deliveryLabel(o.delivery_method),
      'Thanh toán': paymentLabel(o.payment_method),
      'Trạng thái': statusLabel(o.status),
      'Tổng tiền (VNĐ)': Number(o.total_price),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 5 }, { wch: 10 }, { wch: 18 }, { wch: 30 }, { wch: 18 },
      { wch: 24 }, { wch: 18 }, { wch: 13 }, { wch: 40 }, { wch: 25 },
      { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Đơn hàng');
    const filename = `don-hang-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success('Đã xuất file Excel');
  };

  if (loading) {
    return <div className="container py-8 max-w-6xl"><div className="animate-pulse h-60 bg-muted rounded-2xl" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="container py-6 max-w-6xl space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <Inbox className="h-6 w-6 text-primary" /> Đơn hàng nhận được
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Danh sách khách hàng yêu cầu mua sản phẩm của bạn</p>
        </div>
        <Button onClick={exportExcel} className="gap-2 rounded-xl bg-gradient-primary text-primary-foreground shadow-md shadow-primary/20" disabled={orders.length === 0}>
          <Download className="h-4 w-4" /> Xuất Excel
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">Chưa có đơn hàng nào</p>
          <p className="text-sm text-muted-foreground mt-1">Khi có khách đặt mua sản phẩm, đơn hàng sẽ hiển thị tại đây.</p>
        </div>
      ) : (
        <>
          {(() => {
            const pending = orders.filter(o => !o.shipped_at && o.status !== 'shipped' && o.status !== 'completed' && o.status !== 'cancelled');
            const history = orders.filter(o => o.shipped_at || o.status === 'shipped' || o.status === 'completed');
            return (
              <>
                <h2 className="text-base font-bold flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Cần xử lý ({pending.length})</h2>
                <div className="rounded-2xl border bg-card overflow-x-auto" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>SL</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Địa chỉ</TableHead>
                        <TableHead className="text-center">Hỏa tốc</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Tổng</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pending.length === 0 ? (
                        <TableRow><TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-6">Không có đơn cần xử lý</TableCell></TableRow>
                      ) : pending.map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="text-xs font-mono font-semibold whitespace-nowrap">#{o.id.slice(0, 8).toUpperCase()}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{new Date(o.created_at).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell className="font-medium max-w-[200px]">
                            <div className="truncate">{o.item?.title || '—'}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">SP: {o.item_id.slice(0, 8).toUpperCase()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{o.recipient_name}</div>
                            <div className="text-xs text-muted-foreground">{o.buyer?.name || ''}</div>
                          </TableCell>
                          <TableCell className="text-xs font-semibold">{o.quantity || 1}</TableCell>
                          <TableCell className="text-xs">{o.recipient_phone}</TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate" title={o.recipient_address}>{o.recipient_address}</TableCell>
                          <TableCell className="text-center">
                            {o.delivery_method === 'express' ? (
                              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 border gap-1"><Zap className="h-3 w-3" />Hỏa tốc</Badge>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{statusLabel(o.status)}</Badge></TableCell>
                          <TableCell className="text-right font-semibold text-primary whitespace-nowrap">{formatPrice(Number(o.total_price))}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" onClick={() => markShipped(o.id)} className="gap-1 rounded-lg bg-gradient-primary text-primary-foreground">
                              <Truck className="h-3.5 w-3.5" /> Đã gửi
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <h2 className="text-base font-bold flex items-center gap-2 mt-6"><History className="h-4 w-4 text-primary" /> Lịch sử đã gửi hàng ({history.length})</h2>
                <div className="rounded-2xl border bg-card overflow-x-auto" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Ngày đặt</TableHead>
                        <TableHead>Đã gửi lúc</TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>SL</TableHead>
                        <TableHead className="text-center">Hỏa tốc</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Tổng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.length === 0 ? (
                        <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-6">Chưa gửi đơn nào</TableCell></TableRow>
                      ) : history.map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="text-xs font-mono font-semibold whitespace-nowrap">#{o.id.slice(0, 8).toUpperCase()}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{new Date(o.created_at).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{o.shipped_at ? new Date(o.shipped_at).toLocaleString('vi-VN') : '—'}</TableCell>
                          <TableCell className="font-medium max-w-[200px]">
                            <div className="truncate">{o.item?.title || '—'}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">SP: {o.item_id.slice(0, 8).toUpperCase()}</div>
                          </TableCell>
                          <TableCell className="text-sm">{o.recipient_name}</TableCell>
                          <TableCell className="text-xs font-semibold">{o.quantity || 1}</TableCell>
                          <TableCell className="text-center">
                            {o.delivery_method === 'express' ? (
                              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 border gap-1"><Zap className="h-3 w-3" />Hỏa tốc</Badge>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell><Badge variant="default" className="text-xs">{statusLabel(o.status)}</Badge></TableCell>
                          <TableCell className="text-right font-semibold text-primary whitespace-nowrap">{formatPrice(Number(o.total_price))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            );
          })()}
        </>
      )}
    </motion.div>
  );
}
