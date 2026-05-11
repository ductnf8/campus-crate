import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORIES } from '@/lib/constants';
import { useLocationPicker } from '@/hooks/useLocationPicker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, MapPin } from 'lucide-react';

const API = 'https://provinces.open-api.vn/api';

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', quantity: '1', category: '', status: 'active' });
  const loc = useLocationPicker();
  const [addressDetail, setAddressDetail] = useState('');

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    if (!id) return;
    supabase.from('items').select('*').eq('id', id).eq('user_id', user.id).single()
      .then(async ({ data, error }) => {
        if (error || !data) { navigate('/profile'); toast.error('Không tìm thấy'); return; }
        setForm({
          title: data.title, description: data.description || '',
          price: String(data.price), quantity: String((data as any).quantity ?? 1),
          category: data.category || '', status: data.status,
        });
        setAddressDetail((data as { address_detail?: string | null }).address_detail?.trim() || '');

        // Pre-fill location picker
        if (data.location) {
          try {
            const provs = await fetch(`${API}/p/`).then(r => r.json());
            const p = provs.find((x: any) => x.name === data.location);
            if (p) {
              loc.setSelectedProvince(p.name);
              loc.setProvinceCode(p.code);
              if (data.district) {
                const pd = await fetch(`${API}/p/${p.code}?depth=2`).then(r => r.json());
                const d = (pd.districts || []).find((x: any) => x.name === data.district);
                if (d) {
                  loc.setSelectedDistrict(d.name);
                  loc.setDistrictCode(d.code);
                  if (data.ward) {
                    const dd = await fetch(`${API}/d/${d.code}?depth=2`).then(r => r.json());
                    const w = (dd.wards || []).find((x: any) => x.name === data.ward);
                    if (w) loc.setSelectedWard(w.name);
                  }
                }
              }
            }
          } catch {}
        }
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    const { error } = await supabase.from('items').update({
      title: form.title.trim(), description: form.description.trim() || null,
      price: parseFloat(form.price),
      quantity: Math.max(0, parseInt(form.quantity || '1', 10)),
      category: form.category || null,
      location: loc.selectedProvince || null,
      district: loc.selectedDistrict || null,
      ward: loc.selectedWard || null,
      address_detail: addressDetail.trim() || null,
      status: form.status,
    } as any).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Đã cập nhật!'); navigate('/profile'); }
    setSaving(false);
  };

  if (loading) return <div className="container py-8"><div className="h-32 skeleton-shimmer rounded-lg" /></div>;

  return (
    <div className="container max-w-lg py-6">
      <h1 className="text-xl font-bold mb-6">Chỉnh sửa bài đăng</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Tiêu đề</Label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} maxLength={200} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Giá (VNĐ)</Label>
            <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} min="0" />
          </div>
          <div>
            <Label>Số lượng</Label>
            <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} min="0" />
          </div>
        </div>
        <div>
          <Label>Mô tả</Label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} maxLength={2000} />
        </div>
        <div>
          <Label>Danh mục</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Địa điểm</Label>
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
            <Label htmlFor="edit-item-address-detail">Địa chỉ chi tiết (số nhà, đường…)</Label>
            <Input
                id="edit-item-address-detail"
                value={addressDetail}
                onChange={e => setAddressDetail(e.target.value)}
                placeholder="VD: Số 12, ngõ 5 — ký túc xá B1"
                maxLength={500}
            />
          </div>
        </div>

        <div>
          <Label>Trạng thái</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Đang bán</SelectItem>
              <SelectItem value="sold">Đã bán</SelectItem>
              <SelectItem value="hidden">Ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu thay đổi'}
        </Button>
      </form>
    </div>
  );
}
