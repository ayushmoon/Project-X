import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiImage, FiCalendar, FiUser, FiActivity, FiVideo } from 'react-icons/fi';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { to: '/', label: 'Home', icon: <FiHome /> },
    { to: '/gallery', label: 'Gallery', icon: <FiImage /> },
    { to: '/memories', label: 'Memories', icon: <FiCalendar /> },
    { to: '/videos', label: 'Videos', icon: <FiVideo /> },
    { to: '/games', label: 'Games', icon: <FiActivity /> },
    { to: '/profile', label: 'Profile', icon: <FiUser /> },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation (Visible on screen < md) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-999 glass-panel rounded-2xl shadow-xl flex items-center justify-around py-3 px-2 border border-white/40 dark:border-white/5 safe-bottom-padding">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center relative py-1 px-3 text-slate-500 dark:text-slate-400 hover:text-brand-violet-600 dark:hover:text-brand-lavender-300 transition-colors"
            >
              <span className={`text-xl z-10 transition-transform duration-300 ${isActive ? 'scale-115 text-brand-violet-600 dark:text-brand-lavender-300' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] mt-0.5 font-medium z-10 hidden xs:block">
                {item.label}
              </span>

              {isActive && (
                <motion.span
                  layoutId="mobileNavBubble"
                  className="absolute inset-0 bg-brand-violet-100/40 dark:bg-brand-violet-950/40 rounded-xl -z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Desktop Left Sidebar (Visible on screen >= md) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-24 hover:w-64 z-[998] glass-panel border-r border-white/30 dark:border-white/5 shadow-2xl transition-all duration-300 group overflow-hidden">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4 px-6 py-8 border-b border-white/20 dark:border-white/5">
          <div
            className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
              boxShadow: '0 4px 18px rgba(236,72,153,0.45)',
            }}
          >
            {/* Romantic heart + tiny stars */}
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              {/* Main heart */}
              <path
                d="M12 20.5C12 20.5 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.12 3 11.56 3.72 12 4.5C12.44 3.72 13.88 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 20.5 12 20.5Z"
                fill="rgba(255,255,255,0.95)"
              />
              {/* Top-right tiny star */}
              <path d="M19 4l.4 1.2L20.6 5.6l-1.2.4L19 7l-.4-1.2L17.4 5.6l1.2-.4Z" fill="rgba(255,255,255,0.7)" />
              {/* Bottom-left tiny star */}
              <path d="M5 17l.3.9.9.3-.9.3L5 19.5l-.3-.9-.9-.3.9-.3Z" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>
          <span className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Kinju's World
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-8 flex flex-col gap-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative overflow-hidden group/item ${isActive
                    ? 'text-brand-violet-600 dark:text-brand-lavender-300 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-white/5'
                  }`}
              >
                <span className="text-xl shrink-0 z-10">{item.icon}</span>
                <span className="text-sm font-medium z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.label}
                </span>

                {isActive && (
                  <motion.span
                    layoutId="desktopNavBubble"
                    className="absolute inset-0 bg-linear-to-r from-brand-violet-100/40 to-brand-lavender-100/20 dark:from-brand-violet-950/40 dark:to-brand-lavender-950/20 rounded-xl -z-0 border-l-2 border-brand-violet-600 dark:border-brand-lavender-500"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-6 text-center border-t border-white/20 dark:border-white/5">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Handcrafted with Love ❤️
          </p>
        </div>
      </aside>
    </>
  );
};
