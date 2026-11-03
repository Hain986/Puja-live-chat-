import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CircleHelp, 
  LogOut, 
  ChevronRight, 
  Sparkles, 
  Radio, 
  MessageCircle, 
  Gift, 
  Users, 
  Copy, 
  Check, 
  Gift as GiftIcon,
  Camera,
  Edit2,
  Save,
  X as CloseIcon,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserBadgeDisplay } from './UserBadges';
import { LANGUAGES } from '../utils/translations';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const SettingsTab: React.FC = () => {
  const { 
    currentUser, 
    wallet,
    logout, 
    triggerDemoNotification, 
    referralStats, 
    referralHistory, 
    redeemInviteCode,
    updateProfile,
    language,
    setLanguage,
    t,
    pushNotificationsEnabled,
    liveAlertsEnabled,
    giftAlertsEnabled,
    messageAlertsEnabled,
    toggleNotificationSetting,
    soundEnabled,
    toggleSound
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentUser.displayName);
  const [newPhoto, setNewPhoto] = useState(currentUser.photoURL || '');
  const [newBio, setNewBio] = useState(currentUser.bio || '');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCameraStream = async () => {
    setIsCameraModalOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) {
      console.warn('Camera access error or unsupported:', e);
      alert('Could not access device camera. Please check permissions or use file upload.');
      setIsCameraModalOpen(false);
    }
  };

  const captureCameraPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setNewPhoto(dataUrl);
      }
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      setIsCameraModalOpen(false);
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    }
    setIsCameraModalOpen(false);
  };

  const sections = [
    { 
      title: 'Preferences & FCM Push', 
      icon: Bell, 
      items: [
        { label: 'Push Notifications (FCM)', type: 'toggle_push', value: pushNotificationsEnabled },
        { label: 'Live Stream Alerts', type: 'toggle_live', value: liveAlertsEnabled },
        { label: 'Gift Received Alerts', type: 'toggle_gift', value: giftAlertsEnabled },
        { label: 'Private Message Alerts', type: 'toggle_message', value: messageAlertsEnabled },
        { label: 'Language', type: 'language', value: language },
        { label: 'Sound Effects', type: 'toggle_sound', value: soundEnabled }
      ] 
    },
    { 
      title: 'Security', 
      icon: Shield, 
      items: [
        { label: 'Password', type: 'none', value: false }, 
        { label: 'Two-Factor Auth', type: 'none', value: false }, 
        { label: 'Login History', type: 'none', value: false }
      ] 
    },
    { 
      title: 'Support', 
      icon: CircleHelp, 
      items: [
        { label: 'Help Center', type: 'none', value: false }, 
        { label: 'Report a Problem', type: 'none', value: false }, 
        { label: 'About Love Chat', type: 'none', value: false }
      ] 
    },
  ];

  const handleCopyCode = () => {
    if (referralStats?.referralCode) {
      navigator.clipboard.writeText(referralStats.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.profileId);
    alert('User ID Copied!');
  };

  const handleRedeem = async () => {
    if (!inviteCode.trim()) return;
    setIsSubmitting(true);
    setRedeemMessage(null);
    try {
      const res = await redeemInviteCode(inviteCode.trim());
      if (res.success) {
        setRedeemMessage({ text: res.message || 'Invitation code applied!', type: 'success' });
        setInviteCode('');
      } else {
        setRedeemMessage({ text: res.error || 'Failed to apply code.', type: 'error' });
      }
    } catch (e) {
      setRedeemMessage({ text: 'Error applying code.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      const res = await updateProfile({
        displayName: newName,
        photoURL: newPhoto,
        bio: newBio
      });
      if (res.success) {
        setIsEditing(false);
      } else {
        alert(res.error || 'Failed to update profile');
      }
    } catch (e) {
      alert('Error updating profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="p-4 space-y-6 text-stone-100 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Settings</h2>
        <button 
          onClick={() => {
            setIsEditing(true);
            setNewName(currentUser.displayName);
            setNewPhoto(currentUser.photoURL || '');
          }}
          className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-pink-400 transition"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* User Card */}
      <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 flex flex-col space-y-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-500 shadow-lg shadow-pink-500/20"
            alt="Profile"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-stone-100 truncate text-lg">{currentUser.displayName}</h3>
            <p className="text-xs text-stone-400 truncate">{currentUser.email}</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold border border-pink-500/20 uppercase">
                {currentUser.role}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/20 uppercase">
                VIP {currentUser.vipLevel || 1}
              </span>
            </div>
            <div className="mt-2">
              <UserBadgeDisplay 
                lifetimeSpent={wallet?.lifetimeSpent || 750} 
                followersCount={currentUser.followersCount || 142}
                isCreator={currentUser.role === 'creator'}
              />
            </div>
          </div>
        </div>
        
        {/* User ID Display */}
        <div className="pt-3 border-t border-stone-800/50 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest px-0.5">Profile ID</p>
            <p className="text-xl font-black text-amber-400 tracking-tighter tabular-nums px-0.5">{currentUser.profileId}</p>
          </div>
          <button 
            onClick={handleCopyId}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 transition text-stone-300 shadow-inner"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isUpdatingProfile && setIsEditing(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Edit Profile</h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdatingProfile}
                  className="p-2 rounded-full hover:bg-stone-800 transition"
                >
                  <CloseIcon className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Photo Upload & Camera Capture */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img
                      src={newPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      className="w-20 h-20 rounded-3xl object-cover border-4 border-pink-500/30 shadow-lg"
                      alt="New Profile"
                    />
                    <div className="absolute inset-0 rounded-3xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Camera className="w-3.5 h-3.5 text-pink-400" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={startCameraStream}
                      className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-md"
                    >
                      <Camera className="w-3.5 h-3.5 text-white" />
                      <span>Use Camera</span>
                    </button>
                  </div>
                </div>

                {/* Name Change */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-stone-400 font-bold uppercase tracking-widest px-1">Display Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:border-pink-500/50 outline-none transition font-medium"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Bio Change */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-stone-400 font-bold uppercase tracking-widest px-1">Bio / Status</label>
                  <textarea
                    value={newBio}
                    onChange={e => setNewBio(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:border-pink-500/50 outline-none transition font-medium resize-none"
                    placeholder="Write a short devotional or personal bio..."
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isUpdatingProfile || !newName.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-black shadow-lg shadow-pink-600/20 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 transition"
                >
                  {isUpdatingProfile ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Camera Live Stream Capture Modal */}
      <AnimatePresence>
        {isCameraModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={stopCameraStream}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-4"
            >
              <h3 className="text-lg font-black text-stone-100">Take Profile Picture</h3>
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-stone-800">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex space-x-3 w-full">
                <button
                  onClick={stopCameraStream}
                  className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  onClick={captureCameraPhoto}
                  className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs shadow-lg transition"
                >
                  Capture Photo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Refer & Earn Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-stone-400 text-xs font-bold uppercase tracking-widest px-1">
          <Users className="w-3.5 h-3.5 text-pink-500" />
          <span>Refer & Earn Diamonds</span>
        </div>
        <div className="p-5 rounded-3xl bg-gradient-to-br from-pink-600/10 to-amber-500/5 border border-pink-500/20 space-y-5">
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-full bg-pink-500/20 text-pink-400">
              <GiftIcon className="w-8 h-8" />
            </div>
            <h3 className="font-black text-lg">Invite Friends, Get Diamonds</h3>
            <p className="text-xs text-stone-400 max-w-[250px]">
              Share your code and get <span className="text-amber-400 font-bold">100 💎</span> when they join and watch their first stream!
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 rounded-xl bg-stone-950 border border-stone-800 font-mono text-center text-pink-400 font-black tracking-widest uppercase">
              {referralStats?.referralCode || 'LOADING...'}
            </div>
            <button 
              onClick={handleCopyCode}
              className="p-3 rounded-xl bg-pink-600 hover:bg-pink-500 transition text-white shadow-lg active:scale-95"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-center">
              <div className="text-stone-400 text-[10px] font-bold uppercase">Invited</div>
              <div className="text-lg font-black text-white">{referralStats?.totalReferrals || 0}</div>
            </div>
            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-center">
              <div className="text-stone-400 text-[10px] font-bold uppercase">Completed</div>
              <div className="text-lg font-black text-emerald-400">{referralStats?.completedReferrals || 0}</div>
            </div>
            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-center">
              <div className="text-stone-400 text-[10px] font-bold uppercase">Earned</div>
              <div className="text-lg font-black text-amber-400">{referralStats?.totalDiamondsEarned || 0} 💎</div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-800 space-y-3">
            <p className="text-[10px] text-stone-500 font-bold uppercase text-center">Have an invitation code?</p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm focus:border-pink-500/50 outline-none transition uppercase tracking-widest font-bold"
              />
              <button
                onClick={handleRedeem}
                disabled={isSubmitting || !inviteCode.trim()}
                className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-50 font-black text-xs transition"
              >
                APPLY
              </button>
            </div>
            {redeemMessage && (
              <p className={`text-[10px] text-center font-bold ${redeemMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {redeemMessage.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center space-x-2 text-stone-400 text-xs font-bold uppercase tracking-widest px-1">
              <section.icon className="w-3.5 h-3.5" />
              <span>{section.title}</span>
            </div>
            <div className="rounded-3xl bg-stone-900/50 border border-stone-800 divide-y divide-stone-800/50 overflow-hidden">
              {section.items.map((item, i) => {
                const currentLangObj = LANGUAGES.find(l => l.code === language);
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (item.type === 'language') {
                        setIsLanguageModalOpen(true);
                      } else if (item.type === 'toggle_push') {
                        toggleNotificationSetting('push');
                      } else if (item.type === 'toggle_live') {
                        toggleNotificationSetting('live');
                      } else if (item.type === 'toggle_gift') {
                        toggleNotificationSetting('gift');
                      } else if (item.type === 'toggle_message') {
                        toggleNotificationSetting('message');
                      } else if (item.type === 'toggle_sound') {
                        toggleSound();
                      }
                    }}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-stone-800/40 transition group cursor-pointer"
                  >
                    <span className="text-sm font-medium text-stone-300 group-hover:text-white transition">{item.label}</span>
                    <div className="flex items-center space-x-3">
                      {item.type === 'language' && (
                        <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20">
                          {currentLangObj ? `${currentLangObj.nativeName} (${currentLangObj.name})` : language}
                        </span>
                      )}
                      {item.type.startsWith('toggle_') && (
                        <div className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${item.value ? 'bg-pink-600' : 'bg-stone-800'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${item.value ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                      )}
                      {item.type === 'none' && (
                        <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-pink-500 transition" />
                      )}
                      {item.type === 'language' && (
                        <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-pink-500 transition" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 15 Languages Selection Modal */}
      <AnimatePresence>
        {isLanguageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsLanguageModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md max-h-[85vh] bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-pink-500" />
                  <h3 className="text-lg font-black text-stone-100">Select Language (15 Languages)</h3>
                </div>
                <button
                  onClick={() => setIsLanguageModalOpen(false)}
                  className="p-2 rounded-full hover:bg-stone-800 transition text-stone-400 hover:text-white"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-2 flex-1">
                <p className="text-xs text-stone-400 mb-3 px-1">
                  Choose your preferred language for the Love Chat experience:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLanguageModalOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition ${
                          isSelected
                            ? 'bg-pink-600/20 border-pink-500 text-white shadow-lg shadow-pink-600/10'
                            : 'bg-stone-950/60 border-stone-800/80 text-stone-300 hover:bg-stone-800/50 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-base font-bold text-pink-400">{lang.nativeName}</span>
                          <span className="text-xs text-stone-400">({lang.name})</span>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Test Notifications Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-stone-400 text-xs font-bold uppercase tracking-widest px-1">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Real-time Notification Test</span>
        </div>
        <div className="p-4 rounded-3xl bg-pink-500/5 border border-pink-500/20 space-y-4 shadow-inner">
          <p className="text-[11px] text-stone-400">Trigger test alerts to verify real-time Firestore synchronization:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button 
              onClick={() => triggerDemoNotification('live_start')}
              className="py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-bold hover:border-pink-500/50 transition flex flex-col items-center justify-center space-y-1"
            >
              <Radio className="w-4 h-4 text-pink-500" />
              <span>Broadcaster Live</span>
            </button>
            <button 
              onClick={() => triggerDemoNotification('message')}
              className="py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-bold hover:border-cyan-500/50 transition flex flex-col items-center justify-center space-y-1"
            >
              <MessageCircle className="w-4 h-4 text-cyan-400" />
              <span>New Message</span>
            </button>
            <button 
              onClick={() => triggerDemoNotification('gift_received')}
              className="py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-bold hover:border-amber-500/50 transition flex flex-col items-center justify-center space-y-1"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Gift Received</span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full mt-8 py-4 rounded-2xl bg-red-950/20 border border-red-500/20 text-red-400 font-bold text-sm flex items-center justify-center space-x-2 hover:bg-red-950/40 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>

      <div className="text-center py-6 text-[10px] text-stone-600 font-medium">
        LOVE CHAT VERSION 1.2.0 • 2026
      </div>
    </div>
  );
};
