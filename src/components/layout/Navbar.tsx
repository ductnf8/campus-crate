import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, PlusCircle, Menu, X, ShoppingBag, LogIn, Sparkles, ShoppingCart, User, LogOut, ChevronDown } from 'lucide-react';
import { getLastRoute, useTrackRoute } from '@/hooks/useLastRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  useTrackRoute();
  const [cartCount, setCartCount] = useState(0);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const updateCart = () => {
      try {
        const raw = localStorage.getItem('stumarket_cart');
        if (!raw) { setCartCount(0); return; }
        const v = JSON.parse(raw);
        if (Array.isArray(v)) setCartCount(v.length);
        else if (v && typeof v === 'object') setCartCount(Object.keys(v).length);
        else setCartCount(0);
      } catch { setCartCount(0); }
    };
    updateCart();
    window.addEventListener('cart-updated', updateCart);
    return () => window.removeEventListener('cart-updated', updateCart);
  }, []);

  useEffect(() => {
    if (!user) { setProfileName(null); setAvatarUrl(null); return; }
    // Try user metadata first, then fetch profile
    const meta = user.user_metadata;
    if (meta?.name || meta?.full_name) {
      setProfileName(meta.name || meta.full_name);
      setAvatarUrl(meta.avatar_url || meta.picture || null);
    }
    supabase.from('profiles').select('name, avatar_url').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.name) setProfileName(data.name);
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      });
  }, [user]);

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const lastRoute = getLastRoute();
    // If already viewing the last route (e.g. an item page), toggle back to home
    if (lastRoute && lastRoute === location.pathname && lastRoute !== '/') {
      navigate('/');
    } else {
      navigate(lastRoute || '/');
    }
  };

  const navLinks = [
    { to: '/', label: 'Khám phá', icon: Sparkles, onClick: handleExploreClick },
    ...(user ? [
      { to: '/post', label: 'Đăng bán', icon: PlusCircle },
      { to: '/favorites', label: 'Yêu thích', icon: Heart },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-card/90 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70">
      <div className="container relative flex h-16 items-center gap-4">
        {/* Trái: logo */}
        <div className="flex min-w-0 flex-1 items-center justify-start">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 text-xl font-bold group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-lg transition-shadow group-hover:shadow-primary/30">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-gradient-primary hidden font-display tracking-tight sm:inline">StuMarket</span>
          </Link>
        </div>

        {/* Giữa: NavLink — căn giữa màn (desktop) */}
        <nav className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={link.onClick}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {isActive && (
                  <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Phải: Nâng cấp / giỏ / tài khoản (desktop) hoặc giỏ + menu (mobile) */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/upgrade">
              <Button size="sm" className="rounded-xl gap-1.5 font-semibold bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white shadow-md shadow-orange-500/30 hover:opacity-90 hover:shadow-lg hover:shadow-orange-500/40 transition-all">
                <Sparkles className="h-4 w-4" /> Nâng cấp
              </Button>
            </Link>
            <Link to="/cart" className="relative rounded-xl p-2.5 transition-colors hover:bg-muted">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl p-1.5 pr-3 transition-colors hover:bg-muted">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="hidden max-w-[120px] truncate text-sm font-medium lg:inline">{profileName || 'Tài khoản'}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex cursor-pointer items-center gap-2">
                      <User className="h-4 w-4" /> Tài khoản
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/seller/orders" className="flex cursor-pointer items-center gap-2">
                      <ShoppingBag className="h-4 w-4" /> Đơn hàng nhận được
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="flex cursor-pointer items-center gap-2">
                      <Heart className="h-4 w-4" /> Yêu thích
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/upgrade" className="flex cursor-pointer items-center gap-2">
                      <Sparkles className="h-4 w-4" /> Nâng cấp Premium
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="flex cursor-pointer items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="rounded-xl gap-2 bg-gradient-primary font-semibold shadow-md shadow-primary/20 hover:opacity-90">
                  <LogIn className="h-4 w-4" /> Đăng nhập
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link to="/cart" className="relative rounded-xl p-2 transition-colors hover:bg-muted">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <button type="button" className="rounded-xl p-2 transition-colors hover:bg-muted" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-card overflow-hidden"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => { if (link.onClick) { link.onClick(e); } setMobileOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === link.to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link to="/profile" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted">
                  <User className="h-5 w-5" /> Tài khoản
                </Link>
              )}
              <div className="pt-3 border-t mt-2">
                {user ? (
                  <Button variant="outline" size="sm" className="w-full rounded-xl gap-2" onClick={() => { signOut(); setMobileOpen(false); }}>
                    <LogOut className="h-4 w-4" /> Đăng xuất
                  </Button>
                ) : (
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full bg-gradient-primary rounded-xl gap-2 font-semibold">
                      <LogIn className="h-4 w-4" /> Đăng nhập
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
