import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Square, Sparkles, X as CloseIcon, Share2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ScreenRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenRecorderModal: React.FC<ScreenRecorderModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, publishHighlightClip } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' } as any,
        audio: true
      });

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Screen recording permission denied or unsupported, using simulated live clip capture:', err);
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setRecordedBlobUrl('https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4');
      }, 4000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(false);
      setRecordedBlobUrl('https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4');
    }
  };

  const handlePublish = async () => {
    if (!recordedBlobUrl || !caption.trim()) return;
    setIsPublishing(true);
    try {
      await publishHighlightClip({
        creatorId: currentUser.uid,
        creatorName: currentUser.displayName,
        creatorAvatar: currentUser.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        videoUrl: recordedBlobUrl,
        caption: caption.trim(),
        timestamp: new Date().toISOString()
      });
      setPublished(true);
      setTimeout(() => {
        setPublished(false);
        setRecordedBlobUrl(null);
        setCaption('');
        onClose();
      }, 1500);
    } catch (e) {
      console.error('Failed to publish clip:', e);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-stone-100 flex flex-col space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-pink-500" />
            <h3 className="text-xl font-black">Record Live Highlight Clip</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-800 transition text-stone-400 hover:text-white">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {!recordedBlobUrl ? (
          <div className="flex flex-col items-center justify-center p-8 bg-stone-950/60 rounded-2xl border border-stone-800 space-y-4">
            {isRecording ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-red-600 animate-ping" />
                </div>
                <div className="text-sm font-bold text-red-400">Recording Live Session Highlight...</div>
                <button
                  onClick={stopRecording}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black flex items-center space-x-2 shadow-lg transition"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop Recording</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-4 rounded-full bg-pink-500/20 text-pink-400">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Capture Key Stream Moments</h4>
                  <p className="text-xs text-stone-400 max-w-[280px] mt-1">
                    Record a high-definition highlight clip of your live session to share directly to your profile feed.
                  </p>
                </div>
                <button
                  onClick={startRecording}
                  className="mt-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-black shadow-lg shadow-pink-600/20 flex items-center space-x-2 hover:opacity-95 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Clip Recording</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-stone-800">
              <video src={recordedBlobUrl} controls className="w-full h-full object-cover" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Clip Caption</label>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Write a catchy highlight caption (e.g., Amazing live stream moment! 🙏✨)"
                className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-sm text-stone-100 focus:border-pink-500/50 outline-none transition"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setRecordedBlobUrl(null)}
                className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 font-bold text-xs transition text-stone-300"
              >
                Re-Record
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing || !caption.trim() || published}
                className="flex-2 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-black text-xs shadow-lg shadow-pink-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 transition"
              >
                {published ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Published to Feed!</span>
                  </>
                ) : isPublishing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Post to Profile Feed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
