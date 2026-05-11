import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocationPicker } from '@/hooks/useLocationPicker';
import { formatPrice } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Truck, CreditCard, MessageSquare, Package, Loader2, LocateFixed, Zap, Rocket, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';

interface ShippingAddress {
  id: string;
  recipient_name: string;
  phone: string;
  address: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const initialQty = Math.max(1, Number(searchParams.get('qty')) || 1);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocationPicker();
  const [quantity, setQuantity] = useState(initialQty);

  const [item, setItem] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);

  const [message, setMessage] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) { navigate('/auth'); return; }
    if (!id) return;

    const load = async () => {
      const [{ data: itemData }, { data: addresses }] = await Promise.all([
        supabase.from('items').select('*').eq('id', id).maybeSingle(),
        supabase.from('shipping_addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
      ]);

      if (!itemData) { navigate('/'); return; }
      setItem(itemData);

      const { data: sellerData } = await supabase.from('profiles').select('name, phone').eq('id', itemData.user_id).maybeSingle();
      setSeller(sellerData);

      if (addresses && addresses.length > 0) {
        setSavedAddresses(addresses as ShippingAddress[]);
        const defaultAddr = addresses.find((a: any) => a.is_default) || addresses[0];
        setSelectedAddressId((defaultAddr as any).id);
      } else {
        setShowAddressForm(true);
      }
      setLoading(false);
    };
    load();
  }, [id, user, navigate]);

  const selectSavedAddress = (addr: ShippingAddress) => {
    setSelectedAddressId(addr.id);
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const startEditAddress = (addr: ShippingAddress) => {
    setEditingAddressId(addr.id);
    setSelectedAddressId(addr.id);
    setShowAddressForm(true);
    setRecipientName(addr.recipient_name);
    setRecipientPhone(addr.phone);
    setAddressDetail(addr.address);
    setSaveAddress(true);
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from('shipping_addresses').delete().eq('id', id);
    if (error) { toast.error('Không xóa được địa chỉ'); return; }
    const next = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(next);
    if (selectedAddressId === id) {
      if (next.length > 0) setSelectedAddressId(next[0].id);
      else { setSelectedAddressId(null); setShowAddressForm(true); }
    }
    toast.success('Đã xóa địa chỉ');
  };

  const buildFullAddress = () => {
    const parts = [addressDetail, location.selectedWard, location.selectedDistrict, location.selectedProvince].filter(Boolean);
    return parts.join(', ');
  };

  const handlePlaceOrder = async () => {
    if (!user || !item) return;

    let finalAddress = '';
    let finalName = recipientName;
    let finalPhone = recipientPhone;

    if (showAddressForm || !selectedAddressId) {
      if (!recipientName.trim() || !recipientPhone.trim()) {
        toast.error('Vui lòng điền tên và số điện thoại người nhận');
        return;
      }
      if (!location.selectedProvince || !location.selectedDistrict || !location.selectedWard) {
        toast.error('Vui lòng chọn đầy đủ Tỉnh/TP, Quận/Huyện và Phường/Xã');
        return;
      }
      if (!addressDetail.trim()) {
        toast.error('Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)');
        return;
      }
      finalAddress = buildFullAddress();
      finalName = recipientName;
      finalPhone = recipientPhone;
    } else {
      const addr = savedAddresses.find(a => a.id === selectedAddressId);
      if (!addr) { toast.error('Vui lòng chọn địa chỉ'); return; }
      finalAddress = addr.address;
      finalName = addr.recipient_name;
      finalPhone = addr.phone;
    }

    setPlacing(true);
    try {
      let addressId = selectedAddressId;
      if (showAddressForm) {
        if (editingAddressId) {
          await supabase.from('shipping_addresses').update({
            recipient_name: recipientName,
            phone: recipientPhone,
            address: finalAddress,
          }).eq('id', editingAddressId);
          addressId = editingAddressId;
        } else if (saveAddress) {
          const { data: newAddr } = await supabase.from('shipping_addresses').insert({
            user_id: user.id,
            recipient_name: recipientName,
            phone: recipientPhone,
            address: finalAddress,
            is_default: savedAddresses.length === 0,
          }).select('id').single();
          if (newAddr) addressId = newAddr.id;
        }
      }

      const orderQty = Math.max(1, Math.min(quantity, item.quantity ?? 1));
      const { error } = await supabase.from('orders').insert({
        buyer_id: user.id,
        seller_id: item.user_id,
        item_id: item.id,
        shipping_address_id: addressId,
        recipient_name: finalName,
        recipient_phone: finalPhone,
        recipient_address: finalAddress,
        message: message || null,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        quantity: orderQty,
        total_price: Number(item.price) * orderQty,
      } as any);

      if (error) throw error;

      try {
        const raw = localStorage.getItem('stumarket_cart');
        if (raw) {
          const v = JSON.parse(raw);
          if (Array.isArray(v)) {
            localStorage.setItem('stumarket_cart', JSON.stringify(v.filter((i: string) => i !== item.id)));
          } else if (v && typeof v === 'object') {
            delete v[item.id];
            localStorage.setItem('stumarket_cart', JSON.stringify(v));
          }
        }
      } catch {}
      window.dispatchEvent(new Event('cart-updated'));

      toast.success('Đặt hàng thành công!');
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.message || 'Đặt hàng thất bại');
    }
    setPlacing(false);
  };

  if (loading) {
    return <div className="container py-8 max-w-2xl"><div className="animate-pulse h-60 skeleton-shimmer rounded-2xl" /></div>;
  }

  if (!item) return null;

  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-6 max-w-2xl space-y-5">
        <Link to={`/item/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>

        <h1 className="text-2xl font-bold font-display">Đặt hàng</h1>

        {/* Product summary */}
        <div className="rounded-2xl border bg-card p-4 flex gap-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted shrink-0">
            {item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold line-clamp-2 text-sm">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-1">Người bán: {seller?.name || 'Ẩn danh'} · Còn {item.quantity ?? 0}</p>
            <p className="text-primary font-extrabold font-display text-lg mt-1">{formatPrice(item.price)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Số lượng:</span>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted">−</button>
              <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
              <button
                  onClick={() => setQuantity(q => Math.min((item.quantity ?? 1), q + 1))}
                  disabled={quantity >= (item.quantity ?? 1)}
                  className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted disabled:opacity-40"
              >+</button>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="rounded-2xl border bg-card p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="font-semibold font-display flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Địa chỉ nhận hàng
          </h2>

          {savedAddresses.length > 0 && !showAddressForm && (
              <div className="space-y-2">
                {savedAddresses.map(addr => {
                  const active = selectedAddressId === addr.id;
                  return (
                      <div
                          key={addr.id}
                          className={`group relative w-full p-3 rounded-xl border-2 transition-colors cursor-pointer ${
                              active ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30'
                          }`}
                          onClick={() => selectSavedAddress(addr)}
                      >
                        <div className="pr-20">
                          <p className="font-medium text-sm">{addr.recipient_name} — {addr.phone}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{addr.address}</p>
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={(e) => { e.stopPropagation(); startEditAddress(addr); }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xóa địa chỉ này?</AlertDialogTitle>
                                <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteAddress(addr.id)}>Xóa</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                  );
                })}
                <Button variant="outline" size="sm" onClick={() => { setShowAddressForm(true); setSelectedAddressId(null); setEditingAddressId(null); setRecipientName(''); setRecipientPhone(''); setAddressDetail(''); }}>
                  + Thêm địa chỉ mới
                </Button>
              </div>
          )}

          {showAddressForm && (
              <div className="space-y-3">
                {savedAddresses.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => { setShowAddressForm(false); if (savedAddresses[0]) selectSavedAddress(savedAddresses[0]); }}>
                      ← Chọn địa chỉ đã lưu
                    </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tên người nhận</Label>
                    <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <Label>Số điện thoại</Label>
                    <Input value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} placeholder="0912345678" />
                  </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-primary"
                    onClick={location.useCurrentLocation}
                    disabled={location.loadingGeo}
                >
                  {location.loadingGeo ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                  Sử dụng vị trí hiện tại
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Tỉnh/Thành phố</Label>
                    <Select value={location.selectedProvince} onValueChange={location.selectProvince}>
                      <SelectTrigger><SelectValue placeholder="Chọn Tỉnh/TP" /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {location.provinces.map(p => <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quận/Huyện</Label>
                    <Select value={location.selectedDistrict} onValueChange={location.selectDistrict} disabled={!location.selectedProvince}>
                      <SelectTrigger><SelectValue placeholder="Chọn Quận/Huyện" /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {location.districts.map(d => <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Phường/Xã</Label>
                    <Select value={location.selectedWard} onValueChange={location.selectWard} disabled={!location.selectedDistrict}>
                      <SelectTrigger><SelectValue placeholder="Chọn Phường/Xã" /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {location.wards.map(w => <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Địa chỉ chi tiết (số nhà, tên đường) *</Label>
                  <Input value={addressDetail} onChange={e => setAddressDetail(e.target.value)} placeholder="VD: Số 12, Đường Nguyễn Trãi, ngõ 5..." />
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} className="rounded" />
                  Lưu địa chỉ cho lần sau
                </label>
              </div>
          )}
        </div>

        {/* Message */}
        <div className="rounded-2xl border bg-card p-5 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="font-semibold font-display flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Lời nhắn cho người bán
            <span className="text-xs font-normal text-muted-foreground ml-1">(không bắt buộc)</span>
          </h2>
          <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Ghi chú thêm cho người bán (tùy chọn)..." rows={2} />
        </div>

        {/* Delivery method */}
        <div className="rounded-2xl border bg-card p-5 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="font-semibold font-display flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> Phương thức giao hàng
          </h2>
          <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer hover:border-primary/30 transition-colors">
              <RadioGroupItem value="standard" />
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Giao hàng nhanh</p>
                <p className="text-xs text-muted-foreground">Nhận hàng trong 2-3 ngày</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer hover:border-primary/30 transition-colors">
              <RadioGroupItem value="express" />
              <Zap className="h-4 w-4 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Giao hàng hỏa tốc</p>
                <p className="text-xs text-muted-foreground">Nhận hàng trong vài giờ (nội thành)</p>
              </div>
            </label>
          </RadioGroup>
        </div>

        {/* Payment method */}
        <div className="rounded-2xl border bg-card p-5 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="font-semibold font-display flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Phương thức thanh toán
          </h2>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer hover:border-primary/30 transition-colors">
              <RadioGroupItem value="cod" />
              <div>
                <p className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</p>
                <p className="text-xs text-muted-foreground">Trả tiền mặt khi nhận được sản phẩm</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer hover:border-primary/30 transition-colors">
              <RadioGroupItem value="bank_transfer" />
              <div>
                <p className="text-sm font-medium">Chuyển khoản ngân hàng</p>
                <p className="text-xs text-muted-foreground">Chuyển khoản trước khi giao hàng</p>
              </div>
            </label>
          </RadioGroup>
        </div>

        {/* Order summary & place order */}
        <div className="rounded-2xl border bg-card p-5 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between text-lg">
            <span className="font-medium">Tổng thanh toán:</span>
            <span className="font-extrabold text-primary font-display text-xl">{formatPrice(Number(item.price) * quantity)}</span>
          </div>
          <Button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-base shadow-md shadow-primary/20 hover:opacity-90"
          >
            {placing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đặt hàng'}
          </Button>
        </div>
      </motion.div>
  );
}
