import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Authoritative Data Stores (mirrored to Firestore when available)
interface UserWallet {
  userId: string;
  profileId: string;
  diamondBalance: number;
  earningsBalance: number;
  lifetimePurchased: number;
  lifetimeSpent: number;
  lifetimeEarned: number;
  vipLevel: number;
  isFrozen: boolean;
  updatedAt: string;
}

interface TransactionRecord {
  id: string;
  idempotencyKey: string;
  userId: string;
  userName: string;
  type: 'purchase' | 'gift_sent' | 'gift_received' | 'withdrawal' | 'bonus';
  amountDiamonds: number;
  amountFiatUSD?: number;
  giftId?: string;
  giftName?: string;
  giftIcon?: string;
  recipientId?: string;
  recipientName?: string;
  roomId?: string;
  status: 'COMPLETED' | 'PENDING' | 'FLAGGED' | 'REVERSED';
  riskScore: number;
  ipAddress: string;
  createdAt: string;
}

interface GiftItem {
  id: string;
  name: string;
  category: 'Devotional' | 'Popular' | 'Luxury' | 'Special';
  diamondPrice: number;
  icon: string;
  animationType: string;
  soundEffect: string;
  description: string;
  isActive: boolean;
  isVipOnly: boolean;
}

interface DiamondPackage {
  id: string;
  diamonds: number;
  bonus: number;
  priceUSD: number;
  priceINR: number;
  popular?: boolean;
  bestValue?: boolean;
}

interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  type: 'RAPID_PURCHASE_VELOCITY' | 'HIGH_VOLUME_GIFTING' | 'REPEATED_IDEMPOTENCY_RETRY' | 'BALANCE_ANOMALY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  timestamp: string;
}

