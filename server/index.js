import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Default 36 official players
const DEFAULT_OFFICIAL_PLAYERS = [
  // All-Rounders (12)
  { id: 'p-1', name: 'John Anish Collin', rating: 10.0, role: 'All Rounder', basePrice: 20000000 },
  { id: 'p-2', name: 'Mirun Kaushik', rating: 9.5, role: 'All Rounder', basePrice: 15000000 },
  { id: 'p-3', name: 'Lionel Shawn', rating: 8.9, role: 'All Rounder', basePrice: 10000000 },
  { id: 'p-4', name: 'Amith Richard', rating: 6.9, role: 'All Rounder', basePrice: 5000000 },
  { id: 'p-5', name: 'Dilip Antony', rating: 9.4, role: 'All Rounder', basePrice: 15000000 },
  { id: 'p-6', name: 'Deva', rating: 8.6, role: 'All Rounder', basePrice: 10000000 },
  { id: 'p-7', name: 'Mohamed Farhan Hussain', rating: 6.3, role: 'All Rounder', basePrice: 2500000 },
  { id: 'p-8', name: 'Sebastian', rating: 8.5, role: 'All Rounder', basePrice: 10000000 },
  { id: 'p-9', name: 'Ashwin', rating: 8.7, role: 'All Rounder', basePrice: 10000000 },
  { id: 'p-10', name: 'Sri Priyan', rating: 9.1, role: 'All Rounder', basePrice: 15000000 },
  { id: 'p-11', name: 'Sujith', rating: 9.0, role: 'All Rounder', basePrice: 15000000 },
  { id: 'p-12', name: 'Samuel', rating: 8.4, role: 'All Rounder', basePrice: 10000000 },
  // Batsmen (14)
  { id: 'p-13', name: 'Mohamed Russell', rating: 9.1, role: 'Batsman', basePrice: 15000000 },
  { id: 'p-14', name: 'Srinivas', rating: 8.5, role: 'Batsman', basePrice: 10000000 },
  { id: 'p-15', name: 'Alavandhan', rating: 8.9, role: 'Batsman', basePrice: 15000000 },
  { id: 'p-16', name: 'Nakul', rating: 8.8, role: 'Batsman', basePrice: 10000000 },
  { id: 'p-17', name: 'Ajay Kumar', rating: 7.2, role: 'Batsman', basePrice: 7500000 },
  { id: 'p-18', name: 'Mohamed Salih', rating: 7.4, role: 'Batsman', basePrice: 7500000 },
  { id: 'p-19', name: 'Mohamed Rifayz', rating: 8.9, role: 'Batsman', basePrice: 10000000 },
  { id: 'p-20', name: 'Mohamed Noufal', rating: 7.9, role: 'Batsman', basePrice: 7500000 },
  { id: 'p-21', name: 'Mohamed Shapan', rating: 7.9, role: 'Batsman', basePrice: 7500000 },
  { id: 'p-22', name: 'Daniel', rating: 8.3, role: 'Batsman', basePrice: 10000000 },
  { id: 'p-23', name: 'Barani', rating: 8.0, role: 'Batsman', basePrice: 10000000 },
  { id: 'p-24', name: 'Thangavel', rating: 9.2, role: 'Batsman', basePrice: 15000000 },
  { id: 'p-25', name: 'Bhoopesh', rating: 8.1, role: 'Batsman', basePrice: 10000000 },
  { id: 'p-26', name: 'Vimal', rating: 8.0, role: 'Batsman', basePrice: 10000000 },
  // Bowlers (10)
  { id: 'p-27', name: 'Chitappa', rating: 8.6, role: 'Bowler', basePrice: 10000000 },
  { id: 'p-28', name: 'Singam', rating: 8.0, role: 'Bowler', basePrice: 10000000 },
  { id: 'p-29', name: 'Kathiresan', rating: 7.5, role: 'Bowler', basePrice: 7500000 },
  { id: 'p-30', name: 'Jayanth Shanmuganathan', rating: 9.4, role: 'Bowler', basePrice: 15000000 },
  { id: 'p-31', name: 'Elancheral', rating: 7.4, role: 'Bowler', basePrice: 7500000 },
  { id: 'p-32', name: 'Deepakram', rating: 8.1, role: 'Bowler', basePrice: 10000000 },
  { id: 'p-33', name: 'Dinesh Kumar', rating: 7.7, role: 'Bowler', basePrice: 7500000 },
  { id: 'p-34', name: 'Mohamed Hafeez', rating: 8.6, role: 'Bowler', basePrice: 10000000 },
  { id: 'p-35', name: 'Kesavan', rating: 7.5, role: 'Bowler', basePrice: 7500000 },
  { id: 'p-36', name: 'Akash', rating: 8.2, role: 'Bowler', basePrice: 10000000 },
];

