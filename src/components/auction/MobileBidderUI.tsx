import React, { useState } from 'react';
import { Award, Shield, User, DollarSign, Timer, Zap, AlertCircle, CheckCircle2, Loader2, Users } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { formatINR, formatRating, getRatingColor, getRoleBadge } from '../../lib/formatters';
import { SQUAD_LIMIT, MIN_BID_RESERVE } from '../../data/defaultData';


export const MobileBidderUI: React.FC = () => {
  const {
    myTeam,
    isSpectator,
    serverCurrentPlayer,
    serverCurrentIndex,
    serverTotalPlayers,
    serverCurrentBid,
    serverLeadingTeamId,
    serverLeadingTeamName,
    serverLeadingTeamColor,
    serverTimerSeconds,
    isSubmittingBid,
    lastBidError,
    placeBid,
    teams,
  } = useSocket();

  // No modal state

  if (!serverCurrentPlayer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center text-slate-400">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <h3 className="text-base font-bold text-white">Connecting to Auction Arena...</h3>
        <p className="text-xs text-slate-500 mt-1">Waiting for the server to sync active lot</p>
      </div>
    );
  }

  // Spectator mode: render read-only view
  if (isSpectator) {
    const roleInfo = getRoleBadge(serverCurrentPlayer.role);
    const isUrgent = serverTimerSeconds <= 5;
    const timerColor = isUrgent
      ? 'text-red-400 border-red-500 bg-red-500/10 animate-pulse'
      : serverTimerSeconds <= 10
      ? 'text-amber-400 border-amber-500 bg-amber-500/10'
      : 'text-emerald-400 border-emerald-500 bg-emerald-500/10';

    return (
      <div className="h-[100dvh] w-screen overflow-hidden flex flex-col justify-between pb-6 px-4 pt-2 select-none">
        {/* Spectator Top Bar */}
        <div className="sticky top-2 z-30 mb-3 rounded-2xl glass-card border border-purple-500/50 p-3 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-purple-950 border border-purple-500">
              👁️
            </div>
            <div>
              <h3 className="text-xs font-black text-purple-300">SPECTATOR MODE</h3>
              <span className="text-[10px] text-slate-400 font-medium">Read-Only View</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Teams</span>
              <span className="text-xs font-black text-amber-400">{teams.length}/6</span>
            </div>
          </div>
        </div>

        {/* Live Player Card */}
        <div className="flex-1 flex flex-col justify-center space-y-3 my-2">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <span className="text-slate-400 font-bold">
              LOT #{serverCurrentIndex + 1} OF {serverTotalPlayers}
            </span>
            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-extrabold ${timerColor}`}>
              <Timer className="w-3.5 h-3.5" />
              <span>{serverTimerSeconds}s</span>
            </div>
          </div>

          <div className="rounded-3xl glass-card border border-slate-800 p-5 shadow-2xl relative overflow-hidden text-center">
            <div className="flex justify-center mb-3">
              <span className={`px-3 py-0.5 rounded-full border text-[11px] font-bold tracking-wider uppercase ${roleInfo.bg} ${roleInfo.border} ${roleInfo.text}`}>
                {serverCurrentPlayer.role}
              </span>
            </div>
            <div className="relative w-24 h-24 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-slate-700 flex items-center justify-center text-3xl font-extrabold text-amber-400 font-display shadow-lg">
              {serverCurrentPlayer.name.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="text-2xl font-black text-white uppercase font-display tracking-wide mt-2">
              {serverCurrentPlayer.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1 text-xs text-slate-400">
              <span>Base: <strong className="text-slate-300">{formatINR(serverCurrentPlayer.basePrice)}</strong></span>
              <span>•</span>
              <span className="italic opacity-70">Rating Hidden</span>
            </div>
            <div className="mt-4 p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-inner">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">
                CURRENT HIGHEST BID
              </span>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 font-display">
                {formatINR(serverCurrentBid)}
              </div>
              {serverLeadingTeamId ? (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-700">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: serverLeadingTeamColor || '#f59e0b' }} />
                  <span className="text-slate-300">{serverLeadingTeamName || 'Leading Franchise'}</span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  No bids yet. Open at base price ({formatINR(serverCurrentPlayer.basePrice)}).
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Spectator Footer */}
        <div className="pt-2">
          <div className="w-full py-4 rounded-3xl bg-purple-500/10 border-2 border-purple-500/30 text-purple-300 text-center font-black text-lg uppercase tracking-wider">
            👁️ SPECTATING — READ ONLY
          </div>
        </div>
      </div>
    );
  }

  if (!myTeam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center text-slate-400">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <h3 className="text-base font-bold text-white">Connecting to Auction Arena...</h3>
        <p className="text-xs text-slate-500 mt-1">Waiting for the server to sync active lot</p>
      </div>
    );
  }

  const roleInfo = getRoleBadge(serverCurrentPlayer.role);
  const ratingColor = getRatingColor(serverCurrentPlayer.rating);

  // Compute next bid amount for this user
  const isOpeningBid = !serverLeadingTeamId;
  const isAlreadyLeading = serverLeadingTeamId === myTeam.id;
  const isSquadFull = myTeam.players.length >= SQUAD_LIMIT;

  let nextBidAmount = serverCurrentBid;
  if (!isOpeningBid) {
    const cur = serverCurrentBid;
    // IPL-style tiered increments
    let increment: number;
    if (cur < 10000000) {
      increment = 1000000;   // +10L up to 1 Cr
    } else if (cur < 20000000) {
      increment = 2000000;   // +20L up to 2 Cr
    } else if (cur < 50000000) {
      increment = 2500000;   // +25L up to 5 Cr
    } else {
      increment = 5000000;   // +50L above 5 Cr
    }
    nextBidAmount = cur + increment;
  }

  // Reserve check
  const vacantSlots = SQUAD_LIMIT - (myTeam.players.length + 1);
  const requiredReserve = Math.max(0, vacantSlots) * MIN_BID_RESERVE;
  const isPurseShort = myTeam.purseRemaining < nextBidAmount;
  const isReserveViolated = myTeam.purseRemaining - nextBidAmount < requiredReserve;

  const isBidDisabled = isAlreadyLeading || isSquadFull || isPurseShort || isReserveViolated || isSubmittingBid;

  const handleTapBid = async () => {
    if (isBidDisabled) return;
    await placeBid(nextBidAmount);
  };

  // Timer alert styling
  const isUrgent = serverTimerSeconds <= 5;
  const timerColor = isUrgent
    ? 'text-red-400 border-red-500 bg-red-500/10 animate-pulse'
    : serverTimerSeconds <= 10
    ? 'text-amber-400 border-amber-500 bg-amber-500/10'
    : 'text-emerald-400 border-emerald-500 bg-emerald-500/10';

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col justify-between pb-6 px-4 pt-2 select-none">
      
      {/* 1. STICKY LIVE HUD (Top Mobile Bar) */}
      <div className="sticky top-2 z-30 mb-3 rounded-2xl glass-card border border-slate-700/80 p-3 shadow-xl flex items-center justify-between">
        {/* Left: Team Info */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-slate-950 border"
            style={{ borderColor: myTeam.color }}
          >
            {myTeam.logo}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-white truncate max-w-[120px]">{myTeam.name}</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Your Franchise</span>
          </div>
        </div>

        {/* Right: Purse Balance & Squad Counter */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Purse Left</span>
            <span className="text-xs font-black text-emerald-400 font-display">
              {formatINR(myTeam.purseRemaining)}
            </span>
          </div>

          <div
            className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-center"
            title="Inspect your squad"
          >
            <span className="text-[9px] text-slate-400 block">Squad</span>
            <span className="text-xs font-extrabold text-amber-400">
              {myTeam.players.length}/{SQUAD_LIMIT}
            </span>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE LOT CENTER STAGE */}
      <div className="flex-1 flex flex-col justify-center space-y-3 my-2">
        
        {/* Lot Progress & Timer Strip */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <span className="text-slate-400 font-bold">
            LOT #{serverCurrentIndex + 1} OF {serverTotalPlayers}
          </span>

          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-extrabold ${timerColor}`}>
            <Timer className="w-3.5 h-3.5" />
            <span>{serverTimerSeconds}s</span>
          </div>
        </div>

        {/* Player Profile Card */}
        <div className="rounded-3xl glass-card border border-slate-800 p-5 shadow-2xl relative overflow-hidden text-center">
          
          {/* Role badge */}
          <div className="flex justify-center mb-3">
            <span className={`px-3 py-0.5 rounded-full border text-[11px] font-bold tracking-wider uppercase ${roleInfo.bg} ${roleInfo.border} ${roleInfo.text}`}>
              {serverCurrentPlayer.role}
            </span>
          </div>

          {/* Player Avatar */}
          <div className="relative w-24 h-24 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-slate-700 flex items-center justify-center text-3xl font-extrabold text-amber-400 font-display shadow-lg">
            {serverCurrentPlayer.name.slice(0, 2).toUpperCase()}
            
          </div>

          {/* Player Name */}
          <h2 className="text-2xl font-black text-white uppercase font-display tracking-wide mt-2">
            {serverCurrentPlayer.name}
          </h2>

          <div className="flex items-center justify-center gap-2 mt-1 text-xs text-slate-400">
            <span>Base: <strong className="text-slate-300">{formatINR(serverCurrentPlayer.basePrice)}</strong></span>
            <span>•</span>
            <span className="italic opacity-70">Rating Hidden</span>
          </div>

          {/* CURRENT LIVE BID BOX */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-inner">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">
              CURRENT HIGHEST BID
            </span>

            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 font-display">
              {formatINR(serverCurrentBid)}
            </div>

            {/* Leading Team Indicator */}
            {serverLeadingTeamId ? (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-700">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: serverLeadingTeamColor || '#f59e0b' }}
                />
                <span className="text-slate-300">{serverLeadingTeamName || 'Leading Franchise'}</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                No bids yet. Open at base price ({formatINR(serverCurrentPlayer.basePrice)}).
              </p>
            )}
          </div>

        </div>

      </div>

      {/* 3. MOBILE ACTION AREA (MASSIVE EASY-TO-TAP BID BUTTON) */}
      <div className="space-y-3 pt-2">
        
        {/* Error Alert Toast if any */}
        {lastBidError && (
          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{lastBidError}</span>
            </div>
          </div>
        )}

        {/* Lead Status Cue */}
        {isAlreadyLeading && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>YOU CURRENTLY HOLD THE HIGHEST BID!</span>
          </div>
        )}

        {/* MASSIVE PLACE BID BUTTON WITH LATENCY SPINNER */}
        <button
          onClick={handleTapBid}
          disabled={isBidDisabled}
          className={`w-full py-5 rounded-3xl font-black text-lg sm:text-xl uppercase tracking-wider flex flex-col items-center justify-center transition-all shadow-2xl ${
            isAlreadyLeading
              ? 'bg-slate-900 border-2 border-emerald-500 text-emerald-400 cursor-default opacity-80'
              : isBidDisabled
              ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/40 active:scale-95'
          }`}
        >
          {isSubmittingBid ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
              <span>CONFIRMING BID...</span>
            </div>
          ) : isAlreadyLeading ? (
            <span>HOLDING LEAD ({formatINR(serverCurrentBid)})</span>
          ) : isSquadFull ? (
            <span>SQUAD FULL (6/6)</span>
          ) : isPurseShort ? (
            <span>INSUFFICIENT PURSE</span>
          ) : isReserveViolated ? (
            <span>RESERVE BREACH</span>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <Zap className="w-5 h-5 fill-current" />
                PLACE BID NOW
              </span>
              <span className="text-xs font-bold opacity-80">
                Raise to {formatINR(nextBidAmount)}
              </span>
            </>
          )}
        </button>

      </div>



    </div>
  );
};