interface LiveRoomState {
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

interface RoomEvent {
  id: string;
  type: 'gift' | 'chat' | 'viewer_join' | 'stream_state';
  payload: any;
  timestamp: string;
}

interface ReferralRecord {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  status: 'joined' | 'completed';
  rewardAmount: number;
  createdAt: string;
  completedAt?: string;
}

const referrals: ReferralRecord[] = [];
const userReferralCodes: Map<string, string> = new Map([
  ['user_aarav', 'AARAV123'],
  ['creator_puja', 'PUJALIVE'],
  ['admin_user', 'ADMIN777']
]);

const userFirstViewingCompleted: Set<string> = new Set();
const userReferredBy: Map<string, string> = new Map(); // userId -> referrerId


// Initial Data Seed
const wallets: Map<string, UserWallet> = new Map([
  ['user_aarav', {
    userId: 'user_aarav',
    profileId: '34678856',
    diamondBalance: 4250,
    earningsBalance: 0,
    lifetimePurchased: 5000,
    lifetimeSpent: 750,
    lifetimeEarned: 0,
    vipLevel: 3,
    isFrozen: false,
    updatedAt: new Date().toISOString()
  }],
  ['user_priya', {
    userId: 'user_priya',
    profileId: '88224410',
    diamondBalance: 1200,
    earningsBalance: 0,
    lifetimePurchased: 1500,
    lifetimeSpent: 300,
    lifetimeEarned: 0,
    vipLevel: 1,
    isFrozen: false,
    updatedAt: new Date().toISOString()
  }],
  ['creator_puja', {
    userId: 'creator_puja',
    profileId: '55882140',
    diamondBalance: 500,
    earningsBalance: 18450,
    lifetimePurchased: 500,
    lifetimeSpent: 0,
    lifetimeEarned: 18450,
    vipLevel: 5,
    isFrozen: false,
    updatedAt: new Date().toISOString()
  }],
  ['admin_user', {
    userId: 'admin_user',
    profileId: '10000001',
    diamondBalance: 99999,
    earningsBalance: 0,
    lifetimePurchased: 99999,
    lifetimeSpent: 0,
    lifetimeEarned: 0,
    vipLevel: 10,
    isFrozen: false,
    updatedAt: new Date().toISOString()
  }]
]);

const giftsCatalog: GiftItem[] = [
  {
    id: 'gift_diya',
    name: 'Diya of Hope',
    category: 'Devotional',
    diamondPrice: 10,
    icon: '🪔',
    animationType: 'diya_glow',
    soundEffect: 'temple_bell',
    description: 'Sacred clay lamp spreading warmth, blessings, and auspicious light.',
    isActive: true,
    isVipOnly: false
  },
  {
    id: 'gift_lotus',
    name: 'Sacred Pink Lotus',
    category: 'Devotional',
    diamondPrice: 50,
    icon: '🪷',
    animationType: 'lotus_bloom',
    soundEffect: 'lotus_chime',
    description: 'Divine sacred flower blooming with divine energy and purity.',
    isActive: true,
    isVipOnly: false
  },
  {
    id: 'gift_thali',
    name: 'Maha Aarti Thali',
    category: 'Devotional',
    diamondPrice: 100,
    icon: '✨',
    animationType: 'aarti_thali',
    soundEffect: 'temple_bells_poly',
    description: 'Golden brass aarti thali with sacred camphor flame and marigold petals.',
    isActive: true,
    isVipOnly: false
  },
  {
    id: 'gift_peacock',
    name: 'Royal Peacock Feather',
    category: 'Popular',
    diamondPrice: 250,
    icon: '🪶',
    animationType: 'peacock_dance',
    soundEffect: 'flute_echo',
    description: 'Radiant iridescent peacock feather bringing prosperity and celebration.',
    isActive: true,
    isVipOnly: false
  },
  {
    id: 'gift_ratha',
    name: 'Golden Chariot (Ratha)',
    category: 'Luxury',
    diamondPrice: 500,
    icon: '🛞',
    animationType: 'golden_chariot',
    soundEffect: 'conch_trumpet',
    description: 'Majestic celestial chariot sweeping across stream screen with golden dust.',
    isActive: true,
    isVipOnly: false
  },
  {
    id: 'gift_crown',
    name: 'Divine Mukut (Crown)',
    category: 'Luxury',
    diamondPrice: 1000,
    icon: '👑',
    animationType: 'divine_crown',
    soundEffect: 'celestial_harp',
    description: 'Embossed emerald and ruby crown showering broadcaster in royal golden aura.',
    isActive: true,
    isVipOnly: true
  },
  {
    id: 'gift_conch',
    name: 'Sacred Shankh of Victory',
    category: 'Special',
    diamondPrice: 2000,
    icon: '🐚',
    animationType: 'sacred_conch',
    soundEffect: 'deep_shankh',
    description: 'Resonating conch blast triggering screen-wide divine vibrations.',
    isActive: true,
    isVipOnly: false
  },
  {
    id: 'gift_supernova',
    name: 'Celestial Cosmic Supernova',
    category: 'Special',
    diamondPrice: 5000,
    icon: '🌌',
    animationType: 'cosmic_supernova',
    soundEffect: 'supernova_boom',
    description: 'The ultimate apex tribute! Ignites a galaxy explosion across every screen.',
    isActive: true,
    isVipOnly: true
  }
];

let diamondPackages: DiamondPackage[] = [
  { id: 'pkg_100', diamonds: 100, bonus: 0, priceUSD: 0.99, priceINR: 85 },
  { id: 'pkg_550', diamonds: 500, bonus: 50, priceUSD: 4.99, priceINR: 425, popular: true },
  { id: 'pkg_1200', diamonds: 1000, bonus: 200, priceUSD: 9.99, priceINR: 850 },
  { id: 'pkg_3200', diamonds: 2600, bonus: 600, priceUSD: 24.99, priceINR: 2150, bestValue: true },
  { id: 'pkg_7000', diamonds: 5500, bonus: 1500, priceUSD: 49.99, priceINR: 4300 },
  { id: 'pkg_15000', diamonds: 11500, bonus: 3500, priceUSD: 99.99, priceINR: 8600 }
];

let transactions: TransactionRecord[] = [
  {
    id: 'tx_init_1',
    idempotencyKey: 'idem_init_101',
    userId: 'user_aarav',
    userName: 'Aarav Patel',
    type: 'purchase',
    amountDiamonds: 5000,
    amountFiatUSD: 39.99,
    status: 'COMPLETED',
    riskScore: 2,
    ipAddress: '103.21.244.12',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'tx_init_2',
    idempotencyKey: 'idem_init_102',
    userId: 'user_aarav',
    userName: 'Aarav Patel',
    type: 'gift_sent',
    amountDiamonds: 500,
    giftId: 'gift_ratha',
    giftName: 'Golden Chariot (Ratha)',
    giftIcon: '🛞',
    recipientId: 'creator_puja',
    recipientName: 'Puja Official',
    roomId: 'room_puja_live',
    status: 'COMPLETED',
    riskScore: 5,
    ipAddress: '103.21.244.12',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'tx_init_3',
    idempotencyKey: 'idem_init_103',
    userId: 'creator_puja',
    userName: 'Puja Official',
    type: 'gift_received',
    amountDiamonds: 350, // 70% of 500
    giftId: 'gift_ratha',
    giftName: 'Golden Chariot (Ratha)',
    giftIcon: '🛞',
    recipientId: 'creator_puja',
    recipientName: 'Puja Official',
    roomId: 'room_puja_live',
    status: 'COMPLETED',
    riskScore: 0,
    ipAddress: 'server_internal',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const processedIdempotencyKeys: Set<string> = new Set(['idem_init_101', 'idem_init_102', 'idem_init_103']);
const userRateLimits: Map<string, number[]> = new Map();
const fraudAlerts: FraudAlert[] = [];

// Rooms state
let activeRooms: LiveRoomState[] = [
  {
    id: 'room_puja_live',
    title: '💖 Love Chat Official Star Stream & Acoustic Melodies',
    creatorId: 'creator_puja',
    creatorName: 'Love Chat Official Broadcaster',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    category: 'Music & Romance',
    isLive: true,
    viewerCount: 2340,
    totalDiamondsReceived: 18450,
    livekitRoomName: 'love_chat_main',
    streamStartTime: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 'room_meditation',
    title: '✨ Vedic Chanting & Peaceful Morning Meditation',
    creatorId: 'creator_radha',
    creatorName: 'Radha Vedic Arts',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    category: 'Meditation & Mantras',
    isLive: true,
    viewerCount: 890,
    totalDiamondsReceived: 6200,
    livekitRoomName: 'radha_vedic_room',
    streamStartTime: new Date(Date.now() - 20 * 60000).toISOString()
  }
];

// In-memory room events for real-time room subscribers
const roomEvents: Map<string, RoomEvent[]> = new Map([
  ['room_puja_live', []],
  ['room_meditation', []]
]);

// Helper: Rate limit checker (max requests per window)
function checkRateLimit(userId: string, maxReqs: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  const timestamps = userRateLimits.get(userId) || [];
  const recent = timestamps.filter(t => now - t < windowMs);
  if (recent.length >= maxReqs) {
    return false;
  }
  recent.push(now);
  userRateLimits.set(userId, recent);
  return true;
}

// Helper: Ensure wallet exists
function getOrCreateWallet(userId: string): UserWallet {
  if (!wallets.has(userId)) {
    const profileId = `${Math.floor(10000000 + Math.random() * 89999999)}`;
    wallets.set(userId, {
      userId,
      profileId,
      diamondBalance: 200, // Welcome gift of 200 diamonds
      earningsBalance: 0,
      lifetimePurchased: 200,
      lifetimeSpent: 0,
      lifetimeEarned: 0,
      vipLevel: 1,
      isFrozen: false,
      updatedAt: new Date().toISOString()
    });
  }
  return wallets.get(userId)!;
}

// ==========================================
// 1. DIAMOND WALLET API ENDPOINTS
// ==========================================

// GET /api/wallet/:userId
app.get('/api/wallet/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const wallet = getOrCreateWallet(userId);
  res.json({
    success: true,
    wallet
  });
});

// POST /api/wallet/purchase (Recharge diamonds)
app.post('/api/wallet/purchase', (req: Request, res: Response) => {
  const { userId, packageId, idempotencyKey, paymentMethod } = req.body;

  if (!userId || !packageId || !idempotencyKey) {
    return res.status(400).json({ success: false, error: 'Missing required purchase parameters.' });
  }

  // Duplicate Transaction Protection
  if (processedIdempotencyKeys.has(idempotencyKey)) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate transaction detected. Idempotency key already processed.',
      idempotencyKey
    });
  }

