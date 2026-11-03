import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Radio, MessageCircle, Settings, DownloadCloud, Video, ShieldAlert } from 'lucide-react';

export type TabType = 'new' | 'stream' | 'messages' | 'settings' | 'download' | 'videocall' | 'admin';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenWalletModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab, onOpenWalletModal }) => {
  const { currentUser, fraudAlerts } = useApp();

  const navItems: { id: TabType; label: string; icon: any; live?: boolean; customAction?: boolean; badge?: boolean }[] = [
    { id: 'new', label: 'New', icon: Sparkles },
    { id: 'stream', label: 'Live', icon: Radio, live: true },
    { id: 'messages', label: 'Message', icon: MessageCircle },
    { id: 'videocall', label: 'Free Video Call', icon: Video },
    { id: 'download', label: 'Download+', icon: DownloadCloud },
    { id: 'settings', label: 'Setting', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Top Tabs (hidden on mobile) */}
      <nav className="hidden sm:flex items-center justify-center space-x-1 py-2 px-4 bg-stone-900/60 border-b border-stone-800 text-xs font-bold">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.customAction) {
                  onOpenWalletModal();
                } else {
                  onSelectTab(item.id as TabType);
                }
              }}
              className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition relative ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.live && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
              {item.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-red-600 text-white">
                  {fraudAlerts.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Android Mobile Bottom Navigation Bar (Persistent at bottom of mobile screen) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 border-t border-stone-800/90 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around safe-area-pb">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.customAction) {
                  onOpenWalletModal();
                } else {
                  onSelectTab(item.id as TabType);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition relative ${
                isActive ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.live && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 border border-stone-950" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
