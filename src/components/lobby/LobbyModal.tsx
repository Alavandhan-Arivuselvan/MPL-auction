import React, { useState } from 'react';
import { Users, PlusCircle, LogIn, Copy, Check, Play, ShieldAlert, Sparkles } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { SQUAD_LIMIT } from '../../data/defaultData';

export const LobbyModal: React.FC = () => {
  const {
    isConnected,
    roomId,
    isHost,
    myTeam,
    teams,
    roomStatus,
    createRoom,
    joinRoom,
    startAuction,
    leaveRoom,
  } = useSocket();

  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('🦁');
  const [teamColor, setTeamColor] = useState('#eab308');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emojiOptions = ['🦁', '⚡', '🔥', '🛡️', '⚔️', '🐉', '🐯', '🦅', '🦈', '🚀'];
  const colorOptions = ['#eab308', '#0284c7', '#dc2626', '#0d9488', '#7c3aed', '#ea580c', '#10b981', '#ec4899'];

  const handleCopyCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = async () => {
    if (!teamName.trim()) {
      return setErrorMessage('Please choose a Team Name for your franchise');
    }
    setIsLoading(true);
    setErrorMessage(null);
    const res = await createRoom(teamName.trim(), teamLogo, teamColor);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage('Failed to create room. Ensure the server is online.');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomCode.trim()) {
      return setErrorMessage('Please enter a valid Room Code');
    }
    if (!teamName.trim()) {
      return setErrorMessage('Please choose a Team Name for your franchise');
    }

    setIsLoading(true);
    setErrorMessage(null);
    const res = await joinRoom(inputRoomCode.trim(), teamName.trim(), teamLogo, teamColor);
    setIsLoading(false);
    if (!res.success && res.message) {
      setErrorMessage(res.message);
    }
  };

  // If already in a room and in LOBBY state: show Waiting Lobby screen
  if (roomId && roomStatus === 'LOBBY') {
    const isFull = teams.length === 6;

    return (
      <div className="max-w-2xl mx-auto p-6 rounded-3xl glass-card border border-slate-800 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
        
        {/* Room Header */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
            {isHost ? '👑 Host Control Lobby' : '🎮 Franchise Waiting Room'}
          </span>
          <h2 className="text-3xl font-black text-white font-display tracking-wide uppercase">
            MPL Auction Lobby
          </h2>
          <p className="text-xs text-slate-400">
            Share this Room Code with your 5 friends to join from their phone or PC!
          </p>
        </div>

        {/* Big Room Code Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border-2 border-amber-500/50 flex items-center justify-between max-w-sm mx-auto shadow-xl">
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Room Code</span>
            <div className="text-2xl font-black text-amber-400 font-mono tracking-widest">{roomId}</div>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Connected Teams Count (Out of 6) */}
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-slate-300">Connected Franchises:</span>
          </div>
          <span className={`font-extrabold ${isFull ? 'text-emerald-400' : 'text-amber-400'}`}>
            {teams.length} / 6 Teams
          </span>
        </div>

        {/* 6 Teams Waiting Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {Array.from({ length: 6 }).map((_, index) => {
            const team = teams[index];
            const isMe = myTeam && team && team.id === myTeam.id;

            return (
              <div
                key={index}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  team
                    ? isMe
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-400'
                      : 'bg-slate-900/80 border-slate-700/80'
                    : 'bg-slate-950/40 border-dashed border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-slate-950 border border-slate-800"
                    style={{ borderColor: team?.color }}
                  >
                    {team ? team.logo : '⏳'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {team ? team.name : `Slot ${index + 1}: Waiting...`}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {team
                        ? isMe
                          ? '⭐ (You) • ₹60 Cr Purse'
                          : 'Connected • ₹60 Cr Purse'
                        : 'Open Slot'}
                    </span>
                  </div>
                </div>

                {team && (
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Host Start Game Action */}
        {isHost ? (
          <div className="pt-2 space-y-2">
            <button
              onClick={startAuction}
              disabled={teams.length < 2}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
                teams.length >= 2
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black shadow-emerald-500/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              {teams.length === 6
                ? 'ALL 6 TEAMS READY — START AUCTION!'
                : teams.length >= 2
                ? `START AUCTION NOW (${teams.length}/6 Teams)`
                : 'WAITING FOR TEAMS TO JOIN (MIN 2)'}
            </button>
            <p className="text-[11px] text-slate-400">
              *Host can launch when at least 2 teams have entered, or wait for all 6!
            </p>
          </div>
        ) : (
          <div className="pt-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>Waiting for the Host to commence the auction... Stay on this screen!</span>
          </div>
        )}

        <button
          onClick={leaveRoom}
          className="text-xs text-slate-500 hover:text-slate-300 transition"
        >
          Exit Room
        </button>

      </div>
    );
  }

  // Initial Onboarding Screen (Create or Join Room)
  return (
    <div className="max-w-md mx-auto p-6 rounded-3xl glass-card border border-slate-800 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center mx-auto text-black font-extrabold shadow-lg shadow-amber-500/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-white font-display uppercase tracking-wide">
          MPL Online Multiplayer
        </h2>
        <p className="text-xs text-slate-400">
          Real-time bidding across 6 mobile phones & computers
        </p>
      </div>

      {/* Server Status Warning if offline */}
      {!isConnected && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>Connecting to WebSocket server... Please ensure server is running (`node server/index.js`).</span>
        </div>
      )}

      {/* Tab Switcher: Join Room vs Host Room */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
        <button
          onClick={() => setActiveTab('join')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'join'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          Join Room
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'create'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Host Room
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs">
          {errorMessage}
        </div>
      )}

      {/* TAB 1: JOIN AS PARTICIPANT */}
      {activeTab === 'join' && (
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Room Code
            </label>
            <input
              type="text"
              placeholder="e.g. MPL-X9Y2"
              value={inputRoomCode}
              onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold text-center tracking-widest text-lg focus:outline-none focus:border-amber-400 uppercase"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Your Custom Franchise Name
            </label>
            <input
              type="text"
              placeholder="e.g. Madurai Mavericks, Tanjore Tigers..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-400"
              maxLength={24}
              required
            />
          </div>

          {/* Logo / Emoji Picker */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Team Mascot
            </label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setTeamLogo(emoji)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition ${
                    teamLogo === emoji
                      ? 'bg-amber-500/20 border-amber-400 scale-110'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setTeamColor(color)}
                  className={`w-7 h-7 rounded-full border-2 transition ${
                    teamColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isConnected}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
          >
            {isLoading ? 'Joining Room...' : 'Enter Franchise Lobby'}
          </button>
        </form>
      )}

      {/* TAB 2: HOST A NEW ROOM */}
      {activeTab === 'create' && (
        <div className="space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2 text-left">
            <span className="font-bold text-white block">Host Capabilities:</span>
            <p>• Automatic 4-letter Room Code generation.</p>
            <p>• Preloaded with all 36 official players from CSV.</p>
            <p>• Controls Gavel (SOLD/UNSOLD) and Auctioneer Timer.</p>
            <p>• Supports up to 6 participant devices remotely.</p>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 text-left">
              Admin Franchise Name
            </label>
            <input
              type="text"
              placeholder="e.g. Admin All-Stars"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-400"
              maxLength={24}
              required
            />
          </div>

          {/* Logo / Emoji Picker */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 text-left">
              Admin Mascot
            </label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setTeamLogo(emoji)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition ${
                    teamLogo === emoji
                      ? 'bg-amber-500/20 border-amber-400 scale-110'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 text-left">
              Admin Theme Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setTeamColor(color)}
                  className={`w-7 h-7 rounded-full border-2 transition ${
                    teamColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={isLoading || !isConnected}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/30 active:scale-95 transition disabled:opacity-50"
          >
            {isLoading ? 'Creating Room...' : 'Create Room & Generate Code'}
          </button>
        </div>
      )}

    </div>
  );
};
