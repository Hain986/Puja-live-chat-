import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LOVE_CHAT_LOGO } from '../assets/logo';
import { Sparkles, Maximize2, Radio, Heart, Diamond, ArrowRight, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/audioEffects';

interface SplashScreenProps {
  isOpen: boolean;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isOpen, onFinish }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    soundManager.playLotusChime();

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 400);
          return 100;
        }
        return prev + 12;
      });
    }, 140);

    return () => clearInterval(interval);
  }, [isOpen, onFinish]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-stone-950 via-pink-950/40 to-stone-950 text-stone-100 overflow-hidden"
      >
        {/* Animated Background Glow Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pink-600/20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-rose-600/15 blur-[90px]" />
          <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-amber-500/15 blur-[90px]" />
        </div>

        {/* Top Controls Bar */}
        <div className="w-full max-w-md flex items-center justify-between z-10">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/30 text-pink-300 text-xs font-bold backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>LOVE CHAT LIVE</span>
          </div>

          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-full bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-white transition backdrop-blur-md"
            title="Toggle Full Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Center Logo Pic & App Title */}
        <div className="flex flex-col items-center justify-center text-center z-10 my-auto">
          {/* Logo Picture with Glow Frame */}
          <motion.div
            initial={{ scale: 0.6, rotate: -6 }}
            animate={{ scale: [0.6, 1.08, 1], rotate: [0, 4, 0] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative p-1.5 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 shadow-[0_0_60px_rgba(244,63,94,0.5)]"
          >
            <img
              src={LOVE_CHAT_LOGO}
              alt="Love Chat Official Logo"
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-[22px] object-cover shadow-2xl"
            />
            
            {/* Sparkling badges around logo */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-pink-600 text-white shadow-lg border border-pink-300"
            >
              <Heart className="w-4 h-4 fill-white" />
            </motion.div>
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="absolute -bottom-2 -left-2 p-1.5 rounded-full bg-cyan-600 text-white shadow-lg border border-cyan-300"
            >
              <Diamond className="w-4 h-4 fill-white" />
            </motion.div>
          </motion.div>

          {/* Title and Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-pink-400 via-rose-200 to-amber-200 bg-clip-text text-transparent filter drop-shadow-md">
              LOVE CHAT
            </h1>
            <p className="text-xs sm:text-sm text-pink-200/80 font-medium mt-1.5 max-w-xs">
              Live Social Streaming & Virtual Diamond Economy
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="w-48 sm:w-64 h-1.5 bg-stone-800 rounded-full mt-6 overflow-hidden border border-pink-500/20">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-400 mt-2 font-mono">
            {progress < 100 ? 'Starting Live Audio/Video Stream...' : 'Welcome to Love Chat!'}
          </span>
        </div>

        {/* Bottom CTA / Enter Button */}
        <div className="w-full max-w-sm flex flex-col items-center space-y-3 z-10">
          <button
            onClick={onFinish}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-stone-950 font-black text-sm flex items-center justify-center space-x-2 shadow-xl shadow-pink-600/30 active:scale-98 transition"
          >
            <span>Enter Love Chat Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
            <span>Secure Server-Authoritative Diamond Ledger</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
