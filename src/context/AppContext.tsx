import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { auth, testConnection, db } from '../firebase/config';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, Timestamp, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  UserProfile, 
  UserWallet, 
  TransactionRecord, 
  GiftItem, 
  DiamondPackage, 
  LiveRoom, 
  LiveGiftEvent, 
  ChatMessage,
  FraudAlert,
  DailyRewardStatus,
  AppNotification,
  ReferralStats,
  ReferralRecord,
  HighlightClip
} from '../types';
import { soundManager } from '../utils/audioEffects';
import { translate } from '../utils/translations';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  wallet: UserWallet | null;
  transactions: TransactionRecord[];
  gifts: GiftItem[];
  packages: DiamondPackage[];
  activeRoom: LiveRoom | null;
  setActiveRoom: (room: LiveRoom) => void;
  rooms: LiveRoom[];
  liveGiftEvents: LiveGiftEvent[];
  chatMessages: ChatMessage[];
  fraudAlerts: FraudAlert[];
  dailyRewardStatus: DailyRewardStatus | null;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  isLoading: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  sendGift: (giftId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  purchaseDiamonds: (packageId: string) => Promise<{ success: boolean; error?: string }>;
  claimDailyReward: () => Promise<{ success: boolean; error?: string; rewardDiamonds?: number; message?: string }>;
  markNotificationAsRead: (id: string) => Promise<void>;
  triggerDemoNotification: (type: 'live_start' | 'message' | 'gift_received') => Promise<void>;
  refreshDailyRewardStatus: () => Promise<void>;
  sendChatMessage: (text: string) => void;
  refreshWallet: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  switchDemoUser: (role: 'user' | 'creator' | 'admin') => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  referralStats: ReferralStats | null;
  referralHistory: ReferralRecord[];
  redeemInviteCode: (code: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  refreshReferralStatus: () => Promise<void>;
  updateProfile: (data: { displayName?: string; photoURL?: string; bio?: string }) => Promise<{ success: boolean; error?: string }>;
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: any) => string;
  pushNotificationsEnabled: boolean;
  liveAlertsEnabled: boolean;
  giftAlertsEnabled: boolean;
  messageAlertsEnabled: boolean;
  fcmToken: string | null;
  requestFCMToken: () => Promise<boolean>;
  toggleNotificationSetting: (key: 'push' | 'live' | 'gift' | 'message') => void;
  highlightClips: HighlightClip[];
  publishHighlightClip: (clip: Omit<HighlightClip, 'id'>) => Promise<void>;
}

