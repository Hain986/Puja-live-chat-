import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GiftItem, DiamondPackage, FraudAlert, TransactionRecord } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Gift, 
  Package, 
  Users, 
  Activity, 
  Lock, 
  Unlock, 
  Plus, 
  Check,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Radio,
  BarChart3
} from 'lucide-react';
import { LOVE_CHAT_LOGO } from '../assets/logo';

export const AdminDashboard: React.FC = () => {
  const { gifts, packages, triggerDemoNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'fraud' | 'heatmap' | 'gifts' | 'packages' | 'users' | 'transactions'>('overview');
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [adminTransactions, setAdminTransactions] = useState<TransactionRecord[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New gift form state
  const [newGiftName, setNewGiftName] = useState<string>('');
  const [newGiftCategory, setNewGiftCategory] = useState<'Devotional' | 'Popular' | 'Luxury' | 'Special'>('Devotional');
  const [newGiftPrice, setNewGiftPrice] = useState<number>(100);
  const [newGiftIcon, setNewGiftIcon] = useState<string>('✨');
  const [newGiftAnim, setNewGiftAnim] = useState<string>('diya_glow');

  // Load Admin Data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, txRes, alertsRes, usersRes, heatmapRes] = await Promise.all([
        fetch('/api/admin/overview').then(r => r.json()),
        fetch('/api/admin/transactions').then(r => r.json()),
        fetch('/api/admin/fraud-alerts').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/admin/fraud-heatmap').then(r => r.json())
      ]);

      if (overviewRes.success) setOverviewStats(overviewRes.stats);
      if (txRes.success) setAdminTransactions(txRes.transactions);
      if (alertsRes.success) setFraudAlerts(alertsRes.alerts);
      if (usersRes.success) setUsersList(usersRes.users);
      if (heatmapRes.success) setHeatmapData(heatmapRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Freeze/Unfreeze user wallet
  const handleToggleFreeze = async (userId: string, currentFreeze: boolean) => {
    try {
      const res = await fetch('/api/admin/freeze-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, freeze: !currentFreeze })
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.map(u => u.userId === userId ? { ...u, isFrozen: !currentFreeze } : u));
      }
    } catch (e) {
      console.error('Failed to update freeze status:', e);
    }
  };

  // Add / Edit Virtual Gift
  const handleCreateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftName.trim()) return;

    try {
      const res = await fetch('/api/admin/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGiftName,
          category: newGiftCategory,
          diamondPrice: newGiftPrice,
          icon: newGiftIcon,
          animationType: newGiftAnim,
          soundEffect: 'temple_bell',
          description: `Custom ${newGiftCategory} virtual tribute.`,
          isActive: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewGiftName('');
        loadAdminData();
      }
    } catch (err) {
      console.error('Failed to save gift:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 text-stone-100">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-950 via-red-950/40 to-stone-950 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-red-400/50 shadow-md shrink-0">
            <img src={LOVE_CHAT_LOGO} alt="Love Chat Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black bg-gradient-to-r from-red-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                Love Chat Sentinel & Admin
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Real-time fraud velocity detection, wallet audit ledger, and virtual catalog management.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => {
              triggerDemoNotification('live_start');
              alert('Live broadcast notification sent to followers!');
            }}
            className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center space-x-1.5 transition"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Go Live Alert</span>
          </button>

          <button
            onClick={loadAdminData}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-stone-800 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: Activity },
          { id: 'fraud', label: `Fraud Alerts (${fraudAlerts.length})`, icon: AlertTriangle, badge: fraudAlerts.length > 0 },
          { id: 'heatmap', label: 'Fraud Heatmap', icon: BarChart3 },
          { id: 'transactions', label: 'Transaction Audit', icon: ShieldCheck },
          { id: 'gifts', label: 'Manage Gifts', icon: Gift },
          { id: 'packages', label: 'Diamond Packages', icon: Package },
          { id: 'users', label: 'User Wallets', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
              <div className="text-[11px] text-stone-400 font-semibold uppercase">Total Volume Recharged</div>
              <div className="text-2xl font-black text-cyan-300 mt-1">
                {(overviewStats?.totalVolume || 0).toLocaleString()} 💎
              </div>
              <div className="text-[10px] text-stone-500 mt-1">Fiat USD: ${overviewStats?.platformRevenueUSD || '0.00'}</div>
            </div>

            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
              <div className="text-[11px] text-stone-400 font-semibold uppercase">Gifts Exchanged</div>
              <div className="text-2xl font-black text-pink-300 mt-1">
                {(overviewStats?.totalGiftsExchanged || 0).toLocaleString()} 💎
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">Platform 30% Margin Kept</div>
            </div>

            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
              <div className="text-[11px] text-stone-400 font-semibold uppercase">Active Streams</div>
              <div className="text-2xl font-black text-amber-300 mt-1">
                {overviewStats?.activeRoomsCount || 2}
              </div>
              <div className="text-[10px] text-stone-500 mt-1">LiveKit WebRTC Nodes Online</div>
            </div>

            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
              <div className="text-[11px] text-stone-400 font-semibold uppercase">Fraud Alerts</div>
              <div className={`text-2xl font-black mt-1 ${fraudAlerts.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {fraudAlerts.length}
              </div>
              <div className="text-[10px] text-stone-500 mt-1">Velocity & Idempotency Rules</div>
            </div>
          </div>

          {/* Quick Monitoring Highlights */}
          <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-3">
            <h3 className="font-bold text-sm text-amber-200">System Security Posture</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-stone-200">Server-Side Balance Validation</div>
                  <div className="text-[10px] text-stone-500">Frontend wallet overrides blocked 100%</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 flex items-center space-x-2.5">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-stone-200">Idempotency Guard Active</div>
                  <div className="text-[10px] text-stone-500">Zero double-spending recorded</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-stone-200">Rate Limiter & Bot Filter</div>
                  <div className="text-[10px] text-stone-500">Max 45 gift transactions / 30 sec</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FRAUD DETECTION ALERTS */}
      {activeTab === 'fraud' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-200">Active Velocity & Anomaly Flags</h3>
            <span className="text-xs text-stone-400">Automated Heuristic Engine</span>
          </div>

          {fraudAlerts.length === 0 ? (
            <div className="p-8 rounded-xl bg-stone-900/60 border border-stone-800 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-bold text-stone-200 text-sm">No Fraud Alerts Detected</div>
              <div className="text-xs text-stone-400">All transactions passed velocity checks and idempotency rules.</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {fraudAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-red-600 text-white">
                        {alert.severity}
                      </span>
                      <span className="font-bold text-stone-200">{alert.type}</span>
                      <span className="text-stone-400 font-mono text-[10px]">({alert.userId})</span>
                    </div>
                    <div className="text-stone-300">{alert.details}</div>
                    <div className="text-[10px] text-stone-500">{new Date(alert.timestamp).toLocaleString()}</div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleFreeze(alert.userId, false)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Freeze Wallet</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: FRAUD HEATMAP */}
      {activeTab === 'heatmap' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-stone-200">Fraud Density Heatmap</h3>
              <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest">Temporal Risk Analysis • Day vs Hour</p>
            </div>
            <div className="flex items-center space-x-4 text-[10px] font-bold">
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 rounded bg-stone-800" />
                <span className="text-stone-500">Low Risk</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 rounded bg-red-500/40" />
                <span className="text-stone-400">Medium</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 rounded bg-red-600" />
                <span className="text-red-400 font-black">High Velocity</span>
              </div>
            </div>
          </div>

          {!heatmapData ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-3">
               <RefreshCw className="w-8 h-8 text-stone-700 animate-spin" />
               <span className="text-xs text-stone-600 font-bold uppercase tracking-widest">Processing Temporal Data...</span>
            </div>
          ) : (
            <div className="bg-stone-900/40 border border-stone-800 p-4 sm:p-6 rounded-3xl overflow-x-auto no-scrollbar shadow-inner">
              <div className="min-w-[650px] space-y-4">
                {/* Header: Days */}
                <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2">
                  <div />
                  {heatmapData.labels.days.map((day: string) => (
                    <div key={day} className="text-center text-[10px] font-black text-stone-500 uppercase tracking-tighter">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Rows: Hours */}
                <div className="space-y-1">
                  {heatmapData.labels.hours.map((hourLabel: string, hIdx: number) => (
                    <div key={hIdx} className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 group">
                      <div className="flex items-center justify-end pr-3 text-[10px] font-mono text-stone-600 group-hover:text-stone-400 transition-colors">
                        {hourLabel}
                      </div>
                      {Array.from({ length: 7 }).map((_, dIdx) => {
                        const count = heatmapData.heatmap[dIdx][hIdx];
                        let bgColor = 'bg-stone-800/50 hover:bg-stone-800';
                        if (count > 0 && count < 3) bgColor = 'bg-red-500/20 hover:bg-red-500/30';
                        if (count >= 3 && count < 6) bgColor = 'bg-red-500/40 hover:bg-red-500/50';
                        if (count >= 6) bgColor = 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:bg-red-500';
                        
                        return (
                          <div 
                            key={dIdx} 
                            className={`h-6 rounded-md transition-all duration-300 border border-stone-800/20 flex items-center justify-center text-[9px] font-black ${bgColor} ${count > 0 ? 'text-white' : 'text-transparent'}`}
                            title={`${count} suspicious incidents at ${hourLabel} on ${heatmapData.labels.days[dIdx]}`}
                          >
                            {count > 0 ? count : ''}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-start space-x-3">
             <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
             <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wide">Fraud Analytic Insight</h4>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Heatmap density indicates automated "night-owl" bot activity often spikes between 22:00 and 02:00. 
                  High-velocity cells (Red) should be cross-referenced with the Transaction Audit to identify 
                  coordinated IP ranges for potential platform-wide freezing.
                </p>
             </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTION AUDIT LEDGER */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-200">Global Financial Ledger</h3>
            <span className="text-xs text-stone-400 font-mono">Immutable Audit Trail</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 font-semibold uppercase text-[10px] border-b border-stone-800">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Diamonds</th>
                  <th className="p-3">Gift</th>
                  <th className="p-3">Idempotency Key</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {adminTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-stone-800/30">
                    <td className="p-3 font-mono text-[10px] text-stone-400">
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-medium text-stone-200">{tx.userName}</td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-300">
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-amber-300">
                      {tx.amountDiamonds.toLocaleString()} 💎
                    </td>
                    <td className="p-3 text-stone-300">{tx.giftName || '—'}</td>
                    <td className="p-3 font-mono text-[9px] text-stone-500">
                      {tx.idempotencyKey.slice(0, 16)}...
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MANAGE VIRTUAL GIFTS */}
      {activeTab === 'gifts' && (
        <div className="space-y-6">
          {/* Add New Gift Form */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
            <h3 className="font-bold text-sm text-amber-200 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Create / Add New Virtual Offering</span>
            </h3>

            <form onSubmit={handleCreateGift} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <input
                type="text"
                placeholder="Gift Name (e.g. Rudraksha Mala)"
                value={newGiftName}
                onChange={e => setNewGiftName(e.target.value)}
                className="px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100"
                required
              />

              <select
                value={newGiftCategory}
                onChange={e => setNewGiftCategory(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100"
              >
                <option value="Devotional">Devotional</option>
                <option value="Popular">Popular</option>
                <option value="Luxury">Luxury</option>
                <option value="Special">Special</option>
              </select>

              <input
                type="number"
                placeholder="Diamond Price"
                value={newGiftPrice}
                onChange={e => setNewGiftPrice(Number(e.target.value))}
                className="px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100"
                min="1"
                required
              />

              <input
                type="text"
                placeholder="Icon (e.g. 📿)"
                value={newGiftIcon}
                onChange={e => setNewGiftIcon(e.target.value)}
                className="px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100"
              />

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition shadow-sm"
              >
                Publish Gift
              </button>
            </form>
          </div>

          {/* Current Gift Catalog Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gifts.map(g => (
              <div
                key={g.id}
                className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex flex-col justify-between text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{g.icon}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-stone-800 text-amber-300">
                    {g.category}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-stone-200">{g.name}</div>
                  <div className="text-amber-400 font-extrabold mt-0.5">{g.diamondPrice} 💎</div>
                </div>

                <div className="text-[10px] text-stone-500 line-clamp-1">{g.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DIAMOND PACKAGES */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-200">Configured Diamond Top-Up Tiers</h3>
            <span className="text-xs text-stone-400">Real-time purchase store</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {packages.map(p => (
              <div key={p.id} className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-cyan-300">{p.diamonds} 💎</span>
                  {p.popular && <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[9px] font-bold">Popular</span>}
                </div>
                <div className="text-stone-300">Bonus: +{p.bonus} diamonds</div>
                <div className="font-bold text-stone-100">${p.priceUSD} USD (₹{p.priceINR} INR)</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: USER WALLETS & ROLES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-200">User Wallets & Security Controls</h3>
            <span className="text-xs text-stone-400">{usersList.length} Registered Accounts</span>
          </div>

          <div className="space-y-2">
            {usersList.map(u => (
              <div
                key={u.userId}
                className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-amber-400 font-mono tracking-tighter">ID: {u.profileId}</span>
                    <span className="text-[10px] text-stone-500 font-mono truncate max-w-[80px]">({u.userId})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-300 uppercase">
                      {u.role}
                    </span>
                    {u.isFrozen && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950 text-red-400 border border-red-500/40">
                        FROZEN
                      </span>
                    )}
                  </div>
                  <div className="text-stone-400 mt-1 flex items-center space-x-3 text-[11px]">
                    <span>Balance: <strong className="text-cyan-300 font-bold">{u.diamondBalance.toLocaleString()} 💎</strong></span>
                    <span>•</span>
                    <span>Earned: <strong className="text-amber-300 font-bold">{u.earningsBalance.toLocaleString()} 💎</strong></span>
                    <span>•</span>
                    <span>VIP Level {u.vipLevel}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleFreeze(u.userId, u.isFrozen)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
                      u.isFrozen
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-stone-800 hover:bg-red-900 text-stone-300 hover:text-red-200 border border-stone-700'
                    }`}
                  >
                    {u.isFrozen ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unfreeze</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Freeze</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
