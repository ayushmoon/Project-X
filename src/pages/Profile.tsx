import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievements } from '../context/AchievementsContext';
import { DarkModeContext } from '../App';
import dailySmilesData from '../assets/json/daily_smiles.json';
import { getLoadedPhotos } from '../utils/photoLoader';
import type { PhotoItem } from '../utils/photoLoader';
import { CardImage } from '../components/Shared/CardImage';
import { FiAward, FiHeart, FiSmile, FiSun, FiMoon } from 'react-icons/fi';
import confetti from 'canvas-confetti';

export const Profile: React.FC = () => {
  const {
    achievementList,
    visitCount,
    collectedHearts,
    achievements,
    unlockAchievement,
  } = useAchievements();

  const { darkMode, setDarkMode } = useContext(DarkModeContext);

  const [dailySmile, setDailySmile] = useState<string>('');
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [surprisePhoto, setSurprisePhoto] = useState<PhotoItem | null>(null);

  // 100 Daily Smiles logic: random on each visit, no repeats
  useEffect(() => {
    const sessionActive = sessionStorage.getItem('hlw_session_smile_active');
    const storedSmile = localStorage.getItem('hlw_current_daily_smile');

    if (sessionActive && storedSmile) {
      setDailySmile(storedSmile);
      return;
    }

    try {
      const shownIndicesStr = localStorage.getItem('hlw_shown_smiles_indices');
      let shownIndices: number[] = shownIndicesStr ? JSON.parse(shownIndicesStr) : [];

      if (shownIndices.length >= dailySmilesData.length) {
        shownIndices = [];
      }

      const availableIndices: number[] = [];
      for (let i = 0; i < dailySmilesData.length; i++) {
        if (!shownIndices.includes(i)) {
          availableIndices.push(i);
        }
      }

      const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const selectedSmile = dailySmilesData[randomIdx];

      shownIndices.push(randomIdx);
      localStorage.setItem('hlw_shown_smiles_indices', JSON.stringify(shownIndices));
      localStorage.setItem('hlw_current_daily_smile', selectedSmile);
      sessionStorage.setItem('hlw_session_smile_active', 'true');

      setDailySmile(selectedSmile);
    } catch (e) {
      console.warn('Error fetching daily smile:', e);
      setDailySmile(dailySmilesData[0]);
    }
  }, []);

  // Resolve winking glasses selfie for secret heart popup
  useEffect(() => {
    const loaded = getLoadedPhotos();
    const found = loaded.find(p => p.filename === 'glasses_pucker_selfie.jpg');
    setSurprisePhoto(found || null);
  }, []);

  const handleSecretHeartClick = () => {
    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#ec4899', '#fda4af', '#f43f5e', '#fef08a']
    });

    unlockAchievement('found_secret');
    setShowSecretModal(true);
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-28 md:pb-8 bg-transparent relative flex flex-col justify-between">
      <div className="flex-1">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-800 dark:text-slate-100 transition-colors">
            Your Special Corner
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold transition-colors">
            Statistics, achievements & daily smiles ❤️
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* STATS PANELS */}
          <div className="md:col-span-1 flex flex-col gap-6">
            {/* Visit card */}
            <div className="glass-panel rounded-2xl p-6 border border-white/50 dark:border-white/10 text-center shadow-lg relative overflow-hidden transition-colors">
              <div className="text-4xl">👑</div>
              <h4 className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mt-3 transition-colors">
                Total Visits
              </h4>
              <p className="text-4xl font-serif font-bold text-slate-800 dark:text-slate-100 mt-1 transition-colors">
                {visitCount}
              </p>
              <span className="text-[10px] text-brand-violet-600 dark:text-brand-lavender-300 mt-2 block font-semibold transition-colors">
                Every visit makes me smile!
              </span>
            </div>

            {/* Collected Hearts card */}
            <div className="glass-panel rounded-2xl p-6 border border-white/50 dark:border-white/10 text-center shadow-lg relative overflow-hidden transition-colors">
              <div className="text-4xl animate-heartbeat inline-block">❤️</div>
              <h4 className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mt-3 transition-colors">
                Hearts Caught
              </h4>
              <p className="text-4xl font-serif font-bold text-slate-800 dark:text-slate-100 mt-1 transition-colors">
                {collectedHearts}
              </p>
              <span className="text-[10px] text-brand-violet-600 dark:text-brand-lavender-300 mt-2 block font-semibold transition-colors">
                Cupid's count is rising!
              </span>
            </div>
          </div>

          {/* DAILY SMILE greeting block */}
          <div className="md:col-span-2 flex">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/50 dark:border-white/10 shadow-lg flex-1 flex flex-col justify-between relative overflow-hidden transition-colors">
              {/* Corner quote icons deco */}
              <div className="absolute top-4 left-6 text-brand-pink-100 dark:text-slate-900/60 text-6xl font-serif leading-none select-none pointer-events-none transition-colors">
                “
              </div>
              <div className="absolute bottom-12 right-6 text-brand-pink-100 dark:text-slate-900/60 text-6xl font-serif leading-none select-none pointer-events-none transition-colors">
                ”
              </div>

              <div>
                <span className="text-[10px] font-bold text-brand-violet-600 dark:text-brand-lavender-300 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                  <FiSmile /> Your Daily Smile
                </span>
                <h3 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-xl mt-4 transition-colors">
                  A Little Note For You:
                </h3>
                <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed italic mt-4 font-medium px-4 text-center transition-colors">
                  {dailySmile || "Thinking of you makes my heart blossom..."}
                </p>
              </div>

              <div className="border-t border-brand-pink-100/50 dark:border-white/10 pt-4 mt-6 text-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">
                Updates on next visit
              </div>
            </div>
          </div>
        </div>

        {/* DARK MODE SETTINGS ROW */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-4xl mx-auto glass-panel rounded-2xl border border-white/50 dark:border-white/10 shadow-lg mb-8 overflow-hidden"
        >
          <h3 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 px-6 pt-5 pb-3 border-b border-slate-100/60 dark:border-white/5 flex items-center gap-2">
            Appearance
          </h3>

          {/* Dark Mode row — styled like Samsung settings */}
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/3 transition-colors"
            onClick={() => setDarkMode((prev: boolean) => !prev)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                darkMode
                  ? 'bg-brand-violet-600/20 text-brand-lavender-300'
                  : 'bg-amber-100 text-amber-600'
              }`}>
                {darkMode ? <FiMoon size={17} /> : <FiSun size={17} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 transition-colors">
                  Dark Mode
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 transition-colors">
                  {darkMode ? 'Currently on — tap to switch to light' : 'Currently off — tap to switch to dark'}
                </p>
              </div>
            </div>

            {/* Animated pill toggle */}
            <div
              className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                darkMode
                  ? 'bg-brand-violet-600'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                style={{ left: darkMode ? 'calc(100% - 1.375rem)' : '0.125rem' }}
              />
            </div>
          </div>
        </motion.div>

        {/* ACHIEVEMENTS CENTER */}
        <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 border border-white/50 dark:border-white/10 shadow-xl mb-8 transition-colors">
          <h3 className="font-serif font-bold text-xl text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors">
            <FiAward className="text-brand-violet-600 dark:text-brand-lavender-300" /> Achievement Badges
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {achievementList.map((badge) => {
              const isUnlocked = achievements[badge.id];

              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center justify-between text-center p-4 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'bg-linear-to-br from-brand-lavender-50/70 to-brand-peach-50/70 dark:from-slate-900/60 dark:to-slate-950/60 border-brand-violet-300 dark:border-brand-violet-600/30 shadow-md scale-100'
                      : 'bg-slate-100/40 dark:bg-slate-900/20 border-slate-200/40 dark:border-white/5 opacity-50 scale-95'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm mb-3 ${
                      isUnlocked
                        ? 'bg-linear-to-tr from-brand-violet-600 to-brand-pink-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <h4 className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-500'} transition-colors`}>
                    {badge.name}
                  </h4>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 leading-normal px-1 transition-colors">
                    {badge.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EASTER EGG INVISIBLE HEART */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSecretHeartClick}
          className="w-6 h-6 flex items-center justify-center text-brand-pink-400 opacity-2 hover:opacity-50 transition-opacity duration-300 cursor-pointer text-xs"
          title="Secret heart..."
        >
          <FiHeart className="animate-heartbeat" fill="currentColor" />
        </button>
      </div>

      {/* SURPRISE SECRET MODAL */}
      <AnimatePresence>
        {showSecretModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSecretModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative border border-brand-pink-200 dark:border-brand-violet-600/30 overflow-hidden text-slate-850 dark:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative dotted border */}
              <div className="absolute inset-2 border border-dashed border-brand-pink-300 dark:border-brand-violet-600/20 rounded-2xl pointer-events-none" />

              <div className="text-5xl animate-float">🕵️‍♀️❤️✨</div>
              <h3 className="font-serif font-bold text-2xl text-slate-800 dark:text-slate-100 mt-4 leading-tight">
                You Found it!
              </h3>
              <span className="text-[10px] text-brand-pink-500 dark:text-brand-pink-400 font-bold uppercase tracking-widest block mt-1">
                The Secret Heart Easter Egg
              </span>
              
              {/* Display winking leopard-glasses selfie photo inside modal! */}
              {surprisePhoto && (
                <div className="w-36 h-48 mx-auto mt-4 overflow-hidden rounded-xl shadow-md border border-brand-pink-100 dark:border-white/5 relative">
                  <CardImage photo={surprisePhoto} className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-4 font-medium italic transition-colors">
                "You found my hidden heart! You must be looking really closely. Just like this heart was hidden, my love for you is everywhere on this site. I love you so much!"
              </p>
              
              <button
                onClick={() => setShowSecretModal(false)}
                className="mt-6 px-6 py-2 bg-brand-violet-600 dark:bg-brand-lavender-500 hover:bg-brand-violet-700 dark:hover:bg-brand-lavender-600 text-white rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer shadow-md transition-all border-none"
              >
                Close Surprise 🎁
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
