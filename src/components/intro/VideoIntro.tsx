'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoIntroProps {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setLoadError(true));

    const handleEnd = () => finish();
    v.addEventListener('ended', handleEnd);
    return () => v.removeEventListener('ended', handleEnd);
  }, []);

  function finish() {
    setVisible(false);
    setTimeout(onComplete, 500);
  }

  if (loadError) {
    onComplete();
    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <video
            ref={videoRef}
            src="/intro.mp4"
            className="w-full h-full object-cover"
            muted
            playsInline
            onError={() => setLoadError(true)}
          />

          {/* Skip button */}
          <motion.button
            className="absolute bottom-10 right-10 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium hover:bg-white/20 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            onClick={finish}
          >
            Пропустить →
          </motion.button>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 8, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
