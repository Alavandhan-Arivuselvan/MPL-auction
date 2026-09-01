import React from 'react';
import { X, Award, Shield, User, DollarSign, Trophy } from 'lucide-react';
import { Team } from '../../types/auction';
import { formatINR, formatRating, getRatingColor, getRoleBadge } from '../../lib/formatters';
import { SQUAD_LIMIT } from '../../data/defaultData';

interface SquadBreakdownModalProps {
  team: Team | null;
  onClose: () => void;
}

export const SquadBreakdownModal: React.FC<SquadBreakdownModalProps> = ({ team, onClose }) => {
  if (!team) return null;

  const totalSpent = team.players.reduce((sum, p) => sum + (p.soldPrice ?? 0), 0);
  const avgRating =
    team.players.length > 0
      ? team.players.reduce((sum, p) => sum + p.rating, 0) / team.players.length
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl glass-card border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div
          className="p-6 border-b border-slate-800 flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${team.color}25, transparent)`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">{team.logo}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-white font-display tracking-wide">
                  {team.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-900 text-slate-300 border border-slate-700">
                  {team.shortName}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Squad: {team.players.length}/{SQUAD_LIMIT} Players • Spent: {formatINR(totalSpent)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Metrics Banner */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 bg-slate-950/80 border-b border-slate-800 text-center py-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Purse Remaining</span>
            <p className="text-base font-black text-emerald-400 font-display">
              {formatINR(team.purseRemaining)}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Squad Average</span>
            <p className="text-base font-black text-amber-400 font-display">
              {team.players.length > 0 ? `${formatRating(avgRating)} / 10.0` : '—'}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Acquired</span>
            <p className="text-base font-black text-cyan-400 font-display">
              {team.players.length} / {SQUAD_LIMIT}
            </p>
          </div>
        </div>

        {/* Players Roster Grid */}
        <div className="p-6 max-h-[380px] overflow-y-auto space-y-3">
          {team.players.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No players acquired yet in this auction.</p>
            </div>
          ) : (
            team.players.map((player, idx) => {
              const roleBadge = getRoleBadge(player.role);
              const ratingColor = getRatingColor(player.rating);

              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{player.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}>
                          {player.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Rating */}
                    <div className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 text-xs font-extrabold ${ratingColor}`}>
                      <Award className="w-3.5 h-3.5" />
                      <span>{formatRating(player.rating)}</span>
                    </div>

                    {/* Bought Price */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-[10px] text-slate-400 block">Bought For</span>
                      <span className="text-xs font-black text-amber-400 font-display">
                        {formatINR(player.soldPrice ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