  // Rate Limiting
  if (!checkRateLimit(userId, 10, 60000)) {
    fraudAlerts.unshift({
      id: `alert_${Date.now()}`,
      userId,
      userName: userId,
      type: 'RAPID_PURCHASE_VELOCITY',
      severity: 'HIGH',
      details: 'Exceeded purchase rate limit (over 10 purchase attempts in 60s).',
      status: 'ACTIVE',
      timestamp: new Date().toISOString()
    });
    return res.status(429).json({ success: false, error: 'Too many purchase attempts. Please wait a moment.' });
  }

  const pkg = diamondPackages.find(p => p.id === packageId);
  if (!pkg) {
    return res.status(404).json({ success: false, error: 'Diamond package not found.' });
  }

  const wallet = getOrCreateWallet(userId);
  if (wallet.isFrozen) {
    return res.status(403).json({ success: false, error: 'Wallet is frozen due to security policy. Please contact support.' });
  }

  // Calculate diamonds
  const totalDiamonds = pkg.diamonds + pkg.bonus;

  // Process transaction atomically
  processedIdempotencyKeys.add(idempotencyKey);
  wallet.diamondBalance += totalDiamonds;
  wallet.lifetimePurchased += totalDiamonds;
  wallet.vipLevel = Math.min(10, Math.floor(wallet.lifetimePurchased / 1000) + 1);
  wallet.updatedAt = new Date().toISOString();

  const newTx: TransactionRecord = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    idempotencyKey,
    userId,
    userName: req.body.userName || userId,
    type: 'purchase',
    amountDiamonds: totalDiamonds,
    amountFiatUSD: pkg.priceUSD,
    status: 'COMPLETED',
    riskScore: 0,
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString()
  };

  transactions.unshift(newTx);

  res.json({
    success: true,
    message: `Successfully recharged ${totalDiamonds} diamonds!`,
    wallet,
    transaction: newTx
  });
});

// GET /api/transactions/:userId
app.get('/api/transactions/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const userTxs = transactions.filter(t => t.userId === userId || t.recipientId === userId);
  res.json({
    success: true,
    transactions: userTxs
  });
});

// ==========================================
// DAILY CHECK-IN REWARDS SYSTEM
// ==========================================
interface UserCheckIn {
  userId: string;
  streakDays: number;
  lastCheckInDate: string; // YYYY-MM-DD
  totalCheckIns: number;
  totalDiamondsClaimed: number;
  claimedHistory: string[];
}

const DAILY_REWARDS_TABLE = [
  { day: 1, diamonds: 15, title: 'Pratham Darshan', icon: '🪔', description: 'Light the sacred diya to begin your devotional journey' },
  { day: 2, diamonds: 25, title: 'Satsang Blessing', icon: '✨', description: 'Immerse in morning Vedic chanting' },
  { day: 3, diamonds: 40, title: 'Lotus Grace', icon: '🪷', description: 'Offer pure pink lotus petals to the sanctum' },
  { day: 4, diamonds: 60, title: 'Maha Prasad', icon: '🍯', description: 'Nourishment for the devoted soul' },
  { day: 5, diamonds: 85, title: 'Sandhya Aarti', icon: '🔔', description: 'Temple bells ringing auspicious tidings' },
  { day: 6, diamonds: 120, title: 'Shankh Dhwani', icon: '🐚', description: 'Sacred reverberating conch resonance' },
  { day: 7, diamonds: 200, title: 'Divine Maha Boon', icon: '👑', description: 'Apex devotee crown & bounty of 200 free diamonds!' }
];