const INITIAL_PURSE = 600000000; // ₹60 Cr
const SQUAD_LIMIT = 6;
const MIN_RESERVE_PER_SLOT = 2500000; // ₹25 Lakhs

// IPL-style auto-increment tiers
function getIPLIncrement(currentBid) {
  if (currentBid < 10000000) return 1000000;    // +10L up to 1 Cr
  if (currentBid < 20000000) return 2000000;     // +20L up to 2 Cr
  if (currentBid < 50000000) return 2500000;     // +25L up to 5 Cr
  return 5000000;                                // +50L above 5 Cr
}

// Rooms State Map
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MPL-${code}`;
}

function stopRoomTimer(room) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }
}

function startRoomTimer(room, seconds = 20) {
  stopRoomTimer(room);
  room.timerSeconds = seconds;

  room.timerInterval = setInterval(() => {
    if (room.status !== 'LIVE') return;

    if (room.timerSeconds > 0) {
      room.timerSeconds -= 1;
      io.to(room.roomId).emit('timer_tick', { timerSeconds: room.timerSeconds });
    } else {
      stopRoomTimer(room);
      if (room.leadingTeamId) {
        handleMarkSold(room.roomId);
      } else {
        handleMarkUnsold(room.roomId);
      }
    }
  }, 1000);
}

function handleMarkSold(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.leadingTeamId) return;

  const activePlayer = room.players[room.currentPlayerIndex];
  if (activePlayer.isSold || activePlayer.isUnsold) return; // Prevent double trigger race conditions

  stopRoomTimer(room);

  const winningTeam = room.teams.find((t) => t.id === room.leadingTeamId);

  activePlayer.isSold = true;
  activePlayer.soldPrice = room.currentBid;
  activePlayer.soldTo = winningTeam.id;

  winningTeam.purseRemaining -= room.currentBid;
  winningTeam.players.push({ ...activePlayer });

  // Next player calculation
  let nextIndex = room.currentPlayerIndex + 1;
  while (nextIndex < room.players.length && (room.players[nextIndex].isSold || room.players[nextIndex].isUnsold)) {
    nextIndex++;
  }

  const allTeamsFull = room.teams.every((t) => t.players.length >= SQUAD_LIMIT);
  const hasMore = nextIndex < room.players.length;

  if (!hasMore || allTeamsFull) {
    room.status = 'COMPLETED';
    io.to(roomId).emit('auction_completed', {
      teams: rankTeamsWithTieBreaker(room.teams),
      players: room.players,
    });
  } else {
    room.currentPlayerIndex = nextIndex;
    const nextPlayer = room.players[nextIndex];
    room.currentBid = nextPlayer.basePrice;
    room.leadingTeamId = null;
    room.bidHistory = [];

    startRoomTimer(room);

    io.to(roomId).emit('player_sold', {
      soldPlayer: activePlayer,
      winningTeam,
      soldPrice: activePlayer.soldPrice,
      teams: room.teams,
      nextPlayer,
      nextIndex,
      timerSeconds: 20,
    });
  }
}

function handleMarkUnsold(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const activePlayer = room.players[room.currentPlayerIndex];
  if (activePlayer.isSold || activePlayer.isUnsold) return; // Prevent double trigger race conditions

  stopRoomTimer(room);

  activePlayer.isUnsold = true;
  room.unsoldQueue.push({ ...activePlayer });

  let nextIndex = room.currentPlayerIndex + 1;
  while (nextIndex < room.players.length && (room.players[nextIndex].isSold || room.players[nextIndex].isUnsold)) {
    nextIndex++;
  }

  if (nextIndex >= room.players.length) {
    if (room.unsoldQueue.length > 0) {
      io.to(roomId).emit('round_ended_with_unsold', {
        unsoldQueue: room.unsoldQueue,
      });
    } else {
      room.status = 'COMPLETED';
      io.to(roomId).emit('auction_completed', {
        teams: rankTeamsWithTieBreaker(room.teams),
        players: room.players,
      });
    }
  } else {
    room.currentPlayerIndex = nextIndex;
    const nextPlayer = room.players[nextIndex];
    room.currentBid = nextPlayer.basePrice;
    room.leadingTeamId = null;
    room.bidHistory = [];

    startRoomTimer(room);

    io.to(roomId).emit('player_unsold', {
      unsoldPlayer: activePlayer,
      nextPlayer,
      nextIndex,
      unsoldQueueCount: room.unsoldQueue.length,
      timerSeconds: 20,
    });
  }
}

// Tie-breaker: If average rating is identical, team with higher remaining purse ranks higher
function rankTeamsWithTieBreaker(teams) {
  return [...teams].sort((a, b) => {
    const avgA = a.players.length > 0 ? a.players.reduce((sum, p) => sum + p.rating, 0) / a.players.length : 0;
    const avgB = b.players.length > 0 ? b.players.reduce((sum, p) => sum + p.rating, 0) / b.players.length : 0;
    const diff = avgB - avgA;
    if (Math.abs(diff) > 0.0001) return diff;
    // Tie-breaker: Highest remaining purse
    return b.purseRemaining - a.purseRemaining;
  });
}

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // 1. HOST CREATES ROOM
  socket.on('create_room', (data, callback) => {
    const roomId = generateRoomCode();
    const players = data?.players && data.players.length > 0
      ? data.players.map((p) => ({ ...p, isSold: false, isUnsold: false, soldPrice: null, soldTo: null }))
      : DEFAULT_OFFICIAL_PLAYERS.map((p) => ({ ...p, isSold: false, isUnsold: false, soldPrice: null, soldTo: null }));

    const teamId = `team-${socket.id.substring(0, 5)}`;
    const newTeam = {
      id: teamId,
      socketId: socket.id,
      name: data?.teamName || `Admin Franchise`,
      shortName: (data?.teamName || `ADM`).substring(0, 3).toUpperCase(),
      logo: data?.logo || '👑',
      color: data?.color || '#ffffff',
      purseRemaining: INITIAL_PURSE,
      maxPurse: INITIAL_PURSE,
      players: [],
    };

    const newRoom = {
      roomId,
      hostSocketId: socket.id,
      status: 'LOBBY',
      players,
      teams: [newTeam],
      currentPlayerIndex: 0,
      currentBid: players[0]?.basePrice || 10000000,
      leadingTeamId: null,
      bidHistory: [],
      unsoldQueue: [],
      timerSeconds: 20,
      timerInterval: null,
    };

    rooms.set(roomId, newRoom);
    socket.join(roomId);
    socket.data = { roomId, teamId, isHost: true };

    console.log(`[Room Created] Room: ${roomId} by Host: ${socket.id}`);

    if (typeof callback === 'function') {
      callback({ success: true, roomId, isHost: true, playerCount: players.length, myTeam: newTeam, teams: newRoom.teams });
    }

    socket.emit('room_created', {
      roomId,
      isHost: true,
      teams: newRoom.teams,
      playersCount: players.length,
    });
  });

  // 2. PARTICIPANT JOINS ROOM
  socket.on('join_room', ({ roomId, teamName, logo, color, existingTeamId }, callback) => {
    const cleanRoomId = (roomId || '').trim().toUpperCase();
    const room = rooms.get(cleanRoomId);

    if (!room) {
      const err = { success: false, message: 'Room code not found. Please check and try again.' };
      if (typeof callback === 'function') callback(err);
      return socket.emit('join_error', err);
    }

    // Handle Reconnection
    if (existingTeamId) {
      const existingTeam = room.teams.find(t => t.id === existingTeamId);
      if (existingTeam) {
        existingTeam.socketId = socket.id;
        socket.join(cleanRoomId);
        socket.data = { roomId: cleanRoomId, teamId: existingTeam.id, isHost: room.hostSocketId === socket.id };
        
        console.log(`[Team Reconnected] ${existingTeam.name} reconnected to ${cleanRoomId}`);
        
        const payload = {
          success: true,
          roomId: cleanRoomId,
          myTeam: existingTeam,
          teams: room.teams,
          status: room.status,
          isHost: room.hostSocketId === socket.id,
        };
        
        if (typeof callback === 'function') callback(payload);
        socket.emit('joined_successfully', payload);
        return; // Early return for reconnect
      }
    }

    // Handle Spectator join
    if (teamName === '__SPECTATOR__' || !teamName) {
      // If no teamName or explicitly spectator, join as read-only spectator
      if (teamName === '__SPECTATOR__') {
        socket.join(cleanRoomId);
        socket.data = { roomId: cleanRoomId, teamId: null, isHost: false, isSpectator: true };

        console.log(`[Spectator Joined] ${socket.id} spectating room ${cleanRoomId}`);

        const spectatorPayload = {
          success: true,
          roomId: cleanRoomId,
          myTeam: null,
          teams: room.teams,
          status: room.status,
          isHost: false,
          isSpectator: true,
          // If auction is live, send current state
          currentPlayer: room.status === 'LIVE' ? room.players[room.currentPlayerIndex] : null,
          currentIndex: room.currentPlayerIndex,
          totalPlayers: room.players.length,
          currentBid: room.currentBid,
          leadingTeamId: room.leadingTeamId,
          timerSeconds: room.timerSeconds,
        };

        if (typeof callback === 'function') callback(spectatorPayload);
        socket.emit('joined_successfully', spectatorPayload);
        return;
      }
    }

    if (room.teams.length >= 6) {
      const err = { success: false, message: 'Room is already full! Maximum 6 teams permitted.' };
      if (typeof callback === 'function') callback(err);
      return socket.emit('join_error', err);
    }

    if (room.teams.some(t => t.logo === logo)) {
      const err = { success: false, message: `Mascot ${logo} is already taken!` };
      if (typeof callback === 'function') callback(err);
      return socket.emit('join_error', err);
    }

    if (room.teams.some(t => t.color === color)) {
      const err = { success: false, message: `Color is already taken by another franchise!` };
      if (typeof callback === 'function') callback(err);
      return socket.emit('join_error', err);
    }

    const teamId = `team-${socket.id.substring(0, 5)}`;
    const newTeam = {
      id: teamId,
      socketId: socket.id,
      name: teamName || `Franchise ${room.teams.length + 1}`,
      shortName: (teamName || `F${room.teams.length + 1}`).substring(0, 3).toUpperCase(),
      logo: logo || '🏏',
      color: color || '#3b82f6',
      purseRemaining: INITIAL_PURSE,
      maxPurse: INITIAL_PURSE,
      players: [],
    };

    room.teams.push(newTeam);
    socket.join(cleanRoomId);
    socket.data = { roomId: cleanRoomId, teamId, isHost: false };

    console.log(`[Team Joined] ${newTeam.name} joined room ${cleanRoomId}`);

    const payload = {
      success: true,
      roomId: cleanRoomId,
      myTeam: newTeam,
      teams: room.teams,
      status: room.status,
      isHost: false,
    };

    if (typeof callback === 'function') callback(payload);
    socket.emit('joined_successfully', payload);

    // Broadcast lobby update to all clients in room
    io.to(cleanRoomId).emit('lobby_update', {
      teams: room.teams,
      status: room.status,
      teamsCount: room.teams.length,
    });
  });

  // 3. HOST STARTS AUCTION
  socket.on('start_auction', ({ roomId }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.status = 'LIVE';
    room.currentPlayerIndex = 0;
    room.currentBid = room.players[0]?.basePrice || 10000000;
    room.leadingTeamId = null;
    room.bidHistory = [];

    startRoomTimer(room);

    console.log(`[Auction Started] Room ${roomId}`);

    const syncPayload = {
      status: 'LIVE',
      currentPlayer: room.players[0],
      currentIndex: 0,
      totalPlayers: room.players.length,
      currentBid: room.currentBid,
      leadingTeamId: null,
      teams: room.teams,
      bidHistory: [],
      timerSeconds: 20,
    };

    if (typeof callback === 'function') callback({ success: true });
    io.to(roomId).emit('auction_started', syncPayload);
  });

  // 4. REAL-TIME BID PLACEMENT WITH ROBUST VALIDATION
  socket.on('place_bid', ({ roomId, teamId, amount }, callback) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'LIVE') {
      const err = { success: false, reason: 'Auction is not actively live.' };
      if (typeof callback === 'function') callback(err);
      return;
    }

    const team = room.teams.find((t) => t.id === teamId);
    const activePlayer = room.players[room.currentPlayerIndex];

    if (!team || !activePlayer) {
      const err = { success: false, reason: 'Invalid team or active player.' };
      if (typeof callback === 'function') callback(err);
      return;
    }

    // Validation 1: Already leading
    if (room.leadingTeamId === team.id) {
      const err = { success: false, reason: 'Your team is already holding the highest bid!' };
      if (typeof callback === 'function') callback(err);
      return;
    }

    // Validation 2: Squad Limit (Max 6)
    if (team.players.length >= SQUAD_LIMIT) {
      const err = { success: false, reason: `Squad limit reached (${SQUAD_LIMIT}/${SQUAD_LIMIT} players)!` };
      if (typeof callback === 'function') callback(err);
      return;
    }

    // Determine target bid amount using IPL-style increments
    let targetAmount = amount;
    if (!targetAmount) {
      if (!room.leadingTeamId) {
        targetAmount = activePlayer.basePrice;
      } else {
        targetAmount = room.currentBid + getIPLIncrement(room.currentBid);
      }
    }

    // Validation 3: Higher than current
    if (room.leadingTeamId && targetAmount <= room.currentBid) {
      const err = { success: false, reason: `Bid must exceed current bid of ₹${room.currentBid / 10000000} Cr.` };
      if (typeof callback === 'function') callback(err);
      return;
    }

    // Validation 4: Purse availability
    if (targetAmount > team.purseRemaining) {
      const err = { success: false, reason: 'Insufficient purse balance!' };
      if (typeof callback === 'function') callback(err);
      return;
    }

    // Validation 5: Reserve check for remaining squad slots
    const vacantSlots = SQUAD_LIMIT - (team.players.length + 1);
    const requiredReserve = Math.max(0, vacantSlots) * MIN_RESERVE_PER_SLOT;
    if (team.purseRemaining - targetAmount < requiredReserve) {
      const err = {
        success: false,
        reason: `Reserve breach: Must reserve at least ₹${requiredReserve / 100000}L for remaining ${vacantSlots} slots.`,
      };
      if (typeof callback === 'function') callback(err);
      return;
    }

    // VALIDATION PASSED -> ACCEPT BID
    room.currentBid = targetAmount;
    room.leadingTeamId = team.id;

    const bidRecord = {
      id: `bid-${Date.now()}`,
      playerId: activePlayer.id,
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      amount: targetAmount,
      timestamp: Date.now(),
    };

    room.bidHistory.unshift(bidRecord);

    // Reset clock on bid to 15 seconds
    startRoomTimer(room, 15);

    console.log(`[Bid Accepted] ${team.name} bid ${targetAmount} on ${activePlayer.name}`);

    if (typeof callback === 'function') {
      callback({ success: true, amount: targetAmount });
    }

    io.to(roomId).emit('bid_update', {
      currentBid: targetAmount,
      leadingTeamId: team.id,
      leadingTeamName: team.name,
      leadingTeamColor: team.color,
      bidRecord,
      timerSeconds: 15,
    });
  });

  // 5. HOST MARKS PLAYER AS SOLD
  socket.on('mark_sold', ({ roomId }, callback) => {
    handleMarkSold(roomId);
    if (typeof callback === 'function') callback({ success: true });
  });

  // 6. HOST MARKS PLAYER AS UNSOLD
  socket.on('mark_unsold', ({ roomId }, callback) => {
    handleMarkUnsold(roomId);
    if (typeof callback === 'function') callback({ success: true });
  });

  // 7. HOST RECIRCULATES UNSOLD PLAYERS (Round 2)
  socket.on('recirculate_unsold', ({ roomId }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.unsoldQueue.length === 0) {
      if (typeof callback === 'function') callback({ success: false, reason: 'No unsold players to recirculate.' });
      return;
    }

    console.log(`[Recirculate] Starting Round 2 with ${room.unsoldQueue.length} unsold players in room ${roomId}`);

    // Reset unsold players in the main roster with halved base prices
    const unsoldIds = new Set(room.unsoldQueue.map(p => p.id));
    room.players.forEach(p => {
      if (unsoldIds.has(p.id)) {
        p.isUnsold = false;
        p.basePrice = Math.max(2500000, Math.round(p.basePrice * 0.5)); // 50% discount, min 25L
      }
    });

    // Find first recirculated player
    const firstIdx = room.players.findIndex(p => unsoldIds.has(p.id));
    if (firstIdx === -1) {
      if (typeof callback === 'function') callback({ success: false, reason: 'Could not find unsold players.' });
      return;
    }

    room.unsoldQueue = [];
    room.currentPlayerIndex = firstIdx;
    room.currentBid = room.players[firstIdx].basePrice;
    room.leadingTeamId = null;
    room.bidHistory = [];
    room.status = 'LIVE';

    startRoomTimer(room);

    const syncPayload = {
      status: 'LIVE',
      currentPlayer: room.players[firstIdx],
      currentIndex: firstIdx,
      totalPlayers: room.players.length,
      currentBid: room.currentBid,
      leadingTeamId: null,
      teams: room.teams,
      timerSeconds: 20,
    };

    io.to(roomId).emit('recirculate_started', syncPayload);
    if (typeof callback === 'function') callback({ success: true });
  });

  // 8. DISCONNECT HANDLER
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ${socket.id}`);
    
    // Iterate through all rooms to find if this socket was a host or participant
    rooms.forEach((room, roomId) => {
      const team = room.teams.find(t => t.socketId === socket.id);
      if (team) {
        console.log(`[Team Disconnected] ${team.name} disconnected from ${roomId}`);
        // We do NOT remove the team from room.teams, so they can reconnect.
        io.to(roomId).emit('team_disconnected', { teamId: team.id });
      }
      
      // If host disconnected, we might want to pause or transfer host, but for now we'll just log.
      if (room.hostSocketId === socket.id) {
        console.log(`[Host Disconnected] Host left room ${roomId}`);
        io.to(roomId).emit('host_disconnected');
      }
    });
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> MPL WebSocket Server running on http://0.0.0.0:${PORT}`);
});
