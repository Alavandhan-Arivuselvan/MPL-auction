import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import confetti from 'canvas-confetti';
import { Player, Team, BidRecord, AuctionStatus } from '../types/auction';
import { DEFAULT_TEAMS, RAW_DEFAULT_CSV, SQUAD_LIMIT, MIN_BID_RESERVE } from '../data/defaultData';
import { parsePlayerCSV } from '../lib/csvParser';
import { soundEffects } from '../lib/soundEffects';

interface AuctionStore {
  // State
  status: AuctionStatus;
  teams: Team[];
  players: Player[];
  currentPlayerIndex: number;
  currentBid: number;
  leadingTeamId: string | null;
  bidHistory: BidRecord[];
  allBidsLog: BidRecord[];
  unsoldPlayersQueue: Player[];
  timerSeconds: number;
  isTimerRunning: boolean;
  timerDuration: number;
  isMuted: boolean;
  autoNextOnSold: boolean;

  // Computed & Actions
  initDefaultData: () => void;
  loadCSV: (csvString: string) => { success: boolean; count: number; errors: string[] };
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  startAuction: () => void;
  pauseAuction: () => void;
  resumeAuction: () => void;
  resetAuction: () => void;

  // Bidding Actions
  placeBid: (teamId: string, customAmount?: number) => { success: boolean; message?: string };
  undoLastBid: () => void;
  markSold: () => void;
  markUnsold: () => void;
  skipToPlayer: (index: number) => void;
  recirculateUnsold: () => void;

  // Timer Controls
  tickTimer: () => void;
  resetTimer: () => void;
  setTimerDuration: (seconds: number) => void;
  toggleMute: () => void;
}

