import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Heart, 
  Video, 
  Search, 
  X as ClearIcon, 
  UserPlus, 
  UserCheck, 
  Bell, 
  Check, 
  Radio, 
  Gift, 
  X as CloseIcon,
  BadgeCheck,
  Crown,
  Diamond,
  Trophy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/audioEffects';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Creator {
  id: string;
  name: string;
  category: string;
  viewers: string;
  followers: number;
  image: string;
  bio: string;
  isFollowing?: boolean;
}

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  avatar?: string;
  type: 'follow' | 'follower' | 'like';
}

interface TopCreator {
  rank: number;
  id: string;
  name: string;
  category: string;
  giftEarningsDiamonds: number;
  image: string;
  badge: 'gold' | 'silver' | 'bronze' | 'none';
  badgeLabel: string;
}

const TOP_CREATORS_LEADERBOARD: TopCreator[] = [
  {
    rank: 1,
    id: 'creator_priya',
    name: 'Priya Patel',
    category: 'Dance & Art',
    giftEarningsDiamonds: 98400,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60',
    badge: 'gold',
    badgeLabel: '🥇 Gold #1'
  },
  {
    rank: 2,
    id: 'creator_sana',
    name: 'Sana Verma',
    category: 'Music & Bhakti',
    giftEarningsDiamonds: 74200,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60',
    badge: 'silver',
    badgeLabel: '🥈 Silver #2'
  },
  {
    rank: 3,
    id: 'creator_amit',
    name: 'Amit Joshi',
    category: 'Vedic Astrology',
    giftEarningsDiamonds: 52100,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60',
    badge: 'bronze',
    badgeLabel: '🥉 Bronze #3'
  },
  {
    rank: 4,
    id: 'creator_puja',
    name: 'Puja Official',
    category: 'Aarti & Satsang',
    giftEarningsDiamonds: 38900,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    badge: 'none',
    badgeLabel: 'Rank #4'
  },
  {
    rank: 5,
    id: 'creator_rahul',
    name: 'Rahul Sharma',
    category: 'Talk & Satsang',
    giftEarningsDiamonds: 29500,
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60',
    badge: 'none',
    badgeLabel: 'Rank #5'
  }
];

