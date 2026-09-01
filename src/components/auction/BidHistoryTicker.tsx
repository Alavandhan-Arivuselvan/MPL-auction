import React from 'react';
import { History, Undo2, TrendingUp } from 'lucide-react';
import { BidRecord } from '../../types/auction';
import { formatINR } from '../../lib/formatters';

interface BidHistoryTickerProps {
  bids: BidRecord[];
  onUndo: () => void;
}

export const BidHistoryTicker: React.FC<BidHistoryTickerProps> = ({ bids, onUndo }) => {
  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Bid Stream
          </h3>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
            {bids.length}
          </span>
        </div>

        {bids.length > 0 && (
          <button
            onClick={onUndo}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-800/60"
            title="Undo the last bid in case of accidental click"
          >
            <Undo2 className="w-3 h-3" />
            <span>Undo Last Bid</span>
          </button>
        )}
      </div>

      {/* Bid List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[160px] md:max-h-[220px]">
        {bids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
            <TrendingUp className="w-6 h-6 mb-1 text-slate-600" />
            <p className="text-xs">No bids on this lot yet.</p>
          </div>
        ) : (
          bids.map((bid, index) => (
            <div
              key={bid.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                index === 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-white'
                  : 'bg-slate-900/60 border-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: bid.teamColor }}
                />
                <span className="text-xs font-bold">{bid.teamName}</span>
                {index === 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-amber-500 text-black">
                    LEAD
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold ${index === 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {formatINR(bid.amount)}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
