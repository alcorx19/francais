import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, Volume2, SkipForward, SkipBack, Headphones, CircleAlert } from 'lucide-react';

interface GlobalAudioPlayerProps {
  isPlaying: boolean;
  audioName: string;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onStop: () => void;
  onSeek: (percent: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export default function GlobalAudioPlayer({
  isPlaying,
  audioName,
  currentTime,
  duration,
  onPlayPause,
  onStop,
  onSeek,
  volume,
  onVolumeChange,
}: GlobalAudioPlayerProps) {
  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = Math.min(Math.max(clickX / width, 0), 1);
    onSeek(percent);
  };

  return (
    <motion.div
      id="global-audio-player"
      className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 shadow-2xl z-50 flex items-center px-4 md:px-8 select-none"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        {/* Track Details */}
        <div className="flex items-center space-x-3 w-1/4 min-w-[150px]">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Headphones className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate" title={audioName}>
              {audioName}
            </p>
            <span className="text-[10px] font-medium text-emerald-400 flex items-center space-x-1 mt-0.5">
              <span className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${isPlaying ? 'animate-ping' : ''}`}></span>
              <span>{isPlaying ? "Ders Esnasında Çalıyor" : "Duraklatıldı"}</span>
            </span>
          </div>
        </div>

        {/* Player Controls & Scrubber */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-3">
          {/* Action Buttons */}
          <div className="flex items-center space-x-4 shrink-0">
            <button
              onClick={onPlayPause}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white flex items-center justify-center shadow-lg transition duration-150 cursor-pointer"
              title={isPlaying ? "Duraklat" : "Oynat"}
            >
              {isPlaying ? <Pause className="w-4.5 h-4.5 fill-white" /> : <Play className="w-4.5 h-4.5 fill-white ml-0.5" />}
            </button>
            <button
              onClick={onStop}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Kapat"
            >
              <Square className="w-4.5 h-4.5 fill-current" />
            </button>
          </div>

          {/* Scrubber of Timeline */}
          <div className="w-full max-w-lg flex items-center space-x-3">
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">{formatTime(currentTime)}</span>
            <div
              onClick={handleProgressClick}
              className="flex-1 h-2 bg-slate-800 rounded-full cursor-pointer relative overflow-hidden group hover:h-2.5 transition-all duration-100"
            >
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-75 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Close */}
        <div className="w-1/4 flex items-center justify-end space-x-4 min-w-[100px]">
          <div className="hidden sm:flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <button
            onClick={onStop}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition uppercase cursor-pointer"
          >
            Sonlandır
          </button>
        </div>
      </div>
    </motion.div>
  );
}