export const NewExplore: React.FC = () => {
  const { highlightClips, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toast, setToast] = useState<ToastAlert | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const [creators, setCreators] = useState<Creator[]>([
    { 
      id: 'creator_sana', 
      name: 'Sana Verma', 
      category: 'Music & Bhakti', 
      viewers: '1.2k', 
      followers: 12450, 
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60',
      bio: 'Devotional singer & Sandhya Kirtan host | Daily live satsang ✨',
      isFollowing: false 
    },
    { 
      id: 'creator_rahul', 
      name: 'Rahul Sharma', 
      category: 'Talk & Satsang', 
      viewers: '850', 
      followers: 8900, 
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60',
      bio: 'Vedic Philosophy & Mindfulness Coach | Inspiring youth 🙏',
      isFollowing: false 
    },
    { 
      id: 'creator_priya', 
      name: 'Priya Patel', 
      category: 'Dance & Art', 
      viewers: '3.4k', 
      followers: 24100, 
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60',
      bio: 'Classical Bharatanatyam dancer & Sacred Art practitioner 🌸',
      isFollowing: false 
    },
    { 
      id: 'creator_amit', 
      name: 'Amit Joshi', 
      category: 'Vedic Astrology', 
      viewers: '2.1k', 
      followers: 15300, 
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60',
      bio: 'Jyotish Acharya & Kundali Advisor | Real-time horoscope streams 🔮',
      isFollowing: false 
    },
  ]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (alert: ToastAlert) => {
    setToast(alert);
    soundManager.playLotusChime();
  };

  const handleToggleFollow = async (e: React.MouseEvent, creator: Creator) => {
    e.stopPropagation(); // prevent opening profile modal if clicking follow button directly
    const nextFollowingState = !creator.isFollowing;

    // Update local creator state
    setCreators(prev => prev.map(c => {
      if (c.id === creator.id) {
        return {
          ...c,
          isFollowing: nextFollowingState,
          followers: nextFollowingState ? c.followers + 1 : c.followers - 1
        };
      }
      return c;
    }));

    if (selectedCreator && selectedCreator.id === creator.id) {
      setSelectedCreator({
        ...selectedCreator,
        isFollowing: nextFollowingState,
        followers: nextFollowingState ? selectedCreator.followers + 1 : selectedCreator.followers - 1
      });
    }

    if (nextFollowingState) {
      // Trigger Toast notification
      showToast({
        id: `toast_${Date.now()}`,
        title: 'New Follower Alert! 🎉',
        message: `You followed ${creator.name}. You'll now get live updates!`,
        avatar: creator.image,
        type: 'follow'
      });

      // Save real-time Firestore notification for creator
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: creator.id,
          type: 'message',
          title: 'New Follower Alert! 👤',
          message: `${currentUser.displayName || 'A user'} started following your profile.`,
          senderId: currentUser.uid,
          senderName: currentUser.displayName || 'Devotee',
          isRead: false,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error('Failed to create follower notification in Firestore:', err);
      }
    } else {
      showToast({
        id: `toast_${Date.now()}`,
        title: 'Unfollowed Profile',
        message: `Unfollowed ${creator.name}.`,
        avatar: creator.image,
        type: 'follow'
      });
    }
  };

  const handleSimulateIncomingFollower = async () => {
    const mockNames = ['Ananya Sharma', 'Rohan Mehta', 'Vikram Singh', 'Neha Kulkarni', 'Kavita Roy'];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const mockAvatar = `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 100000)}?w=100&auto=format&fit=crop&q=80`;

    showToast({
      id: `toast_inc_${Date.now()}`,
      title: 'User Followed You! 🔔',
      message: `${randomName} is now following your broadcasts!`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      type: 'follower'
    });

    try {
      await addDoc(collection(db, 'notifications'), {
        userId: currentUser.uid,
        type: 'message',
        title: 'New Follower Alert! 👤',
        message: `${randomName} started following your profile.`,
        senderName: randomName,
        isRead: false,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to write simulation to Firestore:', err);
    }
  };

  const filteredCreators = creators.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                            (selectedCategory === 'Trending' && parseInt(c.viewers) > 1) ||
                            c.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const filteredClips = highlightClips.filter(clip => 
    clip.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clip.caption.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-8 pb-20 relative">
      
      {/* Toast Notification Banner System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-stone-900/95 border border-pink-500/50 rounded-2xl shadow-2xl backdrop-blur-xl p-3.5 flex items-center justify-between text-stone-100"
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img 
                  src={toast.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                  alt="Toast Avatar" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-pink-500 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-pink-600 text-white">
                  <UserCheck className="w-3 h-3" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-xs text-pink-300 flex items-center space-x-1">
                  <span>{toast.title}</span>
                </h4>
                <p className="text-xs text-stone-200 truncate mt-0.5">{toast.message}</p>
              </div>
            </div>
            <button 
              onClick={() => setToast(null)} 
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition shrink-0 ml-2"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Demo Simulator */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-pink-500" />
          <span>What's New & Explore</span>
        </h2>
        
        {/* Simulate New Follower Button */}
        <button
          onClick={handleSimulateIncomingFollower}
          className="px-3 py-1.5 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-300 hover:bg-pink-500/30 text-xs font-bold flex items-center space-x-1.5 transition active:scale-95"
          title="Simulate incoming follower alert"
        >
          <Bell className="w-3.5 h-3.5 text-pink-400 animate-bounce" />
          <span className="hidden sm:inline">Test Follower Alert</span>
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search favorite creators by username or category..."
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-500 text-sm focus:border-pink-500/60 outline-none shadow-lg transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <ClearIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
        {['All', 'Trending', 'Music & Bhakti', 'Talk & Satsang', 'Dance & Art', 'Vedic Astrology'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Top Creators Leaderboard Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-stone-400 text-xs font-bold uppercase tracking-widest">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Top Creators (Recent Gift Earnings)</span>
          </div>
          <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            🏆 Weekly Leaderboard
          </span>
        </div>

        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-3 pt-1">
          {TOP_CREATORS_LEADERBOARD.map((tc) => {
            const isGold = tc.badge === 'gold';
            const isSilver = tc.badge === 'silver';
            const isBronze = tc.badge === 'bronze';

            return (
              <motion.div
                key={tc.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => {
                  const matched = creators.find(c => c.id === tc.id) || {
                    id: tc.id,
                    name: tc.name,
                    category: tc.category,
                    viewers: '2.5k',
                    followers: 18000,
                    image: tc.image,
                    bio: `Top Ranked Creator #${tc.rank} in Recent Gift Earnings! 💎`,
                    isFollowing: false
                  };
                  setSelectedCreator(matched);
                }}
                className={`relative min-w-[165px] w-[165px] rounded-3xl p-4 flex flex-col items-center text-center cursor-pointer transition shadow-xl shrink-0 border ${
                  isGold
                    ? 'bg-gradient-to-b from-amber-950/80 via-stone-900 to-stone-950 border-amber-400/60 shadow-amber-500/10 hover:border-amber-400'
                    : isSilver
                    ? 'bg-gradient-to-b from-slate-900/90 via-stone-900 to-stone-950 border-slate-300/50 shadow-slate-400/10 hover:border-slate-200'
                    : isBronze
                    ? 'bg-gradient-to-b from-amber-950/40 via-stone-900 to-stone-950 border-amber-700/50 shadow-amber-700/10 hover:border-amber-500'
                    : 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
                }`}
              >
                {/* Rank Badge Header Pill */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border shadow-md ${
                    isGold
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 border-amber-300'
                      : isSilver
                      ? 'bg-gradient-to-r from-slate-300 to-stone-200 text-stone-950 border-slate-100'
                      : isBronze
                      ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white border-amber-500'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}>
                    {tc.badgeLabel}
                  </span>
                </div>

                {/* Avatar with Crown/Rank Border */}
                <div className="relative mt-5 mb-2.5">
                  <img
                    src={tc.image}
                    alt={tc.name}
                    className={`w-16 h-16 rounded-full object-cover border-2 shadow-lg ${
                      isGold
                        ? 'border-amber-400 shadow-amber-500/30'
                        : isSilver
                        ? 'border-slate-300 shadow-slate-300/20'
                        : isBronze
                        ? 'border-amber-600 shadow-amber-600/20'
                        : 'border-stone-700'
                    }`}
                  />
                  {isGold && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 p-1 rounded-full bg-amber-500 text-stone-950 shadow-lg">
                      <Crown className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                    </div>
                  )}
                </div>

                {/* Creator Name & Category */}
                <div className="w-full truncate font-black text-xs text-white flex items-center justify-center space-x-1">
                  <span className="truncate">{tc.name}</span>
                  <BadgeCheck className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                </div>
                <div className="text-[10px] font-bold text-pink-400/90 truncate w-full mt-0.5">{tc.category}</div>

                {/* Gift Earnings Diamond Pill */}
                <div className="mt-3 px-2.5 py-1 rounded-full bg-stone-950/80 border border-amber-500/30 text-[10px] font-black text-amber-300 flex items-center space-x-1 shadow-inner">
                  <Diamond className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{tc.giftEarningsDiamonds.toLocaleString()} 💎</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recorded Highlight Clips Feed */}
      {filteredClips.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-stone-400 text-xs font-bold uppercase tracking-widest">
            <Video className="w-4 h-4 text-pink-500" />
            <span>Highlight Clips ({filteredClips.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredClips.map((clip) => (
              <motion.div
                key={clip.id}
                whileHover={{ scale: 1.01 }}
                className="rounded-3xl bg-stone-900 border border-stone-800 overflow-hidden shadow-xl flex flex-col"
              >
                <div className="relative aspect-video bg-black">
                  <video src={clip.videoUrl} controls className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 border border-pink-500/40 backdrop-blur-md text-[10px] font-black text-pink-300 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    <span>Highlight Clip</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <img src={clip.creatorAvatar} alt={clip.creatorName} className="w-10 h-10 rounded-full object-cover border border-pink-500" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-stone-100 truncate">{clip.creatorName}</h4>
                      <p className="text-[10px] text-stone-400">{clip.timestamp}</p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 font-medium">{clip.caption}</p>

                  <div className="pt-3 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
                    <button className="flex items-center space-x-1 hover:text-pink-400 transition">
                      <Heart className="w-4 h-4 text-pink-500 fill-pink-500/20" />
                      <span className="font-bold">{clip.likesCount || 0} Likes</span>
                    </button>
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Love Chat Feed</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Broadcasters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-stone-400 text-xs font-bold uppercase tracking-widest">
          <TrendingUp className="w-4 h-4" />
          <span>Creators ({filteredCreators.length})</span>
        </div>

        {filteredCreators.length === 0 ? (
          <div className="text-center py-12 text-stone-500 font-medium text-sm bg-stone-900/40 rounded-3xl border border-stone-800">
            No creators or categories found matching "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filteredCreators.map((creator) => (
              <motion.div
                key={creator.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedCreator(creator)}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-xl cursor-pointer border border-stone-800/60 hover:border-pink-500/50 transition duration-300"
              >
                <img src={creator.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={creator.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-pink-600 text-[10px] font-black flex items-center space-x-1 uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Live</span>
                </div>

                {/* Quick Follow Button on Card */}
                <button
                  onClick={(e) => handleToggleFollow(e, creator)}
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center space-x-1.5 backdrop-blur-md transition shadow-lg ${
                    creator.isFollowing
                      ? 'bg-pink-600 text-white border-pink-400'
                      : 'bg-black/70 text-stone-100 border-white/30 hover:bg-pink-600 hover:border-pink-500 hover:text-white'
                  }`}
                  title={creator.isFollowing ? 'Following' : 'Follow'}
                >
                  {creator.isFollowing ? (
                    <>
                      <UserCheck className="w-3 h-3 text-white" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 text-pink-400" />
                      <span>Follow</span>
                    </>
                  )}
                </button>

                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  <div className="text-sm font-black text-white flex items-center space-x-1">
                    <span>{creator.name}</span>
                    <BadgeCheck className="w-3.5 h-3.5 text-pink-400" />
                  </div>
                  <div className="text-[10px] text-pink-400 font-bold">{creator.category}</div>
                  <div className="flex items-center justify-between text-[10px] text-stone-300 pt-0.5">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-stone-400" />
                      <span>{creator.followers.toLocaleString()} followers</span>
                    </div>
                    <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Creator Profile Detail Modal */}
      <AnimatePresence>
        {selectedCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setSelectedCreator(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-stone-100 flex flex-col space-y-5"
            >
              <button
                onClick={() => setSelectedCreator(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-stone-400 hover:text-white backdrop-blur-md z-10 transition"
              >
                <CloseIcon className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <div className="relative">
                  <img
                    src={selectedCreator.image}
                    alt={selectedCreator.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-pink-500 shadow-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-pink-600 rounded-full text-white border-2 border-stone-900">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white flex items-center justify-center space-x-1">
                    <span>{selectedCreator.name}</span>
                  </h3>
                  <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 inline-block mt-1">
                    {selectedCreator.category}
                  </span>
                </div>

                <p className="text-xs text-stone-300 px-2 leading-relaxed font-medium">
                  {selectedCreator.bio}
                </p>

                <div className="grid grid-cols-2 gap-3 w-full py-2">
                  <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800 text-center">
                    <div className="text-[10px] font-bold text-stone-400 uppercase">Followers</div>
                    <div className="text-base font-black text-white mt-0.5">{selectedCreator.followers.toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800 text-center">
                    <div className="text-[10px] font-bold text-stone-400 uppercase">Live Viewers</div>
                    <div className="text-base font-black text-pink-400 mt-0.5">{selectedCreator.viewers}</div>
                  </div>
                </div>

                <div className="w-full space-y-2.5 pt-1">
                  <button
                    onClick={(e) => handleToggleFollow(e, selectedCreator)}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition shadow-lg ${
                      selectedCreator.isFollowing
                        ? 'bg-stone-800 border border-stone-700 text-stone-200 hover:bg-stone-700'
                        : 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-pink-600/20 active:scale-95'
                    }`}
                  >
                    {selectedCreator.isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCreator(null);
                        showToast({
                          id: `toast_live_${Date.now()}`,
                          title: 'Joining Live Stream',
                          message: `Connecting to ${selectedCreator.name}'s broadcast...`,
                          avatar: selectedCreator.image,
                          type: 'follow'
                        });
                      }}
                      className="flex-1 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 font-bold text-xs text-stone-200 transition flex items-center justify-center space-x-1.5"
                    >
                      <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      <span>Watch Stream</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
