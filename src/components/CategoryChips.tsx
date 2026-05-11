import { CATEGORIES } from '@/lib/constants';
import { Laptop, BookOpen, Shirt, Home, Bike, Watch, Dumbbell, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Điện tử': Laptop,
  'Sách vở': BookOpen,
  'Quần áo': Shirt,
  'Đồ gia dụng': Home,
  'Xe cộ': Bike,
  'Phụ kiện': Watch,
  'Đồ thể thao': Dumbbell,
  'Khác': MoreHorizontal,
};

interface CategoryChipsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      <button
        onClick={() => onSelect('')}
        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          !selected
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
            : 'bg-card border text-muted-foreground hover:text-foreground hover:border-primary/30'
        }`}
      >
        Tất cả
      </button>
      {CATEGORIES.map((cat, i) => {
        const Icon = CATEGORY_ICONS[cat] || MoreHorizontal;
        const isActive = selected === cat;
        return (
          <motion.button
            key={cat}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(isActive ? '' : cat)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-card border text-muted-foreground hover:text-foreground hover:border-primary/30'
            }`}
          >
            <Icon className="h-4 w-4" />
            {cat}
          </motion.button>
        );
      })}
    </div>
  );
}
