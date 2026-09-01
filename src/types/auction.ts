export type Role = 'All Rounder' | 'Batsman' | 'Bowler' | 'Wicketkeeper';

export interface Player {
  id: string;
  name: string;
  rating: number; // 1.0 - 10.0
  role: Role;
  basePrice: number; // in numerical INR (e.g., 20000000 for 2 Cr)
  isSold: boolean;
  isUnsold: boolean;
  soldPrice: number | null;
  soldTo: string | null; // team id
  avatarUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string; // Hex color for broadcast themes
  gradient: string;
  logo: string;
  purseRemaining: number; // Initial 60,00,00,000 (₹60 Cr)
  maxPurse: number;
  players: Player[];
}

export interface BidRecord {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  amount: number;
  timestamp: number;
}

export type AuctionStatus = 'SETUP' | 'LIVE' | 'PAUSED' | 'COMPLETED';

export interface AuctionSummary {
  totalSpent: number;
  totalSold: number;
  totalUnsold: number;
  topBuy: { player: Player; team: Team; price: number } | null;
}