const DEMO_PROFILES: Record<string, UserProfile> = {
  user: {
    uid: 'user_aarav',
    profileId: '34678856',
    email: 'aarav.devotee@pujalive.in',
    displayName: 'Aarav Patel',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    role: 'user',
    bio: 'Devout follower of daily Sandhya Aarti & Bhajan streams 🙏✨',
    vipLevel: 3,
    followersCount: 142
  },
  creator: {
    uid: 'creator_puja',
    profileId: '55882140',
    email: 'puja.official@pujalive.in',
    displayName: 'Puja Official Broadcast',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    role: 'creator',
    isCreator: true,
    bio: 'Official Divine Aarti & Vedic Satsang Channel | Har Har Mahadev 🕉️',
    vipLevel: 5,
    followersCount: 14820
  },
  admin: {
    uid: 'admin_user',
    profileId: '10000001',
    email: 'rkmathurrkmathur7@gmail.com',
    displayName: 'R.K. Mathur (Lead Admin)',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    role: 'admin',
    bio: 'Platform Financial & Anti-Fraud Security Officer',
    vipLevel: 10,
    followersCount: 9999
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_PROFILES.user);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [packages, setPackages] = useState<DiamondPackage[]>([]);
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<LiveRoom | null>(null);
  const [liveGiftEvents, setLiveGiftEvents] = useState<LiveGiftEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [dailyRewardStatus, setDailyRewardStatus] = useState<DailyRewardStatus | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralRecord[]>([]);
  const [language, setLanguage] = useState<string>('en');
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean>(true);
  const [liveAlertsEnabled, setLiveAlertsEnabled] = useState<boolean>(true);
  const [giftAlertsEnabled, setGiftAlertsEnabled] = useState<boolean>(true);
  const [messageAlertsEnabled, setMessageAlertsEnabled] = useState<boolean>(true);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const requestFCMToken = async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined') return false;
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushNotificationsEnabled(true);
        const mockToken = `fcm_token_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
        setFcmToken(mockToken);
        if (auth.currentUser) {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            fcmToken: mockToken,
            notificationPreferences: {
              push: true,
              live: liveAlertsEnabled,
              gift: giftAlertsEnabled,
              message: messageAlertsEnabled
            },
            updatedAt: serverTimestamp()
          });
        }
        return true;
      } else {
        setPushNotificationsEnabled(false);
        return false;
      }
    } catch (e) {
      console.error('FCM Token request error:', e);
      return false;
    }
  };

  const toggleNotificationSetting = (key: 'push' | 'live' | 'gift' | 'message') => {
    if (key === 'push') {
      const next = !pushNotificationsEnabled;
      setPushNotificationsEnabled(next);
      if (next) requestFCMToken();
    } else if (key === 'live') {
      setLiveAlertsEnabled(prev => !prev);
    } else if (key === 'gift') {
      setGiftAlertsEnabled(prev => !prev);
    } else if (key === 'message') {
      setMessageAlertsEnabled(prev => !prev);
    }
  };

  const [highlightClips, setHighlightClips] = useState<HighlightClip[]>([
    {
      id: 'clip_1',
      creatorId: 'creator_puja',
      creatorName: 'Puja Official Broadcast',
      creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
      caption: 'Maha Sandhya Aarti divine moments 🙏✨ Har Har Mahadev!',
      likesCount: 342,
      timestamp: '2h ago'
    }
  ]);

  const publishHighlightClip = async (clip: Omit<HighlightClip, 'id'>) => {
    try {
      const newClip: HighlightClip = {
        id: `clip_${Date.now()}`,
        ...clip,
        likesCount: 1
      };
      setHighlightClips(prev => [newClip, ...prev]);

      try {
        await addDoc(collection(db, 'highlights'), {
          ...newClip,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        // Silent fallback
      }
    } catch (e) {
      console.error('Failed to publish highlight clip:', e);
    }
  };

  const t = useCallback((key: any) => translate(language, key), [language]);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const toggleSound = () => {
    setSoundEnabled(prev => {
      soundManager.enabled = !prev;
      return !prev;
    });
  };

  // Real-time Notifications Listener
  useEffect(() => {
    // Only attach listener if we have a real authenticated user
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications: AppNotification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        newNotifications.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp
        } as AppNotification);
      });
      setNotifications(newNotifications);
      
      // Play sound for new notification if it's new and unread
      const latest = newNotifications[0];
      if (latest && !latest.isRead && soundEnabled) {
        // Debounce or check timestamp to avoid sound on initial load
        const diff = Date.now() - new Date(latest.timestamp).getTime();
        if (diff < 5000) {
          soundManager.playLotusChime();
        }
      }
    }, (error) => {
      // CRITICAL: Handle Firestore errors as per security guidelines
      const errInfo = {
        error: error.message,
        operationType: 'list',
        path: 'notifications',
        authInfo: {
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          emailVerified: auth.currentUser?.emailVerified
        }
      };
      console.error('Firestore Notification Listener Error:', JSON.stringify(errInfo));
    });

    return () => unsubscribe();
  }, [currentUser.uid, soundEnabled]); // Re-run when currentUser.uid changes (e.g. after login)

  const markNotificationAsRead = async (id: string) => {
    try {
      const ref = doc(db, 'notifications', id);
      await updateDoc(ref, { isRead: true });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Fetch Daily Check-in Rewards Status
  const refreshDailyRewardStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/rewards/status/${currentUser.uid}`);
      const data = await res.json();
      if (data.success) {
        setDailyRewardStatus(data);
      }
    } catch (err) {
      console.error('Failed to load daily reward status:', err);
    }
  }, [currentUser.uid]);

  // Fetch Authoritative Wallet
  const refreshWallet = useCallback(async () => {
    try {
      const res = await fetch(`/api/wallet/${currentUser.uid}`);
      const data = await res.json();
      if (data.success && data.wallet) {
        setWallet(data.wallet);
      }
    } catch (err) {
      console.error('Failed to load wallet:', err);
    }
  }, [currentUser.uid]);

  // Fetch Transaction History
  const refreshTransactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/transactions/${currentUser.uid}`);
      const data = await res.json();
      if (data.success && data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  }, [currentUser.uid]);

  // Initial Data Load
  useEffect(() => {
    let mounted = true;
    async function initData() {
      setIsLoading(true);
      try {
        testConnection(); // Validate Firestore connection

        const [giftsRes, pkgsRes, roomsRes] = await Promise.all([
          fetch('/api/gifts').then(r => r.json()),
          fetch('/api/packages').then(r => r.json()),
          fetch('/api/rooms').then(r => r.json())
        ]);

        if (!mounted) return;

        if (giftsRes.success) setGifts(giftsRes.gifts);
        if (pkgsRes.success) setPackages(pkgsRes.packages);
        if (roomsRes.success && roomsRes.rooms?.length > 0) {
          setRooms(roomsRes.rooms);
          setActiveRoom(roomsRes.rooms[0]);
        }
      } catch (err) {
        console.error('Error initializing app data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initData();
    return () => { mounted = false; };
  }, []);

  // Sync wallet when currentUser changes
  useEffect(() => {
    refreshWallet();
    refreshTransactions();
  }, [currentUser.uid, refreshWallet, refreshTransactions]);

  // Poll room events for active live stream
  useEffect(() => {
    if (!activeRoom) return;

    // Seed mock live comments for realistic stream feel
    setChatMessages([
      { id: 'c1', senderId: 'u1', senderName: 'Pooja Verma', text: 'Jai Shri Krishna! Shubh Sandhya Aarti 🙏', timestamp: '1m ago' },
      { id: 'c2', senderId: 'u2', senderName: 'Rohan Sharma', text: 'Beautiful darshan today ✨ Blessings to all!', timestamp: 'Just now' },
      { id: 'c3', senderId: 'user_aarav', senderName: 'Aarav Patel', text: 'Har Har Mahadev! Offering sacred diya 🪔', vipLevel: 3, timestamp: 'Just now' }
    ]);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${activeRoom.id}/events`);
        const data = await res.json();
        if (data.success && data.events) {
          const giftEvents = data.events
            .filter((e: any) => e.type === 'gift')
            .map((e: any) => ({
              id: e.id,
              ...e.payload,
              timestamp: e.timestamp
            }));
          if (giftEvents.length > 0) {
            setLiveGiftEvents(giftEvents.slice(-5));
          }
        }
      } catch (e) {
        // Silent poll error
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeRoom?.id]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const isAdmin = user.email === 'rkmathurrkmathur7@gmail.com';
        // In a real app, we would fetch the user doc from Firestore here.
        // For this demo, we generate a stable numeric ID based on the UID if it's a real login.
        const hash = user.uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const generatedProfileId = `${30000000 + (hash % 69999999)}`;

        setCurrentUser({
          uid: user.uid,
          profileId: generatedProfileId,
          email: user.email || 'user@example.com',
          displayName: user.displayName || 'Devotee',
          photoURL: user.photoURL || undefined,
          role: isAdmin ? 'admin' : 'user',
          vipLevel: isAdmin ? 10 : 1
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Purchase Diamonds with Idempotency Protection
  const purchaseDiamonds = async (packageId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const idempotencyKey = `recharge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const res = await fetch('/api/wallet/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          userName: currentUser.displayName,
          packageId,
          idempotencyKey,
          paymentMethod: 'UPI_INSTANT'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Recharge failed' };
      }

      setWallet(data.wallet);
      if (data.transaction) {
        setTransactions(prev => [data.transaction, ...prev]);
      }

      soundManager.playCoinChime();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during purchase' };
    }
  };

  // Send Gift with Server-Side Validation & Deduplication
  const sendGift = async (giftId: string, quantity: number = 1): Promise<{ success: boolean; error?: string }> => {
    if (!activeRoom) {
      return { success: false, error: 'No active stream room selected.' };
    }

    try {
      const idempotencyKey = `gift_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const res = await fetch('/api/gifts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          recipientId: activeRoom.creatorId,
          recipientName: activeRoom.creatorName,
          giftId,
          roomId: activeRoom.id,
          quantity,
          idempotencyKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to send gift.' };
      }

      // Authoritative Balance Update from Server response
      if (wallet) {
        setWallet({
          ...wallet,
          diamondBalance: data.newBalance,
          lifetimeSpent: wallet.lifetimeSpent + data.totalSpent
        });
      }

      if (data.transaction) {
        setTransactions(prev => [data.transaction, ...prev]);
      }

      // Play Sound Effect
      if (data.event?.soundEffect) {
        soundManager.playSoundForGift(data.event.soundEffect);
      }

      // Haptic feedback for mobile/Android
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 40, 50]);
      }

      // Add to live events for animation display
      if (data.event) {
        const giftEvt: LiveGiftEvent = {
          id: data.event.id,
          ...data.event.payload,
          timestamp: data.event.timestamp
        };
        setLiveGiftEvents(prev => [...prev.slice(-4), giftEvt]);

        // Add gift announcement to live chat stream
        setChatMessages(prev => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            text: `Sent ${quantity}x ${giftEvt.giftName}! ✨`,
            vipLevel: currentUser.vipLevel,
            timestamp: 'Just now',
            giftBanner: {
              giftName: giftEvt.giftName,
              giftIcon: giftEvt.giftIcon,
              quantity,
              diamonds: data.totalSpent
            }
          }
        ]);

        // Trigger celebratory visual effects
        if (giftEvt.totalDiamonds >= 500) {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF4500', '#FF1493']
          });
        }

        // Create Real-time Firestore Notification for recipient (simulation since we are sender)
        // In a real app, the server would do this.
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: activeRoom.creatorId,
            type: 'gift_received',
            title: 'New Gift Received! 🎁',
            message: `${currentUser.displayName} sent you ${quantity}x ${giftEvt.giftName}!`,
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            isRead: false,
            timestamp: serverTimestamp(),
            metadata: { giftId, quantity, totalDiamonds: data.totalSpent }
          });
        } catch (err) {
          console.error('Failed to create notification for gift:', err);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error executing gift transfer' };
    }
  };

  // Trigger Demo Notifications for Testing
  const triggerDemoNotification = async (type: 'live_start' | 'message' | 'gift_received') => {
    try {
      let title = '';
      let message = '';
      let senderName = 'System';
      
      switch (type) {
        case 'live_start':
          title = 'Broadcaster is Live! 🎙️';
          message = 'Love Chat Official Broadcaster has started a new stream. Join now!';
          senderName = 'Broadcaster';
          break;
        case 'message':
          title = 'New Message 💬';
          message = 'Hey! I really enjoyed your previous stream. When are you going live again?';
          senderName = 'Anya';
          break;
        case 'gift_received':
          title = 'You received a gift! 💎';
          message = 'Aarav Patel sent you a Golden Chariot (Ratha)!';
          senderName = 'Aarav Patel';
          break;
      }

      await addDoc(collection(db, 'notifications'), {
        userId: currentUser.uid,
        type,
        title,
        message,
        senderName,
        isRead: false,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to trigger demo notification:', err);
    }
  };

  // Send regular live chat message
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      text: text.trim(),
      vipLevel: currentUser.vipLevel,
      isBroadcaster: currentUser.uid === activeRoom?.creatorId,
      timestamp: 'Just now'
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  // Claim Daily Check-In Reward
  const claimDailyReward = async (): Promise<{ success: boolean; error?: string; rewardDiamonds?: number; message?: string }> => {
    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          userName: currentUser.displayName
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to claim daily reward.' };
      }

      // Update Authoritative Wallet
      if (data.wallet) {
        setWallet(data.wallet);
      } else if (wallet && data.rewardDiamonds) {
        setWallet({
          ...wallet,
          diamondBalance: data.newBalance ?? (wallet.diamondBalance + data.rewardDiamonds)
        });
      }

      if (data.transaction) {
        setTransactions(prev => [data.transaction, ...prev]);
      }

      // Re-fetch daily reward status
      await refreshDailyRewardStatus();

      // Play sacred celebration bell sound & trigger confetti
      soundManager.playTempleBell();
      setTimeout(() => soundManager.playCoinChime(), 200);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#F59E0B', '#10B981']
      });

      // Add to live chat announcement
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_reward_${Date.now()}`,
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          text: `Claimed Day ${data.dayIndex} Check-In Blessing (+${data.rewardDiamonds} 💎) 🙏✨`,
          vipLevel: currentUser.vipLevel,
          timestamp: 'Just now'
        }
      ]);

      return {
        success: true,
        rewardDiamonds: data.rewardDiamonds,
        message: data.message
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error claiming daily reward.' };
    }
  };

  // Referral Module Methods
  const refreshReferralStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/referral/status/${currentUser.uid}`);
      const data = await res.json();
      if (data.success) {
        setReferralStats(data.stats);
        setReferralHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load referral status:', err);
    }
  }, [currentUser.uid]);

  const redeemInviteCode = async (inviteCode: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const res = await fetch('/api/referral/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          userName: currentUser.displayName,
          inviteCode
        })
      });
      const data = await res.json();
      if (data.success) {
        await refreshReferralStatus();
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Automated first stream viewing completion
  useEffect(() => {
    if (!currentUser.uid || !activeRoom) return;

    // After 30 seconds of active viewing, notify server to complete referral bonus if applicable
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/referral/complete-viewing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.uid })
        });
        const data = await res.json();
        if (data.success && data.bonus) {
          // Refresh wallet to show updated balance if needed (referrer context)
          await refreshWallet();
          
          // Create notification for the user who completed the viewing
          try {
            await addDoc(collection(db, 'notifications'), {
              userId: currentUser.uid,
              type: 'system',
              title: 'Goal Achieved! 🤝',
              message: `You've completed your first stream viewing! Your friend has been awarded ${data.bonus} 💎 Bonus.`,
              isRead: false,
              timestamp: serverTimestamp()
            });
          } catch (nErr) {
            console.error('Failed to notify user of referral completion:', nErr);
          }
        }
      } catch (e) {
        // Silent fail
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [currentUser.uid, activeRoom?.id, refreshWallet]);

  // Sync wallet & rewards when currentUser changes
  useEffect(() => {
    refreshWallet();
    refreshTransactions();
    refreshDailyRewardStatus();
    refreshReferralStatus();
  }, [currentUser.uid, refreshWallet, refreshTransactions, refreshDailyRewardStatus, refreshReferralStatus]);

  // Quick switch demo users for fast testing across all 3 roles
  const switchDemoUser = (role: 'user' | 'creator' | 'admin') => {
    const selected = DEMO_PROFILES[role];
    if (selected) {
      setCurrentUser(selected);
    }
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      console.warn('Google sign-in popup closed or failed:', e);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(DEMO_PROFILES.user);
  };

  const updateProfile = async (data: { displayName?: string; photoURL?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!auth.currentUser) return { success: false, error: 'Not authenticated' };
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        ...data
      }));

      return { success: true };
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      return { success: false, error: err.message || 'Update failed' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        wallet,
        transactions,
        gifts,
        packages,
        activeRoom,
        setActiveRoom,
        rooms,
        liveGiftEvents,
        chatMessages,
        fraudAlerts,
        dailyRewardStatus,
        notifications,
        unreadNotificationsCount,
        isLoading,
        soundEnabled,
        toggleSound,
        sendGift,
        purchaseDiamonds,
        claimDailyReward,
        markNotificationAsRead,
        triggerDemoNotification,
        refreshDailyRewardStatus,
        sendChatMessage,
        refreshWallet,
        refreshTransactions,
        switchDemoUser,
        signInWithGoogle,
        logout,
        referralStats,
        referralHistory,
        redeemInviteCode,
        refreshReferralStatus,
        updateProfile,
        language,
        setLanguage,
        t,
        pushNotificationsEnabled,
        liveAlertsEnabled,
        giftAlertsEnabled,
        messageAlertsEnabled,
        fcmToken,
        requestFCMToken,
        toggleNotificationSetting,
        highlightClips,
        publishHighlightClip
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