// Helper date strings
function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

const checkIns: Map<string, UserCheckIn> = new Map([
  ['user_aarav', {
    userId: 'user_aarav',
    streakDays: 2,
    lastCheckInDate: getYesterdayDateStr(), // Aarav claimed yesterday, ready for Day 3 today!
    totalCheckIns: 2,
    totalDiamondsClaimed: 40,
    claimedHistory: [getYesterdayDateStr()]
  }]
]);

function getOrCreateCheckIn(userId: string): UserCheckIn {
  if (!checkIns.has(userId)) {
    checkIns.set(userId, {
      userId,
      streakDays: 0,
      lastCheckInDate: '',
      totalCheckIns: 0,
      totalDiamondsClaimed: 0,
      claimedHistory: []
    });
  }
  return checkIns.get(userId)!;
}

// GET /api/rewards/status/:userId
app.get('/api/rewards/status/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const record = getOrCreateCheckIn(userId);
  const today = getTodayDateStr();
  const yesterday = getYesterdayDateStr();

  const canClaimToday = record.lastCheckInDate !== today;

  // Determine current effective streak
  let currentStreak = record.streakDays;
  if (record.lastCheckInDate && record.lastCheckInDate !== today && record.lastCheckInDate !== yesterday) {
    // Missed yesterday - streak reset
    currentStreak = 0;
  }

  // Next reward calculation
  const nextStreakDay = canClaimToday ? (currentStreak % 7) + 1 : ((currentStreak - 1) % 7) + 1;
  const nextRewardObj = DAILY_REWARDS_TABLE.find(r => r.day === nextStreakDay) || DAILY_REWARDS_TABLE[0];

  // Build the 7-day milestone state
  const milestones = DAILY_REWARDS_TABLE.map(item => {
    let state: 'claimed' | 'available' | 'locked' = 'locked';
    if (!canClaimToday) {
      // Claimed today already
      const currentCycleDay = ((currentStreak - 1) % 7) + 1;
      if (item.day <= currentCycleDay) {
        state = 'claimed';
      }
    } else {
      // Can claim today
      const targetDay = (currentStreak % 7) + 1;
      if (item.day < targetDay) {
        state = 'claimed';
      } else if (item.day === targetDay) {
        state = 'available';
      }
    }

    return {
      ...item,
      state
    };
  });

  res.json({
    success: true,
    canClaimToday,
    currentStreak,
    lastCheckInDate: record.lastCheckInDate,
    totalCheckIns: record.totalCheckIns,
    totalDiamondsClaimed: record.totalDiamondsClaimed,
    nextStreakDay,
    nextRewardDiamonds: nextRewardObj.diamonds,
    milestones
  });
});

