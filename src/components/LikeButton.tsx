import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useFavoritesStore } from '../store/favoritesStore';
import { cn } from '../lib/utils';

type LikeButtonProps = {
  songId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function LikeButton({ songId, size = 'md', className = '' }: LikeButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const fav = isFavorite(songId);
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(songId);
      }}
      className={cn('transition-transform hover:scale-110', className)}
      aria-label={fav ? 'Unlike' : 'Like'}
    >
      <AnimatePresence mode="wait">
        {fav ? (
          <motion.div
            key="liked"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Heart className={cn(sizeClass, 'fill-accent text-accent')} />
          </motion.div>
        ) : (
          <motion.div
            key="unliked"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Heart className={cn(sizeClass, 'text-gray-400 hover:text-white')} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
