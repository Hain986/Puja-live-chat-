import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Trophy, Flame, Zap, ShieldAlert, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audioEffects';

interface PkBattleOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  streamerAName: string;
  streamerAAvatar: string;
  streamerBName: string;
  streamerBAvatar: string;
  currentRoomId: string;
}

export const PkBattleOverlay: React.FC<PkBattleOverlayProps> = ({
  isOpen,
  onClose,
  streamerAName,
  streamerAAvatar,
  streamerBName,
  streamerBAvatar,
  currentRoomId
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(90); // 90 seconds battle timer
  const [scoreA, setScoreA] = useState<number>(1250);
  const [scoreB, setScoreB] = useState<number>(980);
  const [battleEnded, setBattleEnded] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(90);
      setScoreA(1250);
      setScoreB(980);
      setBattleEnded(false);
      setWinner(null);
      return;
    }

    // Play battle gong / chime sound
    soundManager.playTempleBell();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setBattleEnded(true);
          const finalWinner = scoreA >= scoreB ? streamerAName : streamerBName;
          setWinner(finalWinner);
          soundManager.playCoinChime();
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.4 },
            colors: ['#FFD700', '#FF4500', '#FF1493', '#00FFFF']
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate incoming support gifts during live battle
    const simInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        if (Math.random() > 0.5) {
          setScoreA(prev => prev + Math.floor(Math.random() * 100) + 20);
        } else {
          setScoreB(prev => prev + Math.floor(Math.random() * 100) + 20);
        }
      }
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(simInterval);
    };
  }, [isOpen, scoreA, scoreB, streamerAName, streamerBName]);

  if (!isOpen) return null;

  const totalScore = scoreA + scoreB;
  const percentA = totalScore > 0 ? Math.round((scoreA / totalScore) * 100) : 50;
  const percentB = 100 - percentA;

  return (
    <div className="absolute top-16 left-0 right-0 z-30 px-3 pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="max-w-xl mx-auto rounded-3xl bg-stone-950/90 border-2 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-xl overflow-hidden p-3 text-stone-100 relative"
      >
        {/* PK Header Badge */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-widest flex items-center space-x-1 shadow-lg border border-yellow-300">
          <Swords className="w-3.5 h-3.5 text-stone-950 animate-bounce" />
          <span>PK BATTLE ARENA</span>
        </div>

        <div className="flex items-center justify-between mt-5 mb-3 px-2">
          
          {/* Streamer A */}
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <img src={streamerAAvatar} alt={streamerAName} className="w-11 h-11 rounded-full object-cover border-2 border-pink-500 shadow-md" />
              {scoreA > scoreB && !battleEnded && (
                <span className="absolute -top-1 -right-1 px-1 rounded-full bg-amber-400 text-stone-950 font-black text-[8px]">👑</span>
              )}
            </div>
            <div>
              <div className="font-extrabold text-xs truncate max-w-[100px] sm:max-w-[130px]">{streamerAName}</div>
              <div className="font-black text-sm text-pink-300 tabular-nums">{scoreA.toLocaleString()} 💎</div>
            </div>
          </div>

          {/* Timer / VS */}
          <div className="flex flex-col items-center px-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-black text-xs text-stone-950 shadow-md">
              VS
            </div>
            <div className={`text-xs font-mono font-black mt-1 ${timeLeft <= 10 ? 'text-red-500 animate-ping' : 'text-amber-300'}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>
          </div>

          {/* Streamer B */}
          <div className="flex items-center space-x-2.5 flex-row-reverse text-right">
            <div className="relative">
              <img src={streamerBAvatar} alt={streamerBName} className="w-11 h-11 rounded-full object-cover border-2 border-cyan-500 shadow-md" />
              {scoreB > scoreA && !battleEnded && (
                <span className="absolute -top-1 -left-1 px-1 rounded-full bg-amber-400 text-stone-950 font-black text-[8px]">👑</span>
              )}
            </div>
            <div>
              <div className="font-extrabold text-xs truncate max-w-[100px] sm:max-w-[130px]">{streamerBName}</div>
              <div className="font-black text-sm text-cyan-300 tabular-nums">{scoreB.toLocaleString()} 💎</div>
            </div>
          </div>
        </div>

        {/* Split Progress Bar */}
        <div className="relative h-3.5 bg-stone-900 rounded-full overflow-hidden flex border border-stone-800">
          <motion.div 
            className="h-full bg-gradient-to-r from-pink-600 to-rose-500 transition-all duration-300"
            style={{ width: `${percentA}%` }}
          />
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-300"
            style={{ width: `${percentB}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3 text-[9px] font-black text-white pointer-events-none drop-shadow-md">
            <span>{percentA}%</span>
            <span>{percentB}%</span>
          </div>
        </div>

        {/* Battle Ended Modal / Announcement */}
        <AnimatePresence>
          {battleEnded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-40"
            >
              <Trophy className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
              <h3 className="text-lg font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-pink-300 bg-clip-text text-transparent">
                PK BATTLE VICTORY!
              </h3>
              <p className="text-xs text-stone-300 mt-1 mb-3">
                Winner: <strong className="text-amber-400 text-sm">{winner}</strong> with exceptional supporter gifts!
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 text-stone-950 font-black text-xs shadow-lg active:scale-95 transition"
              >
                Close Arena
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close Button if running */}
        {!battleEnded && (
          <div className="mt-2 text-center">
            <button
              onClick={onClose}
              className="text-[10px] text-stone-500 hover:text-stone-300 font-bold uppercase tracking-wider underline transition"
            >
              Minimize PK Battle
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
