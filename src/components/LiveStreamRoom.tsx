import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AnimatedGiftOverlay } from './AnimatedGiftOverlay';
import { PkBattleOverlay } from './PkBattleOverlay';
import { UserBadgeDisplay } from './UserBadges';
import { 
  Heart, 
  Sparkles, 
  Send, 
  Users, 
  Radio, 
  Volume2, 
  VolumeX, 
  Share2, 
  ShieldCheck, 
  Flame,
  Diamond,
  Swords,
  Video,
  Wand2,
  X as CloseIcon,
  Trophy,
  UserPlus,
  Zap,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LOVE_CHAT_LOGO } from '../assets/logo';
import { ScreenRecorderModal } from './ScreenRecorderModal';
import { soundManager } from '../utils/audioEffects';

interface LiveStreamRoomProps {
  onOpenGiftTray: () => void;
  onOpenWallet: () => void;
}

interface FloatingHeart {
  id: number;
  x: number;
  color: string;
}

interface VisualFilter {
  id: string;
  name: string;
  icon: string;
  cssFilter: string;
  overlayGradient?: string;
}

const VISUAL_FILTERS: VisualFilter[] = [
  { id: 'normal', name: 'Normal Stream', icon: '📷', cssFilter: 'none' },
  { id: 'golden', name: 'Golden Aarti', icon: '🪔', cssFilter: 'sepia(0.35) saturate(1.5) brightness(1.08) contrast(1.05)', overlayGradient: 'from-amber-500/15 via-transparent to-yellow-500/10' },
  { id: 'rose', name: 'Rose Devotion', icon: '🌹', cssFilter: 'hue-rotate(325deg) saturate(1.35) brightness(1.05)', overlayGradient: 'from-pink-500/15 via-transparent to-rose-500/10' },
  { id: 'vivid', name: 'Vivid Glow', icon: '✨', cssFilter: 'saturate(1.75) contrast(1.15) brightness(1.05)', overlayGradient: 'from-purple-500/15 via-transparent to-indigo-500/10' },
  { id: 'vintage', name: 'Classic Satsang', icon: '🖤', cssFilter: 'grayscale(1) contrast(1.2) brightness(0.95)' },
  { id: 'dreamy', name: 'Divine Halo', icon: '🌟', cssFilter: 'brightness(1.15) contrast(1.02) saturate(1.25)', overlayGradient: 'from-cyan-500/15 via-transparent to-blue-500/10' },
];

interface LiveActivityItem {
  id: string;
  type: 'gift' | 'follower' | 'milestone';
  icon: string;
  title: string;
  subtitle: string;
  highlightValue?: string;
  bgColor: string;
  borderColor: string;
}

const DEFAULT_ROOM_ACTIVITIES: LiveActivityItem[] = [
  {
    id: 'act_1',
    type: 'milestone',
    icon: '🎉',
    title: 'Stream Milestone Reached!',
    subtitle: 'Crossed 2,500 Concurrent Devotee Viewers',
    highlightValue: '2.5k Viewers',
    bgColor: 'bg-gradient-to-r from-amber-950/80 via-yellow-950/70 to-stone-900',
    borderColor: 'border-amber-400/60'
  },
  {
    id: 'act_2',
    type: 'follower',
    icon: '👤',
    title: 'New Follower Joined',
    subtitle: 'Ananya Sharma started following Puja Official',
    highlightValue: '+1 Follower',
    bgColor: 'bg-gradient-to-r from-pink-950/80 via-rose-950/70 to-stone-900',
    borderColor: 'border-pink-500/60'
  },
  {
    id: 'act_3',
    type: 'gift',
    icon: '🏎️',
    title: 'Virtual Gift Offered!',
    subtitle: 'Rohan Mehta offered Golden Chariot',
    highlightValue: '+250 💎',
    bgColor: 'bg-gradient-to-r from-purple-950/80 via-pink-950/70 to-stone-900',
    borderColor: 'border-purple-400/60'
  },
  {
    id: 'act_4',
    type: 'milestone',
    icon: '🔥',
    title: 'Diamond Leaderboard Rank',
    subtitle: 'Ranked #1 Trending Live Stream Today!',
    highlightValue: '#1 Trending',
    bgColor: 'bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-stone-900',
    borderColor: 'border-amber-400/70'
  }
];

