import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, 
  Diamond, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  User, 
  LogOut, 
  Sparkles, 
  ChevronDown,
  Gift,
  Maximize2,
  Bell,
  DownloadCloud,
  Play
} from 'lucide-react';
import { LOVE_CHAT_LOGO } from '../assets/logo';
import { NotificationList } from './NotificationList';

interface HeaderProps {
  onOpenWallet: () => void;
  onOpenDailyRewards: () => void;
  onOpenSplash?: () => void;
  onSelectTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWallet, onOpenDailyRewards, onOpenSplash, onSelectTab }) => {
  const { 
    currentUser, 
    wallet, 
    dailyRewardStatus,
    switchDemoUser, 
    soundEnabled, 
    toggleSound, 
    signInWithGoogle, 
    logout 
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const { notifications, unreadNotificationsCount } = useApp();
  const canClaim = dailyRewardStatus?.canClaimToday ?? true;

  return (
    <header className="sticky top-0 z-40 w-full bg-stone-950/90 border-b border-stone-800/80 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between text-stone-100">
      
      {/* Brand Logo with Love Chat Logo Pic */}
      <div 
        onClick={onOpenSplash}
        className="flex items-center space-x-2.5 cursor-pointer group"
        title="Click to view Love Chat full screen logo splash"
      >
        <div className="relative w-9 h-9 rounded-xl p-0.5 bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 shadow-md shadow-pink-500/25 group-hover:scale-105 transition">
          <img
            src={LOVE_CHAT_LOGO}
            alt="Love Chat Logo"
            className="w-full h-full rounded-[10px] object-cover"
          />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-black text-sm tracking-wide bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
              LOVE CHAT
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-pink-600 text-[9px] font-black tracking-widest text-white uppercase animate-pulse">
              LIVE
            </span>
          </div>
          <p className="text-[10px] text-stone-400 leading-none hidden sm:block">
            Live Social Streaming & Diamond Economy
          </p>
        </div>
      </div>

      {/* Action items: Daily Rewards, Notifications, Balance, Role Switcher, Audio */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        
        {/* Google Play App Download Header Button */}
        <button
          onClick={() => onSelectTab ? onSelectTab('download') : window.open('https://play.google.com/store', '_blank')}
          className="px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition active:scale-95"
          title="Download Google Play App / APK"
        >
          <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
          <span className="hidden md:inline">Google Play App</span>
          <span className="md:hidden">Get App</span>
        </button>
        
        {/* Daily Rewards Check-In Button */}
        <button
          onClick={onOpenDailyRewards}
          className={`relative px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-bold flex items-center space-x-1.5 shadow-sm transition active:scale-95 ${
            canClaim
              ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/30 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
          title="Daily Check-In: Earn Free Diamonds"
        >
          <Gift className={`w-3.5 h-3.5 ${canClaim ? 'text-amber-400 fill-amber-400' : 'text-stone-400'}`} />
          <span className="hidden xs:inline">Check-In</span>
          {canClaim && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5" />
          )}
        </button>

        {/* Real-time Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-full border transition active:scale-95 ${
              unreadNotificationsCount > 0 
                ? 'bg-stone-900 border-pink-500/30 text-pink-400' 
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            <Bell className={`w-4 h-4 ${unreadNotificationsCount > 0 ? 'animate-swing fill-pink-500/10' : ''}`} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-600 text-[10px] font-black flex items-center justify-center text-white border border-stone-950 shadow-lg">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          
          <NotificationList 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
          />
        </div>

        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          className="p-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition"
          title="Toggle Chime & Aarti Sounds"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-amber-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-stone-500" />
          )}
        </button>

        {/* Diamond Wallet Balance Pill */}
        <button
          onClick={onOpenWallet}
          className="px-2.5 sm:px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 border border-cyan-400/40 text-cyan-300 font-extrabold text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95"
          title="Click to recharge or view ledger"
        >
          <Diamond className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400 shrink-0" />
          <span>{(wallet?.diamondBalance ?? 0).toLocaleString()}</span>
          <span className="text-[10px] text-amber-400 font-normal ml-0.5 hidden xs:inline">+</span>
        </button>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 transition"
          >
            <img
              src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
              alt={currentUser.displayName}
              className="w-5 h-5 rounded-full object-cover border border-amber-400/60"
            />
            <span className="font-bold text-[11px] max-w-[80px] sm:max-w-[120px] truncate">
              {currentUser.role === 'admin' ? '🛡️ Admin' : currentUser.role === 'creator' ? '🎙️ Puja' : 'Aarav'}
            </span>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {/* Role selection dropdown */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-stone-900 border border-amber-500/30 shadow-2xl p-1.5 z-50 text-xs space-y-1 animate-fade-in">
              <div className="px-3 py-1.5 border-b border-stone-800 text-[10px] text-stone-400 font-semibold uppercase">
                Switch Perspective
              </div>

              <button
                onClick={() => {
                  switchDemoUser('user');
                  setShowRoleMenu(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-left flex items-center space-x-2 transition ${
                  currentUser.role === 'user' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                <span>🙏</span>
                <div>
                  <div className="font-bold">Devotee (Aarav)</div>
                  <div className="text-[10px] text-stone-400">Gift sender, wallet holder</div>
                </div>
              </button>

              <button
                onClick={() => {
                  switchDemoUser('creator');
                  setShowRoleMenu(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-left flex items-center space-x-2 transition ${
                  currentUser.role === 'creator' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                <span>🎙️</span>
                <div>
                  <div className="font-bold">Broadcaster (Love Chat Live)</div>
                  <div className="text-[10px] text-stone-400">Live stream & earnings dashboard</div>
                </div>
              </button>

              <button
                onClick={() => {
                  switchDemoUser('admin');
                  setShowRoleMenu(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-left flex items-center space-x-2 transition ${
                  currentUser.role === 'admin' ? 'bg-red-950/80 text-red-300 font-bold' : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <div>
                  <div className="font-bold">Admin Sentinel</div>
                  <div className="text-[10px] text-stone-400">rkmathurrkmathur7@gmail.com</div>
                </div>
              </button>

              <div className="pt-1 border-t border-stone-800 flex flex-col space-y-1">
                <button
                  onClick={() => {
                    signInWithGoogle();
                    setShowRoleMenu(false);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg text-left text-amber-400 hover:bg-stone-800 text-[11px] font-semibold flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Sign In with Google</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
