import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onFinish: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish }) => {
  const [stage, setStage] = useState(0);
  const loadingTexts = [
    'Scanning the universe for sparkles...',
    'Gathering sweet smiles and giggles...',
    'Brewing a cup of virtual comfort...',
    'Almost there, beautiful... ❤️',
  ];

  useEffect(() => {
    // Progress through loading stages
    const timer1 = setTimeout(() => setStage(1), 1200);
    const timer2 = setTimeout(() => setStage(2), 2400);
    const timer3 = setTimeout(() => setStage(3), 3600);
    const timer4 = setTimeout(() => {
      onFinish();
    }, 4800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-romantic-gradient dark:bg-dark-space overflow-hidden transition-colors duration-500">
      {/* Animated floating subtle background particles */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-[20%] left-[10%] w-24 h-24 bg-brand-pink-200 dark:bg-brand-pink-900/30 rounded-full filter blur-xl animate-float float-1" />
        <div className="absolute bottom-[30%] right-[15%] w-32 h-32 bg-brand-lavender-200 dark:bg-brand-lavender-900/30 rounded-full filter blur-2xl animate-float float-3" />
      </div>

      <div className="text-center z-10 px-6">
        {/* Animated Heart Logo */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1, 1.25, 1],
            rotate: [0, -3, 0, 3, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="inline-block cursor-pointer relative"
        >
          {/* Main Heart */}
          <svg
            className="w-24 h-24 text-brand-pink-500 dark:text-brand-pink-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {/* Glow ring */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="absolute inset-0 bg-brand-pink-300 dark:bg-brand-pink-900 rounded-full -z-10 filter blur-md"
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold font-serif text-slate-800 dark:text-slate-100 mt-6 tracking-wide transition-colors"
        >
          Kinju's World
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.6 }}
          className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-2 font-semibold transition-colors"
        >
          A Special Place For Kinju ❤️
        </motion.p>

        {/* Loading Logs (Typewriter / Fade state) */}
        <div className="h-8 mt-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-sm font-medium text-brand-violet-600 dark:text-brand-lavender-300 bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/10 px-4 py-1.5 rounded-full backdrop-blur-xs shadow-xs transition-colors"
            >
              {loadingTexts[stage]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Premium progress bar */}
        <div className="w-48 h-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-full mx-auto mt-6 overflow-hidden border border-white/20 dark:border-white/5">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4.5, ease: 'easeInOut' }}
            className="h-full bg-linear-to-r from-brand-violet-600 to-brand-pink-500 dark:from-brand-violet-500 dark:to-brand-pink-400"
          />
        </div>
      </div>
    </div>
  );
};
