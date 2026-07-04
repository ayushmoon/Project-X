import React from 'react';
import { useMusic } from '../context/MusicContext';
import { FiMusic, FiVolumeX, FiVolume2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export const BackgroundMusic: React.FC = () => {
  const { isPlaying, togglePlay, volume, setVolume } = useMusic();
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);

  return (
    <div className="fixed top-4 right-4 z-[999] flex items-center gap-2">
      {/* Floating play/pause music button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlay}
        onMouseEnter={() => setShowVolumeSlider(true)}
        className={`w-11 h-11 rounded-full flex items-center justify-center glass-panel-dark shadow-lg cursor-pointer transition-all border ${
          isPlaying
            ? 'border-brand-violet-500 text-brand-violet-600 dark:text-brand-lavender-300 dark:border-brand-lavender-500/50 shadow-brand-violet-100/30'
            : 'border-white/40 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-brand-violet-600 dark:hover:text-brand-lavender-300'
        }`}
      >
        {isPlaying ? (
          <div className="flex items-end gap-[3px] h-4">
            <motion.span
              animate={{ height: ['4px', '16px', '4px'] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
              className="w-[2px] bg-brand-violet-600 dark:bg-brand-lavender-400 rounded-full"
            />
            <motion.span
              animate={{ height: ['6px', '12px', '6px'] }}
              transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0.15 }}
              className="w-[2px] bg-brand-violet-600 dark:bg-brand-lavender-400 rounded-full"
            />
            <motion.span
              animate={{ height: ['3px', '14px', '3px'] }}
              transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut', delay: 0.3 }}
              className="w-[2px] bg-brand-violet-600 dark:bg-brand-lavender-400 rounded-full"
            />
          </div>
        ) : (
          <FiMusic className="text-lg" />
        )}
      </motion.button>

      {/* Volume slider control on hover */}
      <AnimatePresence>
        {showVolumeSlider && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            onMouseLeave={() => setShowVolumeSlider(false)}
            className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow-md border border-white/50 dark:border-white/10"
          >
            <button
              onClick={togglePlay}
              className="text-slate-600 dark:text-slate-300 hover:text-brand-violet-600 dark:hover:text-brand-lavender-300 transition-colors"
            >
              {volume === 0 || !isPlaying ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-violet-600 dark:accent-brand-lavender-400"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
