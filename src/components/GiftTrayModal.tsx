import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { GiftItem, GiftCategory } from '../types';
import { Sparkles, Diamond, X, Zap, ChevronRight, AlertCircle, ShieldCheck, Eye, Volume2, Play } from 'lucide-react';
import { soundManager } from '../utils/audioEffects';

interface GiftTrayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecharge: () => void;
}

export const GiftTrayModal: React.FC<GiftTrayModalProps> = ({ isOpen, onClose, onOpenRecharge }) => {
  const { gifts, wallet, sendGift, activeRoom } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<GiftCategory>('Devotional');
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [previewKey, setPreviewKey] = useState<number>(Date.now());

  if (!isOpen) return null;

  const filteredGifts = gifts.filter(g => g.category === selectedCategory);
  const userBalance = wallet?.diamondBalance ?? 0;
  const currentGift = selectedGift || filteredGifts[0] || null;
  const totalCost = currentGift ? currentGift.diamondPrice * multiplier : 0;
  const hasEnoughDiamonds = userBalance >= totalCost;

  const handleSend = async () => {
    if (!currentGift) return;
    if (!hasEnoughDiamonds) {
      setErrorMsg(`Need ${totalCost - userBalance} more diamonds!`);
      return;
    }

    setIsSending(true);
    setErrorMsg(null);
    const result = await sendGift(currentGift.id, multiplier);
    setIsSending(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to send gift.');
    } else {
      // Auto close or keep open for continuous combo gifting
    }
  };

  const multipliers = [1, 5, 10, 66, 99];
  const categories: GiftCategory[] = ['Devotional', 'Popular', 'Luxury', 'Special'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full sm:max-w-md max-h-[85vh] bg-stone-900 border-t sm:border border-amber-500/30 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 text-stone-100">
        
        {/* Handle bar on mobile */}
        <div className="w-12 h-1.5 bg-stone-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-amber-100">Send Virtual Offering</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              {activeRoom?.creatorName || 'Broadcaster'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Balance Strip */}
        <div className="px-4 py-2 bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 flex items-center justify-between border-b border-stone-800/80">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-xs">
              <Diamond className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <div className="text-xs text-stone-400">Available Diamonds</div>
              <div className="font-extrabold text-sm text-cyan-300 flex items-center space-x-1">
                <span>{userBalance.toLocaleString()}</span>
                <span className="text-xs font-normal text-cyan-400/70">💎</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenRecharge();
            }}
            className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center space-x-1 transition shadow-sm"
          >
            <span>Recharge +</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Gift Stream Animation Preview Overlay Stage */}
        {showPreview && currentGift && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-stone-950 via-amber-950/70 to-stone-950 border-b border-stone-800 flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Preview Stage Header Bar */}
            <div className="w-full flex items-center justify-between mb-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest z-10">
              <div className="flex items-center space-x-1 text-amber-300">
                <Eye className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Live Stream Effect Preview</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewKey(Date.now());
                  soundManager.playLotusChime();
                }}
                className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition flex items-center space-x-1"
              >
                <Volume2 className="w-3 h-3 text-amber-300" />
                <span>Test Sound & Replay</span>
              </button>
            </div>

            {/* Animated Floating Gift Preview Stage */}
            <div className="relative w-full h-24 rounded-2xl bg-black/60 border border-stone-800/80 flex flex-col items-center justify-center overflow-hidden p-2">
              
              {/* Background Animated Halo Glow */}
              <motion.div
                key={`halo_${currentGift.id}_${previewKey}`}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.8, 1.3, 1], opacity: [0.5, 0.9, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-28 h-28 rounded-full bg-gradient-to-r from-amber-500/30 via-pink-500/20 to-purple-500/30 blur-xl pointer-events-none"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={`gift_${currentGift.id}_${previewKey}`}
                  initial={{ scale: 0, y: 15, rotate: -15 }}
                  animate={{ scale: [0.8, 1.25, 1], y: [10, -5, 0], rotate: [-10, 5, 0] }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
                  className="relative text-4xl filter drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] z-10 my-0.5"
                >
                  {currentGift.icon}
                </motion.div>
              </AnimatePresence>

              {/* Floating Sparkles Effect */}
              <motion.div
                key={`sparkle_${currentGift.id}_${previewKey}`}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute w-16 h-16 border border-dashed border-amber-400/40 rounded-full pointer-events-none opacity-40"
              />

              {/* Animation Type & Gift Name Banner Tag */}
              <div className="mt-0.5 px-3 py-0.5 rounded-full bg-stone-900/90 border border-amber-400/40 backdrop-blur-md text-amber-200 font-extrabold text-[10px] shadow-md z-10 flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{currentGift.name}</span>
                <span className="text-[9px] text-stone-400 font-semibold">• {currentGift.animationType || 'Divine Glow'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex space-x-1 px-3 py-2 border-b border-stone-800 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                const first = gifts.find(g => g.category === cat);
                if (first) setSelectedGift(first);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {cat === 'Devotional' && '🪔 '}
              {cat === 'Popular' && '🪶 '}
              {cat === 'Luxury' && '👑 '}
              {cat === 'Special' && '🌌 '}
              {cat}
            </button>
          ))}
        </div>

        {/* Gift Grid */}
        <div className="p-3 grid grid-cols-4 gap-2 overflow-y-auto max-h-56">
          {filteredGifts.map(gift => {
            const isSelected = currentGift?.id === gift.id;
            return (
              <button
                key={gift.id}
                onClick={() => setSelectedGift(gift)}
                className={`relative p-2 rounded-xl flex flex-col items-center justify-between text-center transition ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-900/40 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'bg-stone-800/60 border border-stone-700/60 hover:bg-stone-800 hover:border-stone-600'
                }`}
              >
                {gift.isVipOnly && (
                  <span className="absolute top-1 right-1 px-1 py-0.2 rounded text-[9px] font-black bg-purple-600 text-white leading-tight">
                    VIP
                  </span>
                )}
                <div className="text-3xl my-1 transform group-hover:scale-110 transition">
                  {gift.icon}
                </div>
                <div className="text-[11px] font-medium text-stone-200 line-clamp-1">
                  {gift.name}
                </div>
                <div className="text-xs font-bold text-amber-300 flex items-center space-x-0.5 mt-0.5">
                  <span>{gift.diamondPrice}</span>
                  <span className="text-[10px]">💎</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="mx-4 mb-2 p-2 rounded-lg bg-red-950/80 border border-red-500/50 flex items-center space-x-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer: Multiplier & Send Action */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex flex-col space-y-2">
          {/* Combo Multipliers */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Combo Multiplier:</span>
            </span>
            <div className="flex space-x-1">
              {multipliers.map(m => (
                <button
                  key={m}
                  onClick={() => setMultiplier(m)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                    multiplier === m
                      ? 'bg-amber-400 text-stone-950 shadow-sm'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 text-left px-2">
              <div className="text-[11px] text-stone-400">Total Deduction:</div>
              <div className="text-sm font-extrabold text-cyan-300 flex items-center space-x-1">
                <span>{totalCost.toLocaleString()} Diamonds</span>
                <span className="text-xs">💎</span>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={isSending || !currentGift}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition ${
                hasEnoughDiamonds
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-lg shadow-amber-500/20 active:scale-95'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
              ) : hasEnoughDiamonds ? (
                <>
                  <span>Send Gift</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <span>Insufficient 💎</span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center space-x-1 text-[10px] text-stone-500 pt-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Server-validated transaction & duplicate protection enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
