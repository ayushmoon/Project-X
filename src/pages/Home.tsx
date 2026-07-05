import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievements } from '../context/AchievementsContext';
import { getLoadedPhotos } from '../utils/photoLoader';
import type { PhotoItem } from '../utils/photoLoader';
import { CardImage } from '../components/Shared/CardImage';
import { FiArrowRight, FiHeart, FiX, FiMapPin, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import confetti from 'canvas-confetti';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { visitCount, unlockAchievement } = useAchievements();
  const [homePhotos, setHomePhotos] = useState<PhotoItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [displayText, setDisplayText] = useState('');
  const [quoteIdx, setQuoteIdx] = useState(0);

  const typewriterQuotes = [
    'I hope this little world brings a smile to your face today...',
    'You are my absolute favorite thought, every single day...',
    'A special space made entirely of love, just for you...',
    'Whenever you feel happy, sad, or bored, come right here...',
  ];

  // Resolve the main target photos for the home screen
  useEffect(() => {
    const loaded = getLoadedPhotos();
    const targetFilenames = [
      'standing_outdoors.jpg',
      'braids_school_look.jpg',
      'waist_chain_aesthetic.jpg',
      'eyes_close_up.jpg',
      'brown_shirt_gaze.jpg'
    ];

    const selected: PhotoItem[] = [];
    targetFilenames.forEach((fn) => {
      const found = loaded.find(p => p.filename === fn);
      if (found && !selected.some(p => p.filename === found.filename)) {
        selected.push(found);
      }
    });

    // Fallback if target photos are somehow missing
    if (selected.length < targetFilenames.length) {
      loaded.forEach((p) => {
        if (selected.length < targetFilenames.length && !selected.some(x => x.filename === p.filename)) {
          selected.push(p);
        }
      });
    }

    setHomePhotos(selected);
  }, []);

  // Typewriter effect
  useEffect(() => {
    let active = true;
    let charIdx = 0;
    const currentQuote = typewriterQuotes[quoteIdx];

    setDisplayText('');

    const typeWriter = () => {
      if (!active) return;
      if (charIdx < currentQuote.length) {
        setDisplayText(currentQuote.slice(0, charIdx + 1));
        charIdx++;
        setTimeout(typeWriter, 50);
      } else {
        setTimeout(() => {
          if (active) {
            setQuoteIdx((prev) => (prev + 1) % typewriterQuotes.length);
          }
        }, 3000);
      }
    };

    typeWriter();

    return () => {
      active = false;
    };
  }, [quoteIdx]);

  const handleConfettiBurst = () => {
    confetti({
      particleCount: 85,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#fb7185', '#fda4af', '#f43f5e']
    });
    confetti({
      particleCount: 85,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#d8b4fe', '#e9d5ff', '#c084fc']
    });
  };

  const handlePhotoClick = (photo: PhotoItem) => {
    handleConfettiBurst();
    setSelectedPhoto(photo);
    unlockAchievement('found_secret');
  };

  const handleNext = () => {
    if (homePhotos.length === 0) return;
    setDirection(1);
    setActiveIdx((prev) => (prev + 1) % homePhotos.length);
  };

  const handlePrev = () => {
    if (homePhotos.length === 0) return;
    setDirection(-1);
    setActiveIdx((prev) => (prev - 1 + homePhotos.length) % homePhotos.length);
  };

  const handleDragEnd = (_event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (homePhotos.length === 0) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4500); // Auto-scroll every 4.5 seconds

    return () => clearInterval(interval);
  }, [homePhotos, activeIdx]);

  const getVisitOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Slider Animations
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.95,
      rotate: dir > 0 ? 3 : -3
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 320, damping: 28 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0,
      scale: 0.95,
      rotate: dir < 0 ? 3 : -3,
      transition: {
        x: { type: 'spring' as const, stiffness: 320, damping: 28 },
        opacity: { duration: 0.25 }
      }
    })
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-6 pb-28 md:pb-8 bg-transparent max-w-4xl mx-auto w-full">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg mb-8"
      >
        <span className="text-xs uppercase tracking-widest text-brand-violet-600 dark:text-brand-lavender-300 font-bold bg-brand-lavender-100/50 dark:bg-brand-lavender-500/20 px-3.5 py-1.5 rounded-full border border-brand-lavender-200 dark:border-brand-lavender-500/30">
          This is your {getVisitOrdinal(visitCount)} visit ❤️
        </span>
        <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-800 dark:text-slate-100 mt-5 leading-tight transition-colors">
          Welcome to <br />
          <span className="text-romantic-gradient font-cursive text-5xl md:text-6xl font-normal">
            Kinju's World
          </span>
        </h2>
      </motion.div>

      {/* Polaroid Scroll Slider */}
      <div className="relative w-72 sm:w-80 h-96 flex items-center justify-center mb-6">
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrev}
          className="absolute -left-12 md:-left-16 z-20 w-9 h-9 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-108 active:scale-95 transition-all shadow-md cursor-pointer border-none"
          title="Previous Moment"
        >
          <FiChevronLeft size={18} />
        </button>

        {/* Polaroid frame viewport */}
        <div className="w-full h-full relative overflow-visible flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            {homePhotos.length > 0 && (
              <motion.div
                key={activeIdx}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={handleDragEnd}
                className="w-72 sm:w-80 bg-white dark:bg-slate-900/90 p-4 pb-12 shadow-2xl rounded-sm border border-slate-100 dark:border-white/10 flex flex-col justify-center relative cursor-pointer select-none transition-colors"
                onClick={() => handlePhotoClick(homePhotos[activeIdx])}
              >
                <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-950 overflow-hidden rounded-xs">
                  <CardImage
                    photo={homePhotos[activeIdx]}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Caption */}
                <div className="absolute bottom-3 left-4 right-4 text-center font-cursive text-slate-700 dark:text-slate-200 text-2xl leading-none transition-colors">
                  {homePhotos[activeIdx].title}
                </div>

                {/* Small pin deco */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-brand-pink-300/40 rounded-full blur-xs" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-pink-400 rounded-full border border-white shadow-md flex items-center justify-center text-[8px] text-white">
                  📌
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNext}
          className="absolute -right-12 md:-right-16 z-20 w-9 h-9 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-108 active:scale-95 transition-all shadow-md cursor-pointer border-none"
          title="Next Moment"
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* Slide dots indicators */}
      <div className="flex items-center gap-2 mb-4">
        {homePhotos.map((_, dotIdx) => (
          <button
            key={dotIdx}
            onClick={() => {
              setDirection(dotIdx > activeIdx ? 1 : -1);
              setActiveIdx(dotIdx);
            }}
            className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 border-none ${dotIdx === activeIdx
                ? 'bg-brand-violet-600 dark:bg-brand-lavender-400 scale-110 px-2.5'
                : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
          />
        ))}
      </div>

      {/* Typing Subtitle */}
      <div className="h-10 text-center max-w-sm md:max-w-md mt-4 px-4">
        <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed italic transition-colors">
          {displayText}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-1.5 h-3.5 bg-brand-violet-600 dark:bg-brand-lavender-300 ml-0.5 align-middle"
          />
        </p>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center gap-4 mt-6 z-10"
      >
        <button
          onClick={() => navigate('/gallery')}
          className="w-56 h-12 rounded-full bg-linear-to-r from-brand-violet-600 to-brand-pink-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-103 active:scale-97 transition-all border-none"
        >
          Start Journey <FiArrowRight />
        </button>
      </motion.div>

      {/* Details Creations Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 md:p-6"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Modal Card Box */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl relative border border-slate-100 dark:border-white/5 max-h-[90vh] md:max-h-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button X */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-50 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 bg-slate-100 dark:bg-slate-800 hover:scale-105 p-2 rounded-full cursor-pointer transition-all border-none"
              >
                <FiX size={16} />
              </button>

              {/* Left Side: Photo Frame Container */}
              <div className="w-full md:w-3/5 aspect-[4/3] md:aspect-auto bg-slate-50 dark:bg-slate-950 relative flex items-center justify-center min-h-[30vh] md:min-h-[500px]">
                <div className="w-full h-full overflow-hidden flex items-center justify-center p-4 relative">
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.title}
                    className="w-full h-full object-cover rounded-2xl select-none shadow-inner filter brightness-[1.04] contrast-[1.02] saturate-[1.03]"
                  />
                </div>
              </div>

              {/* Right Side: Elegant Info Panel */}
              <div className="w-full md:w-2/5 flex flex-col justify-between p-6 sm:p-8 bg-linear-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/40 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5">
                <div>
                  <span className="text-[10px] font-bold text-brand-violet-600 dark:text-brand-lavender-300 uppercase tracking-widest bg-brand-violet-100/50 dark:bg-brand-violet-500/15 px-3 py-1 rounded-md border border-brand-violet-200/50 dark:border-brand-violet-500/20 self-start transition-colors">
                    {selectedPhoto.category} Category
                  </span>

                  <h3 className="font-serif text-2xl font-bold mt-4 text-slate-800 dark:text-slate-100 leading-snug transition-colors">
                    {selectedPhoto.title}
                  </h3>

                  {/* Styled Metadata items matching creations details */}
                  <div className="mt-5 space-y-2.5 border-t border-b border-slate-100 dark:border-white/5 py-4 text-xs font-semibold text-slate-600 dark:text-slate-350">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-brand-violet-600 dark:text-brand-lavender-400 text-sm" />
                      <span>Location: In My Heart Forever</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiHeart className="text-brand-pink-500 text-sm" />
                      <span>Estimated Love: Infinite ❤️</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-brand-violet-600 dark:text-brand-lavender-400 text-sm" />
                      <span>Date Captured: {selectedPhoto.date || 'Sweet Date'}</span>
                    </div>
                  </div>

                  {/* Narrative paragraph description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-5 leading-relaxed font-light italic transition-colors">
                    "{selectedPhoto.description}"
                  </p>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={handleConfettiBurst}
                  className="mt-8 w-full h-11 rounded-full bg-linear-to-r from-brand-violet-600 to-brand-pink-500 hover:from-brand-violet-700 hover:to-brand-pink-600 text-white font-bold tracking-wider text-xs uppercase cursor-pointer shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 border-none z-10"
                >
                  <FiHeart className="animate-heartbeat text-sm" fill="currentColor" />
                  Send Sweet Kiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
