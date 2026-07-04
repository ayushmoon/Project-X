import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLoadedPhotos } from '../utils/photoLoader';
import type { PhotoItem } from '../utils/photoLoader';
import { CardImage } from '../components/Shared/CardImage';
import { FiX, FiChevronLeft, FiChevronRight, FiHeart, FiMapPin, FiCalendar } from 'react-icons/fi';

export const Gallery: React.FC = () => {
  const [allPhotos] = useState<PhotoItem[]>(() => getLoadedPhotos());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const hugCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const burstAnimRef = useRef<number | null>(null);

  // Canvas heart burst — same physics as the home FloatingHearts
  const runHeartBurst = useCallback(() => {
    const canvas = hugCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = [
      'rgba(244, 63, 94, ',
      'rgba(251, 113, 133, ',
      'rgba(253, 164, 181, ',
      'rgba(216, 180, 254, ',
      'rgba(233, 213, 255, ',
      'rgba(249, 115, 22, ',
    ];

    interface Particle {
      x: number; y: number; size: number;
      speedX: number; speedY: number;
      alpha: number; decay: number;
      color: string; rotation: number; rotationSpeed: number;
    }

    const drawHeart = (x: number, y: number, size: number, alpha: number, color: string, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      const t = size * 0.3;
      ctx.moveTo(0, t);
      ctx.bezierCurveTo(-size / 2, -t, -size, t, 0, size);
      ctx.bezierCurveTo(size, t, size / 2, -t, 0, t);
      ctx.fillStyle = `${color}${alpha})`;
      ctx.shadowColor = 'rgba(244,63,94,0.25)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    };

    // Spawn 60 burst particles from the lower-center of the modal
    const cx = canvas.width * 0.7;   // right panel center x
    const cy = canvas.height * 0.85; // near the button (bottom 85%)
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: cx + (Math.random() * 120 - 60),
      y: cy,
      size: Math.random() * 14 + 8,
      speedX: Math.random() * 7 - 3.5,
      speedY: -(Math.random() * 8 + 3),
      alpha: 1,
      decay: Math.random() * 0.012 + 0.008,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: Math.random() * 0.06 - 0.03,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.18;
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;
        if (p.alpha > 0) {
          alive = true;
          drawHeart(p.x, p.y, p.size, p.alpha, p.color, p.rotation);
        }
      }
      if (alive) {
        burstAnimRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsBursting(false);
      }
    };
    animate();
  }, []);

  const handleHeartBurst = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (burstAnimRef.current) cancelAnimationFrame(burstAnimRef.current);
    setIsBursting(true);
    setTimeout(runHeartBurst, 30);
  }, [runHeartBurst]);

  useEffect(() => {
    return () => { if (burstAnimRef.current) cancelAnimationFrame(burstAnimRef.current); };
  }, []);

  const categories = ['All', 'Cute', 'Smiling', 'Traditional', 'Selfies', 'Favorite', 'Random'];

  const filteredPhotos = selectedCategory === 'All'
    ? allPhotos.filter((photo, idx, self) => self.findIndex(p => p.filename === photo.filename) === idx)
    : allPhotos.filter(photo => photo.category === selectedCategory);

  const handleOpenLightbox = (photo: PhotoItem) => {
    const idx = filteredPhotos.findIndex(p => p.id === photo.id);

    setLightboxIdx(idx);
    setIsZoomed(false);
  };

  const handleCloseLightbox = () => {
    setLightboxIdx(null);
    setIsZoomed(false);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx + 1) % filteredPhotos.length);
    setIsZoomed(false);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx - 1 + filteredPhotos.length) % filteredPhotos.length);
    setIsZoomed(false);
  };

  const activePhoto = lightboxIdx !== null ? filteredPhotos[lightboxIdx] : null;

  return (
    <div className="min-h-screen px-4 pt-6 pb-28 md:pb-8 bg-transparent">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-800 dark:text-slate-100 transition-colors">
          Our Special Gallery
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold transition-colors">
          Beautiful moments frozen in time ❤️
        </p>
      </motion.div>

      {/* Categories Filter Tabs */}
      <div className="flex justify-start md:justify-center overflow-x-auto no-scrollbar gap-2 mb-8 py-2 px-1 max-w-4xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setLightboxIdx(null);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 cursor-pointer border transition-all ${selectedCategory === cat
                ? 'bg-brand-violet-600 dark:bg-brand-lavender-500 border-transparent text-white shadow-md'
                : 'bg-white/60 dark:bg-slate-900/50 border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/95 dark:hover:bg-slate-900/80'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filteredPhotos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleOpenLightbox(photo)}
              className="glass-card rounded-2xl p-2 cursor-pointer relative group border border-white/40 dark:border-white/5 bg-white/60 dark:bg-slate-900/40 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <CardImage photo={photo} className="w-full" />

              {/* Overlay on hover */}
              <div className="absolute inset-2 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] text-brand-pink-200 font-bold uppercase tracking-wider">
                  {photo.category}
                </span>
                <h4 className="font-serif font-bold text-xs truncate mt-0.5">
                  {photo.title}
                </h4>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 md:p-6"
            onClick={handleCloseLightbox}
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
              {/* 🎉 Full-screen canvas heart burst — same as home FloatingHearts */}
              {isBursting && (
                <canvas
                  ref={hugCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none z-50 rounded-3xl"
                  style={{ display: 'block' }}
                />
              )}
              {/* Close Button X */}
              <button
                onClick={handleCloseLightbox}
                className="absolute top-4 right-4 z-50 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 bg-slate-100 dark:bg-slate-800 hover:scale-105 p-2 rounded-full cursor-pointer transition-all border-none"
              >
                <FiX size={16} />
              </button>

              {/* Left Side: Photo Frame Container */}
              <div className="w-full md:w-3/5 aspect-[4/3] md:aspect-auto bg-slate-50 dark:bg-slate-950 relative flex items-center justify-center min-h-[30vh] md:min-h-[500px]">
                {/* Left navigation arrow */}
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 hover:scale-105 p-2.5 rounded-full cursor-pointer transition-all shadow-md border-none"
                >
                  <FiChevronLeft size={20} />
                </button>

                <div className="w-full h-full overflow-hidden flex items-center justify-center p-4 relative">
                  <motion.div
                    animate={{ scale: isZoomed ? 1.3 : 1 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {activePhoto.isFallback ? (
                      <div
                        style={{ background: activePhoto.url }}
                        className="w-full h-full rounded-2xl flex flex-col items-center justify-center p-8 text-center text-white"
                      >
                        <div className="text-4xl animate-float">❤️</div>
                        <h3 className="font-cursive text-2xl mt-4">{activePhoto.title}</h3>
                      </div>
                    ) : (
                      <img
                        src={activePhoto.url}
                        alt={activePhoto.title}
                        className="w-full h-full object-cover rounded-2xl select-none shadow-inner filter brightness-[1.04] contrast-[1.02] saturate-[1.03]"
                      />
                    )}
                  </motion.div>

                  {/* Photo index count overlay on image */}
                  <span className="absolute bottom-4 left-4 bg-slate-900/60 backdrop-blur-xs text-white text-[9px] font-bold px-2.5 py-1 rounded-md">
                    {lightboxIdx !== null ? lightboxIdx + 1 : 1} / {filteredPhotos.length}
                  </span>
                </div>

                {/* Right navigation arrow */}
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 hover:scale-105 p-2.5 rounded-full cursor-pointer transition-all shadow-md border-none"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>

              {/* Right Side: Elegant Info Panel */}
              <div className="w-full md:w-2/5 flex flex-col justify-between p-6 sm:p-8 bg-linear-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/40 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5">
                <div>
                  <span className="text-[10px] font-bold text-brand-violet-600 dark:text-brand-lavender-300 uppercase tracking-widest bg-brand-violet-100/50 dark:bg-brand-violet-500/15 px-3 py-1 rounded-md border border-brand-violet-200/50 dark:border-brand-violet-500/20 self-start transition-colors">
                    {activePhoto.category} Category
                  </span>

                  <h3 className="font-serif text-2xl font-bold mt-4 text-slate-800 dark:text-slate-100 leading-snug transition-colors">
                    {activePhoto.title}
                  </h3>

                  {/* Styled Metadata items matching the 2nd photo */}
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
                      <span>Date Captured: {activePhoto.date || 'Sweet Date'}</span>
                    </div>
                  </div>

                  {/* Narrative paragraph description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-5 leading-relaxed font-light italic transition-colors">
                    "{activePhoto.description}"
                  </p>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={handleHeartBurst}
                  className="mt-8 w-full h-11 rounded-full bg-linear-to-r from-brand-violet-600 to-brand-pink-500 hover:from-brand-violet-700 hover:to-brand-pink-600 text-white font-bold tracking-wider text-xs uppercase cursor-pointer shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 border-none z-10"
                >
                  <FiHeart className="animate-heartbeat text-sm" fill="currentColor" />
                  Send Sweet Hug
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