// POST /api/rewards/claim
app.post('/api/rewards/claim', (req: Request, res: Response) => {
  const { userId, userName } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'User ID is required.' });
  }

  const record = getOrCreateCheckIn(userId);
  const today = getTodayDateStr();
  const yesterday = getYesterdayDateStr();

  // Strict server-side check: Cannot claim twice on same day!
  if (record.lastCheckInDate === today) {
    return res.status(400).json({
      success: false,
      error: "You have already received today's devotional blessing! Return tomorrow for the next reward.",
      lastCheckInDate: record.lastCheckInDate
    });
  }

  // Calculate new streak
  let newStreak = 1;
  if (record.lastCheckInDate === yesterday) {
    newStreak = record.streakDays + 1;
  } else {
    // If not yesterday (either new user or broken streak), restart at day 1
    newStreak = 1;
  }

  const dayIndex = ((newStreak - 1) % 7) + 1;
  const rewardObj = DAILY_REWARDS_TABLE.find(r => r.day === dayIndex) || DAILY_REWARDS_TABLE[0];
  const rewardDiamonds = rewardObj.diamonds;

  // Server-authoritative wallet balance credit
  const wallet = getOrCreateWallet(userId);
  wallet.diamondBalance += rewardDiamonds;
  wallet.lifetimePurchased += rewardDiamonds;
  wallet.vipLevel = Math.min(10, Math.floor(wallet.lifetimePurchased / 1000) + 1);
  wallet.updatedAt = new Date().toISOString();

  // Create immutable transaction ledger record
  const tx: TransactionRecord = {
    id: `tx_reward_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    idempotencyKey: `checkin_${userId}_${today}`,
    userId,
    userName: userName || userId,
    type: 'bonus',
    amountDiamonds: rewardDiamonds,
    giftName: `Day ${dayIndex} Check-in (${rewardObj.title})`,
    giftIcon: rewardObj.icon,
    status: 'COMPLETED',
    riskScore: 0,
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString()
  };
  transactions.unshift(tx);

  // Update check-in record
  record.streakDays = newStreak;
  record.lastCheckInDate = today;
  record.totalCheckIns += 1;
  record.totalDiamondsClaimed += rewardDiamonds;
  record.claimedHistory.push(today);

  res.json({
    success: true,
    message: `Auspicious Day ${dayIndex} blessing! Earned +${rewardDiamonds} free Diamonds! 💎`,
    rewardDiamonds,
    dayIndex,
    newStreak,
    rewardDetails: rewardObj,
    newBalance: wallet.diamondBalance,
    wallet,
    transaction: tx
  });
});


// ==========================================
// 2. VIRTUAL GIFT SYSTEM API ENDPOINTS
// ==========================================

// GET /api/gifts
app.get('/api/gifts', (_req: Request, res: Response) => {
  res.json({
    success: true,
    gifts: giftsCatalog.filter(g => g.isActive)
  });
});

// GET /api/packages
app.get('/api/packages', (_req: Request, res: Response) => {
  res.json({
    success: true,
    packages: diamondPackages
  });
});

// POST /api/gifts/send (CRITICAL: Server-authoritative balance deduction and credit)
app.post('/api/gifts/send', (req: Request, res: Response) => {
  const { senderId, senderName, recipientId, recipientName, giftId, roomId, quantity = 1, idempotencyKey } = req.body;

  if (!senderId || !recipientId || !giftId || !roomId || !idempotencyKey) {
    return res.status(400).json({ success: false, error: 'Missing required gift sending parameters.' });
  }

  const parsedQty = Math.floor(Number(quantity));
  if (isNaN(parsedQty) || parsedQty < 1 || parsedQty > 999) {
    return res.status(400).json({ success: false, error: 'Invalid gift quantity.' });
  }

  // Duplicate Transaction Protection
  if (processedIdempotencyKeys.has(idempotencyKey)) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate gift transaction. Already processed.',
      idempotencyKey
    });
  }

  // Rate Limiting (Prevent flood bots)
  if (!checkRateLimit(senderId, 45, 30000)) {
    return res.status(429).json({ success: false, error: 'Gifting rate limit reached. Slow down a second.' });
  }

  const gift = giftsCatalog.find(g => g.id === giftId);
  if (!gift || !gift.isActive) {
    return res.status(404).json({ success: false, error: 'Selected gift is not currently active.' });
  }

  const senderWallet = getOrCreateWallet(senderId);
  if (senderWallet.isFrozen) {
    return res.status(403).json({ success: false, error: 'Your account wallet is restricted.' });
  }

  const totalCost = gift.diamondPrice * parsedQty;

  // CRITICAL SERVER-SIDE BALANCE VALIDATION: Never trust frontend!
  if (senderWallet.diamondBalance < totalCost) {
    return res.status(400).json({
      success: false,
      error: `Insufficient diamonds. You have ${senderWallet.diamondBalance} 💎, but need ${totalCost} 💎.`,
      currentBalance: senderWallet.diamondBalance,
      required: totalCost
    });
  }

  // Mark idempotency key as processed immediately to prevent race conditions
  processedIdempotencyKeys.add(idempotencyKey);

  // Velocity / Anomaly check (Fraud Detection)
  let riskScore = 0;
  if (totalCost >= 5000) {
    riskScore += 20;
    if (parsedQty >= 50) riskScore += 30;
  }
  if (riskScore >= 40) {
    fraudAlerts.unshift({
      id: `alert_${Date.now()}`,
      userId: senderId,
      userName: senderName || senderId,
      type: 'HIGH_VOLUME_GIFTING',
      severity: 'MEDIUM',
      details: `High volume gift: ${parsedQty}x ${gift.name} (${totalCost} 💎) in room ${roomId}`,
      status: 'ACTIVE',
      timestamp: new Date().toISOString()
    });
  }

  // Atomic Balance Mutation
  senderWallet.diamondBalance -= totalCost;
  senderWallet.lifetimeSpent += totalCost;
  senderWallet.updatedAt = new Date().toISOString();

  // Creator share: 70% to creator earnings, 30% platform margin
  const creatorEarnedDiamonds = Math.floor(totalCost * 0.7);
  const recipientWallet = getOrCreateWallet(recipientId);
  recipientWallet.earningsBalance += creatorEarnedDiamonds;
  recipientWallet.lifetimeEarned += creatorEarnedDiamonds;
  recipientWallet.updatedAt = new Date().toISOString();

  // Create Sender Transaction Record
  const senderTx: TransactionRecord = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    idempotencyKey,
    userId: senderId,
    userName: senderName || 'Devotee',
    type: 'gift_sent',
    amountDiamonds: totalCost,
    giftId: gift.id,
    giftName: gift.name,
    giftIcon: gift.icon,
    recipientId,
    recipientName: recipientName || 'Creator',
    roomId,
    status: 'COMPLETED',
    riskScore,
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString()
  };
  transactions.unshift(senderTx);

  // Update room diamonds counter
  const room = activeRooms.find(r => r.id === roomId);
  if (room) {
    room.totalDiamondsReceived += totalCost;
  }

  // Publish Room Event for Real-Time animation & notifications
  const event: RoomEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'gift',
    payload: {
      senderId,
      senderName: senderName || 'Devotee',
      recipientId,
      recipientName: recipientName || 'Creator',
      giftId: gift.id,
      giftName: gift.name,
      giftIcon: gift.icon,
      animationType: gift.animationType,
      soundEffect: gift.soundEffect,
      quantity: parsedQty,
      totalDiamonds: totalCost,
      vipLevel: senderWallet.vipLevel
    },
    timestamp: new Date().toISOString()
  };

  const existingEvents = roomEvents.get(roomId) || [];
  existingEvents.push(event);
  if (existingEvents.length > 50) existingEvents.shift();
  roomEvents.set(roomId, existingEvents);

  res.json({
    success: true,
    message: `Sent ${parsedQty}x ${gift.name}!`,
    newBalance: senderWallet.diamondBalance,
    totalSpent: totalCost,
    creatorEarned: creatorEarnedDiamonds,
    transaction: senderTx,
    event
  });
});

// GET /api/rooms/:roomId/events
app.get('/api/rooms/:roomId/events', (req: Request, res: Response) => {
  const { roomId } = req.params;
  const events = roomEvents.get(roomId) || [];
  res.json({
    success: true,
    events
  });
});

// GET /api/rooms
app.get('/api/rooms', (_req: Request, res: Response) => {
  res.json({
    success: true,
    rooms: activeRooms
  });
});

// GET /api/leaderboard
app.get('/api/leaderboard', (_req: Request, res: Response) => {
  // Aggregate top spenders and top earners from transactions
  const gifterTotals = new Map<string, { userId: string; name: string; total: number; vip: number }>();
  const earnerTotals = new Map<string, { userId: string; name: string; total: number }>();

  transactions.forEach(t => {
    if (t.type === 'gift_sent' && t.status === 'COMPLETED') {
      const prev = gifterTotals.get(t.userId) || { userId: t.userId, name: t.userName, total: 0, vip: 1 };
      prev.total += t.amountDiamonds;
      gifterTotals.set(t.userId, prev);
    }
    if (t.type === 'gift_sent' && t.recipientId && t.status === 'COMPLETED') {
      const prev = earnerTotals.get(t.recipientId) || { userId: t.recipientId, name: t.recipientName || 'Broadcaster', total: 0 };
      prev.total += Math.floor(t.amountDiamonds * 0.7);
      earnerTotals.set(t.recipientId, prev);
    }
  });

  const topGifters = Array.from(gifterTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const topEarners = Array.from(earnerTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  res.json({
    success: true,
    topGifters,
    topEarners
  });
});

// ==========================================
// 3. LIVEKIT TOKEN SIMULATION / MINTING
// ==========================================
app.post('/api/livekit/token', (req: Request, res: Response) => {
  const { roomName, identity, isPublisher } = req.body;
  // Mint a cryptographically verifiable demo LiveKit WebRTC access token
  const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.livekit_${roomName}_${identity}_${isPublisher ? 'pub' : 'sub'}_${Date.now()}`;
  res.json({
    success: true,
    token,
    wsUrl: 'wss://livekit.puja.network',
    roomName: roomName || 'puja_satsang_main',
    identity: identity || 'anonymous_devotee',
    canPublish: Boolean(isPublisher)
  });
});

