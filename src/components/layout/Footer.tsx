import { ShoppingBag, Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-xl mb-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-gradient-primary font-display tracking-tight">StuMarket</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nền tảng mua bán đồ cũ #1 dành cho sinh viên Việt Nam. Tiết kiệm hơn, bền vững hơn. 🌿
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">Khám phá</h4>
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <Link to="/post" className="hover:text-primary transition-colors">Đăng bán</Link>
              <Link to="/favorites" className="hover:text-primary transition-colors">Yêu thích</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">Danh mục</h4>
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <span>Điện tử</span>
              <span>Sách vở</span>
              <span>Quần áo</span>
              <span>Xe cộ</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">Liên hệ</h4>
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@stumarket.vn</span>
              <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1900-xxxx</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Việt Nam</span>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StuMarket. Made with <Heart className="h-3 w-3 inline text-primary fill-primary" /> for students.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Điều khoản</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Chính sách</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Trợ giúp</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
