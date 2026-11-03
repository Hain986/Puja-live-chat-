export type UserRole = 'user' | 'creator' | 'moderator' | 'admin';

export interface UserProfile {
  uid: string;
  profileId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  isCreator?: boolean;
  bio?: string;
  followersCount?: number;
  vipLevel?: number;
}

export interface UserWallet {
  userId: string;
  diamondBalance: number;
  earningsBalance: number;
  lifetimePurchased: number;
  lifetimeSpent: number;
  lifetimeEarned: number;
  vipLevel: number;
  isFrozen: boolean;
  updatedAt: string;
}

export type TransactionType = 'purchase' | 'gift_sent' | 'gift_received' | 'withdrawal' | 'bonus';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FLAGGED' | 'REVERSED';

export interface TransactionRecord {
  id: string;
  idempotencyKey: string;
  userId: string;
  userName: string;
  type: TransactionType;
  amountDiamonds: number;
  amountFiatUSD?: number;
  giftId?: string;
  giftName?: string;
  giftIcon?: string;
  recipientId?: string;
  recipientName?: string;
  roomId?: string;
  status: TransactionStatus;
  riskScore: number;
  ipAddress?: string;
  createdAt: string;
}

export type GiftCategory = 'Devotional' | 'Popular' | 'Luxury' | 'Special';

export interface GiftItem {
  id: string;
  name: string;
  category: GiftCategory;
  diamondPrice: number;
  icon: string;
  animationType: string;
  soundEffect: string;
  description: string;
  isActive: boolean;
  isVipOnly: boolean;
}

export interface DiamondPackage {
  id: string;
  diamonds: number;
  bonus: number;
  priceUSD: number;
  priceINR: number;
  popular?: boolean;
  bestValue?: boolean;
}

export interface LiveRoom {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  category: string;
  isLive: boolean;
  viewerCount: number;
  totalDiamondsReceived: number;
  livekitRoomName: string;
  streamStartTime: string;
}

export interface LiveGiftEvent {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  animationType: string;
  soundEffect: string;
  quantity: number;
  totalDiamonds: number;
  vipLevel: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  vipLevel?: number;
  isBroadcaster?: boolean;
  isModerator?: boolean;
  timestamp: string;
  giftBanner?: {
    giftName: string;
    giftIcon: string;
    quantity: number;
    diamonds: number;
  };
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  total: number;
  vip?: number;
  rank?: number;
}

export interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  type: 'RAPID_PURCHASE_VELOCITY' | 'HIGH_VOLUME_GIFTING' | 'REPEATED_IDEMPOTENCY_RETRY' | 'BALANCE_ANOMALY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  timestamp: string;
}

export interface DailyRewardMilestone {
  day: number;
  diamonds: number;
  title: string;
  icon: string;
  description: string;
  state: 'claimed' | 'available' | 'locked';
}

export interface DailyRewardStatus {
  canClaimToday: boolean;
  currentStreak: number;
  lastCheckInDate: string;
  totalCheckIns: number;
  totalDiamondsClaimed: number;
  nextStreakDay: number;
  nextRewardDiamonds: number;
  milestones: DailyRewardMilestone[];
}

export type NotificationType = 'live_start' | 'message' | 'gift_received';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  senderId?: string;
  senderName?: string;
  isRead: boolean;
  metadata?: any;
  timestamp: any; // Using any for Firestore compatibility or string
}

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  completedReferrals: number;
  totalDiamondsEarned: number;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  status: 'joined' | 'completed';
  rewardAmount: number;
  createdAt: string;
  completedAt?: string;
}

export interface HighlightClip {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  videoUrl: string;
  caption: string;
  likesCount?: number;
  timestamp: string;
}
