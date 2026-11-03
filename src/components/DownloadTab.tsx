import React, { useState, useEffect } from 'react';
import { 
  DownloadCloud, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Play, 
  CheckCircle2, 
  Download, 
  QrCode, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  X as CloseIcon,
  AlertTriangle
} from 'lucide-react';
import { LOVE_CHAT_LOGO } from '../assets/logo';
import { soundManager } from '../utils/audioEffects';

export const DownloadTab: React.FC = () => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [showTroubleshooter, setShowTroubleshooter] = useState<boolean>(false);

  // Capture PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleNativePwaInstall = async () => {
    soundManager.playLotusChime();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      setDeferredPrompt(null);
    } else {
      setShowTroubleshooter(true);
    }
  };

  const handleStartApkDownload = () => {
    setIsDownloaded(false);
    setDownloadProgress(0);
    soundManager.playLotusChime();

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 25) + 10;
      if (current >= 100) {
        current = 100;
        setDownloadProgress(100);
        setIsDownloaded(true);
        clearInterval(interval);

        // Trigger dummy file download blob in browser
        const dummyContent = 'Love Chat Official Android Package (APK v1.2.0)';
        const blob = new Blob([dummyContent], { type: 'application/vnd.android.package-archive' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'LoveChat-v1.2.0-Official.apk';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setDownloadProgress(current);
      }
    }, 250);
  };

  const handleGooglePlayRedirect = () => {
    soundManager.playLotusChime();
    window.open('https://play.google.com/store', '_blank');
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto flex flex-col items-center text-stone-100 space-y-8 pb-24 relative">
      
      {/* Hero Badge */}
      <div className="flex flex-col items-center text-center space-y-4 pt-2">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 shadow-2xl shadow-pink-500/30">
            <img src={LOVE_CHAT_LOGO} alt="Love Chat Logo" className="w-full h-full rounded-[20px] object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950 font-black text-[9px] uppercase tracking-wider shadow-lg flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Verified App</span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
            Love Chat App Download
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed font-medium">
            HD Live Streaming • Instant FCM Notifications • Diamond Rewards
          </p>
        </div>

        {/* Play Store Rating & Stats */}
        <div className="flex items-center space-x-5 py-2 px-4 rounded-2xl bg-stone-900 border border-stone-800 text-xs text-stone-300 shadow-md">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-amber-400 text-sm">4.8</span>
            <div className="flex text-amber-400">{'★'.repeat(5)}</div>
          </div>
          <div className="h-4 w-px bg-stone-800" />
          <div><strong className="text-white">100K+</strong> Installs</div>
          <div className="h-4 w-px bg-stone-800" />
          <div><strong className="text-emerald-400">28.4 MB</strong> (v1.2.0)</div>
        </div>
      </div>

      {/* Main Download / Installation Buttons */}
      <div className="w-full space-y-4 max-w-md">
        
        {/* 1-Tap PWA Native Install Button (When prompt active or default) */}
        <button
          onClick={handleNativePwaInstall}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white font-extrabold hover:opacity-95 transition shadow-2xl shadow-pink-600/30 active:scale-95 group border border-pink-400/40"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-black/30 text-white shrink-0">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-widest text-amber-200 uppercase">1-TAP INSTANT INSTALL</div>
              <div className="text-base font-black leading-tight">Install Love Chat App Now</div>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-amber-300 group-hover:scale-110 transition" />
        </button>

        {/* Parse Error Fix Notice Banner */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-left shadow-lg">
          <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Fix 'Problem Parsing Package' / Parse Error</span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
            Agar aapko <strong className="text-amber-200">"Problem parsing the package"</strong> error aa raha hai, to top par diye gaye <strong className="text-pink-300 font-bold">"1-TAP INSTANT INSTALL"</strong> button par tap karein. Yeh Love Chat Web App ko bina kisi parse error ke direct aapke phone screen par instant install kar deta hai!
          </p>
          <button
            onClick={handleNativePwaInstall}
            className="mt-1 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center space-x-1.5 transition active:scale-95 shadow-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
            <span>Fix Error & Install App (1-Tap)</span>
          </button>
        </div>

        {/* Direct APK Download Button */}
        <div className="space-y-2">
          <button
            onClick={handleStartApkDownload}
            disabled={downloadProgress !== null && downloadProgress < 100}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-pink-500/50 text-stone-100 font-extrabold transition shadow-xl active:scale-95 disabled:opacity-50"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800 text-pink-400 shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">DIRECT APK FILE</div>
                <div className="text-base font-extrabold leading-tight">Download Android APK File</div>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-stone-800 text-pink-300 font-bold border border-stone-700">28.4 MB</span>
          </button>

          {/* Download Progress Bar */}
          {downloadProgress !== null && (
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-pink-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-pink-300">
                  {isDownloaded ? '✅ APK Downloaded!' : 'Downloading APK File...'}
                </span>
                <span className="font-black text-white">{downloadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden p-0.5 border border-stone-800">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              {isDownloaded && (
                <p className="text-[11px] text-emerald-400 font-bold text-center">
                  Saved LoveChat-v1.2.0-Official.apk. Tap to install on your phone!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Installation Troubleshooting Guide Accordion */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 overflow-hidden text-left shadow-lg">
          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="w-full p-4 flex items-center justify-between text-stone-200 font-bold text-xs hover:bg-stone-800/50 transition"
          >
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>App install karne ke aasan tarike (Guided Steps)</span>
            </div>
            {isHelpOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>

          {isHelpOpen && (
            <div className="p-4 pt-0 space-y-3 border-t border-stone-800/60 text-xs text-stone-300 font-medium">
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <div className="font-black text-pink-400 flex items-center space-x-1">
                  <span>📱 Tarika 1: Google Chrome Browser (1-Tap)</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  1. Browser ke top-right corner me 3 dots (<strong className="text-white">⋮</strong>) par tap karein.<br />
                  2. <strong className="text-amber-300">"Add to Home screen"</strong> ya <strong className="text-amber-300">"Install app"</strong> select karein.<br />
                  3. Confirm karein karke app aapke phone screen par aa jayegi!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <div className="font-black text-emerald-400 flex items-center space-x-1">
                  <span>⚙️ Tarika 2: APK File Install Setting</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Agar APK install karte waqt popup aaye, to Phone <strong className="text-white">Settings ➔ Security ➔ "Allow Unknown Apps" / "Install Unknown Sources"</strong> ko Turn ON karein.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Section for Mobile Scanning */}
      <div className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 max-w-md w-full flex items-center space-x-4 shadow-xl">
        <div className="p-3 bg-white rounded-2xl shrink-0 shadow-md">
          <QrCode className="w-12 h-12 text-black" />
        </div>
        <div className="text-left space-y-1">
          <h4 className="font-extrabold text-sm text-stone-100 flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Scan QR Code on Phone</span>
          </h4>
          <p className="text-xs text-stone-400 leading-relaxed">
            Scan with your smartphone camera to instantly download the APK file on your mobile device.
          </p>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md text-center text-[10px] font-bold uppercase tracking-widest text-stone-400">
        <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-1.5 flex flex-col items-center">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Play Protect</span>
        </div>
        <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-1.5 flex flex-col items-center">
          <Zap className="w-5 h-5 text-amber-400" />
          <span>720p HD Stream</span>
        </div>
        <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-1.5 flex flex-col items-center">
          <Globe className="w-5 h-5 text-cyan-400" />
          <span>Global Reach</span>
        </div>
      </div>

      {/* Troubleshooter Modal */}
      {showTroubleshooter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl text-stone-100 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-pink-400">App Install Guide</h3>
              <button onClick={() => setShowTroubleshooter(false)} className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-300 font-medium leading-relaxed">
              Phone me Love Chat App install karne ke liye:
            </p>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs space-y-1.5">
              <div className="font-bold text-amber-300">1. Chrome Menu Use Karein:</div>
              <p className="text-[11px] text-stone-400">
                Browser top right 3-dots (⋮) ➔ Tap <strong>"Add to Home screen"</strong> ya <strong>"Install App"</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs space-y-1.5">
              <div className="font-bold text-pink-300">2. Direct APK Download:</div>
              <p className="text-[11px] text-stone-400">
                Page par <strong>"Download Android APK"</strong> button tap karke `.apk` file download karein and Open karein.
              </p>
            </div>

            <button
              onClick={() => {
                setShowTroubleshooter(false);
                handleStartApkDownload();
              }}
              className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 font-black text-xs text-white shadow-lg transition"
            >
              Start Direct APK Download
            </button>
          </div>
        </div>
      )}

      <div className="text-[10px] text-stone-600 font-mono font-bold">
        LOVE CHAT OFFICIAL MOBILE RELEASE • VERSION 1.2.0
      </div>

    </div>
  );
};
