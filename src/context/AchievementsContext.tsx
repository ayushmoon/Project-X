import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

interface ToastInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface AchievementsContextType {
  achievements: Record<string, boolean>;
  achievementList: Achievement[];
  unlockAchievement: (id: string) => void;
  activeToast: ToastInfo | null;
  clearToast: () => void;
  visitCount: number;
  incrementVisits: () => void;
  collectedHearts: number;
  addHearts: (count: number) => void;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'visit_5',
    name: 'Sweet Regular',
    description: "Visited Kinju's World 5 times ❤️",
    icon: '🌸',
  },
  {
    id: 'visit_10',
    name: 'Devoted Lover',
    description: "Visited Kinju's World 10 times 💖",
    icon: '👑',
  },
  {
    id: 'found_secret',
    name: 'Secret Detective',
    description: 'Discovered the hidden invisible heart 🕵️‍♀️',
    icon: '🔍',
  },
  {
    id: 'completed_puzzle',
    name: 'Puzzle Master',
    description: 'Successfully reassembled the Memory Puzzle 🧩',
    icon: '🧩',
  },
  {
    id: 'catch_100_hearts',
    name: 'Cupid\'s Helper',
    description: 'Collected 100 Hearts in the Heart Catch game 🏹',
    icon: '🧺',
  },
];

export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useLocalStorage<Record<string, boolean>>('hlw_achievements', {
    visit_5: false,
    visit_10: false,
    found_secret: false,
    completed_puzzle: false,
    catch_100_hearts: false,
  });

  // Eagerly increment visit count in localStorage BEFORE React state reads it
  // This ensures visitCount displayed is always the current visit number from first render
  const [visitCount, setVisitCount] = useLocalStorage<number>('hlw_visit_count', 0);
  const [collectedHearts, setCollectedHearts] = useLocalStorage<number>('hlw_collected_hearts_total', 0);
  const [activeToast, setActiveToast] = useState<ToastInfo | null>(null);

  // Increment exactly once per page load, eagerly on mount before any render
  const [hasIncremented] = useState(() => {
    try {
      const raw = window.localStorage.getItem('hlw_visit_count');
      const current = raw ? JSON.parse(raw) : 0;
      const next = current + 1;
      window.localStorage.setItem('hlw_visit_count', JSON.stringify(next));
      return next;
    } catch { return 1; }
  });

  // Sync visitCount state to the already-incremented localStorage value on mount
  useEffect(() => {
    setVisitCount(hasIncremented);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check visits achievement when count updates
  useEffect(() => {
    if (visitCount >= 5 && !achievements.visit_5) {
      unlockAchievement('visit_5');
    }
    if (visitCount >= 10 && !achievements.visit_10) {
      unlockAchievement('visit_10');
    }
  }, [visitCount]);

  const unlockAchievement = (id: string) => {
    if (achievements[id]) return; // Already unlocked

    setAchievements(prev => ({
      ...prev,
      [id]: true,
    }));

    const details = ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
    if (details) {
      // Trigger Toast notification
      setActiveToast({
        id,
        name: details.name,
        description: details.description,
        icon: details.icon,
      });

      // Play elegant confetti burst
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#d8b4fe', '#fef08a', '#fda4af', '#e9d5ff']
      });

      // Auto close toast after 5s
      setTimeout(() => {
        setActiveToast(current => current?.id === id ? null : current);
      }, 5000);
    }
  };

  const clearToast = () => setActiveToast(null);

  const incrementVisits = () => {
    setVisitCount(prev => prev + 1);
  };

  const addHearts = (count: number) => {
    setCollectedHearts(prev => {
      const newVal = prev + count;
      if (newVal >= 100 && !achievements.catch_100_hearts) {
        unlockAchievement('catch_100_hearts');
      }
      return newVal;
    });
  };

  const achievementList = ACHIEVEMENT_DEFINITIONS.map(def => ({
    ...def,
    unlockedAt: achievements[def.id] ? 'Unlocked' : undefined,
  }));

  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        achievementList,
        unlockAchievement,
        activeToast,
        clearToast,
        visitCount,
        incrementVisits,
        collectedHearts,
        addHearts,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};