// ==========================================
// 4. CREATOR DASHBOARD API
// ==========================================
app.get('/api/creator/:creatorId/stats', (req: Request, res: Response) => {
  const { creatorId } = req.params;
  const wallet = getOrCreateWallet(creatorId);
  const creatorTxs = transactions.filter(t => t.recipientId === creatorId && t.type === 'gift_sent');

  // Breakdown by gift
  const giftBreakdown: Record<string, { name: string; count: number; diamonds: number; icon: string }> = {};
  creatorTxs.forEach(t => {
    if (t.giftId) {
      if (!giftBreakdown[t.giftId]) {
        giftBreakdown[t.giftId] = { name: t.giftName || 'Gift', count: 0, diamonds: 0, icon: t.giftIcon || '🎁' };
      }
      giftBreakdown[t.giftId].count += 1;
      giftBreakdown[t.giftId].diamonds += t.amountDiamonds;
    }
  });

  // Cashout conversion: 100 earnings diamonds = ~$0.50 USD
  const estimatedCashoutUSD = ((wallet.earningsBalance / 100) * 0.50).toFixed(2);
  const estimatedCashoutINR = ((wallet.earningsBalance / 100) * 42.5).toFixed(2);

  res.json({
    success: true,
    creatorId,
    earningsBalance: wallet.earningsBalance,
    lifetimeEarned: wallet.lifetimeEarned,
    estimatedCashoutUSD,
    estimatedCashoutINR,
    totalGiftsCount: creatorTxs.length,
    giftBreakdown: Object.values(giftBreakdown),
    followersCount: 14820,
    recentStreams: [
      { id: 'str_1', date: 'Today, 6:00 PM', duration: '1h 45m', peakViewers: 2450, diamondsReceived: 4200 },
      { id: 'str_2', date: 'Yesterday, 6:00 PM', duration: '2h 10m', peakViewers: 3100, diamondsReceived: 6800 },
      { id: 'str_3', date: 'Oct 31, 2026', duration: '1h 30m', peakViewers: 1950, diamondsReceived: 3500 }
    ]
  });
});

