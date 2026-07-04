import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

type HorizontalScrollerProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function HorizontalScroller({ title, children, className = '' }: HorizontalScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className={`group/section ${className}`}>
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
      >
        {children}
      </div>
    </section>
  );
}

type CardWrapperProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function CardWrapper({ children, onClick, className = '' }: CardWrapperProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`group/card bg-base-card rounded-2xl p-4 cursor-pointer transition-colors hover:bg-base-hover min-w-[160px] max-w-[200px] flex-shrink-0 ${className}`}
    >
      {children}
    </motion.div>
  );
}
