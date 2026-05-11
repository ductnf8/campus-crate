import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORIES } from '@/lib/constants';
import { useLocationPicker } from '@/hooks/useLocationPicker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Camera, Loader2, MapPin, Wallet, Pencil, Trash2, Check, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatPrice } from '@/lib/constants';
import { Link } from 'react-router-dom';

const POST_FEE = 5000;
const SAVED_ADDR_STORAGE_KEY = 'stumarket_saved_post_addresses';
/** Bản cũ: một object đơn */
const LEGACY_ADDR_STORAGE_KEY = 'stumarket_last_post_address';
const MAX_SAVED_ADDRESSES = 25;

type SavedPostAddress = {
  province: string;
  district: string;
  ward: string;
  /** Số nhà, đường, ngõ... */
  detail: string;
};

type SavedPostAddressRecord = SavedPostAddress & {
  id: string;
  /** Tên gợi nhớ, ví dụ: Nhà, KTX, Công ty */
  label: string;
};

type AddressDialogMode = { type: 'create' } | { type: 'edit'; id: string } | null;

function addressSignature(a: Pick<SavedPostAddress, 'province' | 'district' | 'ward' | 'detail'>) {
  return `${a.province}|${a.district}|${a.ward}|${String(a.detail).trim()}`;
}

function normalizeStoredRecord(raw: unknown): SavedPostAddressRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.province !== 'string' || !o.province.trim()) return null;
  let id = typeof o.id === 'string' && o.id ? o.id : crypto.randomUUID();
  return {
    id,
    label: typeof o.label === 'string' ? o.label : '',
    province: o.province,
    district: typeof o.district === 'string' ? o.district : '',
    ward: typeof o.ward === 'string' ? o.ward : '',
    detail: typeof o.detail === 'string' ? o.detail : '',
  };
}

function loadSavedAddressesFromStorage(): SavedPostAddressRecord[] {
  try {
    const multi = localStorage.getItem(SAVED_ADDR_STORAGE_KEY);
    if (multi) {
      const parsed = JSON.parse(multi) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeStoredRecord).filter(Boolean) as SavedPostAddressRecord[];
      }
    }
    const leg = localStorage.getItem(LEGACY_ADDR_STORAGE_KEY);
    if (leg) {
      const parsed = JSON.parse(leg) as unknown;
      if (Array.isArray(parsed)) {
        const list = parsed.map(normalizeStoredRecord).filter(Boolean) as SavedPostAddressRecord[];
        if (list.length > 0) {
          localStorage.setItem(SAVED_ADDR_STORAGE_KEY, JSON.stringify(list));
          localStorage.removeItem(LEGACY_ADDR_STORAGE_KEY);
        }
        return list;
      }
      const one = normalizeStoredRecord(parsed as object);
      if (one) {
        const list = [one];
        localStorage.setItem(SAVED_ADDR_STORAGE_KEY, JSON.stringify(list));
        localStorage.removeItem(LEGACY_ADDR_STORAGE_KEY);
        return list;
      }
    }
  } catch { /* ignore */ }
  return [];
}

