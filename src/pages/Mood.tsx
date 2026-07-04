import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSmile, FiFrown, FiMeh, FiHeart, FiZap, FiVolume2, FiActivity } from 'react-icons/fi';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

interface MoodConfig {
  type: string;
  label: string;
  icon: React.ReactNode;
  themeColor: string;
  glowColor: string;
  title: string;
  message: string;
  actionText: string;
  actionIcon: React.ReactNode;
  actionLink?: string;
  actionCallback?: () => void;
}

export const Mood: React.FC = () => {
  const [activeMood, setActiveMood] = useState<MoodConfig | null>(null);
  const navigate = useNavigate();

  const handleConfettiBurst = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#fda4af', '#fecdd6', '#e9d5ff', '#fff0f2']
    });
  };

  const moods: MoodConfig[] = [
    {
      type: 'happy',
      label: 'Happy',
      icon: <FiSmile />,
      themeColor: 'from-amber-200 to-rose-200 dark:from-amber-950/60 dark:to-rose-950/50',
      glowColor: 'shadow-amber-100 border-amber-300 dark:border-amber-700/30',
      title: 'YAY! Keep Shining! ☀️',
      message: 'Your happiness is literally the best news in the world. I hope your happy mood multiplies! Let\'s pop some celebratory confetti and keep that beautiful smile glowing.',
      actionText: 'Celebrate & Pop Confetti 🎉',
      actionIcon: <FiZap />,
      actionCallback: handleConfettiBurst,
    },
    {
      type: 'sad',
      label: 'Sad',
      icon: <FiFrown />,
      themeColor: 'from-sky-100 to-brand-pink-100 dark:from-sky-950/50 dark:to-brand-pink-950/40',
      glowColor: 'shadow-sky-100 border-sky-300 dark:border-sky-700/30',
      title: 'Sending You a Giant Hug 🤗',
      message: 'I\'m so sorry today feels heavy, sweetheart. Remember, it\'s completely okay to have off days. Close your eyes, take a deep breath, and feel this virtual hug. You are so loved, exactly as you are.',
      actionText: 'Browse Memories 📸',
      actionIcon: <FiHeart />,
      actionLink: '/memories',
    },
    {
      type: 'bored',
      label: 'Bored',
      icon: <FiMeh />,
      themeColor: 'from-violet-100 to-brand-lavender-200 dark:from-violet-950/50 dark:to-brand-lavender-900/40',
      glowColor: 'shadow-violet-100 border-violet-300 dark:border-violet-700/30',
      title: 'Boredom Buster! 🎮',
      message: 'Bored? Say no more! Let\'s go play some cute games. You can catch falling hearts, solve the puzzle, or test your memory matching cards!',
      actionText: 'Play Games Hub 👾',
      actionIcon: <FiActivity />,
      actionLink: '/games',
    },
    {
      type: 'missing',
      label: 'Missing Someone',
      icon: <FiHeart className="animate-heartbeat" />,
      themeColor: 'from-brand-pink-100 to-brand-lavender-100 dark:from-brand-pink-950/50 dark:to-brand-lavender-900/40',
      glowColor: 'shadow-brand-pink-100 border-brand-pink-300 dark:border-brand-pink-700/30',
      title: 'I Miss You So Much Too 🥺',
      message: 'Distance is just numbers when two hearts are connected. Whenever you look up at the moon or the stars, know that I am looking at them too, thinking of you and wishing I could hold you. Soon! ❤️',
      actionText: 'Browse Memories 📸',
      actionIcon: <FiHeart />,
      actionLink: '/memories',
    },
    {
      type: 'motivation',
      label: 'Need Motivation',
      icon: <FiZap />,
      themeColor: 'from-yellow-100 to-brand-pink-100 dark:from-yellow-950/50 dark:to-brand-pink-950/40',
      glowColor: 'shadow-yellow-100 border-yellow-300 dark:border-yellow-700/30',
      title: 'You Got This! 💪',
      message: 'Just a reminder: you are incredibly smart, capable, and hardworking. Take things one small step at a time. The world is yours to conquer, and I am right here cheering you on at every single step!',
      actionText: 'Hear Cheering Voice 📣',
      actionIcon: <FiVolume2 />,
      actionCallback: () => {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
        alert("Cheering sound activated in spirit: 'GO GO GO! You are amazing! You're going to crush it today!' 🎉✊");
      },
    },
  ];

  const handleActionClick = (mood: MoodConfig) => {
    if (mood.actionLink) {
      navigate(mood.actionLink);
    } else if (mood.actionCallback) {
      mood.actionCallback();
    }
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-28 md:pb-8 bg-transparent flex flex-col items-center justify-center">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-800 dark:text-slate-100 transition-colors">
          How are you feeling today?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold transition-colors">
          Tell me your mood, and I'll send you comfort ❤️
        </p>
      </motion.div>

      {/* Mood Selector Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 max-w-xl mx-auto mb-8 z-10">
        {moods.map((mood) => (
          <motion.button
            key={mood.type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveMood(mood)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold cursor-pointer glass-card border border-white/50 dark:border-white/5 shadow-sm hover:border-brand-violet-600 dark:hover:border-brand-lavender-500 ${
              activeMood?.type === mood.type
                ? 'bg-linear-to-r from-brand-violet-600 to-brand-pink-500 dark:from-brand-violet-500 dark:to-brand-pink-400 text-white border-transparent shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <span className="text-base">{mood.icon}</span>
            <span>{mood.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Ambiance/Comfort Message Panel */}
      <div className="w-full max-w-lg min-h-64 flex items-center justify-center px-2">
        <AnimatePresence mode="wait">
          {activeMood ? (
            <motion.div
              key={activeMood.type}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className={`w-full bg-linear-to-br ${activeMood.themeColor} rounded-3xl p-6 sm:p-8 shadow-xl border border-white/60 dark:border-white/10 text-center flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Floating decorative elements */}
              <div className="absolute w-24 h-24 bg-white/20 rounded-full blur-xl -top-6 -left-6" />
              <div className="absolute w-24 h-24 bg-white/20 rounded-full blur-xl -bottom-6 -right-6" />

              <div className="z-10">
                <h3 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-2xl mb-4 leading-tight">
                  {activeMood.title}
                </h3>
                <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-medium transition-colors">
                  {activeMood.message}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleActionClick(activeMood)}
                className="mt-8 self-center w-60 h-11 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all text-xs uppercase tracking-wider border border-slate-100 dark:border-white/10 z-10"
              >
                {activeMood.actionIcon} {activeMood.actionText}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              className="text-center p-8 border-2 border-dashed border-slate-300/60 dark:border-slate-700/40 rounded-3xl max-w-sm"
            >
              <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                Tap one of the mood bubbles above to shift the room's energy and receive your comforting actions ❤️
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