export const LiveStreamRoom: React.FC<LiveStreamRoomProps> = ({ onOpenGiftTray, onOpenWallet }) => {
  const { 
    activeRoom, 
    liveGiftEvents, 
    chatMessages, 
    sendChatMessage, 
    wallet, 
    soundEnabled, 
    toggleSound,
    currentUser 
  } = useApp();

  const [chatInput, setChatInput] = useState<string>('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [pkBattleOpen, setPkBattleOpen] = useState<boolean>(false);
  const [recorderOpen, setRecorderOpen] = useState<boolean>(false);
  const [activeFilterId, setActiveFilterId] = useState<string>('normal');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  // Live Activity Ticker States
  const [activities, setActivities] = useState<LiveActivityItem[]>(DEFAULT_ROOM_ACTIVITIES);
  const [currentTickerIdx, setCurrentTickerIdx] = useState<number>(0);
  const [isActivityExpanded, setIsActivityExpanded] = useState<boolean>(false);

  const activeFilter = VISUAL_FILTERS.find(f => f.id === activeFilterId) || VISUAL_FILTERS[0];
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Sync incoming real-time gifts to ticker
  useEffect(() => {
    if (liveGiftEvents.length > 0) {
      const latestGift = liveGiftEvents[liveGiftEvents.length - 1];
      const newActivity: LiveActivityItem = {
        id: `act_gift_${latestGift.id}`,
        type: 'gift',
        icon: latestGift.giftIcon || '🎁',
        title: `${latestGift.senderName} offered ${latestGift.giftName}!`,
        subtitle: `Recipient: ${latestGift.recipientName}`,
        highlightValue: `+${latestGift.totalDiamonds} 💎`,
        bgColor: 'bg-gradient-to-r from-pink-950/90 via-rose-950/80 to-stone-900',
        borderColor: 'border-pink-400/70'
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 10)]);
      setCurrentTickerIdx(0);
    }
  }, [liveGiftEvents]);

  // Rotate ticker automatically every 4 seconds
  useEffect(() => {
    if (activities.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTickerIdx(prev => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activities]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  const handleHeartReaction = () => {
    const colors = ['#f43f5e', '#ec4899', '#f59e0b', '#fbbf24', '#8b5cf6'];
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x: 60 + (Math.random() - 0.5) * 60,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setFloatingHearts(prev => [...prev.slice(-15), newHeart]);
  };

  const currentRoom = activeRoom || {
    id: 'room_puja_live',
    title: '🕉️ Maha Sandhya Aarti & Bhakti Satsang Live Stream',
    creatorName: 'Puja Official Broadcast',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    viewerCount: 2340,
    totalDiamondsReceived: 18450
  };

  return (
    <div className="relative w-full h-[calc(100vh-125px)] sm:h-[680px] max-w-4xl mx-auto rounded-none sm:rounded-2xl overflow-hidden bg-stone-950 flex flex-col shadow-2xl border border-stone-800">
      
      {/* Visual Live Stream Background (Simulated Aarti Sanctum with Dynamic Visual Filters) */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-stone-900 via-amber-950/60 to-stone-950 transition-all duration-500"
        style={{ filter: activeFilter.cssFilter }}
      >
        {/* Active Filter Overlay Gradient */}
        {activeFilter.overlayGradient && (
          <div className={`absolute inset-0 z-0 bg-gradient-to-tr ${activeFilter.overlayGradient} pointer-events-none transition-all duration-500`} />
        )}
        
        {/* Animated Sacred Backdrop */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-amber-500/30 to-orange-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-yellow-600/20 blur-2xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-orange-600/20 blur-2xl" />
        </div>

        {/* Central Broadcaster Visual Sanctum */}
        <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none select-none">
          
          {/* Glowing Divine Mandala / Aarti Halo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="w-72 sm:w-96 h-72 sm:h-96 rounded-full border border-amber-500/20 flex items-center justify-center opacity-60"
          >
            <div className="w-56 sm:w-72 h-56 sm:h-72 rounded-full border border-dashed border-amber-400/30 flex items-center justify-center">
              <span className="text-8xl sm:text-9xl text-amber-500/20 font-serif">🕉️</span>
            </div>
          </motion.div>

          {/* Broadcaster Camera Simulation Frame */}
          <div className="absolute flex flex-col items-center">
            <div className="relative">
              <img
                src={currentRoom.creatorAvatar}
                alt={currentRoom.creatorName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.6)]"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-red-600 rounded-full border-2 border-stone-950">
                <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
              </div>
            </div>

            <div className="mt-3 px-3.5 py-1 rounded-full bg-black/60 border border-pink-500/40 backdrop-blur-md text-pink-200 font-bold text-xs flex items-center space-x-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span>Love Chat Official Broadcaster</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stream Header (Over video) */}
      <div className="relative z-20 p-3 flex items-center justify-between bg-gradient-to-b from-stone-950/90 via-stone-950/50 to-transparent">
        
        {/* Creator Info & Love Chat Logo Badge */}
        <div className="flex items-center space-x-2">
          {/* Love Chat App Logo Badge */}
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-pink-400/60 shadow-md shrink-0">
            <img src={LOVE_CHAT_LOGO} alt="Love Chat Logo" className="w-full h-full object-cover" />
          </div>

          <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <img
              src={currentRoom.creatorAvatar}
              alt="Creator"
              className="w-7 h-7 rounded-full object-cover border border-pink-400"
            />
            <div className="text-left">
              <div className="font-extrabold text-xs text-pink-100 leading-tight">
                {currentRoom.creatorName}
              </div>
              <div className="text-[10px] text-pink-400/80 font-medium flex items-center space-x-1">
                <span>{currentRoom.totalDiamondsReceived.toLocaleString()} 💎 received</span>
              </div>
            </div>
          </div>
        </div>

        {/* LiveKit & Viewers pill */}
        <div className="flex items-center space-x-2">
          {/* Visual Stream Filter Button */}
          <button
            onClick={() => setShowFilterMenu(prev => !prev)}
            className={`px-2.5 py-1 rounded-full border text-[10px] font-black flex items-center space-x-1 backdrop-blur-md transition shadow-sm ${
              activeFilterId !== 'normal'
                ? 'bg-amber-500/30 border-amber-400 text-amber-300 animate-pulse'
                : 'bg-stone-900/60 border-stone-700 text-stone-300 hover:text-white'
            }`}
            title="Real-time Visual Stream Filters"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">FILTERS</span>
          </button>

          {/* Record Highlight Clip Button */}
          <button
            onClick={() => setRecorderOpen(true)}
            className="px-2.5 py-1 rounded-full bg-pink-600/30 border border-pink-500/50 text-pink-300 hover:bg-pink-600/50 text-[10px] font-black flex items-center space-x-1 backdrop-blur-md transition shadow-sm"
            title="Record Highlight Clip"
          >
            <Video className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden xs:inline">RECORD CLIP</span>
          </button>

          {/* PK Battle trigger button */}
          <button
            onClick={() => setPkBattleOpen(true)}
            className="px-2.5 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 hover:bg-red-600/50 text-[10px] font-black flex items-center space-x-1 backdrop-blur-md transition shadow-sm animate-pulse"
            title="Start PK Battle"
          >
            <Swords className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden xs:inline">PK BATTLE</span>
          </button>

          {/* LiveKit WebRTC Indicator */}
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LiveKit 720p HD</span>
          </div>

          {/* Viewer count */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-bold text-stone-200 backdrop-blur-md">
            <Users className="w-3.5 h-3.5 text-red-400" />
            <span>{currentRoom.viewerCount.toLocaleString()}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-full bg-black/60 border border-white/10 text-stone-300 hover:text-white transition backdrop-blur-md"
            title="Toggle devotional audio effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>
        </div>
      </div>

      {/* Active Filter Indicator Badge on Stream */}
      {activeFilterId !== 'normal' && (
        <div className="absolute top-16 left-3 z-20 px-2.5 py-1 rounded-full bg-black/70 border border-amber-400/50 backdrop-blur-md text-[10px] font-bold text-amber-300 flex items-center space-x-1.5 shadow-md">
          <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
          <span>Effect: {activeFilter.name}</span>
        </div>
      )}

      {/* Real-time Live Activity Ticker Banner */}
      {activities.length > 0 && (
        <div className="absolute top-16 right-3 sm:right-4 z-20 max-w-xs sm:max-w-sm">
          <AnimatePresence mode="wait">
            {(() => {
              const item = activities[currentTickerIdx % activities.length];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -12, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.92 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                  className={`p-2.5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center justify-between space-x-2.5 cursor-pointer transition ${item.bgColor} ${item.borderColor}`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-base shrink-0 shadow-inner">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-black text-stone-100 truncate flex items-center space-x-1">
                        <span>{item.title}</span>
                      </div>
                      <div className="text-[10px] text-stone-300/90 truncate font-medium">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {item.highlightValue && (
                    <span className="px-2 py-0.5 rounded-full bg-black/50 border border-white/20 text-[10px] font-black text-amber-300 shrink-0 shadow-sm">
                      {item.highlightValue}
                    </span>
                  )}
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      )}

      {/* Real-time Visual Filter Selector Carousel */}
      <AnimatePresence>
        {showFilterMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-16 left-3 right-3 z-30 p-3 bg-stone-900/95 border border-amber-500/40 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col space-y-2.5"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-1.5 text-xs font-black text-amber-300">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <span>Real-time Stream Visual Effects & Filters</span>
              </div>
              <button
                onClick={() => setShowFilterMenu(false)}
                className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
              {VISUAL_FILTERS.map((f) => {
                const isSelected = activeFilterId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFilterId(f.id);
                      soundManager.playLotusChime();
                    }}
                    className={`px-3.5 py-2.5 rounded-xl flex items-center space-x-2 text-xs font-bold whitespace-nowrap transition border shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-stone-950 font-black border-amber-300 shadow-lg scale-105'
                        : 'bg-stone-950/70 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{f.icon}</span>
                    <span>{f.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Recorder Modal */}
      <ScreenRecorderModal isOpen={recorderOpen} onClose={() => setRecorderOpen(false)} />

      {/* PK Battle Arena Overlay */}
      <PkBattleOverlay
        isOpen={pkBattleOpen}
        onClose={() => setPkBattleOpen(false)}
        streamerAName={currentRoom.creatorName}
        streamerAAvatar={currentRoom.creatorAvatar}
        streamerBName="Radha Vedic Arts"
        streamerBAvatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        currentRoomId={currentRoom.id}
      />

      {/* Real-time Animated Gift Overlay Component */}
      <AnimatedGiftOverlay events={liveGiftEvents} />

      {/* Floating Hearts Reaction Stream */}
      <div className="pointer-events-none absolute bottom-24 right-4 z-20 w-24 h-64 overflow-hidden">
        <AnimatePresence>
          {floatingHearts.map(heart => (
            <motion.div
              key={heart.id}
              initial={{ y: 0, x: heart.x, opacity: 1, scale: 0.8 }}
              animate={{
                y: -220,
                x: heart.x + (Math.random() - 0.5) * 40,
                opacity: 0,
                scale: [0.8, 1.4, 1]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="absolute bottom-0 text-2xl"
              style={{ color: heart.color }}
            >
              ❤️
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lower Section: Translucent Floating Chat + Controls */}
      <div className="relative z-20 mt-auto p-3 flex flex-col justify-end bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent">
        
        {/* Live Chat Message Feed (floating glass) */}
        <div
          ref={chatScrollRef}
          className="max-h-36 sm:max-h-44 overflow-y-auto space-y-1.5 pr-2 mb-3 no-scrollbar mask-gradient"
        >
          {chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`text-xs px-2.5 py-1.5 rounded-xl max-w-[85%] backdrop-blur-md ${
                msg.giftBanner
                  ? 'bg-gradient-to-r from-amber-950/90 to-yellow-950/80 border border-amber-400/50 text-amber-200'
                  : msg.isBroadcaster
                  ? 'bg-purple-950/80 border border-purple-500/40 text-purple-200'
                  : 'bg-black/55 text-stone-200 border border-white/5'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                {msg.vipLevel && (
                  <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40">
                    VIP {msg.vipLevel}
                  </span>
                )}
                {msg.isBroadcaster && (
                  <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-purple-600 text-white">
                    Broadcaster
                  </span>
                )}
                <span className="font-extrabold text-amber-300/90 text-[11px]">
                  {msg.senderName}:
                </span>
                <span className="text-stone-100 text-[11px] break-words">
                  {msg.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar (Android Optimized Touch Bar) */}
        <div className="flex items-center space-x-2">
          
          {/* Chat Form */}
          <form onSubmit={handleSendChat} className="flex-1 flex items-center relative">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Send devotion or message..."
              className="w-full pl-3.5 pr-10 py-2.5 rounded-full bg-black/60 border border-stone-700/80 text-xs text-stone-100 placeholder-stone-400 focus:outline-hidden focus:border-amber-400 backdrop-blur-md transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Diamond Wallet balance button */}
          <button
            onClick={onOpenWallet}
            className="px-2.5 py-2 rounded-full bg-black/65 border border-cyan-400/40 text-cyan-300 hover:border-cyan-400 text-xs font-bold flex items-center space-x-1 backdrop-blur-md transition shrink-0"
            title="Diamond Balance"
          >
            <Diamond className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
            <span>{(wallet?.diamondBalance ?? 0).toLocaleString()}</span>
          </button>

          {/* Send Gift Primary Button */}
          <button
            onClick={onOpenGiftTray}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-stone-950" />
            <span>Offer Gift</span>
          </button>

          {/* Heart reaction button */}
          <button
            onClick={handleHeartReaction}
            className="p-2.5 rounded-full bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/50 text-pink-400 active:scale-90 transition backdrop-blur-md shrink-0"
            title="Send Love Reaction"
          >
            <Heart className="w-4 h-4 fill-pink-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
