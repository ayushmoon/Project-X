import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiPlay, FiTrash2, FiPlus, FiFolderPlus, FiCalendar, FiClock, FiHeart, FiMinus } from 'react-icons/fi';
import { useAchievements } from '../context/AchievementsContext';
import confetti from 'canvas-confetti';

interface VideoItem {
  id: string;
  title: string;
  url: string;
  date: string;
  description: string;
  isCustom?: boolean;
}

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 'video-1',
    title: 'Your Cutest Smile 🧸❤️',
    url: '/videos/video1.mp4',
    date: 'Dec 2025',
    description: 'A close-up of your beautiful, smiling face with your finger on your cheek. You look so incredibly sweet and adorable, my heart melts! 🥺✨'
  },
  {
    id: 'video-2',
    title: 'Sweet Talks with You 🗣️💖',
    url: '/videos/video2.mp4',
    date: 'Oct 2025',
    description: 'Watching you talk and smile directly at the camera. I could listen to your sweet voice and look at your gorgeous face all day long! 🥰🌹'
  },
  {
    id: 'video-3',
    title: 'Heart Filter Cutie 🤓💕',
    url: '/videos/video3.mp4',
    date: 'Nov 2025',
    description: 'You wearing those cute glasses with little pink hearts floating all around your head! You are the absolute definition of cute. 🌸✨'
  },
  {
    id: 'video-4',
    title: 'Welcome to My Vlog 🎬✨',
    url: '/videos/video4.mp4',
    date: 'Jan 2026',
    description: 'A sweet intro to your vlog! I am definitely your number one fan and subscriber forever and ever. Keep smiling! 🧸💖'
  },
  {
    id: 'video-5',
    title: 'Anime Princess 👸✨',
    url: '/videos/video5.mp4',
    date: 'Feb 2026',
    description: 'Showing off your gorgeous long hair and that beautiful cartoon filter look. You look like a real-life anime princess! 🌸💖'
  }
];