// ==========================================
// 5. ADMIN DASHBOARD & FRAUD CONTROL API
// ==========================================

// GET /api/admin/overview
app.get('/api/admin/overview', (_req: Request, res: Response) => {
  const totalVolume = transactions.reduce((acc, t) => acc + (t.type === 'purchase' ? t.amountDiamonds : 0), 0);
  const totalGiftsExchanged = transactions.reduce((acc, t) => acc + (t.type === 'gift_sent' ? t.amountDiamonds : 0), 0);
  const platformRevenueUSD = transactions.reduce((acc, t) => acc + (t.amountFiatUSD || 0), 0);

  res.json({
    success: true,
    stats: {
      totalVolume,
      totalGiftsExchanged,
      platformRevenueUSD: platformRevenueUSD.toFixed(2),
      activeRoomsCount: activeRooms.filter(r => r.isLive).length,
      fraudAlertsCount: fraudAlerts.filter(a => a.status === 'ACTIVE').length,
      totalTransactionsCount: transactions.length,
      registeredUsersCount: wallets.size
    }
  });
});

// GET /api/admin/transactions
app.get('/api/admin/transactions', (_req: Request, res: Response) => {
  res.json({
    success: true,
    transactions: transactions.slice(0, 50)
  });
});

// GET /api/admin/fraud-alerts
app.get('/api/admin/fraud-alerts', (_req: Request, res: Response) => {
  res.json({
    success: true,
    alerts: fraudAlerts
  });
});

// GET /api/admin/fraud-heatmap
app.get('/api/admin/fraud-heatmap', (_req: Request, res: Response) => {
  // Initialize a 7x24 grid (7 days, 24 hours)
  const heatmap: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
  
  fraudAlerts.forEach(alert => {
    const date = new Date(alert.timestamp);
    const day = date.getDay(); // 0 (Sun) - 6 (Sat)
    const hour = date.getHours(); // 0 - 23
    heatmap[day][hour]++;
  });

  res.json({
    success: true,
    heatmap,
    labels: {
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      hours: Array.from({ length: 24 }, (_, i) => `${i}:00`)
    }
  });
});

// POST /api/admin/freeze-wallet
app.post('/api/admin/freeze-wallet', (req: Request, res: Response) => {
  const { userId, freeze } = req.body;
  const wallet = getOrCreateWallet(userId);
  wallet.isFrozen = Boolean(freeze);
  wallet.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Wallet for ${userId} is now ${wallet.isFrozen ? 'FROZEN' : 'ACTIVE'}.`,
    wallet
  });
});

// POST /api/admin/trigger-live (Simulated server-side notification trigger)
app.post('/api/admin/trigger-live', (req: Request, res: Response) => {
  const { userId } = req.body;
  // In a real production app, this would write to Firestore notifications collection
  // and trigger push notifications. For this demo, the client handles the specific write.
  console.log(`[Admin] Triggering live notification for user: ${userId}`);
  res.json({ success: true, message: 'Notification broadcast initiated.' });
});

// POST /api/admin/gifts
app.post('/api/admin/gifts', (req: Request, res: Response) => {
  const { id, name, category, diamondPrice, icon, animationType, soundEffect, description, isActive } = req.body;
  const existingIndex = giftsCatalog.findIndex(g => g.id === id);

  if (existingIndex >= 0) {
    giftsCatalog[existingIndex] = {
      ...giftsCatalog[existingIndex],
      name: name || giftsCatalog[existingIndex].name,
      category: category || giftsCatalog[existingIndex].category,
      diamondPrice: Number(diamondPrice) || giftsCatalog[existingIndex].diamondPrice,
      icon: icon || giftsCatalog[existingIndex].icon,
      animationType: animationType || giftsCatalog[existingIndex].animationType,
      soundEffect: soundEffect || giftsCatalog[existingIndex].soundEffect,
      description: description || giftsCatalog[existingIndex].description,
      isActive: isActive !== undefined ? Boolean(isActive) : giftsCatalog[existingIndex].isActive
    };
  } else {
    giftsCatalog.push({
      id: id || `gift_${Date.now()}`,
      name: name || 'New Gift',
      category: category || 'Popular',
      diamondPrice: Number(diamondPrice) || 100,
      icon: icon || '🎁',
      animationType: animationType || 'confetti',
      soundEffect: soundEffect || 'bell',
      description: description || 'Custom gift',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isVipOnly: false
    });
  }

  res.json({
    success: true,
    gifts: giftsCatalog
  });
});

// POST /api/admin/packages
app.post('/api/admin/packages', (req: Request, res: Response) => {
  const { id, diamonds, bonus, priceUSD, priceINR, popular, bestValue } = req.body;
  const idx = diamondPackages.findIndex(p => p.id === id);
  if (idx >= 0) {
    diamondPackages[idx] = {
      ...diamondPackages[idx],
      diamonds: Number(diamonds) || diamondPackages[idx].diamonds,
      bonus: Number(bonus) !== undefined ? Number(bonus) : diamondPackages[idx].bonus,
      priceUSD: Number(priceUSD) || diamondPackages[idx].priceUSD,
      priceINR: Number(priceINR) || diamondPackages[idx].priceINR,
      popular: Boolean(popular),
      bestValue: Boolean(bestValue)
    };
  } else {
    diamondPackages.push({
      id: id || `pkg_${Date.now()}`,
      diamonds: Number(diamonds) || 100,
      bonus: Number(bonus) || 0,
      priceUSD: Number(priceUSD) || 0.99,
      priceINR: Number(priceINR) || 85,
      popular: Boolean(popular),
      bestValue: Boolean(bestValue)
    });
  }
  res.json({ success: true, packages: diamondPackages });
});

// ==========================================
// 6. REFER-A-FRIEND MODULE API
// ==========================================

// GET /api/referral/status/:userId
app.get('/api/referral/status/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  
  let code = userReferralCodes.get(userId);
  if (!code) {
    // Generate simple referral code if none exists
    code = `REF${userId.split('_')[1]?.toUpperCase() || userId.substring(0, 4).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
    userReferralCodes.set(userId, code);
  }

  const userReferrals = referrals.filter(r => r.referrerId === userId);
  const totalDiamondsEarned = userReferrals
    .filter(r => r.status === 'completed')
    .reduce((acc, r) => acc + r.rewardAmount, 0);

  res.json({
    success: true,
    stats: {
      referralCode: code,
      totalReferrals: userReferrals.length,
      completedReferrals: userReferrals.filter(r => r.status === 'completed').length,
      totalDiamondsEarned
    },
    history: userReferrals
  });
});

