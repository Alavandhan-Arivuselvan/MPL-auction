// Currency and number formatters for MPL Auction

export const formatINR = (amount: number): string => {
  if (isNaN(amount) || amount === 0) return '₹0';

  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }

  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2)} L`;
  }

  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const getRatingColor = (rating: number) => {
  if (rating >= 9.5) return 'text-amber-400 bg-amber-500/10 border-amber-500/40 shadow-amber-500/20';
  if (rating >= 9.0) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40 shadow-emerald-500/20';
  if (rating >= 8.0) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/40 shadow-cyan-500/20';
  if (rating >= 7.0) return 'text-blue-400 bg-blue-500/10 border-blue-500/40 shadow-blue-500/20';
  return 'text-purple-400 bg-purple-500/10 border-purple-500/40 shadow-purple-500/20';
};

export const getRoleBadge = (role: string) => {
  switch (role) {
    case 'All Rounder':
      return {
        label: 'ALL-ROUNDER',
        bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        dot: 'bg-amber-400'
      };
    case 'Batsman':
      return {
        label: 'BATSMAN',
        bg: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20',
        border: 'border-blue-500/40',
        text: 'text-blue-400',
        dot: 'bg-blue-400'
      };
    case 'Bowler':
      return {
        label: 'BOWLER',
        bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400'
      };
    case 'Wicketkeeper':
      return {
        label: 'WICKETKEEPER',
        bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20',
        border: 'border-rose-500/40',
        text: 'text-rose-400',
        dot: 'bg-rose-400'
      };
    default:
      return {
        label: role.toUpperCase(),
        bg: 'bg-slate-800',
        border: 'border-slate-700',
        text: 'text-slate-300',
        dot: 'bg-slate-400'
      };
  }
};
