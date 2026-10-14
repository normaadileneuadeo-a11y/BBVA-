import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BBVABiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userName: string;
}

export const BBVABiometricModal: React.FC<BBVABiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // State: 'scanning' | 'matched'
  const [phase, setPhase] = useState<'scanning' | 'matched'>('scanning');

  useEffect(() => {
    if (isOpen) {
      setPhase('scanning');

      // Authentic Apple Face ID timing (completely silent - no sounds)
      const timer1 = setTimeout(() => {
        setPhase('matched');

        // Silent subtle iOS haptic vibration if supported
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(25);
          } catch (_) {}
        }

        const timer2 = setTimeout(() => {
          onSuccess();
          onClose();
        }, 550);

        return () => clearTimeout(timer2);
      }, 950);

      return () => clearTimeout(timer1);
    }
  }, [isOpen, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Authentic iOS Face ID Frosted Glass HUD */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="w-48 h-48 sm:w-52 sm:h-52 bg-[#1c1c1e]/90 backdrop-blur-2xl rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col items-center justify-center text-white relative overflow-hidden"
      >
        {/* Apple Face ID Glyph */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {phase === 'scanning' ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.94, 1.02, 0.96] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="relative w-20 h-20 flex items-center justify-center"
            >
              {/* Outer Face Contour Box with Rounded Corners and Notch Gaps */}
              <svg 
                className="w-20 h-20 text-white/90" 
                viewBox="0 0 100 100" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Top-left corner */}
                <path d="M 32 12 H 22 C 16.48 12 12 16.48 12 22 V 32" />
                {/* Top-right corner */}
                <path d="M 68 12 H 78 C 83.52 12 88 16.48 88 22 V 32" />
                {/* Bottom-left corner */}
                <path d="M 12 68 V 78 C 12 83.52 16.48 88 22 88 H 32" />
                {/* Bottom-right corner */}
                <path d="M 88 68 V 78 C 88 83.52 83.52 88 78 88 H 68" />

                {/* Left eye */}
                <line x1="33" y1="36" x2="33" y2="44" strokeWidth="4.5" />
                {/* Right eye */}
                <line x1="67" y1="36" x2="67" y2="44" strokeWidth="4.5" />

                {/* Nose bracket */}
                <path d="M 50 40 V 55 H 44" strokeWidth="4" />

                {/* Smiling mouth */}
                <path d="M 34 68 C 42 75 58 75 66 68" strokeWidth="4" />
              </svg>

              {/* Pulsing Light Glow Bar */}
              <motion.div
                className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-75 blur-[0.5px]"
                animate={{ top: ['15%', '85%', '15%'] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              />
            </motion.div>
          ) : (
            /* Apple Face ID Success Checkmark */
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-20 h-20 flex items-center justify-center"
            >
              <svg 
                className="w-20 h-20 text-white/90" 
                viewBox="0 0 100 100" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Top-left corner */}
                <path d="M 32 12 H 22 C 16.48 12 12 16.48 12 22 V 32" />
                {/* Top-right corner */}
                <path d="M 68 12 H 78 C 83.52 12 88 16.48 88 22 V 32" />
                {/* Bottom-left corner */}
                <path d="M 12 68 V 78 C 12 83.52 16.48 88 22 88 H 32" />
                {/* Bottom-right corner */}
                <path d="M 88 68 V 78 C 88 83.52 83.52 88 78 88 H 68" />
              </svg>

              {/* Smooth Apple Green Checkmark */}
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute w-12 h-12 text-[#34c759]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.polyline points="20 6 9 17 4 12" />
              </motion.svg>
            </motion.div>
          )}
        </div>

        {/* Apple Face ID Label */}
        <span className="text-white/90 font-medium text-[15px] tracking-tight mt-3 font-sans">
          Face ID
        </span>
      </motion.div>
    </div>
  );
};
