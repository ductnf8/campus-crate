import { motion } from 'framer-motion';
import { Search, Sparkles, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';
import hero1 from '@/assets/hero-1.jpg';
import hero2 from '@/assets/hero-2.jpg';
import hero3 from '@/assets/hero-3.jpg';

interface HeroSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

interface Slide {
  image: string;
  badge?: { icon: typeof Sparkles; text: string };
  title: React.ReactNode;
  desc: string;
  cta?: { to: string; label: string };
  showSearch?: boolean;
  overlay: string;
}

export default function HeroSection({ searchValue, onSearchChange }: HeroSectionProps) {
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));

  const slides: Slide[] = [
    {
      image: hero1,
      badge: { icon: TrendingUp, text: '1000+ sản phẩm đang bán' },
      title: <>Mua bán đồ cũ<br /><span className="text-primary-foreground/90">cùng sinh viên</span></>,
      desc: 'Tìm đồ giá tốt từ sinh viên gần bạn. Tiết kiệm & bền vững.',
      showSearch: true,
      overlay: 'from-primary/85 via-primary/70 to-accent/80',
    },
    {
      image: hero2,
      badge: { icon: Sparkles, text: 'Ưu đãi giới hạn' },
      title: <>Nâng cấp Premium<br /><span className="text-primary-foreground/90">đăng tin không giới hạn</span></>,
      desc: 'Mở khoá ưu tiên hiển thị, bán nhanh gấp 3 lần. Chỉ từ 49,000đ/tháng.',
      cta: { to: '/upgrade', label: 'Xem các gói Premium' },
      overlay: 'from-amber-600/85 via-orange-500/75 to-rose-500/80',
    },
    {
      image: hero3,
      badge: { icon: ShieldCheck, text: 'Cộng đồng tin cậy' },
      title: <>500+ sinh viên<br /><span className="text-primary-foreground/90">đã tham gia</span></>,
      desc: 'Giao dịch an toàn ngay tại trường. Kết nối nhanh với người cùng campus.',
      cta: { to: '/auth', label: 'Tham gia ngay' },
      overlay: 'from-emerald-700/85 via-teal-600/75 to-primary/80',
    },
  ];

  return (
    <section className="relative">
      <Carousel
        opts={{ loop: true }}
        plugins={[autoplay.current]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {slides.map((slide, idx) => (
            <CarouselItem key={idx} className="pl-0 basis-full">
              <div className="relative overflow-hidden h-[520px] sm:h-[560px] md:h-[600px] lg:h-[660px]">
                {/* Blurred background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center scale-110"
                  style={{ backgroundImage: `url(${slide.image})`, filter: 'blur(8px)' }}
                />
                {/* Color overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.overlay}`} />
                {/* Decorative circles */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary-foreground animate-float" />
                  <div className="absolute bottom-10 right-20 w-24 h-24 rounded-full bg-primary-foreground animate-float" style={{ animationDelay: '1s' }} />
                </div>

                <div className="container relative z-10 h-full flex items-center">
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-2xl mx-auto w-full"
                  >
                    {slide.badge && (
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 text-primary-foreground text-xs font-semibold mb-4">
                        <slide.badge.icon className="h-3.5 w-3.5" />
                        {slide.badge.text}
                      </div>
                    )}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-4 font-display tracking-tight leading-tight drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-primary-foreground/90 text-base sm:text-lg mb-6 leading-relaxed drop-shadow">
                      {slide.desc}
                    </p>

                    {slide.showSearch && (
                      <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          value={searchValue}
                          onChange={(e) => onSearchChange(e.target.value)}
                          placeholder="Tìm kiếm MacBook, sách, xe đạp..."
                          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-card text-foreground shadow-xl shadow-primary/20 border-0 text-base focus:outline-none focus:ring-2 focus:ring-primary-foreground/40 placeholder:text-muted-foreground"
                        />
                      </div>
                    )}

                    {slide.cta && (
                      <Link
                        to={slide.cta.to}
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary-foreground text-primary font-bold text-sm shadow-2xl hover:scale-105 transition-transform"
                      >
                        {slide.cta.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </motion.div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
