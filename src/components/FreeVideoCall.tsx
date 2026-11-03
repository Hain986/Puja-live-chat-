import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, User, Sparkles, Heart, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FreeVideoCall: React.FC = () => {
  const { currentUser } = useApp();
  const [callActive, setIsCallActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(25);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [matchFound, setMatchFound] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCall = () => {
    setIsCallActive(true);
    setMatchFound(false);
    setTimeLeft(25);
    
    // Simulate finding a match
    setTimeout(() => {
      setMatchFound(true);
    }, 2000);
  };

  const endCall = () => {
    setIsCallActive(false);
    setMatchFound(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (callActive && matchFound) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endCall();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive, matchFound]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-6 text-stone-100">
      <AnimatePresence mode="wait">
        {!callActive ? (
          <motion.div
            key="start-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center text-center space-y-6 max-w-md w-full"
          >
            <div className="w-24 h-24 rounded-full bg-pink-500/20 flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(244,63,94,0.3)]">
              <Video className="w-12 h-12 text-pink-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black bg-gradient-to-r from-pink-400 to-rose-300 bg-clip-text text-transparent">
                Free 25s Video Call
              </h2>
              <p className="text-sm text-stone-400">
                Instantly connect with a random verified streamer for a quick 25-second meet!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full text-xs">
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant Match</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Free Daily Limit</span>
              </div>
            </div>

            <button
              onClick={startCall}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 font-black text-white shadow-xl shadow-pink-600/20 hover:scale-[1.02] active:scale-95 transition"
            >
              Start Quick Match
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="call-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950 flex flex-col overflow-hidden"
          >
            {/* Remote Video (Mock) */}
            <div className="flex-1 relative bg-stone-900 flex items-center justify-center">
              {!matchFound ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-pink-400 font-bold animate-pulse">Finding a match...</span>
                </div>
              ) : (
                <>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60"
                    alt="Remote User"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold">Anya • Live</span>
                  </div>
                  
                  {/* Hearts Overlay Simulation */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <AnimatePresence>
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 100, x: 200 }}
                          animate={{ opacity: [0, 1, 0], y: -200, x: 180 + Math.random() * 40 }}
                          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                          className="absolute bottom-20 right-10 text-pink-500"
                        >
                          <Heart className="w-8 h-8 fill-pink-500" />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            {/* Local Video (Selfie Mock) */}
            <div className="absolute top-20 right-4 w-28 h-40 rounded-2xl border-2 border-white/20 bg-stone-800 overflow-hidden shadow-2xl z-10">
              {isVideoOff ? (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-stone-600" />
                </div>
              ) : (
                <div className="w-full h-full bg-stone-700 flex items-center justify-center italic text-[10px] text-stone-500">
                  Camera On
                </div>
              )}
            </div>

            {/* Timer Overlay */}
            {matchFound && (
              <div className="absolute top-8 right-0 left-0 flex justify-center z-10">
                <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-pink-500/30 flex items-center space-x-2">
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">Time Left:</span>
                  <span className={`text-xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-bounce' : 'text-white'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="p-8 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-around z-20">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition ${isMuted ? 'bg-red-500' : 'bg-stone-800/80 border border-white/10'}`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={endCall}
                className="p-5 rounded-full bg-red-600 shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-90 transition"
              >
                <PhoneOff className="w-8 h-8 fill-white" />
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-4 rounded-full transition ${isVideoOff ? 'bg-red-500' : 'bg-stone-800/80 border border-white/10'}`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            </div>

            {/* Progress bottom bar */}
            <div className="h-1 bg-stone-900 w-full overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: matchFound ? '0%' : '100%' }}
                transition={{ duration: 25, ease: 'linear' }}
                className="h-full bg-pink-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
