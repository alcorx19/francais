import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, RefreshCw } from 'lucide-react';

interface LoadingScreenProps {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          id="loading-screen-backdrop"
          className="fixed inset-0 z-[90] bg-white flex flex-col items-center justify-center p-6 select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Glowing central glow */}
          <div className="absolute w-[300px] h-[300px] bg-sky-200/20 round-full blur-3xl animate-pulse"></div>

          <div className="relative flex flex-col items-center">
            {/* Pulsating animated book emblem */}
            <motion.div
              id="loading-book-glow"
              className="w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center mb-6 border border-blue-100"
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <BookOpen className="w-10 h-10 text-blue-600" />
            </motion.div>

            {/* Rotating load symbol */}
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="font-display font-medium text-lg text-slate-700 tracking-wider">
                KİTAP YÜKLENİYOR...
              </span>
            </div>

            <p className="font-sans text-xs text-slate-400 mt-2 text-center max-w-xs leading-relaxed italic">
              Metinler ve çizim katmanları hazırlanıyor, lütfen bekleyiniz...
            </p>
          </div>

          {/* Bottom brand indicator */}
          <div className="absolute bottom-8 flex items-center space-x-2 text-slate-300">
            <span className="text-xs font-mono tracking-widest">ECOLE DE LANGUE</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
