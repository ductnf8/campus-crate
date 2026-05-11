import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin, Clock, Flame } from 'lucide-react';
import { formatPrice, timeAgo } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  location: string | null;
  created_at: string;
  views_count: number;
  is_featured: boolean;
  quantity?: number;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export default function ProductCard({
  id, title, price, image_url, location, created_at,
  views_count, is_featured, quantity, isFavorited, onToggleFavorite,
}: ProductCardProps) {
  const outOfStock = quantity !== undefined && quantity <= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-card rounded-2xl border overflow-hidden hover-lift flex flex-col h-full"
      style={{ boxShadow: 'var(--shadow-card)' }}
      whileHover={{ boxShadow: 'var(--shadow-card-hover)' }}
    >
      {views_count >= 500 && (
        <Badge className="absolute top-2.5 left-2.5 z-10 bg-gradient-hero text-featured-foreground border-0 shadow-md gap-1 rounded-lg font-semibold text-xs px-2.5 py-1">
          <Flame className="h-3 w-3" /> HOT
        </Badge>
      )}

      {onToggleFavorite && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-xl bg-card/90 backdrop-blur-sm shadow-sm hover:bg-card hover:scale-110 transition-all duration-200"
        >
          <Heart className={`h-4 w-4 transition-colors ${isFavorited ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </button>
      )}

      <Link to={`/item/${id}`} className="flex flex-col h-full">
        <div className="aspect-square overflow-hidden bg-muted relative shrink-0">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <Eye className="h-8 w-8" />
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
          {outOfStock && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground font-bold text-sm shadow-lg">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        <div className="p-3.5 flex flex-col flex-1">
          <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>
          <p className="text-primary font-extrabold text-lg font-display">{formatPrice(price)}</p>
          <div className="flex items-center justify-between mt-auto pt-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 truncate max-w-[55%]">
              {location && <><MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{location}</span></>}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" /> {timeAgo(created_at)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" /> {views_count} lượt xem
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
