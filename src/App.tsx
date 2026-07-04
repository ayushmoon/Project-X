import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Dark mode context — Profile page uses this to control the toggle
export const DarkModeContext = createContext<{
  darkMode: boolean;
  setDarkMode: (v: boolean | ((prev: boolean) => boolean)) => void;
}>({ darkMode: false, setDarkMode: () => {} });

// Contexts
import { AchievementsProvider } from './context/AchievementsContext';
import { MusicProvider } from './context/MusicContext';

// Components
import { Navigation } from './components/Navigation';
// import { BackgroundMusic } from './components/BackgroundMusic';
import { FloatingHearts } from './components/FloatingHearts';
import { AchievementToast } from './components/AchievementToast';

// Pages
import { LoadingScreen } from './pages/LoadingScreen';
import { Home } from './pages/Home';
import { Gallery } from './pages/Gallery';
import { Memories } from './pages/Memories';
import { Mood } from './pages/Mood';
import { Games } from './pages/Games';
import { Profile } from './pages/Profile';
import { Videos } from './pages/Videos';

const AppContent: React.FC = () => {
  const location = useLocation();

  // Auto scroll to top on every page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative w-full bg-romantic-gradient selection:bg-brand-pink-200 transition-colors duration-500">
      {/* Background Hearts Canvas */}
      <FloatingHearts />

      {/* Achievement Toast */}
      <AchievementToast />

      {/* Left sidebar / Bottom bar Navigation */}
      <Navigation />

      {/* Smooth Page transition wrapper */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full min-h-screen md:pl-24 flex flex-col justify-start"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/mood" element={<Mood />} />
            <Route path="/games" element={<Games />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(() => {
    return !sessionStorage.getItem('app_loaded_session');
  });

  // Dark mode state lives here at root level, shared via context
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('hlw_dark_mode');
    if (saved !== null) return JSON.parse(saved);
    return false; // Default theme is light theme
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hlw_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <AchievementsProvider>
        <MusicProvider>
          <BrowserRouter>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading-screen"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-screen"
                >
                  <LoadingScreen
                    onFinish={() => {
                      sessionStorage.setItem('app_loaded_session', 'true');
                      setIsLoading(false);
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="app-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <AppContent />
                </motion.div>
              )}
            </AnimatePresence>
          </BrowserRouter>
        </MusicProvider>
      </AchievementsProvider>
    </DarkModeContext.Provider>
  );
}

export default App;
