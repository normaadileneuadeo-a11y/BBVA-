import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BBVALogo } from './BBVALogo';
import { sounds } from '../utils/soundEffects';

interface BBVASplashScreenProps {
  onFinish: () => void;
}

export const BBVASplashScreen: React.FC<BBVASplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    sounds.playNotificationSound();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onFinish();
          }, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div 
      onClick={onFinish}
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#004481] via-[#043263] to-[#001844] flex flex-col items-center justify-between p-8 text-white select-none cursor-pointer overflow-hidden"
    >
      {/* Ambient glowing radial blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Top spacer */}
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFinish();
          }}
          className="text-xs text-blue-200/60 hover:text-white px-3 py-1 rounded-full border border-white/10"
        >
          Saltar
        </button>
      </div>

      {/* Center Animated Logo & Branding */}
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Gleam light effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-sm rounded-full pointer-events-none" />
          <BBVALogo size="xl" color="#ffffff" className="drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-xs tracking-widest uppercase font-semibold text-blue-200 mt-6"
        >
          Creando Oportunidades
        </motion.p>
      </div>

      {/* Bottom Loading Progress Indicator */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2">
        <div className="w-full bg-white/15 h-1 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
        <span className="text-[10px] text-blue-200/70 font-mono tracking-wider">
          Iniciando Banca Digital Segura...
        </span>
      </div>
    </div>
  );
};