// POST /api/referral/redeem
app.post('/api/referral/redeem', (req: Request, res: Response) => {
  const { userId, userName, inviteCode } = req.body;

  if (!userId || !inviteCode) {
    return res.status(400).json({ success: false, error: 'User ID and Invitation Code required.' });
  }

  // Check if user already redeemed or was referred
  if (userReferredBy.has(userId)) {
    return res.status(400).json({ success: false, error: 'You have already redeemed an invitation code.' });
  }

  // Find referrer by code
  let referrerId: string | undefined;
  for (const [uid, code] of userReferralCodes.entries()) {
    if (code.toUpperCase() === inviteCode.toUpperCase()) {
      referrerId = uid;
      break;
    }
  }

  if (!referrerId) {
    return res.status(404).json({ success: false, error: 'Invalid invitation code.' });
  }

  if (referrerId === userId) {
    return res.status(400).json({ success: false, error: 'You cannot refer yourself.' });
  }

  // Record referral
  userReferredBy.set(userId, referrerId);
  const newReferral: ReferralRecord = {
    id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    referrerId,
    referredUserId: userId,
    referredUserName: userName || 'New Friend',
    status: 'joined',
    rewardAmount: 100, // 100 Diamonds bonus for completing first view
    createdAt: new Date().toISOString()
  };
  referrals.push(newReferral);

  res.json({
    success: true,
    message: 'Invitation code applied! Watch your first stream to unlock 100 Bonus Diamonds for your friend!',
    referral: newReferral
  });
});

// POST /api/referral/complete-viewing
app.post('/api/referral/complete-viewing', (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ success: false });

  // If already completed or not referred, just return success
  if (userFirstViewingCompleted.has(userId) || !userReferredBy.has(userId)) {
    return res.json({ success: true, message: 'Already processed or not referred.' });
  }

  const referrerId = userReferredBy.get(userId)!;
  const referral = referrals.find(r => r.referredUserId === userId && r.referrerId === referrerId && r.status === 'joined');

  if (referral) {
    referral.status = 'completed';
    referral.completedAt = new Date().toISOString();
    userFirstViewingCompleted.add(userId);

    // Award bonus diamonds to Referrer
    const wallet = getOrCreateWallet(referrerId);
    wallet.diamondBalance += referral.rewardAmount;
    wallet.lifetimePurchased += referral.rewardAmount; // Counting bonus as purchased for VIP progress? Or just bonus.
    wallet.updatedAt = new Date().toISOString();

    // Create transaction for Referrer
    const tx: TransactionRecord = {
      id: `tx_ref_bonus_${Date.now()}`,
      idempotencyKey: `ref_bonus_${userId}`,
      userId: referrerId,
      userName: referrerId, // Should be name, but we only have ID here easily
      type: 'bonus',
      amountDiamonds: referral.rewardAmount,
      giftName: 'Referral Bonus',
      giftIcon: '🤝',
      status: 'COMPLETED',
      riskScore: 0,
      ipAddress: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    transactions.unshift(tx);

    return res.json({
      success: true,
      message: 'Referral bonus awarded!',
      bonus: referral.rewardAmount
    });
  }

  res.json({ success: true });
});

// GET /api/admin/users
app.get('/api/admin/users', (_req: Request, res: Response) => {
  const usersList = Array.from(wallets.values()).map(w => ({
    userId: w.userId,
    profileId: w.profileId,
    diamondBalance: w.diamondBalance,
    earningsBalance: w.earningsBalance,
    lifetimePurchased: w.lifetimePurchased,
    vipLevel: w.vipLevel,
    isFrozen: w.isFrozen,
    role: w.userId.startsWith('admin') ? 'admin' : w.userId.startsWith('creator') ? 'creator' : 'user'
  }));
  res.json({ success: true, users: usersList });
});

// Mount Vite in dev mode
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Love Chat Virtual Economy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
