import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievements } from '../context/AchievementsContext';
import { FiAward, FiX } from 'react-icons/fi';

export const AchievementToast: React.FC = () => {
  const { activeToast, clearToast } = useAchievements();

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] glass-panel-dark rounded-2xl p-4 flex items-center justify-between shadow-2xl border border-brand-violet-200 dark:border-brand-violet-600/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-linear-to-tr from-brand-violet-600 to-brand-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-md text-white animate-pulse-slow">
              {activeToast.icon}
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-brand-violet-600 dark:text-brand-lavender-300 font-bold flex items-center gap-1">
                <FiAward className="inline" /> Achievement Unlocked!
              </div>
              <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-base leading-tight transition-colors">
                {activeToast.name}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 transition-colors">
                {activeToast.description}
              </p>
            </div>
          </div>
          <button
            onClick={clearToast}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 hover:bg-slate-100/50 dark:hover:bg-white/5 rounded-lg ml-2"
          >
            <FiX size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
