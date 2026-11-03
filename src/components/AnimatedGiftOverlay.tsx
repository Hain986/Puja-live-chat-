import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LiveGiftEvent } from '../types';

interface AnimatedGiftOverlayProps {
  events: LiveGiftEvent[];
}

export const AnimatedGiftOverlay: React.FC<AnimatedGiftOverlayProps> = ({ events }) => {
  const [currentEvent, setCurrentEvent] = useState<LiveGiftEvent | null>(null);

  useEffect(() => {
    if (events.length > 0) {
      const latest = events[events.length - 1];
      setCurrentEvent(latest);
      const timer = setTimeout(() => {
        setCurrentEvent(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [events]);

  if (!currentEvent) return null;

  const renderAnimationContent = () => {
    switch (currentEvent.animationType) {
      case 'diya_glow':
        return (
          <div className="relative flex flex-col items-center justify-center">
            {/* Pulsing divine flame aura */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1.2], opacity: [0.8, 1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute w-56 h-56 rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-400/50 to-orange-500/30 blur-2xl"
            />
            <motion.div
              initial={{ scale: 0, y: 50, rotate: -10 }}
              animate={{ scale: 1.2, y: 0, rotate: 0 }}
              exit={{ scale: 0.5, y: -40, opacity: 0 }}
              className="relative text-8xl filter drop-shadow-[0_0_35px_rgba(255,191,0,0.9)]"
            >
              🪔
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-4 py-1.5 rounded-full bg-black/75 border border-amber-400/60 backdrop-blur-md text-amber-300 font-bold text-sm tracking-wide shadow-lg"
            >
              ✨ Sacred Diya of Hope Glowing ✨
            </motion.div>
          </div>
        );

      case 'lotus_bloom':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: [0, 1.3, 1.1], rotate: [0, 15, 0] }}
              transition={{ duration: 1.2 }}
              className="relative text-8xl filter drop-shadow-[0_0_40px_rgba(244,114,182,0.9)]"
            >
              🪷
            </motion.div>
            {/* Falling divine petals */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: -40, x: (i - 4) * 30 }}
                animate={{
                  y: 120 + Math.random() * 50,
                  x: (i - 4) * 45 + (Math.random() - 0.5) * 40,
                  rotate: Math.random() * 360,
                  opacity: 0
                }}
                transition={{ duration: 2.5, ease: 'easeOut', delay: i * 0.15 }}
                className="absolute text-2xl"
              >
                🌸
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 px-4 py-1.5 rounded-full bg-pink-950/80 border border-pink-400/60 text-pink-200 font-bold text-sm backdrop-blur-md"
            >
              🌸 Sacred Lotus Blooming in Grace 🌸
            </motion.div>
          </div>
        );

      case 'aarti_thali':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
              className="w-48 h-48 rounded-full border-4 border-dashed border-amber-400/80 flex items-center justify-center relative shadow-[0_0_50px_rgba(251,191,36,0.6)]"
            >
              <div className="text-7xl">✨</div>
              <div className="absolute top-2 text-3xl">🪔</div>
              <div className="absolute bottom-2 text-3xl">🪔</div>
              <div className="absolute left-2 text-3xl">🪷</div>
              <div className="absolute right-2 text-3xl">🪷</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 px-4 py-1.5 rounded-full bg-amber-950/90 border border-amber-300 text-amber-200 font-extrabold text-sm"
            >
              🕉️ Maha Aarti Thali Dedicated! 🕉️
            </motion.div>
          </div>
        );

      case 'golden_chariot':
        return (
          <div className="relative w-full flex flex-col items-center justify-center overflow-hidden">
            <motion.div
              initial={{ x: '-120%', scale: 0.8 }}
              animate={{ x: '120%', scale: 1.2 }}
              transition={{ duration: 3.2, ease: 'easeInOut' }}
              className="flex items-center space-x-2 text-8xl filter drop-shadow-[0_0_40px_rgba(255,215,0,0.9)]"
            >
              <span>🛞</span>
              <span className="text-7xl">🐎</span>
              <span className="text-6xl">✨</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-900 font-black text-sm tracking-wider uppercase shadow-2xl"
            >
              ⚜️ Royal Golden Ratha Traversing the Realm! ⚜️
            </motion.div>
          </div>
        );

      case 'divine_crown':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <motion.div
              initial={{ y: -100, scale: 0.3, opacity: 0 }}
              animate={{ y: 0, scale: [1, 1.2, 1], opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="text-9xl filter drop-shadow-[0_0_50px_rgba(234,179,8,1)]"
            >
              👑
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-3 px-5 py-2 rounded-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-stone-950 font-black text-base shadow-2xl border-2 border-white/50"
            >
              🌟 Divine Mukut Conferred! 🌟
            </motion.div>
          </div>
        );

      case 'cosmic_supernova':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 2.2, 1.8], rotate: [0, 720] }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="relative text-9xl filter drop-shadow-[0_0_60px_rgba(168,85,247,1)]"
            >
              🌌
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-extrabold text-base tracking-widest shadow-2xl border border-white/40 animate-pulse"
            >
              ⚡ APEX TRIBUTE: COSMIC SUPERNOVA! ⚡
            </motion.div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1.3, rotate: 0 }}
              className="text-8xl filter drop-shadow-[0_0_35px_rgba(255,215,0,0.8)]"
            >
              {currentEvent.giftIcon || '🎁'}
            </motion.div>
            <div className="mt-3 px-4 py-1.5 rounded-full bg-black/80 text-amber-300 font-bold text-sm">
              {currentEvent.giftName}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center p-4">
      {/* Top Banner Alert */}
      <AnimatePresence>
        <motion.div
          key={currentEvent.id + '_banner'}
          initial={{ y: -50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -40, opacity: 0, scale: 0.9 }}
          className="absolute top-16 mx-auto flex items-center space-x-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-950/95 via-stone-900/95 to-amber-950/95 border border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.4)] backdrop-blur-md"
        >
          <span className="text-2xl animate-bounce">{currentEvent.giftIcon}</span>
          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                VIP {currentEvent.vipLevel}
              </span>
              <span className="text-amber-200 font-bold text-sm">
                {currentEvent.senderName}
              </span>
            </div>
            <span className="text-xs text-stone-300">
              sent <strong className="text-amber-400 font-bold">{currentEvent.quantity}x {currentEvent.giftName}</strong> ({currentEvent.totalDiamonds} 💎)
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main Center Stage Animation */}
      <AnimatePresence>
        <motion.div
          key={currentEvent.id + '_anim'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative"
        >
          {renderAnimationContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
