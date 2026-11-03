import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Gift, 
  Flame, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  X, 
  Clock, 
  ShieldCheck, 
  Calendar,
  Diamond,
  Crown
} from 'lucide-react';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWallet: () => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({ isOpen, onClose, onOpenWallet }) => {
  const { dailyRewardStatus, claimDailyReward, currentUser } = useApp();
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const status = dailyRewardStatus || {
    canClaimToday: true,
    currentStreak: 2,
    lastCheckInDate: '',
    totalCheckIns: 2,
    totalDiamondsClaimed: 40,
    nextStreakDay: 3,
    nextRewardDiamonds: 40,
    milestones: [
      { day: 1, diamonds: 15, title: 'Pratham Darshan', icon: '🪔', description: 'Light the sacred diya', state: 'claimed' },
      { day: 2, diamonds: 25, title: 'Satsang Blessing', icon: '✨', description: 'Vedic chanting', state: 'claimed' },
      { day: 3, diamonds: 40, title: 'Lotus Grace', icon: '🪷', description: 'Sacred pink lotus', state: 'available' },
      { day: 4, diamonds: 60, title: 'Maha Prasad', icon: '🍯', description: 'Devoted soul feast', state: 'locked' },
      { day: 5, diamonds: 85, title: 'Sandhya Aarti', icon: '🔔', description: 'Temple bells ringing', state: 'locked' },
      { day: 6, diamonds: 120, title: 'Shankh Dhwani', icon: '🐚', description: 'Sacred conch vibration', state: 'locked' },
      { day: 7, diamonds: 200, title: 'Divine Maha Boon', icon: '👑', description: 'Apex devotee crown', state: 'locked' }
    ]
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    setFeedback(null);
    const res = await claimDailyReward();
    setIsClaiming(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: res.message || `Claimed +${res.rewardDiamonds} free diamonds!`
      });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to claim daily reward.'
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full sm:max-w-xl bg-stone-900 border-t sm:border border-amber-500/40 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 text-stone-100">
        
        {/* Handle bar for Android mobile */}
        <div className="w-12 h-1.5 bg-stone-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-stone-800 bg-stone-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 shadow-md">
              <Gift className="w-4 h-4 fill-stone-950" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-amber-200">Daily Devotional Check-In</h2>
              <p className="text-[11px] text-stone-400">Earn Free Diamonds for Daily Worship & Attendance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streak & Stats Hero Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-950/80 via-stone-900 to-amber-950/60 border-b border-stone-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
                <span>Devotional Streak</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-100 mt-0.5 flex items-baseline space-x-2">
                <span>{status.currentStreak} Days Consecutive</span>
                <span className="text-xs font-semibold text-stone-300">
                  ({status.totalCheckIns} Total Logins)
                </span>
              </div>
              <div className="text-xs text-stone-300 mt-1">
                Lifetime Claimed: <strong className="text-cyan-300 font-bold">{status.totalDiamondsClaimed} 💎</strong>
              </div>
            </div>

            <div className="text-right">
              <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-amber-400/40 text-right backdrop-blur-md">
                <div className="text-[10px] text-stone-400">Next Blessing</div>
                <div className="text-base font-black text-cyan-300 flex items-center justify-end space-x-1">
                  <span>+{status.nextRewardDiamonds}</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`mx-4 mt-3 p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-500/50'
                : 'bg-red-950/90 text-red-200 border border-red-500/50'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 7-Day Milestones Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 max-h-[48vh]">
          <div className="text-xs font-bold text-stone-300 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>7-Day Saptaham Milestone Road</span>
            </span>
            <span className="text-[11px] text-stone-400">Resets every 7 consecutive days</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {status.milestones.map((milestone) => {
              const isClaimed = milestone.state === 'claimed';
              const isAvailable = milestone.state === 'available';
              const isDay7 = milestone.day === 7;

              return (
                <div
                  key={milestone.day}
                  className={`relative p-3 rounded-xl border flex flex-col justify-between transition ${
                    isDay7 ? 'col-span-2 sm:col-span-2' : ''
                  } ${
                    isAvailable
                      ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 to-amber-950/40 shadow-[0_0_20px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/50'
                      : isClaimed
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-stone-300'
                      : 'border-stone-800 bg-stone-800/40 opacity-75'
                  }`}
                >
                  {/* Status chip */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Day {milestone.day}
                    </span>
                    {isClaimed ? (
                      <span className="flex items-center space-x-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Claimed</span>
                      </span>
                    ) : isAvailable ? (
                      <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded-full border border-amber-400/50 animate-pulse">
                        Ready!
                      </span>
                    ) : (
                      <Lock className="w-3 h-3 text-stone-500" />
                    )}
                  </div>

                  {/* Icon & Details */}
                  <div className="flex items-center space-x-2 my-1">
                    <span className="text-3xl">{milestone.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-stone-200 line-clamp-1">{milestone.title}</div>
                      <div className="text-[10px] text-stone-400">{milestone.description}</div>
                    </div>
                  </div>

                  {/* Diamond Reward Tag */}
                  <div className="mt-2 pt-2 border-t border-stone-800/70 flex items-center justify-between">
                    <span className="font-extrabold text-sm text-cyan-300 flex items-center space-x-1">
                      <Diamond className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                      <span>+{milestone.diamonds} 💎</span>
                    </span>
                    {isDay7 && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 uppercase flex items-center space-x-0.5">
                        <Crown className="w-3 h-3" />
                        <span>Mega Boon</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rules info */}
          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-300">Devotional Rule:</strong> Check in each day to keep your sacred streak intact and claim up to <strong>200 free Diamonds</strong> on Day 7. Missing a day resets the streak back to Day 1.
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-stone-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              {status.canClaimToday
                ? "Today's reward is waiting for you!"
                : "Already claimed today! Next reward unlocks at midnight."}
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {status.canClaimToday ? (
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 transition"
              >
                {isClaiming ? (
                  <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-stone-950" />
                    <span>Claim Today (+{status.nextRewardDiamonds} 💎)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition"
              >
                Check-In Complete ✅
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
