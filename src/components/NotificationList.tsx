import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Heart, MessageCircle, Gift, Radio, X, Check, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppNotification } from '../types';

interface NotificationListProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, unreadNotificationsCount } = useApp();

  if (!isOpen) return null;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'live_start':
        return <div className="p-2 rounded-full bg-pink-500/20 text-pink-500"><Radio className="w-4 h-4" /></div>;
      case 'message':
        return <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-500"><MessageCircle className="w-4 h-4" /></div>;
      case 'gift_received':
        return <div className="p-2 rounded-full bg-amber-500/20 text-amber-500"><Gift className="w-4 h-4" /></div>;
      default:
        return <div className="p-2 rounded-full bg-stone-500/20 text-stone-500"><Bell className="w-4 h-4" /></div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs pointer-events-auto" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.95 }}
        className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto mt-16 max-h-[80vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-stone-800 bg-stone-950/50 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <h2 className="font-black text-lg">Notifications</h2>
            {unreadNotificationsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-pink-600 text-[10px] font-black text-white">
                {unreadNotificationsCount} NEW
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-stone-800 transition text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-6">
              <div className="p-4 rounded-full bg-stone-800/50 text-stone-600">
                <Bell className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-stone-400">No Notifications Yet</p>
                <p className="text-xs text-stone-500">We'll alert you when creators go live or you receive gifts!</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-stone-800/50">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-5 py-4 flex space-x-4 hover:bg-stone-800/30 transition cursor-pointer relative ${!notif.isRead ? 'bg-pink-500/5' : ''}`}
                  onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
                >
                  {!notif.isRead && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pink-500" />
                  )}
                  
                  <div className="shrink-0 pt-0.5">
                    {renderIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-sm truncate ${!notif.isRead ? 'font-black text-stone-100' : 'font-bold text-stone-300'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] text-stone-500 font-medium shrink-0 ml-2">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    
                    {notif.type === 'live_start' && (
                      <div className="pt-2">
                        <button className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-black uppercase tracking-wider transition">
                          Watch Live
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/30 text-center">
          <p className="text-[10px] text-stone-600 font-bold uppercase tracking-widest flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>End-to-End Encrypted Notifications</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
