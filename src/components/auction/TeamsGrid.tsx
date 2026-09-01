import React, { useState } from 'react';
import { Users, Eye, Trophy } from 'lucide-react';
import { Team } from '../../types/auction';
import { formatINR, formatRating } from '../../lib/formatters';
import { SQUAD_LIMIT } from '../../data/defaultData';
import { SquadBreakdownModal } from '../dashboard/SquadBreakdownModal';

interface TeamsGridProps {
  teams: Team[];
  leadingTeamId: string | null;
}

export const TeamsGrid: React.FC<TeamsGridProps> = ({ teams, leadingTeamId }) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  return (
    <>
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 flex flex-col h-full shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Franchise Standings (6 Teams)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Click team to view squad</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 flex-1 overflow-y-auto pr-1">
          {[...teams]
            .map((team) => {
              const avgRating =
                team.players.length > 0
                  ? team.players.reduce((sum, p) => sum + p.rating, 0) / team.players.length
                  : 0;
              return { team, avgRating };
            })
            .sort((a, b) => {
              const diff = b.avgRating - a.avgRating;
              if (Math.abs(diff) > 0.0001) return diff;
              // Tie-breaker: Highest remaining purse
              return b.team.purseRemaining - a.team.purseRemaining;
            })
            .map(({ team, avgRating }, rankIndex) => {
              const isLeading = team.id === leadingTeamId;

              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                    isLeading
                      ? 'border-amber-400 bg-amber-500/10 shadow-md ring-1 ring-amber-400'
                      : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center font-mono">
                      #{rankIndex + 1}
                    </span>
                    <span className="text-2xl">{team.logo}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {team.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">
                        Squad: <strong className="text-slate-200">{team.players.length}/{SQUAD_LIMIT}</strong>
                      </span>
                      {team.players.length > 0 && (
                        <span className="text-[10px] text-amber-400 font-bold">
                          Avg: {formatRating(avgRating)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Purse Left</span>
                    <span className="text-xs font-extrabold text-emerald-400 font-display">
                      {formatINR(team.purseRemaining)}
                    </span>
                  </div>
                  <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SquadBreakdownModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
    </>
  );
};
