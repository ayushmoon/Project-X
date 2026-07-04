import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  volume: number;
  setVolume: (vol: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// A beautiful, soft acoustic piano track that works out of the box
const DEFAULT_AUDIO_URL = 'https://assets.codepen.io/4358584/Anitek_-_01_-_Kisses.mp3';

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt to load from assets first, fallback to CDN
    const audio = new Audio();
    audio.src = '/src/assets/music/ambient.mp3';
    audio.loop = true;
    audio.volume = volume;

    // Check if the local path exists, if it errors, fallback to CDN
    audio.addEventListener('error', () => {
      console.log('Local ambient.mp3 not found, falling back to beautiful CDN lofi track.');
      audio.src = DEFAULT_AUDIO_URL;
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // Fade out
      let fadeCount = 10;
      const fadeInterval = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.05) {
          audioRef.current.volume -= volume / 10;
          fadeCount--;
        } else {
          clearInterval(fadeInterval);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.volume = volume; // Restore target volume
          }
          setIsPlaying(false);
        }
      }, 50);
    } else {
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        // Fade in
        let currentVol = 0;
        const fadeInterval = setInterval(() => {
          if (audioRef.current && currentVol < volume) {
            currentVol += volume / 10;
            audioRef.current.volume = Math.min(currentVol, volume);
          } else {
            clearInterval(fadeInterval);
          }
        }, 50);
      }).catch((err) => {
        console.warn('Playback blocked by browser auto-play policy. User interaction required.', err);
      });
    }
  };

  return (
    <MusicContext.Provider value={{ isPlaying, togglePlay, volume, setVolume }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
