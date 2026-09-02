import React, { useState } from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import { useAuctionStore } from './store/useAuctionStore';
import { useAuctionTimer } from './hooks/useAuctionTimer';
import { Navbar } from './components/Navbar';
import { ActivePlayerCard } from './components/auction/ActivePlayerCard';
import { CountdownTimer } from './components/auction/CountdownTimer';
import { BidHistoryTicker } from './components/auction/BidHistoryTicker';
import { AuctioneerControls } from './components/auction/AuctioneerControls';
import { TeamsGrid } from './components/auction/TeamsGrid';
import { ChampionshipLeaderboard } from './components/dashboard/ChampionshipLeaderboard';
import { CSVUploader } from './components/setup/CSVUploader';
import { LobbyModal } from './components/lobby/LobbyModal';
import { MobileBidderUI } from './components/auction/MobileBidderUI';
import { AuthScreen } from './components/auth/AuthScreen';
import { Play, ChevronLeft, ChevronRight, Trophy, Sparkles, Wifi, Radio } from 'lucide-react';

function AuctionAppContent() {
  const [currentTab, setCurrentTab] = useState<'arena' | 'setup' | 'leaderboard' | 'multiplayer'>('arena');

  // Socket Context for real-time multiplayer
  const {
    roomId,
    isHost,
    myTeam,
    roomStatus,
    serverCurrentPlayer,
    serverCurrentIndex,
    serverTotalPlayers,
    serverCurrentBid,
    serverLeadingTeamId,
    serverTimerSeconds,
    teams: socketTeams,
    bidHistory: socketBidHistory,
    startAuction: socketStartAuction,
    placeBid: socketPlaceBid,
    markSold: socketMarkSold,
    markUnsold: socketMarkUnsold,
    createRoom,
    joinRoom,
  } = useSocket();

  // Local Auction Store selectors (for local offline mode)
  const localStatus = useAuctionStore((s) => s.status);
  const localPlayers = useAuctionStore((s) => s.players);
  const localTeams = useAuctionStore((s) => s.teams);
  const localCurrentPlayerIndex = useAuctionStore((s) => s.currentPlayerIndex);
  const localCurrentBid = useAuctionStore((s) => s.currentBid);
  const localLeadingTeamId = useAuctionStore((s) => s.leadingTeamId);
  const localBidHistory = useAuctionStore((s) => s.bidHistory);
  const unsoldPlayersQueue = useAuctionStore((s) => s.unsoldPlayersQueue);

  // Local Actions
  const localStartAuction = useAuctionStore((s) => s.startAuction);
  const localPlaceBid = useAuctionStore((s) => s.placeBid);
  const localUndoLastBid = useAuctionStore((s) => s.undoLastBid);
  const localMarkSold = useAuctionStore((s) => s.markSold);
  const localMarkUnsold = useAuctionStore((s) => s.markUnsold);
  const localRecirculateUnsold = useAuctionStore((s) => s.recirculateUnsold);
  const localSkipToPlayer = useAuctionStore((s) => s.skipToPlayer);

  // Determine if in online multiplayer room
  const isOnlineMode = !!roomId;

  const [authRole, setAuthRole] = useState<'admin' | 'user' | 'host' | null>(null);

  // Sync authRole if auto-reconnected via socket
  React.useEffect(() => {
    if (isOnlineMode && !authRole) {
      setAuthRole(isHost ? 'host' : 'user');
      setCurrentTab(roomStatus === 'LIVE' ? 'arena' : 'multiplayer');
    }
  }, [isOnlineMode, isHost, authRole, roomStatus]);

  const handleUserJoin = async (username: string, roomCode: string, logo: string, color: string) => {
    const res = await joinRoom(roomCode, username, logo, color);
    if (res.success) {
      setAuthRole('user');
      setCurrentTab('multiplayer');
    } else {
      alert(res.message || 'Failed to join');
    }
  };

  const handleHostCreate = async (teamName: string, logo: string, color: string) => {
    const res = await createRoom(teamName, logo, color);
    if (res.success) {
      setAuthRole('host');
      setCurrentTab('multiplayer');
    } else {
      alert('Failed to create room');
    }
  };

  const handleAdminCreate = async (password: string) => {
    // Since admin provides password, we let them pass to setup
    setAuthRole('admin');
    setCurrentTab('setup');
  };

  if (!authRole && !isOnlineMode) {
    return <AuthScreen onJoinAsUser={handleUserJoin} onHostAsHost={handleHostCreate} onCreateAsAdmin={handleAdminCreate} />;
  }

  // Admin Dashboard Isolation
  if (authRole === 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-amber-500 selection:text-black">
        <div className="bg-gradient-to-r from-amber-500/20 via-blue-500/20 to-purple-500/20 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between">
          <div className="font-black text-amber-400 font-display">MPL ADMIN DASHBOARD</div>
          <button 
            onClick={() => setAuthRole(null)}
            className="px-3 py-1 bg-slate-800 text-xs font-bold rounded text-slate-300 hover:text-white hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <CSVUploader />
        </main>
      </div>
    );
  }

  // If in online room as a BIDDER (participant), display the Mobile-First Bidding UI!
  if (isOnlineMode && !isHost && roomStatus === 'LIVE') {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-amber-500 selection:text-black">
        <MobileBidderUI />
      </div>
    );
  }

  // Active data source (online vs local)
  const activeStatus = isOnlineMode ? roomStatus : localStatus;
  const activeTeams = isOnlineMode ? socketTeams : localTeams;
  const activePlayer = isOnlineMode ? serverCurrentPlayer || localPlayers[0] : localPlayers[localCurrentPlayerIndex];
  const activeIndex = isOnlineMode ? serverCurrentIndex : localCurrentPlayerIndex;
  const activeTotalPlayers = isOnlineMode ? serverTotalPlayers : localPlayers.length;
  const activeCurrentBid = isOnlineMode ? serverCurrentBid : localCurrentBid;
  const activeLeadingTeamId = isOnlineMode ? serverLeadingTeamId : localLeadingTeamId;
  const activeBidHistory = isOnlineMode ? socketBidHistory : localBidHistory;
  const activeLeadingTeam = activeTeams.find((t) => t.id === activeLeadingTeamId);

  const totalSold = localPlayers.filter((p) => p.isSold).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab as 'arena' | 'leaderboard'}
        setCurrentTab={(tab) => setCurrentTab(tab as 'arena' | 'leaderboard' | 'multiplayer')}
      />

      {/* Online Room Banner if active */}
      {isOnlineMode && (
        <div className="bg-gradient-to-r from-amber-500/20 via-blue-500/20 to-purple-500/20 border-b border-amber-500/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-bold text-white">ONLINE MULTIPLAYER ROOM:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-extrabold">
                {roomId}
              </span>
              <span className="text-slate-400">({activeTeams.length}/6 Franchises connected)</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                {isHost ? '👑 HOST CONSOLE' : `🎮 ${myTeam?.name || 'PARTICIPANT'}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TAB 1: AUCTION ARENA */}
        {currentTab === 'arena' && (
          <div className="space-y-6">
            
            {/* If in Lobby state, render Waiting Room Modal */}
            {isOnlineMode && roomStatus === 'LOBBY' ? (
              <LobbyModal />
            ) : (
              <>
                {/* Start Auction Banner if in SETUP state */}
                {activeStatus === 'SETUP' && (
                  <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500/20 via-slate-900 to-blue-500/20 border-2 border-amber-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 glow-gold">
                    <div>
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                        <Sparkles className="w-4 h-4" />
                        Manarpuram Premier League 2026 Ready
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide">
                        Commence Auction (Local or Multiplayer)?
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                        Play locally on one screen or launch a 6-player online room where friends bid directly from their phones!
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={localStartAuction}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-lg transition active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Play Local / Offline
                      </button>

                      <button
                        onClick={() => setCurrentTab('multiplayer')}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Wifi className="w-4 h-4" />
                        Host Online Room (Mobile)
                      </button>
                    </div>
                  </div>
                )}

                {/* Auction Completed Announcement Banner */}
                {activeStatus === 'COMPLETED' && (
                  <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-500/20 via-slate-900 to-amber-500/20 border-2 border-emerald-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-bold">
                        <Trophy className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Auction Has Concluded!</h3>
                        <p className="text-xs text-slate-300">
                          All squad slots have been filled. View the final standings and crowned champions now.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentTab('leaderboard')}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider uppercase transition shadow-lg shadow-emerald-500/30"
                    >
                      View Final Standings
                    </button>
                  </div>
                )}

                {/* Broadcast Layout: 12-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left & Center Main Stage (8 columns) */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Lot Navigation Strip */}
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl glass-panel border border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400">Auction Progress:</span>
                        <span className="font-extrabold text-amber-400 font-display text-sm">
                          {totalSold} / {activeTotalPlayers} Players Sold
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isOnlineMode && (
                          <>
                            <button
                              disabled={activeIndex === 0}
                              onClick={() => localSkipToPlayer(Math.max(0, activeIndex - 1))}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300"
                              title="Previous Lot"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-slate-400 text-[11px] font-semibold">
                              Lot {activeIndex + 1} / {activeTotalPlayers}
                            </span>
                            <button
                              disabled={activeIndex >= activeTotalPlayers - 1}
                              onClick={() => localSkipToPlayer(Math.min(activeTotalPlayers - 1, activeIndex + 1))}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300"
                              title="Next Lot"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isOnlineMode && (
                          <span className="text-amber-400 text-[11px] font-bold">
                            Lot {activeIndex + 1} / {activeTotalPlayers} (Synced via WebSocket)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTIVE PLAYER CENTER STAGE */}
                    <ActivePlayerCard
                      player={activePlayer}
                      lotNumber={activeIndex + 1}
                      totalPlayers={activeTotalPlayers}
                      currentBid={activeCurrentBid}
                      leadingTeam={activeLeadingTeam}
                    />

                    {/* AUCTIONEER BIDDING CONSOLE */}
                    <AuctioneerControls
                      teams={activeTeams}
                      activePlayer={activePlayer}
                      currentBid={activeCurrentBid}
                      leadingTeamId={activeLeadingTeamId}
                      unsoldQueueCount={unsoldPlayersQueue.length}
                      onPlaceBid={(teamId, customAmt) => {
                        if (isOnlineMode) {
                          socketPlaceBid(customAmt);
                          return { success: true };
                        }
                        return localPlaceBid(teamId, customAmt);
                      }}
                      onMarkSold={isOnlineMode ? socketMarkSold : localMarkSold}
                      onMarkUnsold={isOnlineMode ? socketMarkUnsold : localMarkUnsold}
                      onRecirculateUnsold={localRecirculateUnsold}
                    />
                  </div>

                  {/* Right Stage: Clock, Live Bid Stream & Standings (4 columns) */}
                  <div className="lg:col-span-4 space-y-6 flex flex-col">
                    
                    {/* Countdown Timer */}
                    <CountdownTimer />

                    {/* Live Bid Stream Ticker */}
                    <BidHistoryTicker bids={activeBidHistory} onUndo={localUndoLastBid} />



                  </div>

                </div>
              </>
            )}

          </div>
        )}

        {/* TAB 2: MULTIPLAYER LOBBY */}
        {currentTab === 'multiplayer' && (
          <LobbyModal />
        )}

        {/* TAB 3: CHAMPIONSHIP LEADERBOARD */}
        {currentTab === 'leaderboard' && (
          <ChampionshipLeaderboard teams={activeTeams} players={localPlayers} />
        )}

      </main>

      {/* Broadcast Footer Strip */}
      <footer className="w-full border-t border-slate-800/80 bg-[#070b14]/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Manarpuram Premiere League (MPL) • Official Auction Console & Multiplayer Engine</span>
          <span>Rules: 6 Teams • 6 Squad Limit • ₹60 Cr Budget • Winner: Highest Squad Average Rating</span>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <SocketProvider>
      <AuctionAppContent />
    </SocketProvider>
  );
}

export default App;