export const Videos: React.FC = () => {
  const { unlockAchievement } = useAchievements();
  const [playlist, setPlaylist] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);

  // Custom video states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Load playlist from localStorage or fallback to defaults, merging custom ones
  useEffect(() => {
    const saved = localStorage.getItem('hlw_videos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as VideoItem[];
        // Filter out any stale default videos from local storage
        const defaultIds = ['heart-bokeh', 'sweet-sunset', 'cozy-coffee', 'our-special-moment', 'video-1', 'video-2', 'video-3', 'video-4', 'video-5'];
        const customVideos = parsed.filter(v => v.isCustom && !defaultIds.includes(v.id));
        const combined = [...DEFAULT_VIDEOS, ...customVideos];
        setPlaylist(combined);
        if (combined.length > 0) {
          // If the previous video was saved in playlist, try to select it, otherwise select first
          const previousActive = localStorage.getItem('hlw_active_video_id');
          let activeId = previousActive;
          if (activeId === 'heart-bokeh') activeId = 'video-1';
          if (activeId === 'sweet-sunset') activeId = 'video-2';
          if (activeId === 'cozy-coffee') activeId = 'video-3';
          if (activeId === 'our-special-moment') activeId = 'video-4';

          const found = combined.find(v => v.id === activeId);
          setCurrentVideo(found || combined[0]);
        }
      } catch (e) {
        setPlaylist(DEFAULT_VIDEOS);
        setCurrentVideo(DEFAULT_VIDEOS[0]);
      }
    } else {
      setPlaylist(DEFAULT_VIDEOS);
      setCurrentVideo(DEFAULT_VIDEOS[0]);
    }
  }, []);

  // Sync checklist to localStorage
  const savePlaylist = (list: VideoItem[]) => {
    setPlaylist(list);
    localStorage.setItem('hlw_videos', JSON.stringify(list));
  };

  const handleSelectVideo = (video: VideoItem) => {
    setCurrentVideo(video);
    localStorage.setItem('hlw_active_video_id', video.id);
    unlockAchievement('watched_video');

    // Auto scroll video player to top on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Confetti pop on play
    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#a855f7', '#ec4899']
    });
  };

  const handleAddUrlVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newVideo: VideoItem = {
      id: `custom-url-${Date.now()}`,
      title: newTitle.trim(),
      url: newUrl.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      description: newDesc.trim() || 'A sweet moment shared together.',
      isCustom: true
    };

    const updated = [...playlist, newVideo];
    savePlaylist(updated);
    setCurrentVideo(newVideo);
    localStorage.setItem('hlw_active_video_id', newVideo.id);

    // Reset Form
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    setShowAddForm(false);

    unlockAchievement('added_custom_video');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create dynamic Object URL
    const objectUrl = URL.createObjectURL(file);

    const newVideo: VideoItem = {
      id: `custom-file-${Date.now()}`,
      title: file.name.substring(0, file.name.lastIndexOf('.')) || 'Local Video',
      url: objectUrl,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      description: 'A beautiful local video moment loaded right from your computer. ✨',
      isCustom: true
    };

    const updated = [...playlist, newVideo];
    savePlaylist(updated);
    setCurrentVideo(newVideo);
    localStorage.setItem('hlw_active_video_id', newVideo.id);
    setShowAddForm(false);

    unlockAchievement('added_custom_video');
  };

  const handleDeleteVideo = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = playlist.filter(v => v.id !== id);
    savePlaylist(updated);

    if (currentVideo?.id === id) {
      const nextActive = updated.length > 0 ? updated[0] : null;
      setCurrentVideo(nextActive);
      if (nextActive) {
        localStorage.setItem('hlw_active_video_id', nextActive.id);
      } else {
        localStorage.removeItem('hlw_active_video_id');
      }
    }
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-28 md:pb-8 bg-transparent max-w-6xl mx-auto w-full">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <span className="text-[10px] font-bold text-brand-pink-500 dark:text-brand-pink-300 uppercase tracking-widest bg-brand-pink-100/50 dark:bg-brand-pink-950/40 px-3 py-1 rounded-full border border-brand-pink-200/50 dark:border-brand-pink-500/20 inline-flex items-center gap-1.5 mb-2">
          <FiVideo /> Video Sanctuary
        </span>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-800 dark:text-slate-100 transition-colors">
          Our Special Cinema
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 max-w-md mx-auto">
          Play our precious memories and warm video loops right here in our cozy digital corner.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Main Video Player Frame */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden relative flex flex-col h-full">

            {/* Aspect Video container */}
            <div className="aspect-video bg-black relative flex items-center justify-center">
              {currentVideo ? (
                (() => {
                  const youtubeId = getYoutubeId(currentVideo.url);
                  if (youtubeId) {
                    return (
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={currentVideo.title}
                      />
                    );
                  }
                  return (
                    <video
                      ref={videoPlayerRef}
                      key={currentVideo.id}
                      src={currentVideo.url}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      playsInline
                      controlsList="nodownload"
                    />
                  );
                })()
              ) : (
                <div className="text-center text-slate-400 p-8">
                  <FiVideo size={48} className="mx-auto mb-4 text-slate-500 animate-float" />
                  <p className="font-serif text-lg text-slate-300">Your Theater is Empty</p>
                  <p className="text-xs text-slate-500 mt-1">Upload a video or choose one from the playlist.</p>
                </div>
              )}
            </div>

            {/* Current Video Info Card */}
            {currentVideo && (
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-linear-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/40">
                <div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-brand-violet-600 dark:text-brand-lavender-400 mb-2">
                    <span className="flex items-center gap-1.5"><FiCalendar /> {currentVideo.date}</span>
                    <span className="flex items-center gap-1.5"><FiClock /> Video Moment</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {currentVideo.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed font-light font-sans">
                    {currentVideo.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 pt-6 mt-8 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-brand-pink-500 font-bold"><FiHeart /> Plays directly inline</span>
                  <span>Press play to start romantic loop</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Playlist & Custom Upload Options */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          {/* Playlist Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl p-6 flex flex-col max-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-100">
                Moments Playlist
              </h3>
              <span className="text-[10px] bg-brand-violet-100 dark:bg-brand-violet-950/40 text-brand-violet-700 dark:text-brand-lavender-300 font-bold px-2 py-0.5 rounded-full border border-brand-violet-200/50 dark:border-brand-violet-500/20">
                {playlist.length} Video{playlist.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Video List items */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {playlist.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <p className="text-xs">No videos in playlist yet.</p>
                </div>
              ) : (
                playlist.map((video) => {
                  const isPlaying = currentVideo?.id === video.id;
                  return (
                    <div
                      key={video.id}
                      onClick={() => handleSelectVideo(video)}
                      className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer border transition-all duration-300 group ${isPlaying
                          ? 'bg-brand-violet-500/10 border-brand-violet-500/35 dark:border-brand-violet-500/40'
                          : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Play Thumbnail / Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-sm transition-transform duration-300 group-hover:scale-105 ${isPlaying
                            ? 'bg-linear-to-tr from-brand-violet-600 to-brand-pink-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                          <FiPlay className={isPlaying ? 'animate-pulse' : ''} size={14} fill={isPlaying ? 'currentColor' : 'none'} />
                        </div>

                        {/* Title details */}
                        <div className="min-w-0">
                          <h4 className={`text-xs font-semibold truncate ${isPlaying ? 'text-brand-violet-600 dark:text-brand-lavender-300' : 'text-slate-700 dark:text-slate-250'
                            }`}>
                            {video.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block truncate">
                            {video.date}
                          </span>
                        </div>
                      </div>

                      {/* Custom delete option */}
                      {video.isCustom && (
                        <button
                          onClick={(e) => handleDeleteVideo(e, video.id)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors border-none"
                          title="Delete custom moment"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Collapse Add Trigger */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="mt-4 w-full h-10 rounded-2xl bg-linear-to-r from-brand-violet-600 to-brand-pink-500 hover:from-brand-violet-700 hover:to-brand-pink-600 text-white font-bold text-xs uppercase cursor-pointer shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 border-none"
            >
              {showAddForm ? <FiMinus size={14} /> : <FiPlus size={14} />}
              {showAddForm ? 'Close panel' : 'Add custom video'}
            </button>
          </div>

          {/* Form wrapper */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl p-6 overflow-hidden"
              >
                <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                  <FiFolderPlus className="text-brand-violet-600 dark:text-brand-lavender-400" /> Share video moment
                </h3>

                {/* Option 1: Local File Selector */}
                <div className="mb-5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Option 1: Upload video file
                  </label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-11 rounded-xl border border-dashed border-slate-200 dark:border-white/10 hover:border-brand-violet-500/50 dark:hover:border-brand-violet-500/50 bg-slate-50 dark:bg-slate-950/40 text-slate-500 hover:text-brand-violet-600 dark:text-slate-400 dark:hover:text-brand-lavender-300 font-medium text-xs cursor-pointer transition-colors flex items-center justify-center gap-2 border-none"
                  >
                    <FiFolderPlus size={14} /> Choose local file (*.mp4, *.mov)
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-3 my-4">
                  <span className="w-full h-px bg-slate-100 dark:bg-white/5" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Or</span>
                  <span className="w-full h-px bg-slate-100 dark:bg-white/5" />
                </div>

                {/* Option 2: Paste URL Form */}
                <form onSubmit={handleAddUrlVideo} className="space-y-4">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Option 2: Paste Video URL
                  </label>
                  <div>
                    <input
                      type="text"
                      placeholder="Title of the video..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-brand-violet-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="Direct MP4 URL (https://...)"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-brand-violet-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Describe this sweet moment..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-brand-violet-500 focus:outline-none transition-colors h-16 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-slate-100 hover:bg-brand-violet-500/10 text-slate-700 hover:text-brand-violet-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-brand-violet-500/20 dark:hover:text-brand-lavender-300 font-bold text-xs uppercase cursor-pointer transition-all border-none"
                  >
                    Add link to playlist
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
