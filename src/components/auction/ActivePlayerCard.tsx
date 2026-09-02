import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Shield, User, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { Player, Team } from '../../types/auction';
import { formatINR, formatRating, getRatingColor, getRoleBadge } from '../../lib/formatters';

interface ActivePlayerCardProps {
  player: Player | undefined;
  lotNumber: number;
  totalPlayers: number;
  currentBid: number;
  leadingTeam: Team | undefined;
}

export const ActivePlayerCard: React.FC<ActivePlayerCardProps> = ({
  player,
  lotNumber,
  totalPlayers,
  currentBid,
  leadingTeam,
}) => {
  if (!player) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 flex flex-col items-center justify-center min-h-[420px]">
        <div className="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 text-slate-500">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-100">All Lots Concluded!</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          Every player in the pool has been presented to the teams. Check the Championship Leaderboard to view final squad standings.
        </p>
      </div>
    );
  }

  const roleInfo = getRoleBadge(player.role);
  const ratingColor = getRatingColor(player.rating);

  // Generate stylized avatar initials
  const initials = player.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={player.id}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl glass-card border border-slate-800/90 shadow-2xl stadium-spotlight"
      >
        {/* Top Header Strip: Lot Number & Category */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider">
              LOT #{lotNumber}
            </span>
            <span className="text-xs text-slate-400 font-medium">OF {totalPlayers} PLAYERS</span>
          </div>

          {/* Role Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wide ${roleInfo.bg} ${roleInfo.border} ${roleInfo.text}`}>
            <span className={`w-2 h-2 rounded-full ${roleInfo.dot}`} />
            {roleInfo.label}
          </div>
        </div>

        {/* Main Center Stage Body */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Player Visual Avatar Column */}
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <div className="relative group">
              {/* Glowing Aura */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-amber-500 to-purple-600 opacity-30 blur-lg group-hover:opacity-60 transition duration-1000" />

              {/* Avatar Box */}
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-slate-700/80 flex flex-col items-center justify-center p-4 shadow-xl overflow-hidden">
                <div className="w-20 h-20 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center text-3xl font-extrabold text-amber-400 shadow-inner font-display">
                  {initials}
                </div>
                <span className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  MPL 2026
                </span>

              </div>
            </div>

            {/* Base Price Tag below avatar */}
            <div className="mt-4 px-4 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-1.5 text-xs text-slate-300">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Base Price:</span>
              <span className="font-bold text-amber-400">{formatINR(player.basePrice)}</span>
            </div>
          </div>

          {/* Player Specs & Live Bidding Stage */}
          <div className="md:col-span-8 flex flex-col justify-center">
            
            {/* Player Name */}
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-wide uppercase font-display">
              {player.name}
            </h2>

            {/* Rating Details & Role Info */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Specialization:</span>
                <span className="text-white">{player.role}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800 opacity-60">
                <Award className="w-3.5 h-3.5" />
                <span className="italic">Rating Hidden (Blind Bidding)</span>
              </div>
            </div>

            {/* LIVE BID DISPLAY BOX */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-slate-800 relative overflow-hidden shadow-2xl">
              
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                <span>{leadingTeam ? 'CURRENT HIGHEST BID' : 'OPENING BID AVAILABLE'}</span>
                {leadingTeam && (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    IN THE LEAD
                  </span>
                )}
              </div>

              {/* Huge High-Contrast Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-display tracking-tight">
                  {formatINR(currentBid)}
                </span>
                <span className="text-sm font-semibold text-slate-400">INR</span>
              </div>

              {/* Leading Team Banner */}
              {leadingTeam ? (
                <div
                  className="mt-3 flex items-center justify-between p-3 rounded-xl border transition-all"
                  style={{
                    backgroundColor: `${leadingTeam.color}15`,
                    borderColor: `${leadingTeam.color}50`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{leadingTeam.logo}</span>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase">Holding Bid</span>
                      <h4 className="text-base font-bold text-white leading-none">{leadingTeam.name}</h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Purse Left</span>
                    <p className="text-xs font-bold text-emerald-400">
                      {formatINR(leadingTeam.purseRemaining - currentBid)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                  <p className="text-xs text-slate-400 font-medium">
                    No bids placed yet. Click any team below to open bidding at base price ({formatINR(player.basePrice)}).
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

      </motion.div>
    </AnimatePresence>
  );
};
