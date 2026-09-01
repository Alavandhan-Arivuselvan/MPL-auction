import React from 'react';
import { Trophy, Volume2, VolumeX, RotateCcw, Play, Pause, Settings, BarChart3, Radio, Wifi } from 'lucide-react';
import { useAuctionStore } from '../store/useAuctionStore';
import { useSocket } from '../context/SocketContext';

interface NavbarProps {
  currentTab: 'arena' | 'setup' | 'leaderboard' | 'multiplayer';
  setCurrentTab: (tab: 'arena' | 'setup' | 'leaderboard' | 'multiplayer') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const status = useAuctionStore((s) => s.status);
  const isMuted = useAuctionStore((s) => s.isMuted);
  const toggleMute = useAuctionStore((s) => s.toggleMute);
  const isTimerRunning = useAuctionStore((s) => s.isTimerRunning);
  const pauseAuction = useAuctionStore((s) => s.pauseAuction);
  const resumeAuction = useAuctionStore((s) => s.resumeAuction);
  const resetAuction = useAuctionStore((s) => s.resetAuction);

  const { roomId, isConnected } = useSocket();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#070b14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('arena')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/30">
            <Trophy className="w-5 h-5" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 font-display">
                MPL 2026
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Manarpuram Premier League
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">IPL-Style Live Multiplayer Auction Arena</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentTab('arena')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentTab === 'arena'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Arena
          </button>

          <button
            onClick={() => setCurrentTab('multiplayer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
              currentTab === 'multiplayer'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multiplayer</span>
            {roomId && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentTab === 'leaderboard'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Leaderboard
          </button>

          <button
            onClick={() => setCurrentTab('setup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentTab === 'setup'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Setup
          </button>
        </nav>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* WebSocket Server Connection status indicator */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold"
            title={isConnected ? 'WebSocket Server Connected' : 'Connecting to WebSocket Server'}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'}`} />
            <span className={isConnected ? 'text-slate-300' : 'text-red-400'}>
              {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
            </span>
          </div>

          {/* Pause / Resume button */}
          {status === 'LIVE' && !roomId && (
            <button
              onClick={() => (isTimerRunning ? pauseAuction() : resumeAuction())}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isTimerRunning ? 'Pause Auction Clock' : 'Resume Clock'}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
            </button>
          )}

          {/* Mute sound toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={isMuted ? 'Unmute Sounds' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Reset auction modal trigger */}
          <button
            onClick={() => {
              if (window.confirm('Reset the entire local auction state back to start?')) {
                resetAuction();
              }
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
            title="Reset Local Auction"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
