import { Team } from '../types/auction';

export const INITIAL_PURSE = 60000000; // 60 Cr = 60,00,00,000 (wait: 1 Cr = 1,00,00,000. 60 Cr = 60,00,00,000 = 600,000,000)
export const SQUAD_LIMIT = 6;
export const MIN_BID_RESERVE = 2500000; // 25 Lakhs reserve per remaining slot

export const DEFAULT_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    color: '#eab308', // Yellow
    gradient: 'from-amber-500 to-yellow-600',
    logo: '🦁',
    purseRemaining: 600000000, // 60 Cr
    maxPurse: 600000000,
    players: [],
  },
  {
    id: 'team-2',
    name: 'Mumbai Mavericks',
    shortName: 'MM',
    color: '#0284c7', // Blue
    gradient: 'from-blue-500 to-cyan-600',
    logo: '⚡',
    purseRemaining: 600000000,
    maxPurse: 600000000,
    players: [],
  },
  {
    id: 'team-3',
    name: 'Bangalore Blasters',
    shortName: 'BLR',
    color: '#dc2626', // Red
    gradient: 'from-red-500 to-rose-700',
    logo: '🔥',
    purseRemaining: 600000000,
    maxPurse: 600000000,
    players: [],
  },
  {
    id: 'team-4',
    name: 'Gujarat Gladiators',
    shortName: 'GG',
    color: '#0d9488', // Teal
    gradient: 'from-teal-500 to-emerald-700',
    logo: '🛡️',
    purseRemaining: 600000000,
    maxPurse: 600000000,
    players: [],
  },
  {
    id: 'team-5',
    name: 'Kolkata Knights',
    shortName: 'KK',
    color: '#7c3aed', // Purple
    gradient: 'from-purple-600 to-violet-800',
    logo: '⚔️',
    purseRemaining: 600000000,
    maxPurse: 600000000,
    players: [],
  },
  {
    id: 'team-6',
    name: 'Deccan Dragons',
    shortName: 'DD',
    color: '#ea580c', // Orange
    gradient: 'from-orange-500 to-amber-600',
    logo: '🐉',
    purseRemaining: 600000000,
    maxPurse: 600000000,
    players: [],
  },
];

export const RAW_DEFAULT_CSV = `Players ,Rating,Type ,Base Price
John Anish Collin,10,All Rounder,2cr
Mirun Kaushik,9.5,All Rounder,1.5cr
Lionel Shawn,8.9,All Rounder,1cr
Amith Richard,6.9,All Rounder,50L
Dilip Antony,9.4,All Rounder,1.5cr
Deva,8.6,All Rounder,1cr
Mohamed Farhan Hussain,6.3,All Rounder,25L
Sebastian,8.5,All Rounder,1cr
Ashwin,8.7,All Rounder,1cr
Sri Priyan,9.1,All Rounder,1.5cr
Sujith,9,All Rounder,1.5cr
Samuel,8.4,All Rounder,1cr
,,,
,,,
Mohamed Russell,9.1,Batsman,1.5cr
Srinivas,8.5,Batsman,1cr
Alavandhan,9,Batsman,1.5cr
Nakul,8.8,Batsman,1cr
Ajay Kumar,7.2,Batsman,75L
Mohamed Salih,7.4,Batsman,75L
Mohamed Rifayz,8.9,Batsman,1cr
Mohamed Noufal,7.9,Batsman,75L
Mohamed Shapan,7.9,Batsman,75L
Daniel,8.3,Batsman,1cr
Barani,8,Batsman,1cr
Thangavel,9.2,Batsman,1.5cr
Bhoopesh,8.1,Batsman,1cr
Vimal,8,Batsman,1cr
,,,
Chitappa,8.6,Bowler,1cr
Singam,8,Bowler,1cr
Kathiresan,7.5,Bowler,75L
Jayanth Shanmuganathan,9.4,Bowler,1.5cr
Elancheral,7.4,Bowler,75L
Deepakram,8.1,Bowler,1cr
Dinesh Kumar,7.7,Bowler,75L
Mohamed Hafeez,8.6,Bowler,1cr
Kesavan,7.5,Bowler,75L
Akash,8.2,Bowler,1cr`;
