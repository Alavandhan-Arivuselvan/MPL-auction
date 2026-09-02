import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, RefreshCw, Users, Shield, Award } from 'lucide-react';
import { useAuctionStore } from '../../store/useAuctionStore';
import { RAW_DEFAULT_CSV } from '../../data/defaultData';
import { formatINR, formatRating, getRoleBadge, getRatingColor } from '../../lib/formatters';

export const CSVUploader: React.FC = () => {
  const players = useAuctionStore((s) => s.players);
  const teams = useAuctionStore((s) => s.teams);
  const loadCSV = useAuctionStore((s) => s.loadCSV);
  const initDefaultData = useAuctionStore((s) => s.initDefaultData);
  const updateTeam = useAuctionStore((s) => s.updateTeam);
  const updatePlayer = useAuctionStore((s) => s.updatePlayer);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const res = loadCSV(content);
        if (res.success) {
          setNotification({
            type: 'success',
            message: `Successfully loaded ${res.count} players from CSV!`,
          });
        } else {
          setNotification({
            type: 'error',
            message: res.errors.join(', ') || 'Failed to parse CSV.',
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white font-display uppercase tracking-wide">
            MPL Auction Configuration & Player Roster
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your 6 franchises, upload new CSV files, or restore the official 36-player tournament roster.
          </p>
        </div>

        <button
          onClick={() => {
            initDefaultData();
            setNotification({
              type: 'success',
              message: 'Reloaded official 36-player roster and default 6 teams!',
            });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Load Official 36 Roster
        </button>
      </div>

      {/* Notification banner */}
      {notification && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/10 border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Grid: CSV Upload Drag & Drop and Team Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Zone */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex-1 rounded-3xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-900/40 hover:bg-slate-900/70 p-8 flex flex-col items-center justify-center text-center transition cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-white">Drop your Player CSV here</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Supports <span className="text-amber-400 font-mono">Players, Rating, Type, Base Price</span> columns with Indian format prices (e.g. 2cr, 75L).
            </p>
            <span className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700">
              Browse File from Computer
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Roster Highlights:</span>
            <p>• Total Available: <strong className="text-amber-400">{players.length} Players</strong></p>
            <p>• All-Rounders: <strong className="text-white">{players.filter(p => p.role === 'All Rounder').length}</strong></p>
            <p>• Batsmen: <strong className="text-white">{players.filter(p => p.role === 'Batsman').length}</strong></p>
            <p>• Bowlers: <strong className="text-white">{players.filter(p => p.role === 'Bowler').length}</strong></p>
          </div>
        </div>

        {/* 6 Franchises Customizer */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Customize 6 Franchises (₹60 Cr Purse each)
            </h3>
            <span className="text-xs text-slate-500">Auto-saved</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {teams.map((team) => (
              <div key={team.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={team.logo}
                    onChange={(e) => updateTeam(team.id, { logo: e.target.value })}
                    className="w-10 h-10 text-center text-xl rounded-xl bg-slate-950 border border-slate-700 focus:outline-none focus:border-amber-400"
                    title="Change team emoji/logo"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => updateTeam(team.id, { name: e.target.value })}
                      className="w-full text-xs font-bold bg-transparent text-white border-b border-transparent focus:border-amber-400 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={team.shortName}
                        onChange={(e) => updateTeam(team.id, { shortName: e.target.value })}
                        className="w-12 text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-300"
                      />
                      <input
                        type="color"
                        value={team.color}
                        onChange={(e) => updateTeam(team.id, { color: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Players Pool Preview Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Loaded Players Roster ({players.length} Players)
            </h3>
          </div>
        </div>

        <div className="max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="py-3 px-5">#</th>
                <th className="py-3 px-5">Player Name</th>
                <th className="py-3 px-5 text-center">Specialization</th>
                <th className="py-3 px-5 text-center">Rating</th>
                <th className="py-3 px-5 text-right">Base Price</th>
                <th className="py-3 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {players.map((player, index) => {
                const role = getRoleBadge(player.role);
                const ratingColor = getRatingColor(player.rating);

                return (
                  <tr key={player.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-5 text-slate-500 font-mono">{index + 1}</td>
                    <td className="py-3 px-5 font-bold text-white">{player.name}</td>
                    <td className="py-3 px-5 text-center">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${role.bg} ${role.border} ${role.text}`}>
                        {player.role}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <div className={`px-2 py-0.5 rounded-md border text-[11px] font-extrabold flex items-center justify-center gap-1 w-20 mx-auto ${ratingColor}`}>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="10"
                          value={player.rating}
                          onChange={(e) => updatePlayer(player.id, { rating: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-transparent text-center focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right font-extrabold text-amber-400 font-display text-sm">
                      <input
                        type="number"
                        step="100000"
                        min="0"
                        value={player.basePrice}
                        onChange={(e) => updatePlayer(player.id, { basePrice: parseInt(e.target.value) || 0 })}
                        className="w-28 bg-transparent text-right border-b border-transparent focus:border-amber-400 focus:outline-none text-amber-400"
                      />
                    </td>
                    <td className="py-3 px-5 text-center">
                      {player.isSold ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          SOLD
                        </span>
                      ) : player.isUnsold ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                          UNSOLD
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                          UPCOMING
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