export const useAuctionStore = create<AuctionStore>()(
  persist(
    (set, get) => ({
      status: 'SETUP',
      teams: DEFAULT_TEAMS,
      players: parsePlayerCSV(RAW_DEFAULT_CSV).players,
      currentPlayerIndex: 0,
      currentBid: 0,
      leadingTeamId: null,
      bidHistory: [],
      allBidsLog: [],
      unsoldPlayersQueue: [],
      timerSeconds: 20,
      isTimerRunning: false,
      timerDuration: 20,
      isMuted: false,
      autoNextOnSold: false,

      initDefaultData: () => {
        const { players } = parsePlayerCSV(RAW_DEFAULT_CSV);
        set({
          players,
          teams: DEFAULT_TEAMS,
          status: 'SETUP',
          currentPlayerIndex: 0,
          currentBid: 0,
          leadingTeamId: null,
          bidHistory: [],
          allBidsLog: [],
          unsoldPlayersQueue: [],
        });
      },

      loadCSV: (csvString: string) => {
        const { players, errors } = parsePlayerCSV(csvString);
        if (errors.length > 0 && players.length === 0) {
          return { success: false, count: 0, errors };
        }
        set({
          players,
          currentPlayerIndex: 0,
          currentBid: 0,
          leadingTeamId: null,
          bidHistory: [],
          allBidsLog: [],
          unsoldPlayersQueue: [],
        });
        return { success: true, count: players.length, errors };
      },

      updateTeam: (teamId: string, updates: Partial<Team>) => {
        set((state) => ({
          teams: state.teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t)),
        }));
      },

      updatePlayer: (playerId: string, updates: Partial<Player>) => {
        set((state) => ({
          players: state.players.map((p) => (p.id === playerId ? { ...p, ...updates } : p)),
        }));
      },

      startAuction: () => {
        const state = get();
        const activePlayer = state.players[state.currentPlayerIndex];
        const startingBid = activePlayer ? activePlayer.basePrice : 10000000;

        set({
          status: 'LIVE',
          currentBid: startingBid,
          leadingTeamId: null,
          bidHistory: [],
          timerSeconds: state.timerDuration,
          isTimerRunning: true,
        });
      },

      pauseAuction: () => {
        set({ isTimerRunning: false, status: 'PAUSED' });
      },

      resumeAuction: () => {
        set({ isTimerRunning: true, status: 'LIVE' });
      },

      resetAuction: () => {
        const resetTeams = get().teams.map((team) => ({
          ...team,
          purseRemaining: team.maxPurse,
          players: [],
        }));

        const resetPlayers = get().players.map((player) => ({
          ...player,
          isSold: false,
          isUnsold: false,
          soldPrice: null,
          soldTo: null,
        }));

        set({
          status: 'SETUP',
          teams: resetTeams,
          players: resetPlayers,
          currentPlayerIndex: 0,
          currentBid: 0,
          leadingTeamId: null,
          bidHistory: [],
          allBidsLog: [],
          unsoldPlayersQueue: [],
          isTimerRunning: false,
        });
      },

      placeBid: (teamId: string, customAmount?: number) => {
        const state = get();
        const team = state.teams.find((t) => t.id === teamId);
        const player = state.players[state.currentPlayerIndex];

        if (!team || !player) {
          return { success: false, message: 'Invalid team or player' };
        }

        // Squad limit check
        if (team.players.length >= SQUAD_LIMIT) {
          return { success: false, message: `${team.name} already has maximum ${SQUAD_LIMIT} players!` };
        }

        // Determine bid amount
        let bidAmount = customAmount;
        if (!bidAmount) {
          if (!state.leadingTeamId) {
            // First bid starts at base price
            bidAmount = player.basePrice;
          } else {
            // Smart increment logic
            const current = state.currentBid;
            let increment = 1000000; // 10 Lakhs default
            if (current < 10000000) {
              increment = 1000000; // +10L
            } else if (current < 50000000) {
              increment = 2500000; // +25L
            } else {
              increment = 5000000; // +50L
            }
            bidAmount = current + increment;
          }
        }

        // Validate bid amount exceeds current
        if (state.leadingTeamId && bidAmount <= state.currentBid) {
          return { success: false, message: `Bid must be higher than ${state.currentBid}` };
        }

        // Validate purse capacity
        if (bidAmount > team.purseRemaining) {
          return { success: false, message: `${team.name} does not have enough purse remaining!` };
        }

        // Validate remaining slots budget reserve
        const remainingSlotsAfterThis = SQUAD_LIMIT - (team.players.length + 1);
        const requiredReserve = remainingSlotsAfterThis * MIN_BID_RESERVE;
        if (team.purseRemaining - bidAmount < requiredReserve) {
          return {
            success: false,
            message: `${team.name} must reserve at least ₹${requiredReserve / 100000}L for remaining ${remainingSlotsAfterThis} slot(s)!`,
          };
        }

        const newRecord: BidRecord = {
          id: `bid-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          playerId: player.id,
          playerName: player.name,
          teamId: team.id,
          teamName: team.name,
          teamColor: team.color,
          amount: bidAmount,
          timestamp: Date.now(),
        };

        soundEffects.playBidSound();

        set({
          currentBid: bidAmount,
          leadingTeamId: team.id,
          bidHistory: [newRecord, ...state.bidHistory],
          allBidsLog: [newRecord, ...state.allBidsLog],
          timerSeconds: state.timerDuration, // Reset timer on each bid
          isTimerRunning: true,
        });

        return { success: true };
      },

      undoLastBid: () => {
        const state = get();
        if (state.bidHistory.length === 0) return;

        const updatedHistory = state.bidHistory.slice(1);
        if (updatedHistory.length === 0) {
          const activePlayer = state.players[state.currentPlayerIndex];
          set({
            bidHistory: [],
            leadingTeamId: null,
            currentBid: activePlayer ? activePlayer.basePrice : 10000000,
            timerSeconds: state.timerDuration,
          });
        } else {
          const previousBid = updatedHistory[0];
          set({
            bidHistory: updatedHistory,
            leadingTeamId: previousBid.teamId,
            currentBid: previousBid.amount,
            timerSeconds: state.timerDuration,
          });
        }
      },

      markSold: () => {
        const state = get();
        const player = state.players[state.currentPlayerIndex];
        const leadingTeam = state.teams.find((t) => t.id === state.leadingTeamId);

        if (!player || !leadingTeam) {
          return;
        }

        soundEffects.playGavelSound();

        // Confetti celebration
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#ffffff'],
          });
        } catch {
          // ignore if canvas not mounted
        }

        const winningBid = state.currentBid;

        // Update player
        const updatedPlayer: Player = {
          ...player,
          isSold: true,
          isUnsold: false,
          soldPrice: winningBid,
          soldTo: leadingTeam.id,
        };

        const updatedPlayers = state.players.map((p, idx) =>
          idx === state.currentPlayerIndex ? updatedPlayer : p
        );

        // Update winning team
        const updatedTeams = state.teams.map((team) => {
          if (team.id === leadingTeam.id) {
            return {
              ...team,
              purseRemaining: team.purseRemaining - winningBid,
              players: [...team.players, updatedPlayer],
            };
          }
          return team;
        });

        // Find next eligible player
        let nextIndex = state.currentPlayerIndex + 1;
        while (nextIndex < updatedPlayers.length && (updatedPlayers[nextIndex].isSold || updatedPlayers[nextIndex].isUnsold)) {
          nextIndex++;
        }

        // Check if all players completed or all teams full
        const allTeamsFull = updatedTeams.every((t) => t.players.length >= SQUAD_LIMIT);
        const hasMorePlayers = nextIndex < updatedPlayers.length;

        if (!hasMorePlayers || allTeamsFull) {
          soundEffects.playVictoryFanfare();
          set({
            players: updatedPlayers,
            teams: updatedTeams,
            status: 'COMPLETED',
            isTimerRunning: false,
          });
        } else {
          const nextPlayer = updatedPlayers[nextIndex];
          set({
            players: updatedPlayers,
            teams: updatedTeams,
            currentPlayerIndex: nextIndex,
            currentBid: nextPlayer.basePrice,
            leadingTeamId: null,
            bidHistory: [],
            timerSeconds: state.timerDuration,
            isTimerRunning: true,
          });
        }
      },

      markUnsold: () => {
        const state = get();
        const player = state.players[state.currentPlayerIndex];
        if (!player) return;

        soundEffects.playUnsoldSound();

        const updatedPlayer: Player = {
          ...player,
          isUnsold: true,
          isSold: false,
          soldPrice: null,
          soldTo: null,
        };

        const updatedPlayers = state.players.map((p, idx) =>
          idx === state.currentPlayerIndex ? updatedPlayer : p
        );

        const newUnsoldQueue = [...state.unsoldPlayersQueue, updatedPlayer];

        // Find next player
        let nextIndex = state.currentPlayerIndex + 1;
        while (nextIndex < updatedPlayers.length && (updatedPlayers[nextIndex].isSold || updatedPlayers[nextIndex].isUnsold)) {
          nextIndex++;
        }

        if (nextIndex >= updatedPlayers.length) {
          // If all active players finished, check if we have unsold players to recirculate
          if (newUnsoldQueue.length > 0) {
            set({
              players: updatedPlayers,
              unsoldPlayersQueue: newUnsoldQueue,
              isTimerRunning: false,
            });
          } else {
            set({
              players: updatedPlayers,
              unsoldPlayersQueue: [],
              status: 'COMPLETED',
              isTimerRunning: false,
            });
          }
        } else {
          const nextPlayer = updatedPlayers[nextIndex];
          set({
            players: updatedPlayers,
            unsoldPlayersQueue: newUnsoldQueue,
            currentPlayerIndex: nextIndex,
            currentBid: nextPlayer.basePrice,
            leadingTeamId: null,
            bidHistory: [],
            timerSeconds: state.timerDuration,
            isTimerRunning: true,
          });
        }
      },

      recirculateUnsold: () => {
        const state = get();
        if (state.unsoldPlayersQueue.length === 0) return;

        // Reset unsold players to available
        const unsoldIds = new Set(state.unsoldPlayersQueue.map((p) => p.id));
        const updatedPlayers = state.players.map((p) => {
          if (unsoldIds.has(p.id)) {
            return { ...p, isUnsold: false };
          }
          return p;
        });

        // Find the first reset player
        const firstIndex = updatedPlayers.findIndex((p) => unsoldIds.has(p.id));
        if (firstIndex !== -1) {
          const nextPlayer = updatedPlayers[firstIndex];
          set({
            players: updatedPlayers,
            unsoldPlayersQueue: [],
            currentPlayerIndex: firstIndex,
            currentBid: nextPlayer.basePrice,
            leadingTeamId: null,
            bidHistory: [],
            status: 'LIVE',
            timerSeconds: state.timerDuration,
            isTimerRunning: true,
          });
        }
      },

      skipToPlayer: (index: number) => {
        const state = get();
        const player = state.players[index];
        if (!player) return;

        set({
          currentPlayerIndex: index,
          currentBid: player.basePrice,
          leadingTeamId: null,
          bidHistory: [],
          timerSeconds: state.timerDuration,
          isTimerRunning: true,
        });
      },

      tickTimer: () => {
        const state = get();
        if (!state.isTimerRunning || state.status !== 'LIVE') return;

        if (state.timerSeconds > 1) {
          const nextSec = state.timerSeconds - 1;
          soundEffects.playTickSound(nextSec <= 5);
          set({ timerSeconds: nextSec });
        } else {
          // Timer hit 0
          soundEffects.playTickSound(true);
          set({ timerSeconds: 0, isTimerRunning: false });
        }
      },

      resetTimer: () => {
        const state = get();
        set({ timerSeconds: state.timerDuration, isTimerRunning: true });
      },

      setTimerDuration: (seconds: number) => {
        set({ timerDuration: seconds, timerSeconds: seconds });
      },

      toggleMute: () => {
        const newMuted = !get().isMuted;
        soundEffects.isMuted = newMuted;
        set({ isMuted: newMuted });
      },
    }),
    {
      name: 'mpl-auction-state-v1',
      partialize: (state) => ({
        teams: state.teams,
        players: state.players,
        status: state.status,
        currentPlayerIndex: state.currentPlayerIndex,
        currentBid: state.currentBid,
        leadingTeamId: state.leadingTeamId,
        bidHistory: state.bidHistory,
        allBidsLog: state.allBidsLog,
        unsoldPlayersQueue: state.unsoldPlayersQueue,
        timerDuration: state.timerDuration,
        isMuted: state.isMuted,
      }),
    }
  )
);
