import React, { useState } from 'react';
import { Gavel, Ban, PlusCircle, AlertCircle, RefreshCw, Zap, XCircle } from 'lucide-react';
import { Team, Player } from '../../types/auction';
import { formatINR } from '../../lib/formatters';
import { SQUAD_LIMIT, MIN_BID_RESERVE } from '../../data/defaultData';

interface AuctioneerControlsProps {
  isOnlineMode?: boolean;
  myTeam?: Team;
  teams: Team[];
  activePlayer: Player | undefined;
  currentBid: number;
  leadingTeamId: string | null;
  unsoldQueueCount: number;
  onPlaceBid: (teamId: string, customAmount?: number) => { success: boolean; message?: string };
  onMarkSold: () => void;
  onMarkUnsold: () => void;
  onRecirculateUnsold: () => void;
  onEndAuction?: () => void;
}

export const AuctioneerControls: React.FC<AuctioneerControlsProps> = ({
  isOnlineMode,
  myTeam,
  teams,
  activePlayer,
  currentBid,
  leadingTeamId,
  unsoldQueueCount,
  onPlaceBid,
  onMarkSold,
  onMarkUnsold,
  onRecirculateUnsold,
  onEndAuction,
}) => {
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!activePlayer) return null;

  // IPL-style dynamic increments based on current bid
  const getSmartIncrements = (bid: number) => {
    if (bid < 10000000) {
      return [
        { label: '+10 Lakhs', value: 1000000 },
        { label: '+20 Lakhs', value: 2000000 },
        { label: '+50 Lakhs', value: 5000000 },
      ];
    } else if (bid < 20000000) {
      return [
        { label: '+20 Lakhs', value: 2000000 },
        { label: '+50 Lakhs', value: 5000000 },
        { label: '+1.00 Cr', value: 10000000 },
      ];
    } else if (bid < 50000000) {
      return [
        { label: '+25 Lakhs', value: 2500000 },
        { label: '+50 Lakhs', value: 5000000 },
        { label: '+1.00 Cr', value: 10000000 },
      ];
    } else {
      return [
        { label: '+50 Lakhs', value: 5000000 },
        { label: '+1.00 Cr', value: 10000000 },
        { label: '+2.00 Cr', value: 20000000 },
      ];
    }
  };

  const smartIncrements = getSmartIncrements(currentBid);

  const handleCustomBid = (teamId: string) => {
    setErrorMessage(null);
    let amount = parseFloat(customAmountInput);
    if (isNaN(amount) || amount <= 0) {
      // Normal increment
      const result = onPlaceBid(teamId);
      if (!result.success && result.message) {
        setErrorMessage(result.message);
      }
      return;
    }

    // Convert into numerical INR if entered in Cr (e.g. 2.5 -> 25000000)
    if (amount <= 100) {
      amount = amount * 10000000;
    }

    const result = onPlaceBid(teamId, amount);
    if (!result.success && result.message) {
      setErrorMessage(result.message);
    } else {
      setCustomAmountInput('');
    }
  };

  const handleTeamClick = (teamId: string, customAddAmount?: number) => {
    setErrorMessage(null);
    let amountToBid: number | undefined;

    if (customAddAmount) {
      amountToBid = currentBid + customAddAmount;
    }

    const res = onPlaceBid(teamId, amountToBid);
    if (!res.success && res.message) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-800 space-y-5 shadow-2xl">
      
      {/* Top Bar: Increment Presets & Hammer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        
        {/* Smart Increment Quick Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            IPL Smart Step:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {smartIncrements.map((inc) => (
              <button
                key={inc.label}
                onClick={() => {
                  if (leadingTeamId) {
                    // Apply to a different team or prompt
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400 hover:bg-slate-800 transition"
              >
                {inc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Price Input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="number"
              step="0.1"
              placeholder="Custom Bid (Cr)"
              value={customAmountInput}
              onChange={(e) => setCustomAmountInput(e.target.value)}
              className="w-36 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <span className="text-[11px] text-slate-400">e.g. 3.5</span>
        </div>

        {/* Main Hammer / Gavel Buttons */}
        <div className="flex items-center gap-2">
          {/* SOLD Button */}
          <button
            onClick={onMarkSold}
            disabled={!leadingTeamId}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-extrabold transition-all shadow-lg ${
              leadingTeamId
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-emerald-500/30 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Gavel className="w-4 h-4" />
            SOLD!
          </button>

          {/* UNSOLD Button */}
          <button
            onClick={onMarkUnsold}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition active:scale-95"
          >
            <Ban className="w-3.5 h-3.5" />
            UNSOLD
          </button>

          {/* Recirculate button if queue exists */}
          {unsoldQueueCount > 0 && (
            <button
              onClick={onRecirculateUnsold}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold transition"
              title="Bring back unsold players for accelerated round"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recirculate ({unsoldQueueCount})
            </button>
          )}

          {/* End Auction Button (Host only, online mode) */}
          {onEndAuction && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to END the auction? This will finalize all current standings.')) {
                  onEndAuction();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 text-xs font-bold transition"
              title="Force end the auction now"
            >
              <XCircle className="w-3.5 h-3.5" />
              End Auction
            </button>
          )}
        </div>

      </div>

      {/* Error Alert Box if any */}
      {errorMessage && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 font-bold text-sm">
            ✕
          </button>
        </div>
      )}

      {/* Quick-Bid Teams Grid (Local Mode) or Host Bid Button (Online Mode) */}
      <div>
        {isOnlineMode && myTeam ? (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Host Franchise Controls
              </span>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span>Purse: <span className="text-emerald-400 font-display">{formatINR(myTeam.purseRemaining)}</span></span>
                <span>Squad: <span className="text-amber-400">{myTeam.players.length}/{SQUAD_LIMIT}</span></span>
              </div>
            </div>
            
            {(() => {
              const isLeading = myTeam.id === leadingTeamId;
              const isSquadFull = myTeam.players.length >= SQUAD_LIMIT;
              const remainingSlots = SQUAD_LIMIT - (myTeam.players.length + 1);
              const reserveRequired = Math.max(0, remainingSlots) * MIN_BID_RESERVE;
              
              const nextPossibleBid = !leadingTeamId
                ? activePlayer.basePrice
                : currentBid + (smartIncrements[0]?.value ?? 1000000);
              
              const isPurseShort = myTeam.purseRemaining < nextPossibleBid;
              const isReserveViolated = myTeam.purseRemaining - nextPossibleBid < reserveRequired;
              const isDisabled = isSquadFull || isPurseShort || isReserveViolated || isLeading;

              let btnText = "PLACE BID NOW";
              if (isLeading) btnText = `HOLDING LEAD (${formatINR(currentBid)})`;
              else if (isSquadFull) btnText = 'SQUAD FULL (6/6)';
              else if (isPurseShort) btnText = 'INSUFFICIENT PURSE';
              else if (isReserveViolated) btnText = 'RESERVE BREACH';

              return (
                <button
                  onClick={() => handleTeamClick(myTeam.id, !leadingTeamId ? 0 : smartIncrements[0]?.value ?? 1000000)}
                  disabled={isDisabled}
                  className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider flex flex-col items-center justify-center transition-all shadow-xl ${
                    isLeading
                      ? 'bg-slate-900 border-2 border-emerald-500 text-emerald-400 cursor-default'
                      : isDisabled
                      ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/30 active:scale-95'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {!isDisabled && !isLeading && <Zap className="w-5 h-5 fill-current" />}
                    {btnText}
                  </span>
                  {!isDisabled && !isLeading && (
                    <span className="text-xs font-bold opacity-80 mt-1">
                      Raise to {formatINR(nextPossibleBid)}
                    </span>
                  )}
                </button>
              );
            })()}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Click Team to Raise Bid:
              </span>
              <span className="text-[11px] text-slate-400">
                Rule: Max 6 Squad • Purse: ₹60 Cr • Reserve ₹25L/slot
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {teams.map((team) => {
                const isLeading = team.id === leadingTeamId;
                const isSquadFull = team.players.length >= SQUAD_LIMIT;
                const remainingSlots = SQUAD_LIMIT - (team.players.length + 1);
                const reserveRequired = Math.max(0, remainingSlots) * MIN_BID_RESERVE;
                
                // Check if team has enough purse for the next bid
                const nextPossibleBid = !leadingTeamId
                  ? activePlayer.basePrice
                  : currentBid + (smartIncrements[0]?.value ?? 1000000);
                
                const isPurseShort = team.purseRemaining < nextPossibleBid;
                const isReserveViolated = team.purseRemaining - nextPossibleBid < reserveRequired;
                const isDisabled = isSquadFull || isPurseShort || isReserveViolated || isLeading;

                let disabledReason = '';
                if (isLeading) disabledReason = 'CURRENT LEADER';
                else if (isSquadFull) disabledReason = 'SQUAD FULL (6/6)';
                else if (isPurseShort) disabledReason = 'INSUFFICIENT PURSE';
                else if (isReserveViolated) disabledReason = 'RESERVE BREACH';

                return (
                  <button
                    key={team.id}
                    onClick={() => handleCustomBid(team.id)}
                    disabled={isDisabled}
                    className={`relative flex flex-col p-3 rounded-2xl border transition-all text-left group ${
                      isLeading
                        ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                        : isDisabled
                        ? 'border-slate-800 bg-slate-950/50 opacity-40 cursor-not-allowed'
                        : 'border-slate-800 bg-slate-900/90 hover:border-slate-600 hover:bg-slate-800/90 hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    {/* Team Top: Logo & Squad count */}
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-2xl">{team.logo}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                          isSquadFull
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {team.players.length}/{SQUAD_LIMIT}
                      </span>
                    </div>

                    {/* Team Name */}
                    <span className="font-bold text-xs text-white truncate w-full group-hover:text-amber-400 transition-colors">
                      {team.name}
                    </span>

                    {/* Remaining Purse */}
                    <div className="mt-1 flex items-baseline justify-between w-full">
                      <span className="text-[10px] text-slate-400">Purse:</span>
                      <span className="text-xs font-extrabold text-emerald-400">
                        {formatINR(team.purseRemaining)}
                      </span>
                    </div>

                    {/* Disabled Reason Badge or Bid Trigger */}
                    {isDisabled ? (
                      <span className="mt-2 text-[9px] font-bold text-center w-full py-0.5 rounded bg-slate-950 text-slate-400 truncate">
                        {disabledReason}
                      </span>
                    ) : (
                      <span className="mt-2 text-[10px] font-extrabold text-center w-full py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-all">
                        BID NOW
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
};
