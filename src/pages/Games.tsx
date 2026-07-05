import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievements } from '../context/AchievementsContext';
import { getLoadedPhotos } from '../utils/photoLoader';
import { FiHeart, FiPlay, FiRefreshCw, FiCompass, FiAward, FiGrid } from 'react-icons/fi';
import confetti from 'canvas-confetti';

type GameType = 'catch' | 'puzzle' | 'match' | 'wheel';

export const Games: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameType>('catch');
  const { unlockAchievement, addHearts, collectedHearts } = useAchievements();

  // ----------------------------------------------------
  // HEART CATCH GAME LOGIC
  // ----------------------------------------------------
  const [catchScore, setCatchScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [basketX, setBasketX] = useState(50); // percentage 0-100
  const [fallingHearts, setFallingHearts] = useState<{ id: number; x: number; y: number; speed: number; score: number }[]>([]);
  const catchAreaRef = useRef<HTMLDivElement>(null);
  const heartIdCounter = useRef(0);

  // Handle pointer/mouse dragging for basket
  const handleCatchPointerMove = (e: React.PointerEvent) => {
    if (!gameActive || !catchAreaRef.current) return;
    const rect = catchAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(5, Math.min(95, x)));
  };

  // Falling hearts loop
  useEffect(() => {
    if (!gameActive) return;

    // Spawn hearts
    const spawnInterval = setInterval(() => {
      setFallingHearts(prev => [
        ...prev,
        {
          id: heartIdCounter.current++,
          x: Math.random() * 90 + 5,
          y: -10,
          speed: Math.random() * 4 + 3,
          score: Math.random() > 0.8 ? 5 : 1, // Golden hearts give 5 points
        }
      ]);
    }, 800);

    // Update heart positions
    const physicsInterval = setInterval(() => {
      setFallingHearts(prev => {
        const nextHearts = prev.map(h => ({ ...h, y: h.y + h.speed }));
        
        // Collision detection
        const basketWidth = 15; // wide enough to catch
        const basketYLimit = 90; // y-threshold at bottom
        
        const caught = nextHearts.filter(h => {
          const isAtBasketY = h.y >= basketYLimit && h.y <= basketYLimit + 6;
          const isAtBasketX = Math.abs(h.x - basketX) <= basketWidth / 2;
          return isAtBasketY && isAtBasketX;
        });

        if (caught.length > 0) {
          const pointsEarned = caught.reduce((acc, curr) => acc + curr.score, 0);
          setCatchScore(s => {
            const nextScore = s + pointsEarned;
            addHearts(pointsEarned);
            return nextScore;
          });
          
          // Small spark confetti on catch
          confetti({
            particleCount: 5,
            spread: 20,
            origin: { x: basketX / 100, y: 0.85 },
            colors: ['#f43f5e']
          });
        }

        // Keep hearts that haven't hit the floor and weren't caught
        return nextHearts.filter(h => h.y < 100 && !caught.some(c => c.id === h.id));
      });
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(physicsInterval);
    };
  }, [gameActive, basketX]);

  const startGameCatch = () => {
    setCatchScore(0);
    setFallingHearts([]);
    setGameActive(true);
  };

  const stopGameCatch = () => {
    setGameActive(false);
  };

  // ----------------------------------------------------
  // MEMORY PUZZLE LOGIC (3x3 Sliding Tile)
  // ----------------------------------------------------
  const [puzzleGrid, setPuzzleGrid] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  // Pick a random gallery photo — called on mount AND on every shuffle
  const pickRandomPhoto = () => {
    const loaded = getLoadedPhotos().filter(p => !p.isFallback);
    if (loaded.length > 0) {
      const randomPhoto = loaded[Math.floor(Math.random() * loaded.length)];
      setPhotoUrl(randomPhoto.url);
    }
  };

  useEffect(() => {
    pickRandomPhoto();
  }, []);

  const shufflePuzzle = () => {
    // Pick a fresh random photo on every new game
    pickRandomPhoto();
    let shuffled = [...Array(9).keys()];
    // Perform 200 random valid moves to guarantee solvability
    for (let i = 0; i < 200; i++) {
      const emptyIdx = shuffled.indexOf(8);
      const possibleMoves: number[] = [];
      const row = Math.floor(emptyIdx / 3);
      const col = emptyIdx % 3;
      if (row > 0) possibleMoves.push(emptyIdx - 3);
      if (row < 2) possibleMoves.push(emptyIdx + 3);
      if (col > 0) possibleMoves.push(emptyIdx - 1);
      if (col < 2) possibleMoves.push(emptyIdx + 1);
      const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      [shuffled[emptyIdx], shuffled[move]] = [shuffled[move], shuffled[emptyIdx]];
    }
    setPuzzleGrid(shuffled);
    setPuzzleSolved(false);
  };

  const handleTileClick = (idx: number) => {
    if (puzzleSolved) return;
    const emptyIdx = puzzleGrid.indexOf(8);
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const emptyRow = Math.floor(emptyIdx / 3);
    const emptyCol = emptyIdx % 3;

    // Check if clicked tile is adjacent to empty tile
    const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
                        (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const nextGrid = [...puzzleGrid];
      nextGrid[emptyIdx] = puzzleGrid[idx];
      nextGrid[idx] = 8;
      setPuzzleGrid(nextGrid);

      // Check win condition: tiles ordered 0-8
      const isCorrect = nextGrid.every((val, i) => val === i);
      if (isCorrect) {
        setPuzzleSolved(true);
        unlockAchievement('completed_puzzle');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  // ----------------------------------------------------
  // MEMORY MATCHING GAME LOGIC (Pairs)
  // ----------------------------------------------------
  const memoryIcons = ['💖', '🧸', '🌹', '🍫', '✨', '👑'];
  const [matchCards, setMatchCards] = useState<{ id: number; icon: string; matched: boolean; flipped: boolean }[]>([]);
  const [selectedMatchIndices, setSelectedMatchIndices] = useState<number[]>([]);
  const [matchSolved, setMatchSolved] = useState(false);

  const initMatchGame = () => {
    // Generate matched pairs
    const doubleIcons = [...memoryIcons, ...memoryIcons];
    // Shuffle
    const shuffled = doubleIcons
      .map((icon, index) => ({ id: index, icon, matched: false, flipped: false }))
      .sort(() => Math.random() - 0.5);

    setMatchCards(shuffled);
    setSelectedMatchIndices([]);
    setMatchSolved(false);
  };

  const handleMatchCardClick = (idx: number) => {
    if (matchCards[idx].matched || matchCards[idx].flipped || selectedMatchIndices.length >= 2) return;

    // Flip card
    const updatedCards = [...matchCards];
    updatedCards[idx].flipped = true;
    setMatchCards(updatedCards);

    const nextSelected = [...selectedMatchIndices, idx];
    setSelectedMatchIndices(nextSelected);

    if (nextSelected.length === 2) {
      const [firstIdx, secondIdx] = nextSelected;
      if (matchCards[firstIdx].icon === matchCards[secondIdx].icon) {
        // MATCH FOUND
        setTimeout(() => {
          const finalCards = [...matchCards];
          finalCards[firstIdx].matched = true;
          finalCards[secondIdx].matched = true;
          setMatchCards(finalCards);
          setSelectedMatchIndices([]);

          // Check if all matched
          if (finalCards.every(c => c.matched)) {
            setMatchSolved(true);
            confetti({ particleCount: 60, spread: 50, colors: ['#f43f5e', '#d8b4fe'] });
          }
        }, 600);
      } else {
        // NO MATCH - FLIP BACK
        setTimeout(() => {
          const finalCards = [...matchCards];
          finalCards[firstIdx].flipped = false;
          finalCards[secondIdx].flipped = false;
          setMatchCards(finalCards);
          setSelectedMatchIndices([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (activeGame === 'match') {
      initMatchGame();
    }
  }, [activeGame]);

  // ----------------------------------------------------
  // SPIN THE WHEEL LOGIC (Compliments)
  // ----------------------------------------------------
  const complimentsList = [
    'You make my heart melt like chocolate 🍫',
    'Your eyes hold a universe of magic ✨',
    'You are absolute perfection, inside and out 👑',
    'Your laughter is the sweetest music to my ears 🎶',
    'I love the warm, cozy feeling of your hugs 🤗',
    'You make the entire world feel lighter and brighter ☀️',
    'You are my absolute favorite view 🌅',
    'You are incredibly smart, capable, and beautiful 🌸'
  ];
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [complimentResult, setComplimentResult] = useState<string | null>(null);

  const spinTheWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setComplimentResult(null);

    // Spin at least 5 full rotations (1800 deg) plus a random slice
    const randomDegree = Math.floor(Math.random() * 360);
    const targetRotation = wheelRotation + 1800 + randomDegree;
    
    setWheelRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      // Calculate landing index (wheel turns clockwise, pointer is at top/0 degrees)
      const normalizedDegree = (360 - (targetRotation % 360)) % 360;
      const sliceSize = 360 / complimentsList.length;
      const landingIdx = Math.floor(normalizedDegree / sliceSize);
      
      setComplimentResult(complimentsList[landingIdx]);
      
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#fda4af', '#fecdd6', '#fff0f2']
      });
    }, 2000); // matches Framer Motion spin transition time
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-28 md:pb-8 bg-transparent">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-800 dark:text-slate-100 transition-colors">
          Play Zone ❤️
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold transition-colors">
          Unlock smiles, solve puzzles, and collect hearts!
        </p>
      </motion.div>

      {/* Game Selector Tabs */}
      <div className="flex justify-start md:justify-center overflow-x-auto no-scrollbar gap-2 mb-8 py-2 px-1 max-w-4xl mx-auto">
        <button
          onClick={() => { setActiveGame('catch'); stopGameCatch(); }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer border transition-all ${
            activeGame === 'catch'
              ? 'bg-brand-violet-600 dark:bg-brand-lavender-500 border-transparent text-white shadow-md'
              : 'bg-white/60 dark:bg-slate-900/50 border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/95 dark:hover:bg-slate-900/80'
          }`}
        >
          <FiHeart /> Heart Catch
        </button>
        <button
          onClick={() => { setActiveGame('puzzle'); stopGameCatch(); }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer border transition-all ${
            activeGame === 'puzzle'
              ? 'bg-brand-violet-600 dark:bg-brand-lavender-500 border-transparent text-white shadow-md'
              : 'bg-white/60 dark:bg-slate-900/50 border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/95 dark:hover:bg-slate-900/80'
          }`}
        >
          <FiGrid /> Photo Slide Puzzle
        </button>
        <button
          onClick={() => { setActiveGame('match'); stopGameCatch(); }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer border transition-all ${
            activeGame === 'match'
              ? 'bg-brand-violet-600 dark:bg-brand-lavender-500 border-transparent text-white shadow-md'
              : 'bg-white/60 dark:bg-slate-900/50 border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/95 dark:hover:bg-slate-900/80'
          }`}
        >
          <FiAward /> Memory Match
        </button>
        <button
          onClick={() => { setActiveGame('wheel'); stopGameCatch(); }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer border transition-all ${
            activeGame === 'wheel'
              ? 'bg-brand-violet-600 dark:bg-brand-lavender-500 border-transparent text-white shadow-md'
              : 'bg-white/60 dark:bg-slate-900/50 border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/95 dark:hover:bg-slate-900/80'
          }`}
        >
          <FiCompass /> Spin Compliments
        </button>
      </div>

      {/* ACTIVE GAME CANVAS CONTAINER */}
      <div className="max-w-md mx-auto z-10 relative">
        <AnimatePresence mode="wait">
          {/* HEART CATCH GAME */}
          {activeGame === 'catch' && (
            <motion.div
              key="catch-game"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100">Heart Catcher</h3>
                <span className="text-xs font-semibold text-brand-pink-500 bg-brand-pink-100 dark:bg-brand-pink-950/40 px-3 py-1 rounded-full border border-brand-pink-200 dark:border-brand-pink-900/20">
                  Caught: {catchScore} | Total: {collectedHearts}
                </span>
              </div>

              {/* Catching Arcade Screen */}
              <div
                ref={catchAreaRef}
                onPointerMove={handleCatchPointerMove}
                className="w-full h-80 bg-linear-to-b from-brand-pink-50/50 to-brand-lavender-50/50 dark:from-slate-900/40 dark:to-slate-950/40 rounded-2xl relative overflow-hidden touch-none border border-slate-100 dark:border-white/5 cursor-crosshair select-none"
              >
                {gameActive ? (
                  <>
                    {/* Render falling hearts */}
                    {fallingHearts.map(h => (
                      <div
                        key={h.id}
                        style={{
                          left: `${h.x}%`,
                          top: `${h.y}%`,
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 text-2xl transition-all duration-75 select-none ${
                          h.score > 1 ? 'text-amber-400 animate-pulse drop-shadow-md' : 'text-brand-pink-500'
                        }`}
                      >
                        ❤️
                      </div>
                    ))}

                    {/* Basket / Collector plate */}
                    <div
                      style={{ left: `${basketX}%` }}
                      className="absolute bottom-4 -translate-x-1/2 w-16 h-8 bg-linear-to-r from-brand-violet-600 to-brand-pink-500 dark:from-brand-violet-500 dark:to-brand-pink-400 rounded-b-xl rounded-t-sm flex items-center justify-center text-white text-sm font-bold shadow-md pointer-events-none select-none transition-all duration-75"
                    >
                      🧺
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs font-medium">
                      Drag or slide your basket to catch falling hearts! Catching golden glowing hearts gives 5 points!
                    </p>
                    <button
                      onClick={startGameCatch}
                      className="mt-6 px-6 h-11 rounded-full bg-brand-violet-600 dark:bg-brand-lavender-500 text-white font-bold flex items-center gap-2 shadow-md hover:scale-103 active:scale-97 cursor-pointer transition-all"
                    >
                      <FiPlay /> Start Catching
                    </button>
                  </div>
                )}
              </div>

              {gameActive && (
                <button
                  onClick={stopGameCatch}
                  className="mt-4 px-4 py-2 border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold cursor-pointer text-center transition-colors"
                >
                  Pause Game
                </button>
              )}
            </motion.div>
          )}

          {/* SLIDING PIECE PUZZLE */}
          {activeGame === 'puzzle' && (
            <motion.div
              key="puzzle-game"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl relative flex flex-col items-center"
            >
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">Slide to Assemble</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-5 font-medium text-center">
                Tap adjacent tiles to slide them into the empty space. Complete the picture!
              </p>

              {/* Photo preview thumbnail */}
              {photoUrl && (
                <div className="mb-4 flex items-center gap-3">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Reference:</div>
                  <img
                    src={photoUrl}
                    alt="puzzle reference"
                    className="w-14 h-14 object-cover rounded-lg shadow border border-white/40 dark:border-white/10"
                  />
                </div>
              )}

              {/* 3x3 Puzzle Grid */}
              <div className="grid grid-cols-3 gap-0.5 bg-slate-300 dark:bg-slate-700 p-0.5 rounded-xl shadow-inner border-2 border-slate-200 dark:border-white/10"
                style={{ width: 300, height: 300 }}
              >
                {puzzleGrid.map((tileVal, idx) => {
                  if (tileVal === 8) {
                    return (
                      <div
                        key="empty"
                        className="bg-slate-100 dark:bg-slate-900 rounded-sm"
                        style={{ width: '100%', height: '100%' }}
                      />
                    );
                  }

                  // Correct row/col for this tile value in the solved state
                  const tileRow = Math.floor(tileVal / 3);
                  const tileCol = tileVal % 3;

                  return (
                    <motion.div
                      layout
                      key={tileVal}
                      onClick={() => handleTileClick(idx)}
                      className="cursor-pointer active:scale-95 transition-transform rounded-sm overflow-hidden relative"
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
                        backgroundSize: '300% 300%',
                        backgroundPosition: `${tileCol * 50}% ${tileRow * 50}%`,
                        backgroundRepeat: 'no-repeat',
                      }}
                    >
                      <span className="absolute bottom-0.5 right-0.5 text-[7px] text-white/40 font-bold select-none">{tileVal + 1}</span>
                    </motion.div>
                  );
                })}
              </div>

              {puzzleSolved ? (
                <div className="mt-6 text-center">
                  <h4 className="font-serif font-bold text-brand-pink-500 dark:text-brand-pink-400 animate-pulse text-base">
                    ✨ Outstanding! You did it! ✨
                  </h4>
                  <button
                    onClick={shufflePuzzle}
                    className="mt-3 px-5 py-2 rounded-full bg-brand-pink-100 dark:bg-brand-pink-950/40 text-brand-pink-600 dark:text-brand-pink-300 font-bold border border-brand-pink-200 dark:border-brand-pink-900/20 text-xs flex items-center gap-1.5 hover:bg-brand-pink-200 dark:hover:bg-brand-pink-900/60 cursor-pointer transition-colors"
                  >
                    <FiRefreshCw /> New Puzzle
                  </button>
                </div>
              ) : (
                <button
                  onClick={shufflePuzzle}
                  className="mt-6 px-6 h-10 rounded-full bg-brand-violet-600 dark:bg-brand-lavender-500 text-white font-bold flex items-center gap-1.5 shadow-md hover:scale-103 active:scale-97 cursor-pointer transition-all text-xs border-none"
                >
                  <FiRefreshCw /> Shuffle & New Pic
                </button>
              )}
            </motion.div>
          )}

          {/* MEMORY CARD MATCH */}
          {activeGame === 'match' && (
            <motion.div
              key="match-game"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl relative flex flex-col items-center"
            >
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Memory Match</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 font-medium text-center">
                Match all romantic pairs to clear the board!
              </p>

              {/* Pairs Grid */}
              <div className="grid grid-cols-4 gap-3 w-72 mt-2">
                {matchCards.map((card, idx) => {
                  const isOpen = card.flipped || card.matched;
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleMatchCardClick(idx)}
                      className="aspect-square perspective-1000 cursor-pointer select-none"
                    >
                      <motion.div
                        animate={{ rotateY: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full transform-style-3d relative shadow-md rounded-xl border border-white/50 dark:border-white/10"
                      >
                        {/* BACK OF CARD (Hidden default) */}
                        <div className="absolute inset-0 backface-hidden bg-slate-100 dark:bg-slate-950 rounded-xl border border-brand-violet-200 dark:border-brand-violet-600/30 flex items-center justify-center text-brand-violet-500 dark:text-brand-lavender-300 text-xl font-bold">
                          💜
                        </div>

                        {/* FRONT OF CARD (Flipped/Matched state) */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-linear-to-br from-brand-pink-50 to-brand-lavender-50 dark:from-slate-800 dark:to-slate-900 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-brand-pink-200 dark:border-white/10">
                          {card.icon}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              {matchSolved && (
                <div className="mt-6 text-center">
                  <h4 className="font-serif font-bold text-brand-pink-500 dark:text-brand-pink-400 text-base">
                    Matching complete! You win! ❤️
                  </h4>
                  <button
                    onClick={initMatchGame}
                    className="mt-3 px-5 py-2 rounded-full bg-brand-pink-100 dark:bg-brand-pink-950/40 text-brand-pink-600 dark:text-brand-pink-300 font-bold border border-brand-pink-200 dark:border-brand-pink-900/20 text-xs flex items-center gap-1.5 hover:bg-brand-pink-200 dark:hover:bg-brand-pink-900/60 cursor-pointer transition-colors"
                  >
                    <FiRefreshCw /> Play Again
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* SPIN THE COMPLIMENT WHEEL */}
          {activeGame === 'wheel' && (
            <motion.div
              key="wheel-game"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl relative flex flex-col items-center"
            >
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Spin Compliments</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-6 font-medium text-center">
                Need a pick-me-up? Spin the wheel for a guaranteed heart-warming truth.
              </p>

              {/* Interactive Spinning Wheel */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Pointer marker */}
                <div className="absolute top-0 z-40 text-2xl text-brand-pink-500 pointer-events-none filter drop-shadow-md">
                  ▼
                </div>

                <motion.div
                  animate={{ rotate: wheelRotation }}
                  transition={isSpinning ? { duration: 2, ease: [0.15, 0.85, 0.2, 1] } : { duration: 0.1 }}
                  className="w-60 h-60 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center bg-linear-to-tr from-brand-pink-100 to-brand-lavender-100 dark:from-slate-900 dark:to-slate-950 cursor-pointer"
                  onClick={spinTheWheel}
                >
                  {/* Wheel lines separator */}
                  {complimentsList.map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        transform: `rotate(${i * (360 / complimentsList.length)}deg)`,
                      }}
                    >
                      {/* Divider segment line */}
                      <div className="w-[1.5px] h-1/2 bg-white/60 dark:bg-white/10 mx-auto transform origin-bottom" />
                      
                      {/* Little emojis at outer edge */}
                      <div className="text-[10px] text-slate-500 font-bold absolute top-3 left-1/2 -translate-x-1/2">
                        🌟
                      </div>
                    </div>
                  ))}

                  {/* Center spin lock core */}
                  <div className="absolute w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-brand-pink-300 dark:border-white/10 z-30 shadow-lg flex items-center justify-center text-xs">
                    ❤️
                  </div>
                </motion.div>
              </div>

              {complimentResult && (
                <div className="mt-6 text-center bg-white/50 dark:bg-slate-900/50 border border-white dark:border-white/5 p-4 rounded-2xl max-w-xs shadow-xs animate-fade-in">
                  <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-sm">The Wheel Says:</h4>
                  <p className="text-brand-violet-600 dark:text-brand-lavender-300 text-sm font-medium italic mt-2 leading-relaxed">
                    "{complimentResult}"
                  </p>
                </div>
              )}

              <button
                onClick={spinTheWheel}
                disabled={isSpinning}
                className={`mt-6 px-8 h-11 rounded-full font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all text-xs border-none ${
                  isSpinning
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none'
                    : 'bg-brand-violet-600 dark:bg-brand-lavender-500 text-white hover:scale-103 active:scale-97'
                }`}
              >
                {isSpinning ? 'Spinning Ambiance...' : 'Spin the Wheel! 🚀'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
