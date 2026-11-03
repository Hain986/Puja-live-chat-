import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { LiveStreamRoom } from './components/LiveStreamRoom';
import { GiftTrayModal } from './components/GiftTrayModal';
import { DiamondWalletModal } from './components/DiamondWalletModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { CreatorDashboard } from './components/CreatorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LeaderboardView } from './components/LeaderboardView';
import { SplashScreen } from './components/SplashScreen';
import { NewExplore } from './components/NewExplore';
import { MessagesTab } from './components/MessagesTab';
import { SettingsTab } from './components/SettingsTab';
import { DownloadTab } from './components/DownloadTab';
import { FreeVideoCall } from './components/FreeVideoCall';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState<TabType>('new');
  const [isGiftTrayOpen, setIsGiftTrayOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isDailyRewardsOpen, setIsDailyRewardsOpen] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const { isLoading, dailyRewardStatus } = useApp();

  const canClaim = dailyRewardStatus?.canClaimToday ?? true;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans pb-16 sm:pb-4 selection:bg-pink-500/30 selection:text-pink-200">
      
      {/* Full-Screen Love Chat Launch Splash Screen with Official Logo Pic */}
      <SplashScreen
        isOpen={showSplash}
        onFinish={() => setShowSplash(false)}
      />

      {/* Top Header */}
      <Header
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenDailyRewards={() => setIsDailyRewardsOpen(true)}
        onOpenSplash={() => setShowSplash(true)}
        onSelectTab={setCurrentTab}
      />

      {/* Navigation Bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenWalletModal={() => setIsWalletOpen(true)}
      />

      {/* Stream Room Quick Floating Daily Rewards Banner (if not claimed today) */}
      {currentTab === 'stream' && canClaim && (
        <div className="max-w-4xl mx-auto w-full px-3 pt-2">
          <div className="p-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-pink-950/80 via-stone-900 to-amber-950/70 border border-pink-400/40 flex items-center justify-between text-xs shadow-md">
            <div className="flex items-center space-x-2">
              <span className="text-xl animate-bounce">🎁</span>
              <div>
                <span className="font-extrabold text-pink-200">Daily Love Chat Boon Ready!</span>
                <span className="text-stone-300 ml-1.5 hidden xs:inline">
                  Claim your free diamonds for Day {dailyRewardStatus?.nextStreakDay ?? 1}.
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsDailyRewardsOpen(true)}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-pink-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 text-stone-950 font-black text-xs transition active:scale-95 shadow-xs"
            >
              Claim +{dailyRewardStatus?.nextRewardDiamonds ?? 15} 💎
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full flex flex-col justify-center">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-pink-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-pink-300 font-semibold tracking-wide">
              Connecting to Love Chat Live Virtual Economy...
            </p>
          </div>
        ) : (
          <>
            {currentTab === 'new' && <NewExplore />}
            
            {currentTab === 'stream' && (
              <LiveStreamRoom
                onOpenGiftTray={() => setIsGiftTrayOpen(true)}
                onOpenWallet={() => setIsWalletOpen(true)}
              />
            )}

            {currentTab === 'messages' && <MessagesTab />}

            {currentTab === 'videocall' && <FreeVideoCall />}

            {currentTab === 'download' && <DownloadTab />}

            {currentTab === 'settings' && <SettingsTab />}

            {currentTab === 'admin' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* Daily Check-In Rewards Modal */}
      <DailyCheckInModal
        isOpen={isDailyRewardsOpen}
        onClose={() => setIsDailyRewardsOpen(false)}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      {/* Virtual Gift Tray Bottom Sheet */}
      <GiftTrayModal
        isOpen={isGiftTrayOpen}
        onClose={() => setIsGiftTrayOpen(false)}
        onOpenRecharge={() => setIsWalletOpen(true)}
      />

      {/* Diamond Wallet & Transaction Ledger Modal */}
      <DiamondWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onOpenDailyRewards={() => setIsDailyRewardsOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
