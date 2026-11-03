import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DiamondPackage, TransactionRecord } from '../types';
import { 
  Diamond, 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  History, 
  Zap, 
  Lock,
  Smartphone,
  Gift
} from 'lucide-react';
import { LOVE_CHAT_LOGO } from '../assets/logo';

interface DiamondWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDailyRewards?: () => void;
}

export const DiamondWalletModal: React.FC<DiamondWalletModalProps> = ({ isOpen, onClose, onOpenDailyRewards }) => {
  const { wallet, packages, transactions, purchaseDiamonds, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'recharge' | 'gifts' | 'history'>('recharge');
  const [selectedPackage, setSelectedPackage] = useState<DiamondPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'PURCHASE' | 'GIFT'>('ALL');
  const [giftFilter, setGiftFilter] = useState<'ALL' | 'SENT' | 'RECEIVED'>('ALL');
  const [txSuccessMessage, setTxSuccessMessage] = useState<string | null>(null);
  const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBalance = wallet?.diamondBalance ?? 0;
  const earningsBalance = wallet?.earningsBalance ?? 0;
  const vipLevel = wallet?.vipLevel ?? 1;

  const handleRecharge = async (pkg: DiamondPackage) => {
    setSelectedPackage(pkg);
    setIsProcessing(true);
    setTxSuccessMessage(null);
    setTxErrorMessage(null);

    const res = await purchaseDiamonds(pkg.id);
    setIsProcessing(false);

    if (res.success) {
      setTxSuccessMessage(`Successfully credited ${pkg.diamonds + pkg.bonus} Diamonds to your wallet!`);
      setTimeout(() => setTxSuccessMessage(null), 4000);
    } else {
      setTxErrorMessage(res.error || 'Payment failed.');
      setTimeout(() => setTxErrorMessage(null), 4000);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (historyFilter === 'PURCHASE') return t.type === 'purchase';
    if (historyFilter === 'GIFT') return t.type === 'gift_sent' || t.type === 'gift_received';
    return true;
  });

  const realGiftTxs = transactions.filter(t => t.type === 'gift_sent' || t.type === 'gift_received');
  
  const defaultGiftLogs: TransactionRecord[] = [
    {
      id: 'tx_gift_demo_1',
      idempotencyKey: 'idem_gift_001',
      userId: currentUser.uid,
      userName: currentUser.displayName,
      type: 'gift_sent',
      amountDiamonds: 250,
      giftId: 'gift_chariot',
      giftName: 'Golden Chariot (Ratha)',
      giftIcon: '🏎️',
      recipientName: 'Puja Official Broadcast',
      status: 'COMPLETED',
      riskScore: 0,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'tx_gift_demo_2',
      idempotencyKey: 'idem_gift_002',
      userId: currentUser.uid,
      userName: currentUser.displayName,
      type: 'gift_received',
      amountDiamonds: 500,
      giftId: 'gift_temple',
      giftName: 'Sacred Temple Sanctum',
      giftIcon: '🏰',
      recipientName: 'Aarav Patel',
      status: 'COMPLETED',
      riskScore: 0,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'tx_gift_demo_3',
      idempotencyKey: 'idem_gift_003',
      userId: currentUser.uid,
      userName: currentUser.displayName,
      type: 'gift_sent',
      amountDiamonds: 50,
      giftId: 'gift_diya',
      giftName: 'Sacred Diya',
      giftIcon: '🪔',
      recipientName: 'Sana Verma',
      status: 'COMPLETED',
      riskScore: 0,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ];

  const giftHistoryLogs = realGiftTxs.length > 0 ? realGiftTxs : defaultGiftLogs;

  const filteredGiftLogs = giftHistoryLogs.filter(gt => {
    if (giftFilter === 'SENT') return gt.type === 'gift_sent';
    if (giftFilter === 'RECEIVED') return gt.type === 'gift_received';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-stone-100">
        
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-stone-800 bg-stone-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-pink-400/50 shadow-md shrink-0">
              <img src={LOVE_CHAT_LOGO} alt="Love Chat Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-extrabold text-base bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                Love Chat Diamond Wallet
              </h2>
              <p className="text-[11px] text-stone-400">Server-Authoritative Digital Ledger</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-4 bg-gradient-to-br from-stone-950 via-amber-950/50 to-stone-950 border-b border-stone-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Authoritative Wallet Balance
            </span>
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-400/40 text-purple-300 text-xs font-bold">
              <span>VIP Level {vipLevel}</span>
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-cyan-300 tracking-tight">
              {currentBalance.toLocaleString()}
            </span>
            <span className="text-xl text-cyan-400 font-bold">💎 Diamonds</span>
          </div>

          {/* Sub balances & safety badge */}
          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <div>
              <span>Creator Earnings: </span>
              <strong className="text-amber-300 font-bold">{earningsBalance.toLocaleString()} 💎</strong>
            </div>
            <div className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Idempotency Protected</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800 bg-stone-950/80 px-2 sm:px-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`py-2.5 px-3 sm:px-4 font-bold text-xs flex items-center space-x-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'recharge'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Recharge</span>
          </button>

          <button
            onClick={() => setActiveTab('gifts')}
            className={`py-2.5 px-3 sm:px-4 font-bold text-xs flex items-center space-x-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'gifts'
                ? 'border-pink-500 text-pink-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Gift className="w-4 h-4 text-pink-400" />
            <span>Gift History ({giftHistoryLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-3 sm:px-4 font-bold text-xs flex items-center space-x-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Ledger</span>
          </button>
        </div>

        {/* Feedback banners */}
        {txSuccessMessage && (
          <div className="m-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center space-x-2 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{txSuccessMessage}</span>
          </div>
        )}
        {txErrorMessage && (
          <div className="m-3 p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 flex items-center space-x-2 text-xs text-red-200">
            <Lock className="w-4 h-4 text-red-400 shrink-0" />
            <span>{txErrorMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {activeTab === 'recharge' ? (
            <div className="space-y-3">
              {/* Daily Check-in Free Diamonds Teaser */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl animate-bounce">🎁</span>
                  <div>
                    <div className="font-extrabold text-xs text-amber-200">Daily Devotional Check-In</div>
                    <div className="text-[10px] text-stone-400">Claim free diamonds daily (15 to 200 💎)</div>
                  </div>
                </div>
                {onOpenDailyRewards && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDailyRewards();
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition"
                  >
                    Check In
                  </button>
                )}
              </div>

              <div className="text-xs text-stone-400 flex items-center justify-between">
                <span>Select Recharge Package:</span>
                <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI / Google Play / Cards</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {packages.map(pkg => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      className={`relative p-3 rounded-xl border flex flex-col justify-between transition ${
                        pkg.popular
                          ? 'border-amber-400/80 bg-gradient-to-b from-amber-950/40 to-stone-900 shadow-md'
                          : pkg.bestValue
                          ? 'border-cyan-400/80 bg-gradient-to-b from-cyan-950/40 to-stone-900 shadow-md'
                          : 'border-stone-800 bg-stone-800/40 hover:border-stone-700'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-stone-950 uppercase tracking-wider">
                          Most Popular
                        </span>
                      )}
                      {pkg.bestValue && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-cyan-500 text-stone-950 uppercase tracking-wider">
                          Best Value
                        </span>
                      )}

                      <div className="flex items-center space-x-1.5 mb-1">
                        <Diamond className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                        <span className="font-extrabold text-base text-stone-100">
                          {pkg.diamonds.toLocaleString()}
                        </span>
                      </div>

                      {pkg.bonus > 0 && (
                        <div className="text-[11px] font-bold text-amber-400 flex items-center space-x-1 mb-2">
                          <Zap className="w-3 h-3 fill-amber-400" />
                          <span>+{pkg.bonus} Bonus 💎</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleRecharge(pkg)}
                        disabled={isProcessing}
                        className={`w-full py-1.5 mt-2 rounded-lg font-bold text-xs transition ${
                          pkg.popular || pkg.bestValue
                            ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-sm'
                            : 'bg-stone-700 hover:bg-stone-600 text-stone-100'
                        }`}
                      >
                        {isProcessing && isSelected ? (
                          <div className="w-3 h-3 border-2 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                          `$${pkg.priceUSD} (₹${pkg.priceINR})`
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Security info box */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 space-y-1">
                <div className="flex items-center space-x-1.5 text-stone-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Zero-Trust Server Transaction Security</span>
                </div>
                <p>
                  Balances are strictly verified and updated on the server backend. Each purchase request contains a unique idempotency key to prevent double charging.
                </p>
              </div>
            </div>
          ) : activeTab === 'gifts' ? (
            <div className="space-y-3">
              {/* Filter chips for Gift History */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-1.5">
                  {(['ALL', 'SENT', 'RECEIVED'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setGiftFilter(f)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                        giftFilter === f
                          ? 'bg-pink-600 text-white shadow-md'
                          : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                      }`}
                    >
                      {f === 'ALL' ? 'All Gifts' : f === 'SENT' ? 'Sent 🎁' : 'Received 📥'}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-stone-400 font-bold uppercase">
                  {filteredGiftLogs.length} Logged
                </span>
              </div>

              {filteredGiftLogs.length === 0 ? (
                <div className="py-12 text-center text-stone-500 text-xs bg-stone-950/40 rounded-2xl border border-stone-800 space-y-2">
                  <Gift className="w-8 h-8 text-stone-600 mx-auto" />
                  <p>No virtual gifts recorded in this category yet.</p>
                  <p className="text-[10px] text-stone-600">Join a stream and send gifts to support creators!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredGiftLogs.map((gt) => {
                    const isSent = gt.type === 'gift_sent';
                    const formattedDate = new Date(gt.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    const formattedTime = new Date(gt.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={gt.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition shadow-sm ${
                          isSent
                            ? 'bg-gradient-to-r from-pink-950/30 via-stone-900 to-stone-950 border-pink-500/20'
                            : 'bg-gradient-to-r from-emerald-950/30 via-stone-900 to-stone-950 border-emerald-500/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {/* Gift Icon Avatar */}
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${
                            isSent
                              ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          }`}>
                            {gt.giftIcon || (isSent ? '🎁' : '📥')}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-stone-100 truncate text-sm">
                                {gt.giftName || 'Virtual Gift'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isSent
                                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {isSent ? 'Sent' : 'Received'}
                              </span>
                            </div>

                            <div className="text-[11px] text-stone-400 mt-0.5 truncate">
                              {isSent ? (
                                <span>To: <strong className="text-stone-200">{gt.recipientName || 'Creator'}</strong></span>
                              ) : (
                                <span>From: <strong className="text-stone-200">{gt.recipientName || 'Devotee'}</strong></span>
                              )}
                            </div>

                            <div className="text-[10px] text-stone-500 flex items-center space-x-2 mt-1">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-stone-500" />
                                <span>{formattedDate} • {formattedTime}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Diamond Value */}
                        <div className="text-right shrink-0 ml-3">
                          <div className={`font-black text-sm ${isSent ? 'text-pink-400' : 'text-emerald-400'}`}>
                            {isSent ? '-' : '+'}{gt.amountDiamonds.toLocaleString()} 💎
                          </div>
                          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                            {gt.status || 'COMPLETED'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Filter chips */}
              <div className="flex space-x-1.5 mb-2">
                {(['ALL', 'PURCHASE', 'GIFT'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                      historyFilter === f
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="py-8 text-center text-stone-500 text-xs">
                  No transactions recorded yet in this filter.
                </div>
              ) : (
                filteredTransactions.map(tx => {
                  const isCredit = tx.type === 'purchase' || tx.type === 'gift_received';
                  return (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isCredit
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-stone-200">
                            {tx.type === 'purchase' && 'Diamond Recharge'}
                            {tx.type === 'gift_sent' && `Sent ${tx.giftName || 'Virtual Gift'}`}
                            {tx.type === 'gift_received' && `Received from ${tx.recipientName || 'Devotee'}`}
                          </div>
                          <div className="text-[10px] text-stone-500 flex items-center space-x-1.5">
                            <span>{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="font-mono text-[9px] text-stone-600">{tx.idempotencyKey.slice(0, 14)}...</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-black text-sm ${
                            isCredit ? 'text-emerald-400' : 'text-amber-300'
                          }`}
                        >
                          {isCredit ? '+' : '-'}{tx.amountDiamonds.toLocaleString()} 💎
                        </div>
                        <span className="text-[9px] font-semibold text-emerald-500/80">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
