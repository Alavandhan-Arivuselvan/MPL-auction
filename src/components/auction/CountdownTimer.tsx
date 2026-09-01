import React from 'react';
import { Timer, Plus, RotateCcw } from 'lucide-react';
import { useAuctionStore } from '../../store/useAuctionStore';

export const CountdownTimer: React.FC = () => {
  const timerSeconds = useAuctionStore((s) => s.timerSeconds);
  const timerDuration = useAuctionStore((s) => s.timerDuration);
  const isTimerRunning = useAuctionStore((s) => s.isTimerRunning);
  const resetTimer = useAuctionStore((s) => s.resetTimer);
  const setTimerDuration = useAuctionStore((s) => s.setTimerDuration);

  // Determine alert color state
  const isUrgent = timerSeconds <= 5;
  const isWarning = timerSeconds > 5 && timerSeconds <= 10;

  const colorScheme = isUrgent
    ? {
        border: 'border-red-500',
        text: 'text-red-400',
        glow: 'glow-red',
        bg: 'bg-red-500/10',
        ringStroke: '#ef4444',
      }
    : isWarning
    ? {
        border: 'border-amber-500',
        text: 'text-amber-400',
        glow: 'glow-gold',
        bg: 'bg-amber-500/10',
        ringStroke: '#f59e0b',
      }
    : {
        border: 'border-emerald-500',
        text: 'text-emerald-400',
        glow: 'glow-green',
        bg: 'bg-emerald-500/10',
        ringStroke: '#10b981',
      };

  const progressPercentage = (timerSeconds / timerDuration) * 100;
  const circumference = 2 * Math.PI * 40; // radius 40
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-between p-4 rounded-2xl border ${colorScheme.border} ${colorScheme.bg} transition-all duration-300 ${isUrgent ? 'animate-pulse' : ''}`}>
      
      {/* Left info */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          {/* SVG Circular Progress Ring */}
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="#1e293b"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke={colorScheme.ringStroke}
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 26}
              strokeDashoffset={2 * Math.PI * 26 * (1 - timerSeconds / timerDuration)}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <span className={`absolute font-display text-2xl font-bold ${colorScheme.text}`}>
            {timerSeconds}s
          </span>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-slate-300">
            <Timer className="w-3.5 h-3.5 text-slate-400" />
            Auction Clock
          </div>
          <p className="text-[11px] text-slate-400">
            {isUrgent ? 'GOING ONCE, TWICE...' : isWarning ? 'LAST CALL FOR BIDS' : 'BIDDING IN PROGRESS'}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        {/* Reset Clock */}
        <button
          onClick={resetTimer}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1"
          title="Reset timer to duration"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>

        {/* Preset duration selectors */}
        <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
          {[15, 20, 30].map((sec) => (
            <button
              key={sec}
              onClick={() => setTimerDuration(sec)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                timerDuration === sec
                  ? 'bg-amber-500 text-black font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
