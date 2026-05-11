import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { formatPrice, timeAgo } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2, Trash2, Eye, User, Camera, Wallet, Sparkles } from 'lucide-react';
import UniversityInput from '@/components/UniversityInput';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Profile {
  name: string | null;
  email: string | null;
  university: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  balance?: number | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Profile>({ name: '', email: '', university: '', phone: '', avatar_url: '', bio: '' });
  const [myItems, setMyItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          const p = { ...data, bio: (data as any).bio || null };
          setProfile(p);
          setForm(p);
        }
      });
    supabase.from('items').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setMyItems(data); });
  }, [user, navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('item-images').upload(path, file, { upsert: true });
    if (uploadErr) { toast.error('Upload thất bại'); setUploadingAvatar(false); return; }
    const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path);
    const url = urlData.publicUrl + '?t=' + Date.now();
    await supabase.from('profiles').update({ avatar_url: url } as any).eq('id', user.id);
    setProfile(prev => prev ? { ...prev, avatar_url: url } : prev);
    setForm(prev => ({ ...prev, avatar_url: url }));
    setUploadingAvatar(false);
    toast.success('Cập nhật ảnh đại diện thành công!');
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      name: form.name, university: form.university, phone: form.phone, bio: form.bio,
    } as any).eq('id', user.id);
    if (error) toast.error(error.message);
    else { toast.success('Cập nhật thành công!'); setProfile(form); setEditing(false); }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const id = deletingId;
    setDeletingId(null);
    await supabase.from('items').delete().eq('id', id);
    setMyItems(prev => prev.filter(i => i.id !== id));
    toast.success('Đã xóa bài đăng');
  };

  if (!profile) {
    return <div className="container py-8"><div className="h-32 skeleton-shimmer rounded-lg" /></div>;
  }

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <div className="rounded-2xl border bg-gradient-to-br from-primary via-primary to-accent p-5 text-primary-foreground shadow-xl shadow-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary-foreground/15 backdrop-blur flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs opacity-80">Số dư hiện tại</p>
              <p className="text-2xl font-extrabold font-display tracking-tight">
                {formatPrice(Number(profile.balance ?? 0))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/deposit"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors text-xs font-bold shadow-lg"
            >
              <Wallet className="h-3.5 w-3.5" /> Nạp tiền
            </Link>
            <Link
              to="/upgrade"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-foreground/15 backdrop-blur hover:bg-primary-foreground/25 transition-colors text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" /> Nâng cấp
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden group">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full"
            >
              {uploadingAvatar ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile.name || 'Chưa có tên'}</h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
            <Edit className="h-4 w-4 mr-1" /> Sửa
          </Button>
        </div>

        {editing && (
          <div className="space-y-3 pt-4 border-t animate-fade-in">
            <div>
              <Label>Tên</Label>
              <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Trường đại học</Label>
              <UniversityInput value={form.university || ''} onChange={v => setForm(f => ({ ...f, university: v }))} />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Tiểu sử</Label>
              <Textarea value={form.bio || ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Giới thiệu ngắn về bạn..." rows={3} maxLength={500} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu thay đổi'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/my-purchases" className="rounded-2xl border bg-card p-4 hover:border-primary/50 transition-colors flex items-center gap-3" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">🛍️</div>
          <div>
            <p className="font-semibold text-sm">Đơn đã mua</p>
            <p className="text-xs text-muted-foreground">Lịch sử mua hàng</p>
          </div>
        </Link>
        <Link to="/seller/orders" className="rounded-2xl border bg-card p-4 hover:border-primary/50 transition-colors flex items-center gap-3" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">📦</div>
          <div>
            <p className="font-semibold text-sm">Đơn nhận được</p>
            <p className="text-xs text-muted-foreground">Quản lý bán hàng</p>
          </div>
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Bài đăng của tôi ({myItems.length})</h2>
        {myItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">Bạn chưa đăng bài nào.</p>
        ) : (
          <div className="space-y-3">
            {myItems.map(item => (
              <div key={item.id} className="bg-card rounded-lg border p-3 flex gap-3">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                  {item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/item/${item.id}`} className="font-medium text-sm line-clamp-1 hover:text-primary">{item.title}</Link>
                  <p className="text-primary font-bold text-sm">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {item.status === 'active' ? 'Đang bán' : item.status === 'sold' ? 'Đã bán' : 'Ẩn'}
                    </Badge>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{item.views_count}</span>
                    <span>{timeAgo(item.created_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link to={`/edit/${item.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingId(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài đăng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bài đăng sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
