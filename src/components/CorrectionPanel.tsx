import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PAGE_CORRECTIONS } from '../data';
import { X, CheckSquare, Copy, Check } from 'lucide-react';

interface CorrectionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPageNum: number; // PDF.js page number
}

export default function CorrectionPanel({ isOpen, onClose, currentPageNum }: CorrectionPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const bookPageNum = currentPageNum - 1;
  const correctionText = PAGE_CORRECTIONS[String(bookPageNum)] || null;

  const handleCopy = () => {
    if (!correctionText) return;
    navigator.clipboard.writeText(correctionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="correction-panel-container"
          className="fixed right-0 top-16 bottom-0 w-80 md:w-96 bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-semibold text-slate-800">Correction des Exercices</h3>
              </div>
              <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                Kitap Sayfa: <span className="font-bold text-slate-700">{bookPageNum}</span> 
                <span className="text-slate-300 mx-1">|</span> 
                PDF Sayfa: <span className="font-bold text-slate-700">{currentPageNum}</span>
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Code representation of Offset info */}
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center justify-between">
            <span className="text-[11px] text-amber-700 font-medium font-sans">
              ℹ️ Sayfa Ofseti (-1) otomatik hesaplandı.
            </span>
            <span className="bg-amber-100 text-amber-800 font-mono text-[10px] px-1.5 py-0.5 rounded">
              P_PDF ({currentPageNum}) - 1 = P_Kitap ({bookPageNum})
            </span>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 text-sm text-slate-600 leading-relaxed font-sans">
            {correctionText ? (
              <div className="space-y-4">
                {/* Custom HTML rendering for rich text corrections */}
<div 
  className="bg-slate-50 border border-slate-100 rounded-xl p-4 font-sans text-slate-700 select-text text-sm"
  dangerouslySetInnerHTML={{ __html: correctionText }}
/>

                <button
                  onClick={handleCopy}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-medium text-xs rounded-xl transition flex items-center justify-center space-x-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Panoya Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Cevapları Panoya Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-3">
                <CheckSquare className="w-10 h-10 text-slate-200 stroke-[1.5]" />
                <p className="font-medium text-slate-500 text-sm">Cevap Anahtarı Bulunmuyor</p>
                <p className="text-xs text-slate-400 max-w-[200px]">
                  Kitabın bu sayfasında (Sayfa {bookPageNum}) kayıtlı bir cevap anahtarı bulunmamaktadır.
                </p>
              </div>
            )}
          </div>

          {/* Bottom tracker state indicator */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1 font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sayfa Akış Takibi Aktif</span>
            </span>
            <span className="font-mono text-[9px]">v1.0.0</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
