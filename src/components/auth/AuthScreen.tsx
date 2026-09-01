import React, { useState } from 'react';
import { ShieldAlert, Users, PlusCircle, LogIn } from 'lucide-react';

interface AuthScreenProps {
  onJoinAsUser: (username: string, roomCode: string, logo: string, color: string) => void;
  onCreateAsAdmin: (password: string) => void;
}

export function AuthScreen({ onJoinAsUser, onCreateAsAdmin }: AuthScreenProps) {
  const [mode, setMode] = useState<'select' | 'user' | 'admin'>('select');
  
  // User state
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [teamLogo, setTeamLogo] = useState('🦁');
  const [teamColor, setTeamColor] = useState('#eab308');
  
  // Admin state
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const emojiOptions = ['🦁', '⚡', '🔥', '🛡️', '⚔️', '🐉', '🐯', '🦅', '🦈', '🚀'];
  const colorOptions = ['#eab308', '#0284c7', '#dc2626', '#0d9488', '#7c3aed', '#ea580c', '#10b981', '#ec4899'];

  const handleUserJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !roomCode.trim()) return;
    onJoinAsUser(username, roomCode, teamLogo, teamColor);
  };

  const handleAdminCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Hardcoded check
    if (password === 'mpladmin2026') {
      onCreateAsAdmin(password);
    } else {
      setError('Invalid admin password');
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel border border-amber-500/30 rounded-3xl p-8 space-y-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 uppercase tracking-widest font-display mb-2">
              MPL 2026
            </h1>
            <p className="text-slate-400 text-sm">Select your role to continue</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode('user')}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white group-hover:text-amber-400 transition-colors">Join Game</div>
                  <div className="text-xs text-slate-400">Join as a Franchise Owner</div>
                </div>
              </div>
              <LogIn className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              onClick={() => setMode('admin')}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white group-hover:text-amber-400 transition-colors">Create Game</div>
                  <div className="text-xs text-slate-400">Host as Admin (Requires Password)</div>
                </div>
              </div>
              <PlusCircle className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'user') {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel border border-amber-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Join Lobby</h2>
            <p className="text-slate-400 text-sm">Enter your details to connect</p>
          </div>

          <form onSubmit={handleUserJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username (Franchise Name)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Chennai Super Kings"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Room Code</label>
              <input
                type="text"
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="MPL-XXXX"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors font-mono uppercase"
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
            
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl bg-amber-500 text-black font-extrabold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
              >
                Connect to Room
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel border border-amber-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Admin Setup</h2>
          <p className="text-slate-400 text-sm">Enter admin password to create room</p>
        </div>

        <form onSubmit={handleAdminCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          
          {error && <div className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-2 rounded-lg">{error}</div>}
          
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setMode('select')}
              className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-amber-500 text-black font-extrabold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
