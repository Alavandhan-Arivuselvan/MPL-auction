import React, { useState } from 'react';
import { Trophy, Medal, Award, Download, Users, DollarSign, Sparkles } from 'lucide-react';
import { Team, Player } from '../../types/auction';
import { formatINR, formatRating, getRatingColor } from '../../lib/formatters';
import { SQUAD_LIMIT } from '../../data/defaultData';
import { SquadBreakdownModal } from './SquadBreakdownModal';
import Papa from 'papaparse';

interface ChampionshipLeaderboardProps {
  teams: Team[];
  players: Player[];
}

export const ChampionshipLeaderboard: React.FC<ChampionshipLeaderboardProps> = ({ teams, players }) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Compute team scores and sort by:
  // 1. Squad Average Rating (Descending)
  // 2. Tie-Breaker: Remaining Purse (Descending - Team with more remaining money wins)
  const rankedTeams = [...teams].map((team) => {
    const totalRating = team.players.reduce((sum, p) => sum + p.rating, 0);
    const avgRating = team.players.length > 0 ? totalRating / team.players.length : 0;
    const totalSpent = team.players.reduce((sum, p) => sum + (p.soldPrice ?? 0), 0);

    return {
      team,
      avgRating,
      totalRating,
      totalSpent,
      purseRemaining: team.purseRemaining,
      squadCount: team.players.length,
      isFull: team.players.length === SQUAD_LIMIT,
      isTieBroken: false, // Flagged below if tied on rating
    };
  }).sort((a, b) => {
    const ratingDiff = b.avgRating - a.avgRating;
    // If difference is greater than precision tolerance, sort by rating
    if (Math.abs(ratingDiff) > 0.0001) {
      return ratingDiff;
    }
    // TIE-BREAKER: If ratings are identical, team with higher remaining purse wins!
    return b.purseRemaining - a.purseRemaining;
  });

  // Identify teams involved in ties
  for (let i = 0; i < rankedTeams.length; i++) {
    const current = rankedTeams[i];
    const prev = rankedTeams[i - 1];
    const next = rankedTeams[i + 1];

    const tiedWithPrev = prev && Math.abs(current.avgRating - prev.avgRating) <= 0.0001;
    const tiedWithNext = next && Math.abs(current.avgRating - next.avgRating) <= 0.0001;

    if (tiedWithPrev || tiedWithNext) {
      current.isTieBroken = true;
    }
  }

  const champion = rankedTeams[0];
  const championWonByTieBreaker =
    rankedTeams.length > 1 &&
    Math.abs(rankedTeams[0].avgRating - rankedTeams[1].avgRating) <= 0.0001 &&
    rankedTeams[0].purseRemaining > rankedTeams[1].purseRemaining;

  // CSV Export Handler
  const handleExportCSV = () => {
    const exportRows: Record<string, unknown>[] = [];

    rankedTeams.forEach((item, index) => {
      item.team.players.forEach((player) => {
        exportRows.push({
          'Rank': index + 1,
          'Team Name': item.team.name,
          'Team Avg Rating': formatRating(item.avgRating),
          'Purse Remaining': formatINR(item.purseRemaining),
          'Player Name': player.name,
          'Role': player.role,
          'Player Rating': player.rating,
          'Base Price': formatINR(player.basePrice),
          'Sold Price': formatINR(player.soldPrice ?? 0),
        });
      });
    });

    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MPL_2026_Auction_Final_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Champion Celebration Hero Card */}
      {champion && champion.team.players.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 shadow-2xl glow-gold text-center stadium-spotlight">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            MPL 2026 Champions
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-2xl mb-4 transform hover:scale-105 transition-transform">
              <Trophy className="w-12 h-12 text-slate-950" />
            </div>

            <span className="text-sm font-bold text-amber-400 uppercase tracking-widest">
              Highest Squad Average Rating
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white font-display tracking-wide uppercase mt-1">
              {champion.team.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
              <div className="px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg">
                <span className="text-xs text-slate-400 font-semibold block">Team Squad Average</span>
                <span className="text-3xl font-black text-amber-400 font-display">
                  {formatRating(champion.avgRating)} / 10.0
                </span>
              </div>

              <div className="px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg">
                <span className="text-xs text-slate-400 font-semibold block">Purse Left (Tie-Breaker)</span>
                <span className="text-2xl font-black text-emerald-400 font-display">
                  {formatINR(champion.purseRemaining)}
                </span>
              </div>

              <div className="px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg">
                <span className="text-xs text-slate-400 font-semibold block">Squad Ceiling</span>
                <span className="text-2xl font-black text-cyan-400 font-display">
                  {champion.team.players.length} / {SQUAD_LIMIT} Acquired
                </span>
              </div>
            </div>

            {/* Tie-breaker win notification */}
            {championWonByTieBreaker && (
              <div className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-amber-500/25 border-2 border-amber-400/60 text-amber-300 text-xs font-black shadow-lg glow-gold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  DECIDED BY TIE-BREAKER: Identical squad average rating broken by Higher Remaining Purse (+{formatINR(champion.purseRemaining - rankedTeams[1].purseRemaining)} advantage)!
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Tie-Breaker Rule Alert Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
            Tie-Breaker Rule
          </span>
          <span>
            If 2 or more teams finish with the <strong>exact same average rating</strong>, the team with <strong>more remaining purse</strong> is declared the winner.
          </span>
        </div>
        <span className="text-[11px] text-emerald-400 font-bold whitespace-nowrap">
          Criterion 1: Squad Average ➔ Criterion 2: Remaining Purse
        </span>
      </div>

      {/* Leaderboard Table Card */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        
        {/* Table Header Controls */}
        <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Official Championship Standings
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by mathematical average rating of squad players • Tie-breaker: Highest purse remaining
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition shadow"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Download Full Report (CSV)
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                <th className="py-4 px-6 text-center">Rank</th>
                <th className="py-4 px-6">Franchise</th>
                <th className="py-4 px-6 text-center">Squad Size</th>
                <th className="py-4 px-6 text-center">Squad Average</th>
                <th className="py-4 px-6 text-right">Purse Left</th>
                <th className="py-4 px-6 text-right">Total Spent</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rankedTeams.map((item, index) => {
                const isWinner = index === 0 && item.team.players.length > 0;
                const isSecond = index === 1 && item.team.players.length > 0;
                const isThird = index === 2 && item.team.players.length > 0;

                return (
                  <tr
                    key={item.team.id}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      isWinner ? 'bg-amber-500/5 font-semibold' : ''
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center">
                        {isWinner ? (
                          <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-sm shadow-md shadow-amber-500/30">
                            🥇 1
                          </div>
                        ) : isSecond ? (
                          <div className="w-8 h-8 rounded-full bg-slate-300 text-black flex items-center justify-center font-bold text-sm">
                            🥈 2
                          </div>
                        ) : isThird ? (
                          <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-sm">
                            🥉 3
                          </div>
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Franchise Details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.team.logo}</span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-white">{item.team.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                              {item.team.shortName}
                            </span>
                            {item.isTieBroken && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                ⚖️ Tie-Breaker (Purse Ranked)
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {item.team.players.length === SQUAD_LIMIT ? (
                              <span className="text-emerald-400">Squad Complete (6/6)</span>
                            ) : (
                              <span>{SQUAD_LIMIT - item.team.players.length} slots vacant</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Squad Count */}
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.isFull ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.squadCount} / {SQUAD_LIMIT}
                      </span>
                    </td>

                    {/* Squad Average Rating */}
                    <td className="py-4 px-6 text-center">
                      <span className="text-lg font-black text-amber-400 font-display">
                        {item.team.players.length > 0 ? formatRating(item.avgRating) : '—'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">/ 10.0</span>
                    </td>

                    {/* Purse Remaining */}
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm font-extrabold text-emerald-400 font-display">
                        {formatINR(item.purseRemaining)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Available</span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm font-bold text-slate-300 font-display">
                        {formatINR(item.totalSpent)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Invested</span>
                    </td>

                    {/* Squad Inspection Button */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedTeam(item.team)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition"
                      >
                        Inspect Squad
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      <SquadBreakdownModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
    </div>
  );
};
