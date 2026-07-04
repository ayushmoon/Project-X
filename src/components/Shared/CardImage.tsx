import React, { useState } from 'react';
import type { PhotoItem } from '../../utils/photoLoader';

interface CardImageProps {
  photo: PhotoItem;
  className?: string;
  isZoomed?: boolean;
}

export const CardImage: React.FC<CardImageProps> = ({ photo, className = '', isZoomed = false }) => {
  const [loaded, setLoaded] = useState(false);

  // Helper to render customized beautiful SVGs for fallbacks
  const renderFallbackIcon = () => {
    switch (photo.category) {
      case 'Smiling':
        return (
          <svg className="w-16 h-16 text-white/80 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
          </svg>
        );
      case 'Cute':
        return (
          <svg className="w-16 h-16 text-white/80 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        );
      case 'Traditional':
        return (
          <svg className="w-16 h-16 text-white/80 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.19-.347.568-.549.976-.549s.785.202.976.549l2.224 4.057a1.1 1.1 0 0 0 .918.572l4.475.397c.394.035.726.29.83.673a1.107 1.107 0 0 1-.295 1.09l-3.385 2.978c-.282.247-.406.626-.328 1.002l1.016 4.417c.09.39-.076.793-.414 1.013a1.09 1.09 0 0 1-1.077.054l-3.87-2.304a1.102 1.102 0 0 0-1.127 0l-3.87 2.304a1.09 1.09 0 0 1-1.077-.054c-.338-.22-.504-.623-.414-1.013l1.016-4.417a1.102 1.102 0 0 0-.328-1.002L3.52 10.3c-.31-.272-.423-.7-.295-1.09.127-.39.46-.645.83-.673l4.475-.397a1.1 1.1 0 0 0 .918-.572L11.48 3.5Z" />
          </svg>
        );
      case 'Selfies':
        return (
          <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>
        );
      case 'Favorite':
        return (
          <svg className="w-16 h-16 text-white/80 animate-heartbeat" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        );
      default:
        return (
          <svg className="w-16 h-16 text-white/80 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l8.982-5.025a15.9 15.9 0 0 0 2.476-8.99A15.9 15.9 0 0 0 11.472 2.5a15.9 15.9 0 0 0-8.99 2.476A15.9 15.9 0 0 0 2.5 11.472 15.9 15.9 0 0 0 9.813 15.904Z" />
          </svg>
        );
    }
  };

  if (photo.isFallback) {
    return (
      <div
        style={{ background: photo.url }}
        className={`w-full aspect-4/5 rounded-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden text-center select-none shadow-inner border border-white/30 ${className}`}
      >
        {/* Glow circles */}
        <div className="absolute w-24 h-24 bg-white/10 rounded-full blur-xl -top-6 -left-6" />
        <div className="absolute w-32 h-32 bg-white/10 rounded-full blur-2xl -bottom-10 -right-10" />

        {renderFallbackIcon()}

        <span className="font-cursive text-white/90 text-2xl mt-4 block leading-none">
          {photo.title}
        </span>
        <span className="text-[10px] text-white/60 uppercase tracking-widest mt-2 block font-semibold">
          {photo.category}
        </span>
      </div>
    );
  }

  // Keep every photo card in the gallery section in a vertical pattern (3:4 portrait aspect ratio)
  const aspectClass = 'aspect-[3/4]';

  return (
    <div className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-white/5 shadow-xs ${className}`}>
      {/* Shimmer Placeholder */}
      {!loaded && (
        <div className="absolute inset-0 shimmer z-10" />
      )}

      <img
        src={photo.url}
        alt={photo.title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-out filter brightness-[1.04] contrast-[1.02] saturate-[1.03] ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${isZoomed ? 'scale-110' : ''}`}
        style={{ display: 'block' }}
      />
    </div>
  );
};
