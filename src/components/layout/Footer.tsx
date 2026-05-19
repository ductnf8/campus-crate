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
              <div className="flex flex-col gap-2">
                <a
                    href="mailto:duc27tb@gmail.com"
                    className="flex items-center gap-2 hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                  duc27tb@gmail.com
                </a>

                <a
                    href="tel:0869098696"
                    className="flex items-center gap-2 hover:text-primary"
                >
                  <Phone className="h-4 w-4" />
                  0869098696
                </a>

                <a
                    href="https://www.google.com/maps/place/55+Ng.+267+%C4%90.+H%E1%BB%93+T%C3%B9ng+M%E1%BA%ADu,+T%E1%BB%AB+Li%C3%AAm,+H%C3%A0+N%E1%BB%99i,+Vi%E1%BB%87t+Nam/@21.0406413,105.7593083,17z/data=!3m1!4b1!4m6!3m5!1s0x313454c0f4826485:0x4be1d8ddc3b72a94!8m2!3d21.0406363!4d105.7618886!16s%2Fg%2F11s8dvgx9n?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:text-primary"
                >
                  <MapPin className="h-4 w-4" />
                  Hồ Tùng Mậu, Nam Từ Liêm, Hà Nội
                </a>
              </div>
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
