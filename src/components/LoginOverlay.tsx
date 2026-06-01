import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VALID_IDS } from '../data';
import { LogIn, HelpCircle } from 'lucide-react';

interface LoginOverlayProps {
  onLoginSuccess: (id: string) => void;
}

export default function LoginOverlay({ onLoginSuccess }: LoginOverlayProps) {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = userId.trim().toUpperCase();
    if (VALID_IDS.includes(cleanId)) {
      setError(false);
      setIsVisible(false);
      // Wait for exit animation to complete before calling parent
      setTimeout(() => {
        onLoginSuccess(cleanId);
      }, 500);
    } else {
      setError(true);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="login-overlay-container"
          className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-4 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Subtle ambient dynamic blobs */}
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

          <motion.div
            id="login-card"
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-100 flex flex-col items-center"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 100 }}
          >
            {/* Elegant Emblem logo */}
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <LogIn className="w-8 h-8" />
            </div>

            <h1 className="font-display font-medium text-2xl text-slate-900 tracking-tight text-center">
              Plateforme de Cours Interactive
            </h1>
            <p className="font-sans text-sm text-slate-500 mt-2 text-center">
              Ders kitabını açmak ve etkinliklere katılmak için Öğrenci veya Öğretmen ID'nizi giriniz.
            </p>

            <form onSubmit={handleSubmit} className="w-full mt-8">
              <div className="relative">
                <input
                  type="text"
                  id="user-id-input"
                  placeholder="ÖRN: OGR123, PROF456"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    if (error) setError(false);
                  }}
                  className="w-full font-mono font-medium text-center uppercase border-2 text-slate-800 placeholder-slate-400 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border-slate-200 focus:border-blue-500 p-3.5 rounded-xl transition-all duration-200 outline-none"
                  autoFocus
                />
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    id="login-error-msg"
                    className="text-rose-500 text-xs text-center font-medium mt-3 italic"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    Geçersiz Öğrenci/Öğretmen ID! Lütfen tekrar deneyiniz.
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                id="login-submit-btn"
                className="w-full mt-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium p-3.5 rounded-xl shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Sisteme Giriş Yap</span>
              </button>
            </form>

            {/* Explanatory badge list */}
            <div className="w-full mt-8 pt-6 border-t border-slate-100 flex flex-col space-y-2 text-left">
              <div className="flex items-start space-x-2 text-[11px] text-slate-400">
                <HelpCircle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-500">Test için kullanabileceğiniz ID'ler:</span>
                  <div className="mt-1 flex flex-wrap gap-1.5 font-mono">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">OGR123</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">PROF456</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">DEMO</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
