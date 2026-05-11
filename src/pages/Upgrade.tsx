import { useState } from 'react';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/constants';

const PLANS = [
  {
    id: 'basic',
    name: 'Cơ bản',
    price: 0,
    icon: Sparkles,
    color: 'from-slate-400 to-slate-600',
    desc: 'Cho người mới bắt đầu',
    benefits: [
      'Đăng tối đa 5 bài/tháng',
      'Phí đăng bài 5,000đ/bài',
      'Hỗ trợ qua email',
      'Hiển thị tiêu chuẩn',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49000,
    icon: Zap,
    color: 'from-primary to-accent',
    desc: 'Phổ biến nhất',
    popular: true,
    benefits: [
      'Đăng bài KHÔNG giới hạn',
      'Miễn phí đăng bài hoàn toàn',
      'Ưu tiên hiển thị top đầu',
      'Huy hiệu Pro nổi bật',
      'Hỗ trợ 24/7',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 129000,
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    desc: 'Cho người bán chuyên nghiệp',
    benefits: [
      'Tất cả quyền lợi gói Pro',
      'Tin đăng được PUSH lên đầu mỗi ngày',
      'Phân tích thống kê chi tiết',
      'Chứng nhận người bán uy tín',
      'Quảng cáo miễn phí trên trang chủ',
      'Tư vấn 1-1 từ chuyên gia',
    ],
  },
];

export default function UpgradePage() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (planId: string, planName: string) => {
    setSelected(planId);
    toast.success(`Đã chọn gói ${planName}!`, {
      description: 'Đây là demo - chưa tích hợp thanh toán thật.',
    });
  };

  return (
    <div className="container max-w-6xl py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <Sparkles className="h-3.5 w-3.5" /> Nâng cấp tài khoản
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight mb-3">
          Chọn gói phù hợp với bạn
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          Bán hàng nhanh hơn, hiển thị nhiều hơn, không còn giới hạn.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isSelected = selected === plan.id;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl border-2 p-6 bg-card transition-all ${
                plan.popular
                  ? 'border-primary shadow-2xl shadow-primary/20 md:scale-105'
                  : 'border-border hover:border-primary/40 hover:shadow-lg'
              } ${isSelected ? 'ring-4 ring-primary/30' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-md">
                  ⭐ Phổ biến nhất
                </div>
              )}

              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>

              <h3 className="text-xl font-bold font-display">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-display tracking-tight">
                    {plan.price === 0 ? 'Miễn phí' : formatPrice(plan.price)}
                  </span>
                </div>
                {plan.price > 0 && (
                  <span className="text-sm text-muted-foreground">/tháng</span>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 min-h-[200px]">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelect(plan.id, plan.name)}
                disabled={plan.price === 0}
                className={`w-full rounded-xl font-semibold ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.price === 0 ? 'Gói hiện tại' : isSelected ? '✓ Đã chọn' : `Chọn gói ${plan.name}`}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        💡 Đây là demo UI - chưa tích hợp thanh toán thật.
      </p>
    </div>
  );
}
