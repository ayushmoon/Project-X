import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getLoadedPhotos } from '../utils/photoLoader';
import type { PhotoItem } from '../utils/photoLoader';
import { CardImage } from '../components/Shared/CardImage';
import { FiHeart } from 'react-icons/fi';
import confetti from 'canvas-confetti';

export const Memories: React.FC = () => {
  const [photos] = useState<PhotoItem[]>(() => {
    const all = getLoadedPhotos();
    return all.filter((photo, idx, self) => self.findIndex(p => p.filename === photo.filename) === idx);
  });
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleHeartRelease = (e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({
      particleCount: 40,
      angle: 90,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#fda4af', '#f3e8ff']
    });
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-28 md:pb-8 bg-transparent">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-800 dark:text-slate-100 transition-colors">
          Our Sweet Memories
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold transition-colors">
          Tap any card to unlock the message hidden on the back ❤️
        </p>
      </motion.div>

      {/* Vertical Interactive Timeline */}
      <div className="relative max-w-2xl mx-auto py-8">
        {/* Central Timeline Line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-linear-to-b from-brand-violet-500/30 via-brand-pink-500/30 to-brand-peach-500/30" />

        {/* Timeline Items */}
        <div className="space-y-16">
          {photos.map((photo, idx) => {
            const isFlipped = !!flippedCards[photo.id];
            const isLeft = idx % 2 === 0;

            return (
              <div
                key={photo.id}
                className={`relative flex flex-col md:flex-row items-center justify-between w-full ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline center bubble node */}
                <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white dark:border-slate-950 bg-brand-violet-600 dark:bg-brand-lavender-500 z-10 shadow-md flex items-center justify-center text-[10px] text-white">
                  ❤️
                </div>

                {/* Content Card Panel */}
                <div className={`w-full md:w-[45%] ${isLeft ? 'text-right' : 'text-left'}`}>
                  {/* Perspective Flip Box */}
                  <div
                    onClick={() => toggleFlip(photo.id)}
                    className="w-full aspect-4/5 perspective-1000 cursor-pointer select-none mx-auto"
                    style={{ maxWidth: '320px' }}
                  >
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="w-full h-full relative transform-style-3d shadow-xl rounded-2xl border border-white/50 dark:border-white/10"
                    >
                      {/* CARD FRONT */}
                      <div className="absolute inset-0 backface-hidden bg-white/95 dark:bg-slate-900/90 rounded-2xl p-3 flex flex-col justify-between shadow-lg border border-slate-100 dark:border-white/5">
                        <CardImage photo={photo} className="w-full h-[78%] object-cover rounded-xl" />
                        <div className="text-center pt-2 pb-1">
                          <span className="text-[10px] font-bold text-brand-violet-600 dark:text-brand-lavender-300 uppercase tracking-widest">
                            {photo.date || 'Sweet Date'}
                          </span>
                          <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base mt-0.5 truncate transition-colors">
                            {photo.title}
                          </h4>
                        </div>
                      </div>

                      {/* CARD BACK */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 bg-linear-to-br from-brand-lavender-50 to-brand-peach-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl p-5 flex flex-col justify-between shadow-2xl border border-brand-lavender-200 dark:border-brand-violet-600/30">
                        {/* Elegant Border Decoration */}
                        <div className="absolute inset-2.5 border border-dashed border-brand-pink-300/60 dark:border-brand-violet-600/20 rounded-xl pointer-events-none" />

                        {/* Top Metadata */}
                        <div className="z-10 flex items-center justify-between text-[10px] text-brand-violet-600 dark:text-brand-lavender-300 font-bold uppercase tracking-wider">
                          <span>{photo.category} Memory</span>
                          <span>{photo.date || 'Romantic Date'}</span>
                        </div>

                        {/* Middle Candid Note */}
                        <div className="z-10 flex-1 flex items-center justify-center px-2 py-4">
                          <p className="text-sm md:text-base font-serif italic text-slate-700 dark:text-slate-200 leading-relaxed text-center font-medium transition-colors">
                            "{photo.description}"
                          </p>
                        </div>

                        {/* Bottom Interactive Trigger */}
                        <div className="z-10 flex flex-col items-center gap-1.5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleHeartRelease(e)}
                            className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-brand-pink-500 dark:text-brand-pink-400 flex items-center justify-center shadow-md border border-brand-pink-200 dark:border-white/10 cursor-pointer text-base hover:bg-brand-pink-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <FiHeart className="animate-heartbeat" fill="currentColor" />
                          </motion.button>
                          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                            Tap to send a hug
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Empty side space spacer on Desktop */}
                <div className="hidden md:block w-[45%]" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
