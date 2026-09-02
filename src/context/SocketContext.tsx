import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Team, Player, BidRecord } from '../types/auction';
import { soundEffects } from '../lib/soundEffects';

export interface SoldAnnouncement {
  playerName: string;
  teamName: string;
  teamLogo: string;
  teamColor: string;
  soldPrice: number;
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  roomId: string | null;
  isHost: boolean;
  isSpectator: boolean;
  myTeam: Team | null;
  teams: Team[];
  roomStatus: 'IDLE' | 'LOBBY' | 'LIVE' | 'COMPLETED';
  serverCurrentPlayer: Player | null;
  serverCurrentIndex: number;
  serverTotalPlayers: number;
  serverCurrentBid: number;
  serverLeadingTeamId: string | null;
  serverLeadingTeamName: string | null;
  serverLeadingTeamColor: string | null;
  serverTimerSeconds: number;
  bidHistory: BidRecord[];
  isSubmittingBid: boolean;
  lastBidError: string | null;
  soldAnnouncement: SoldAnnouncement | null;
  createRoom: (teamName: string, logo: string, color: string) => Promise<{ success: boolean; roomId?: string }>;
  joinRoom: (roomId: string, teamName: string, logo: string, color: string) => Promise<{ success: boolean; message?: string }>;
  joinAsSpectator: (roomId: string) => Promise<{ success: boolean; message?: string }>;
  startAuction: () => void;
  placeBid: (amount?: number) => Promise<{ success: boolean; reason?: string }>;
  markSold: () => void;
  markUnsold: () => void;
  recirculateUnsold: () => void;
  endAuction: () => void;
  leaveRoom: () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

// Determine socket server URL: default to current host:3001 or env variable VITE_SOCKET_URL
const getSocketServerUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${hostname}:3001`;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [roomStatus, setRoomStatus] = useState<'IDLE' | 'LOBBY' | 'LIVE' | 'COMPLETED'>('IDLE');

  const [serverCurrentPlayer, setServerCurrentPlayer] = useState<Player | null>(null);
  const [serverCurrentIndex, setServerCurrentIndex] = useState(0);
  const [serverTotalPlayers, setServerTotalPlayers] = useState(36);
  const [serverCurrentBid, setServerCurrentBid] = useState(0);
  const [serverLeadingTeamId, setServerLeadingTeamId] = useState<string | null>(null);
  const [serverLeadingTeamName, setServerLeadingTeamName] = useState<string | null>(null);
  const [serverLeadingTeamColor, setServerLeadingTeamColor] = useState<string | null>(null);
  const [serverTimerSeconds, setServerTimerSeconds] = useState(20);
  const [bidHistory, setBidHistory] = useState<BidRecord[]>([]);

  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [lastBidError, setLastBidError] = useState<string | null>(null);
  const [soldAnnouncement, setSoldAnnouncement] = useState<SoldAnnouncement | null>(null);
  const soldAnnouncementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const serverUrl = getSocketServerUrl();
    console.log(`[Socket] Connecting to server at: ${serverUrl}`);

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log(`[Socket Connected] Socket ID: ${newSocket.id}`);
      setIsConnected(true);
      
      const sessionStr = localStorage.getItem('mpl_session');
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          if (session.roomId && session.teamId) {
            console.log('Attempting auto-reconnect with session:', session);
            newSocket.emit('join_room', { 
              roomId: session.roomId, 
              existingTeamId: session.teamId 
            });
          }
        } catch (e) {
          console.error('Failed to parse mpl_session', e);
        }
      }
    });

    newSocket.on('disconnect', () => {
      console.log(`[Socket Disconnected]`);
      setIsConnected(false);
    });
    
    newSocket.on('joined_successfully', (res: any) => {
      if (res.success && res.roomId) {
        setRoomId(res.roomId);
        setIsHost(res.isHost || false);
        setIsSpectator(res.isSpectator || false);
        if (res.myTeam) setMyTeam(res.myTeam);
        if (res.teams) setTeams(res.teams);
        if (res.status) setRoomStatus(res.status);
        // Sync live state for spectators joining mid-auction
        if (res.isSpectator && res.status === 'LIVE') {
          if (res.currentPlayer) setServerCurrentPlayer(res.currentPlayer);
          if (res.currentIndex !== undefined) setServerCurrentIndex(res.currentIndex);
          if (res.totalPlayers !== undefined) setServerTotalPlayers(res.totalPlayers);
          if (res.currentBid !== undefined) setServerCurrentBid(res.currentBid);
          if (res.leadingTeamId !== undefined) setServerLeadingTeamId(res.leadingTeamId);
          if (res.timerSeconds !== undefined) setServerTimerSeconds(res.timerSeconds);
        }
      }
    });

    // 1. Lobby updates
    newSocket.on('lobby_update', (data: { teams: Team[]; status: string }) => {
      setTeams(data.teams);
      if (data.status === 'LOBBY') setRoomStatus('LOBBY');
    });

    // 2. Auction Started
    newSocket.on('auction_started', (data: {
      status: 'LIVE';
      currentPlayer: Player;
      currentIndex: number;
      totalPlayers: number;
      currentBid: number;
      leadingTeamId: string | null;
      teams: Team[];
      timerSeconds: number;
    }) => {
      setRoomStatus('LIVE');
      setServerCurrentPlayer(data.currentPlayer);
      setServerCurrentIndex(data.currentIndex);
      setServerTotalPlayers(data.totalPlayers);
      setServerCurrentBid(data.currentBid);
      setServerLeadingTeamId(data.leadingTeamId);
      setTeams(data.teams);
      setServerTimerSeconds(data.timerSeconds);
      setBidHistory([]);
    });

    // 3. Bid Update (Accepted)
    newSocket.on('bid_update', (data: {
      currentBid: number;
      leadingTeamId: string;
      leadingTeamName: string;
      leadingTeamColor: string;
      bidRecord: BidRecord;
      timerSeconds: number;
    }) => {
      setServerCurrentBid(data.currentBid);
      setServerLeadingTeamId(data.leadingTeamId);
      setServerLeadingTeamName(data.leadingTeamName);
      setServerLeadingTeamColor(data.leadingTeamColor);
      setServerTimerSeconds(data.timerSeconds);
      setBidHistory((prev) => [data.bidRecord, ...prev]);
      setIsSubmittingBid(false);
      setLastBidError(null);
      soundEffects.playBidSound();
    });

    // 4. Timer Tick
    newSocket.on('timer_tick', (data: { timerSeconds: number }) => {
      setServerTimerSeconds(data.timerSeconds);
      soundEffects.playTickSound(data.timerSeconds <= 5);
    });

    // 5. Player Sold
    newSocket.on('player_sold', (data: {
      soldPlayer: Player;
      winningTeam: Team;
      soldPrice: number;
      teams: Team[];
      nextPlayer: Player | null;
      nextIndex: number;
      timerSeconds: number;
    }) => {
      soundEffects.playGavelSound();
      setTeams(data.teams);

      // Show sold announcement overlay
      setSoldAnnouncement({
        playerName: data.soldPlayer.name,
        teamName: data.winningTeam.name,
        teamLogo: data.winningTeam.logo,
        teamColor: data.winningTeam.color,
        soldPrice: data.soldPrice,
      });

      // Clear any previous timer
      if (soldAnnouncementTimerRef.current) {
        clearTimeout(soldAnnouncementTimerRef.current);
      }

      // Auto-clear announcement after 4 seconds and transition to next player
      soldAnnouncementTimerRef.current = setTimeout(() => {
        setSoldAnnouncement(null);
        if (data.nextPlayer) {
          setServerCurrentPlayer(data.nextPlayer);
          setServerCurrentIndex(data.nextIndex);
          setServerCurrentBid(data.nextPlayer.basePrice);
          setServerLeadingTeamId(null);
          setServerLeadingTeamName(null);
          setServerLeadingTeamColor(null);
          setServerTimerSeconds(data.timerSeconds);
          setBidHistory([]);
        }
      }, 4000);

      // Update my team purse if I won
      setMyTeam((prev) => (prev && prev.id === data.winningTeam.id ? data.winningTeam : prev));
    });

    // 6. Player Unsold
    newSocket.on('player_unsold', (data: {
      unsoldPlayer: Player;
      nextPlayer: Player;
      nextIndex: number;
      timerSeconds: number;
    }) => {
      soundEffects.playUnsoldSound();
      setServerCurrentPlayer(data.nextPlayer);
      setServerCurrentIndex(data.nextIndex);
      setServerCurrentBid(data.nextPlayer.basePrice);
      setServerLeadingTeamId(null);
      setServerLeadingTeamName(null);
      setServerLeadingTeamColor(null);
      setServerTimerSeconds(data.timerSeconds);
      setBidHistory([]);
    });

    // 7. Auction Completed
    newSocket.on('auction_completed', (data: { teams: Team[]; players: Player[] }) => {
      soundEffects.playVictoryFanfare();
      setRoomStatus('COMPLETED');
      setTeams(data.teams);
    });

    // 8. Recirculate Started (Round 2)
    newSocket.on('recirculate_started', (data: {
      status: 'LIVE';
      currentPlayer: Player;
      currentIndex: number;
      totalPlayers: number;
      currentBid: number;
      leadingTeamId: string | null;
      teams: Team[];
      timerSeconds: number;
    }) => {
      setRoomStatus('LIVE');
      setServerCurrentPlayer(data.currentPlayer);
      setServerCurrentIndex(data.currentIndex);
      setServerTotalPlayers(data.totalPlayers);
      setServerCurrentBid(data.currentBid);
      setServerLeadingTeamId(data.leadingTeamId);
      setTeams(data.teams);
      setServerTimerSeconds(data.timerSeconds);
      setBidHistory([]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Actions
  const createRoom = (teamName: string, logo: string, color: string) => {
    return new Promise<{ success: boolean; roomId?: string }>((resolve) => {
      if (!socket) return resolve({ success: false });
      socket.emit('create_room', { teamName, logo, color }, (res: { success: boolean; roomId?: string; myTeam?: Team; teams?: Team[] }) => {
        if (res.success && res.roomId && res.myTeam) {
          localStorage.setItem('mpl_session', JSON.stringify({ roomId: res.roomId, teamId: res.myTeam.id, isHost: true }));
          setRoomId(res.roomId);
          setIsHost(true);
          setMyTeam(res.myTeam);
          if (res.teams) setTeams(res.teams);
          setRoomStatus('LOBBY');
          resolve({ success: true, roomId: res.roomId });
        } else {
          resolve({ success: false });
        }
      });
    });
  };

  const joinRoom = (code: string, teamName: string, logo: string, color: string) => {
    return new Promise<{ success: boolean; message?: string }>((resolve) => {
      if (!socket) return resolve({ success: false, message: 'Not connected to server' });
      socket.emit('join_room', { roomId: code, teamName, logo, color }, (res: {
        success: boolean;
        message?: string;
        roomId?: string;
        myTeam?: Team;
        teams?: Team[];
      }) => {
        if (res.success && res.roomId && res.myTeam) {
          localStorage.setItem('mpl_session', JSON.stringify({ roomId: res.roomId, teamId: res.myTeam.id, isHost: false }));
          setRoomId(res.roomId);
          setIsHost(false);
          setIsSpectator(false);
          setMyTeam(res.myTeam);
          if (res.teams) setTeams(res.teams);
          setRoomStatus('LOBBY');
          resolve({ success: true });
        } else {
          resolve({ success: false, message: res.message || 'Failed to join room' });
        }
      });
    });
  };

  const joinAsSpectator = (code: string) => {
    return new Promise<{ success: boolean; message?: string }>((resolve) => {
      if (!socket) return resolve({ success: false, message: 'Not connected to server' });
      socket.emit('join_room', { roomId: code, teamName: '__SPECTATOR__' }, (res: {
        success: boolean;
        message?: string;
        roomId?: string;
        isSpectator?: boolean;
        teams?: Team[];
        status?: string;
      }) => {
        if (res.success && res.roomId) {
          setRoomId(res.roomId);
          setIsHost(false);
          setIsSpectator(true);
          setMyTeam(null);
          if (res.teams) setTeams(res.teams);
          if (res.status) setRoomStatus(res.status as any);
          resolve({ success: true });
        } else {
          resolve({ success: false, message: res.message || 'Failed to join as spectator' });
        }
      });
    });
  };

  const startAuction = () => {
    if (!socket || !roomId || !isHost) return;
    socket.emit('start_auction', { roomId });
  };

  const placeBid = (amount?: number) => {
    return new Promise<{ success: boolean; reason?: string }>((resolve) => {
      if (!socket || !roomId || !myTeam) {
        return resolve({ success: false, reason: 'Not in an active room' });
      }

      setIsSubmittingBid(true);
      setLastBidError(null);

      socket.emit('place_bid', { roomId, teamId: myTeam.id, amount }, (res: { success: boolean; reason?: string }) => {
        setIsSubmittingBid(false);
        if (!res.success) {
          setLastBidError(res.reason || 'Bid rejected by server');
          resolve({ success: false, reason: res.reason });
        } else {
          resolve({ success: true });
        }
      });
    });
  };

  const markSold = () => {
    if (!socket || !roomId || !isHost) return;
    socket.emit('mark_sold', { roomId });
  };

  const markUnsold = () => {
    if (!socket || !roomId || !isHost) return;
    socket.emit('mark_unsold', { roomId });
  };

  const recirculateUnsold = () => {
    if (!socket || !roomId || !isHost) return;
    socket.emit('recirculate_unsold', { roomId });
  };

  const endAuction = () => {
    if (!socket || !roomId || !isHost) return;
    socket.emit('end_auction', { roomId });
  };

  const leaveRoom = () => {
    localStorage.removeItem('mpl_session');
    setRoomId(null);
    setIsHost(false);
    setIsSpectator(false);
    setMyTeam(null);
    setRoomStatus('IDLE');
    setBidHistory([]);
    setSoldAnnouncement(null);
  };

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      roomId,
      isHost,
      isSpectator,
      myTeam,
      teams,
      roomStatus,
      serverCurrentPlayer,
      serverCurrentIndex,
      serverTotalPlayers,
      serverCurrentBid,
      serverLeadingTeamId,
      serverLeadingTeamName,
      serverLeadingTeamColor,
      serverTimerSeconds,
      bidHistory,
      isSubmittingBid,
      lastBidError,
      soldAnnouncement,
      createRoom,
      joinRoom,
      joinAsSpectator,
      startAuction,
      placeBid,
      markSold,
      markUnsold,
      recirculateUnsold,
      endAuction,
      leaveRoom,
    }),
    [
      socket,
      isConnected,
      roomId,
      isHost,
      isSpectator,
      myTeam,
      teams,
      roomStatus,
      serverCurrentPlayer,
      serverCurrentIndex,
      serverTotalPlayers,
      serverCurrentBid,
      serverLeadingTeamId,
      serverLeadingTeamName,
      serverLeadingTeamColor,
      serverTimerSeconds,
      bidHistory,
      isSubmittingBid,
      lastBidError,
      soldAnnouncement,
    ]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
