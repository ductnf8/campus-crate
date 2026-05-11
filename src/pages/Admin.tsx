import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Trash2, Users, ShoppingBag, Megaphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice, timeAgo } from '@/lib/constants';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
      .then(({ data }) => {
        if (!data) { navigate('/'); toast.error('Bạn không có quyền admin'); return; }
        setIsAdmin(true);
        setLoading(false);
        // Load data
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setUsers(data); });
        supabase.from('items').select('*, profiles!items_user_id_fkey(name)').order('created_at', { ascending: false }).then(({ data }) => { if (data) setItems(data); });
        supabase.from('ads').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setAds(data); });
      });
  }, [user, navigate]);

  const deleteItem = async (id: string) => {
    if (!confirm('Xóa bài đăng này?')) return;
    await supabase.from('items').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success('Đã xóa');
  };

  if (loading) return <div className="container py-8"><div className="h-32 skeleton-shimmer rounded-lg" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="container py-6">
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" /> Admin Panel
      </h1>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items" className="gap-1"><ShoppingBag className="h-4 w-4" /> Bài đăng</TabsTrigger>
          <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" /> Users</TabsTrigger>
          <TabsTrigger value="ads" className="gap-1"><Megaphone className="h-4 w-4" /> Quảng cáo</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-2 mt-4">
          <p className="text-sm text-muted-foreground mb-2">Tổng: {items.length} bài đăng</p>
          {items.map(item => (
            <div key={item.id} className="bg-card rounded-lg border p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                {item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item.price)} · {item.profiles?.name || 'N/A'} · {timeAgo(item.created_at)}
                </p>
              </div>
              <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status}</Badge>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteItem(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="users" className="space-y-2 mt-4">
          <p className="text-sm text-muted-foreground mb-2">Tổng: {users.length} users</p>
          {users.map(u => (
            <div key={u.id} className="bg-card rounded-lg border p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {u.avatar_url ? <img src={u.avatar_url} className="h-full w-full object-cover" /> : <Users className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{u.name || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{u.email} · {u.university || 'N/A'}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="ads" className="space-y-2 mt-4">
          <p className="text-sm text-muted-foreground mb-2">Tổng: {ads.length} quảng cáo</p>
          {ads.map(ad => (
            <div key={ad.id} className="bg-card rounded-lg border p-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{ad.title}</p>
                <p className="text-xs text-muted-foreground">{ad.position} · {ad.is_active ? 'Active' : 'Inactive'}</p>
              </div>
              <Badge variant={ad.is_active ? 'default' : 'secondary'}>{ad.is_active ? 'Bật' : 'Tắt'}</Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