function writeSavedAddressesToStorage(list: SavedPostAddressRecord[]) {
  try {
    localStorage.setItem(SAVED_ADDR_STORAGE_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

export default function PostItemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', quantity: '1' });
  const [balance, setBalance] = useState<number | null>(null);
  const loc = useLocationPicker();
  const [savedAddresses, setSavedAddresses] = useState<SavedPostAddressRecord[]>([]);
  const [saveAddressOn, setSaveAddressOn] = useState(true);
  const [addressDetail, setAddressDetail] = useState('');
  const [addressDialogMode, setAddressDialogMode] = useState<AddressDialogMode>(null);
  const [editDraft, setEditDraft] = useState({ label: '', province: '', district: '', ward: '', detail: '' });
  const [editDistricts, setEditDistricts] = useState<Array<{ code: number; name: string }>>([]);
  const [editWards, setEditWards] = useState<Array<{ code: number; name: string }>>([]);

  useEffect(() => {
    setSavedAddresses(loadSavedAddressesFromStorage());
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('balance').eq('id', user.id).maybeSingle()
        .then(({ data }) => { if (data) setBalance(Number((data as any).balance ?? 0)); });
  }, [user]);

  /** Đổ địa chỉ đã lưu vào bộ chọn địa điểm + ô chi tiết (một lần bấm “Sử dụng”). */
  const fillLocationPickersFromRecord = async (addr: SavedPostAddress) => {
    const p = loc.provinces.find(pp => pp.name === addr.province);
    if (!p) { toast.error('Không tìm thấy tỉnh/thành'); return; }
    loc.selectProvince(p.name);
    setAddressDetail(addr.detail ?? '');
    try {
      const pRes = await fetch(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`);
      const pData = await pRes.json();
      const d = (pData.districts || []).find((x: { name: string }) => x.name === addr.district);
      if (d) {
        loc.selectDistrict(d.name);
        const dRes = await fetch(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`);
        const dData = await dRes.json();
        const w = (dData.wards || []).find((x: { name: string }) => x.name === addr.ward);
        if (w) setTimeout(() => loc.selectWard(w.name), 100);
      }
    } catch { /* fallback: ít nhất đã có tỉnh */ }
  };

  const applySavedAddressRecord = async (rec: SavedPostAddressRecord) => {
    await fillLocationPickersFromRecord(rec);
    toast.success('Đã điền địa chỉ vào form');
  };

  const dialogOpen = addressDialogMode !== null;

  useEffect(() => {
    if (!dialogOpen || !editDraft.province) {
      setEditDistricts([]);
      return;
    }
    const prov = loc.provinces.find(x => x.name === editDraft.province);
    if (!prov) {
      setEditDistricts([]);
      return;
    }
    let cancelled = false;
    fetch(`https://provinces.open-api.vn/api/p/${prov.code}?depth=2`)
        .then(r => r.json())
        .then((d: { districts?: Array<{ code: number; name: string }> }) => {
          if (!cancelled) setEditDistricts(d.districts || []);
        })
        .catch(() => {
          if (!cancelled) setEditDistricts([]);
        });
    return () => {
      cancelled = true;
    };
  }, [dialogOpen, editDraft.province, loc.provinces]);

  useEffect(() => {
    if (!dialogOpen) {
      setEditWards([]);
      return;
    }
    if (!editDraft.district || editDistricts.length === 0) {
      setEditWards([]);
      return;
    }
    const dist = editDistricts.find(x => x.name === editDraft.district);
    if (!dist) {
      setEditWards([]);
      return;
    }
    let cancelled = false;
    fetch(`https://provinces.open-api.vn/api/d/${dist.code}?depth=2`)
        .then(r => r.json())
        .then((d: { wards?: Array<{ code: number; name: string }> }) => {
          if (!cancelled) setEditWards(d.wards || []);
        })
        .catch(() => {
          if (!cancelled) setEditWards([]);
        });
    return () => {
      cancelled = true;
    };
  }, [dialogOpen, editDraft.district, editDistricts]);

  const emptyEditDraft = () => ({ label: '', province: '', district: '', ward: '', detail: '' });

  const openCreateSavedAddressDialog = () => {
    setEditDraft(emptyEditDraft());
    setAddressDialogMode({ type: 'create' });
  };

  const openEditSavedAddressDialog = (rec: SavedPostAddressRecord) => {
    setEditDraft({
      label: rec.label,
      province: rec.province,
      district: rec.district,
      ward: rec.ward,
      detail: rec.detail ?? '',
    });
    setAddressDialogMode({ type: 'edit', id: rec.id });
  };

  const closeAddressDialog = () => setAddressDialogMode(null);

  const persistAddressDialog = () => {
    if (!editDraft.province.trim()) {
      toast.error('Vui lòng chọn tỉnh/thành');
      return;
    }
    const body: SavedPostAddress = {
      province: editDraft.province,
      district: editDraft.district,
      ward: editDraft.ward,
      detail: editDraft.detail.trim(),
    };
    const label = editDraft.label.trim();

    let nextList: SavedPostAddressRecord[];

    if (addressDialogMode?.type === 'create') {
      if (savedAddresses.some(a => addressSignature(a) === addressSignature(body))) {
        toast.info('Địa chỉ này đã có trong danh sách.');
        return;
      }
      nextList = [
        { ...body, id: crypto.randomUUID(), label },
        ...savedAddresses,
      ].slice(0, MAX_SAVED_ADDRESSES);
    } else if (addressDialogMode?.type === 'edit') {
      const sid = addressDialogMode.id;
      const clash = savedAddresses.some(
          a => a.id !== sid && addressSignature(a) === addressSignature(body),
      );
      if (clash) {
        toast.error('Địa chỉ trùng với một mục khác trong danh sách.');
        return;
      }
      nextList = savedAddresses.map(a =>
          a.id === sid ? { ...body, id: sid, label } : a,
      );
    } else {
      return;
    }

    setSavedAddresses(nextList);
    writeSavedAddressesToStorage(nextList);
    closeAddressDialog();
    toast.success('Đã lưu danh sách địa chỉ. Bấm «Sử dụng» trên ô tương ứng để đổ vào form.');
  };

  const deleteSavedAddress = (id: string) => {
    const nextList = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(nextList);
    writeSavedAddressesToStorage(nextList);
    toast.success('Đã xóa địa chỉ khỏi danh sách');
  };

  const formatSavedLine = (a: SavedPostAddressRecord) =>
    [a.detail, a.ward, a.district, a.province].filter(Boolean).join(', ');

  if (!user) { navigate('/auth'); return null; }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price) { toast.error('Vui lòng điền tiêu đề và giá'); return; }
    if (balance !== null && balance < POST_FEE) {
      toast.error(`Số dư không đủ! Cần ${formatPrice(POST_FEE)} để đăng bài.`, {
        description: 'Hãy nâng cấp gói Pro để đăng bài miễn phí.',
      });
      return;
    }

    setLoading(true);
    let image_url: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('item-images').upload(path, imageFile);
      if (uploadError) { toast.error('Lỗi upload ảnh'); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from('items').insert({
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      quantity: Math.max(1, parseInt(form.quantity || '1', 10)),
      category: form.category || null,
      location: loc.selectedProvince || null,
      district: loc.selectedDistrict || null,
      ward: loc.selectedWard || null,
      address_detail: addressDetail.trim() || null,
      image_url,
    });

    if (error) {
      toast.error('Lỗi đăng bài: ' + error.message);
      setLoading(false);
      return;
    }

    const newBalance = (balance ?? 0) - POST_FEE;
    await supabase.from('profiles').update({ balance: newBalance } as any).eq('id', user.id);
    setBalance(newBalance);

    if (saveAddressOn && loc.selectedProvince) {
      const snapshot: SavedPostAddress = {
        province: loc.selectedProvince,
        district: loc.selectedDistrict,
        ward: loc.selectedWard,
        detail: addressDetail.trim(),
      };
      const sig = addressSignature(snapshot);
      const exists = savedAddresses.some(a => addressSignature(a) === sig);
      if (!exists) {
        const rec: SavedPostAddressRecord = { ...snapshot, id: crypto.randomUUID(), label: '' };
        const nextList = [rec, ...savedAddresses].slice(0, MAX_SAVED_ADDRESSES);
        setSavedAddresses(nextList);
        writeSavedAddressesToStorage(nextList);
      }
    }

    toast.success('Đăng bài thành công!', {
      description: `Đã trừ ${formatPrice(POST_FEE)}. Số dư còn lại: ${formatPrice(newBalance)}`,
    });
    navigate('/');
    setLoading(false);
  };

  return (
      <div className="container max-w-lg py-6">
        <h1 className="text-xl font-bold mb-2">Đăng bán sản phẩm</h1>
        <div className="mb-5 rounded-2xl border bg-gradient-to-br from-primary/5 to-accent/5 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Số dư hiện tại</p>
            <p className="font-bold text-lg">{balance === null ? '...' : formatPrice(balance)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Phí đăng bài</p>
            <p className="font-bold text-sm text-primary">−{formatPrice(POST_FEE)}</p>
          </div>
        </div>
        {balance !== null && balance < POST_FEE && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center justify-between">
              <span>Số dư không đủ.</span>
              <Link to="/upgrade" className="font-semibold underline">Nâng cấp ngay →</Link>
            </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Ảnh sản phẩm</Label>
            <label className="mt-1 block cursor-pointer">
              <div className="border-2 border-dashed rounded-lg aspect-video flex items-center justify-center overflow-hidden bg-muted hover:bg-muted/80 transition-colors">
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
                ) : (
                    <div className="text-center text-muted-foreground">
                      <Camera className="h-8 w-8 mx-auto mb-1" />
                      <p className="text-sm">Chọn ảnh</p>
                    </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div>
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input id="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="VD: Laptop Dell cũ giá rẻ" maxLength={200} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price">Giá (VNĐ) *</Label>
              <Input id="price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="VD: 500000" min="0" />
            </div>
            <div>
              <Label htmlFor="quantity">Số lượng *</Label>
              <Input id="quantity" type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="VD: 1" min="1" />
            </div>
          </div>

          <div>
            <Label htmlFor="desc">Mô tả</Label>
            <Textarea id="desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả chi tiết sản phẩm..." rows={4} maxLength={2000} />
          </div>

          <div>
            <Label>Danh mục</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Location 3-level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label>Địa điểm</Label>
              <Button type="button" variant="ghost" size="sm" onClick={loc.useCurrentLocation} disabled={loc.loadingGeo} className="text-xs gap-1.5 text-primary">
                <MapPin className="h-3.5 w-3.5" />
                {loc.loadingGeo ? 'Đang xác định...' : 'Dùng vị trí hiện tại'}
              </Button>
            </div>
            {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <MapPin className="h-3.5 w-3.5" /> Địa chỉ đã lưu ({savedAddresses.length})
                    </div>
                    <Button type="button" variant="outline" size="sm" className="h-8 gap-1" onClick={openCreateSavedAddressDialog}>
                      <Plus className="h-3.5 w-3.5" /> Thêm
                    </Button>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto space-y-2 pr-0.5">
                    {savedAddresses.map(addr => (
                        <div
                            key={addr.id}
                            className="p-3 rounded-xl border border-primary/25 bg-card hover:border-primary/50 transition-colors"
                        >
                          <p className="text-xs font-medium text-foreground truncate">
                            {addr.label.trim() || formatSavedLine(addr)}
                          </p>
                          {addr.label.trim() ? (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{formatSavedLine(addr)}</p>
                          ) : null}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Button type="button" size="sm" variant="secondary" className="h-8 gap-1.5" onClick={() => { void applySavedAddressRecord(addr); }}>
                              <Check className="h-3.5 w-3.5" /> Sử dụng
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => openEditSavedAddressDialog(addr)}>
                              <Pencil className="h-3.5 w-3.5" /> Sửa
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 ml-auto text-destructive hover:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" /> Xóa
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa địa chỉ này?</AlertDialogTitle>
                                  <AlertDialogDescription>Địa chỉ sẽ bị gỡ khỏi danh sách trên máy bạn.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteSavedAddress(addr.id)}>Xóa</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}

            {savedAddresses.length === 0 && (
                <Button type="button" variant="outline" size="sm" className="w-full gap-1.5" onClick={openCreateSavedAddressDialog}>
                  <Plus className="h-4 w-4" /> Thêm địa chỉ vào danh sách
                </Button>
            )}

            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeAddressDialog(); }}>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{addressDialogMode?.type === 'create' ? 'Thêm địa chỉ' : 'Sửa địa chỉ'}</DialogTitle>
                  <DialogDescription>
                    Cập nhật địa chỉ đầy đủ (gồm số nhà/đường nếu cần). Lưu xong bấm «Sử dụng» trên thẻ tương ứng để đổ vào form đăng bài.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <div>
                    <Label htmlFor="edit-addr-label">Tên gợi nhớ (tuỳ chọn)</Label>
                    <Input
                        id="edit-addr-label"
                        value={editDraft.label}
                        onChange={e => setEditDraft(d => ({ ...d, label: e.target.value }))}
                        placeholder="VD: Nhà riêng, KTX khu B, Công ty…"
                        maxLength={120}
                    />
                  </div>
                  <div>
                    <Label>Tỉnh/Thành phố</Label>
                    <Select
                        value={editDraft.province}
                        onValueChange={v =>
                            setEditDraft(d => ({ ...d, province: v, district: '', ward: '', detail: d.detail, label: d.label }))
                        }
                    >
                      <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {loc.provinces.map(p => (
                            <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {editDistricts.length > 0 && (
                      <div>
                        <Label>Quận/Huyện</Label>
                        <Select
                            value={editDraft.district}
                            onValueChange={v =>
                                setEditDraft(d => ({ ...d, district: v, ward: '', label: d.label }))
                            }
                            disabled={!editDraft.province}
                        >
                          <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {editDistricts.map(d => (
                                <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                  )}
                  {editWards.length > 0 && (
                      <div>
                        <Label>Phường/Xã</Label>
                        <Select
                            value={editDraft.ward}
                            onValueChange={v => setEditDraft(d => ({ ...d, ward: v, label: d.label }))}
                            disabled={!editDraft.district}
                        >
                          <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {editWards.map(w => (
                                <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                  )}
                  <div>
                    <Label htmlFor="edit-addr-detail">Địa chỉ chi tiết (số nhà, đường, ngõ...)</Label>
                    <Input
                        id="edit-addr-detail"
                        value={editDraft.detail}
                        onChange={e => setEditDraft(d => ({ ...d, detail: e.target.value, label: d.label }))}
                        placeholder="VD: Số 12, ngõ 5 Phan Đình Giót"
                        maxLength={500}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={closeAddressDialog}>
                    Hủy
                  </Button>
                  <Button type="button" onClick={persistAddressDialog}>
                    Lưu
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Select value={loc.selectedProvince} onValueChange={loc.selectProvince}>
              <SelectTrigger><SelectValue placeholder="Tỉnh/Thành phố" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {loc.provinces.map(p => <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {loc.districts.length > 0 && (
                <Select value={loc.selectedDistrict} onValueChange={loc.selectDistrict}>
                  <SelectTrigger><SelectValue placeholder="Quận/Huyện" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {loc.districts.map(d => <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
            )}
            {loc.wards.length > 0 && (
                <Select value={loc.selectedWard} onValueChange={loc.selectWard}>
                  <SelectTrigger><SelectValue placeholder="Phường/Xã" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {loc.wards.map(w => <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
            )}
            <div>
              <Label htmlFor="address-detail">Địa chỉ chi tiết (số nhà, đường…)</Label>
              <Input
                  id="address-detail"
                  value={addressDetail}
                  onChange={e => setAddressDetail(e.target.value)}
                  placeholder="VD: Ký túc xá B1, tòa A — phòng 302"
                  maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">Tuỳ chọn — giúp người mua dễ tìm điểm giao hàng/gặp mặt.</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3">
              <div>
                <p className="text-sm font-medium">Thêm địa chỉ đang nhập vào danh sách</p>
                <p className="text-xs text-muted-foreground">Sau khi đăng bài thành công (tránh trùng với ô đã có)</p>
              </div>
              <Switch checked={saveAddressOn} onCheckedChange={setSaveAddressOn} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang đăng...</> : 'Đăng bán'}
          </Button>
        </form>
      </div>
  );
}
