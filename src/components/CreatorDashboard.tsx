import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Gift, 
  ShieldCheck, 
  Clock, 
  Radio, 
  Users, 
  Sparkles, 
  Lock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const CreatorDashboard: React.FC = () => {
  const { currentUser, wallet } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [cashoutRequested, setCashoutRequested] = useState<boolean>(false);
  const [payoutBank, setPayoutBank] = useState<string>('HDFC Bank •••• 4892 (UPI: puja.official@okhdfcbank)');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCreatorStats() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/creator/${currentUser.uid}/stats`);
        const data = await res.json();
        if (data.success) {
          setStats(data);
        }
      } catch (err) {
        console.error('Error loading creator stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreatorStats();
  }, [currentUser.uid]);

  const earningsDiamonds = wallet?.earningsBalance ?? (stats?.earningsBalance || 18450);
  const cashoutUSD = ((earningsDiamonds / 100) * 0.50).toFixed(2);
  const cashoutINR = ((earningsDiamonds / 100) * 42.5).toFixed(2);

  const handleCashout = () => {
    setCashoutRequested(true);
    setTimeout(() => {
      setCashoutRequested(false);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 text-stone-100">
      
      {/* Creator Profile Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950/60 to-stone-900 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={currentUser.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-amber-100">{currentUser.displayName}</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40">
                Verified Broadcaster 🎙️
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {currentUser.bio || 'Official Divine Aarti & Vedic Satsang Channel'}
            </p>
            <div className="flex items-center space-x-3 mt-2 text-xs font-semibold text-stone-300">
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>14,820 Followers</span>
              </span>
              <span>•</span>
              <span className="text-emerald-400">70% Net Revenue Split Active</span>
            </div>
          </div>
        </div>

        {/* Stream Broadcast Toggle */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveStreaming ? 'bg-red-500 animate-pulse' : 'bg-stone-500'}`} />
            <span className="text-xs font-bold text-stone-200">
              {isLiveStreaming ? 'STREAM IS LIVE' : 'OFFLINE'}
            </span>
          </div>
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              isLiveStreaming
                ? 'bg-red-950 text-red-300 border border-red-500/40 hover:bg-red-900'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isLiveStreaming ? 'End Broadcast' : 'Go Live Now'}</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Creator Earnings Balance */}
        <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Available Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-amber-300">
              {earningsDiamonds.toLocaleString()} 💎
            </div>
            <div className="text-xs text-stone-400 mt-1">
              ≈ <strong className="text-emerald-400 font-bold">${cashoutUSD} USD</strong> (₹{cashoutINR} INR)
            </div>
          </div>
          <button
            onClick={handleCashout}
            disabled={earningsDiamonds < 100}
            className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition"
          >
            Request Payout Transfer
          </button>
        </div>

        {/* Live Viewers & Peak */}
        <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Current Audience</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-cyan-300">2,340</div>
            <div className="text-xs text-stone-400 mt-1">
              Peak this session: <strong className="text-stone-200">3,120 viewers</strong>
            </div>
          </div>
          <div className="text-[11px] text-stone-500 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>+24% higher engagement than yesterday</span>
          </div>
        </div>

        {/* Total Gifts Received */}
        <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Virtual Offerings</span>
            <Gift className="w-4 h-4 text-pink-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-pink-300">
              {stats?.totalGiftsCount || 12} Offerings
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Top Gift: <strong className="text-amber-300">Golden Chariot (Ratha)</strong>
            </div>
          </div>
          <div className="text-[11px] text-stone-500 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Average devotee tip: 450 💎</span>
          </div>
        </div>
      </div>

      {cashoutRequested && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center space-x-2 text-xs text-emerald-200 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Payout request of ${cashoutUSD} submitted! Initiating NEFT/IMPS transfer to verified account {payoutBank}.</span>
        </div>
      )}

      {/* Stream History & Gift Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stream History */}
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <h3 className="font-bold text-sm text-amber-200 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Broadcast Stream History</span>
            </h3>
            <span className="text-xs text-stone-400">Past 7 Days</span>
          </div>

          <div className="space-y-2.5">
            {[
              { title: 'Sandhya Maha Aarti & Bhajan', date: 'Today, 6:00 PM', duration: '1h 45m', peak: 2450, diamonds: 4200 },
              { title: 'Vedic Chanting & Stotra Recital', date: 'Yesterday, 6:00 PM', duration: '2h 10m', peak: 3100, diamonds: 6800 },
              { title: 'Morning Surya Puja & Satsang', date: 'Oct 31, 2026', duration: '1h 30m', peak: 1950, diamonds: 3500 },
              { title: 'Deepotsav Festival Celebration', date: 'Oct 29, 2026', duration: '3h 15m', peak: 5200, diamonds: 14200 }
            ].map((stream, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-stone-200">{stream.title}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {stream.date} • {stream.duration} • {stream.peak.toLocaleString()} peak viewers
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-amber-300">+{stream.diamonds.toLocaleString()} 💎</div>
                  <span className="text-[10px] text-stone-400">≈ ${(stream.diamonds * 0.005).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Security & Payout Setup */}
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <h3 className="font-bold text-sm text-amber-200 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Account Security & Payout</span>
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">Tier 1 Verified</span>
          </div>

          {/* 2FA Status */}
          <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-bold text-stone-200">Two-Factor Authentication</div>
                <div className="text-[11px] text-stone-500">Secured via Authenticator App</div>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                twoFactorEnabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Payout Destination */}
          <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-2 text-xs">
            <div className="font-bold text-stone-200 flex items-center justify-between">
              <span>Verified Bank / UPI Payout Route</span>
              <span className="text-[10px] text-emerald-400 font-mono">KYC COMPLETE</span>
            </div>
            <input
              type="text"
              value={payoutBank}
              onChange={e => setPayoutBank(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-hidden focus:border-amber-400"
            />
            <div className="text-[10px] text-stone-500">
              Withdrawals are reviewed against anti-fraud rules and credited within 24 hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
