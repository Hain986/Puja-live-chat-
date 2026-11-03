import React from 'react';
import { Crown, Sparkles, Diamond, Flame, Star, Shield } from 'lucide-react';

export interface BadgeInfo {
  label: string;
  icon: any;
  colorClass: string;
  tooltip: string;
}

export function getTopGifterBadge(lifetimeSpent: number = 0): BadgeInfo | null {
  if (lifetimeSpent >= 5000) {
    return {
      label: 'Apex Gifter',
      icon: Crown,
      colorClass: 'bg-gradient-to-r from-amber-500 to-yellow-300 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
      tooltip: 'Contributed 5,000+ Diamonds in lifetime gifts'
    };
  }
  if (lifetimeSpent >= 1500) {
    return {
      label: 'Elite Gifter',
      icon: Diamond,
      colorClass: 'bg-gradient-to-r from-pink-500 to-rose-400 text-white border-pink-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
      tooltip: 'Contributed 1,500+ Diamonds in lifetime gifts'
    };
  }
  if (lifetimeSpent >= 300) {
    return {
      label: 'Top Gifter',
      icon: Star,
      colorClass: 'bg-gradient-to-r from-cyan-500 to-blue-400 text-white border-cyan-300',
      tooltip: 'Contributed 300+ Diamonds in lifetime gifts'
    };
  }
  return null;
}

export function getSuperCreatorBadge(followersCount: number = 0, isCreator: boolean = false): BadgeInfo | null {
  if (!isCreator && followersCount < 1000) return null;

  if (followersCount >= 10000) {
    return {
      label: 'Super Creator',
      icon: Crown,
      colorClass: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-stone-950 border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
      tooltip: 'Elite Broadcaster with 10k+ followers & high engagement'
    };
  }
  if (isCreator || followersCount >= 1000) {
    return {
      label: 'Featured Star',
      icon: Flame,
      colorClass: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]',
      tooltip: 'Verified Live Streaming Star'
    };
  }
  return null;
}

export const UserBadgeDisplay: React.FC<{ 
  lifetimeSpent?: number; 
  followersCount?: number; 
  isCreator?: boolean;
  size?: 'sm' | 'md';
}> = ({ lifetimeSpent = 0, followersCount = 0, isCreator = false, size = 'sm' }) => {
  const gifterBadge = getTopGifterBadge(lifetimeSpent);
  const creatorBadge = getSuperCreatorBadge(followersCount, isCreator);

  if (!gifterBadge && !creatorBadge) return null;

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <div className="flex items-center space-x-1.5 flex-wrap">
      {creatorBadge && (
        <span className={`inline-flex items-center space-x-1 rounded-full font-black uppercase tracking-wider border ${creatorBadge.colorClass} ${sizeClasses}`}>
          <creatorBadge.icon className={`${iconSize} shrink-0`} />
          <span>{creatorBadge.label}</span>
        </span>
      )}
      {gifterBadge && (
        <span className={`inline-flex items-center space-x-1 rounded-full font-black uppercase tracking-wider border ${gifterBadge.colorClass} ${sizeClasses}`}>
          <gifterBadge.icon className={`${iconSize} shrink-0`} />
          <span>{gifterBadge.label}</span>
        </span>
      )}
    </div>
  );
};
