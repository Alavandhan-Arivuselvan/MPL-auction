import Papa from 'papaparse';
import type { Player, Role } from '../types/auction';

export function parsePriceToNumber(rawPrice: string | number): number {
  if (typeof rawPrice === 'number') return rawPrice;
  if (!rawPrice) return 2500000;

  const cleaned = rawPrice.toString().trim().toLowerCase();

  // Match Cr (e.g., 2cr, 1.5cr, 2 cr)
  if (cleaned.includes('cr')) {
    const numStr = cleaned.replace(/cr/g, '').replace(/[^0-9.]/g, '');
    const num = parseFloat(numStr);
    return isNaN(num) ? 10000000 : Math.round(num * 10000000);
  }

  // Match L / Lakhs (e.g., 75l, 50l, 25l, 50 lakhs)
  if (cleaned.includes('l')) {
    const numStr = cleaned.replace(/lakhs?|l/g, '').replace(/[^0-9.]/g, '');
    const num = parseFloat(numStr);
    return isNaN(num) ? 5000000 : Math.round(num * 100000);
  }

  // Direct number or plain numeric string
  const num = parseFloat(cleaned.replace(/,/g, ''));
  if (!isNaN(num)) {
    // If entered as < 100, might be lakhs or cr, but usually raw number
    if (num <= 10) return Math.round(num * 10000000); // e.g. 1.5 -> 1.5 Cr
    if (num <= 100) return Math.round(num * 100000); // e.g. 50 -> 50 Lakhs
    return Math.round(num);
  }

  return 2500000; // Default fallback 25 Lakhs
}

export function normalizeRole(rawRole: string): Role {
  if (!rawRole) return 'Batsman';
  const clean = rawRole.trim().toLowerCase();

  if (clean.includes('all') || clean.includes('rounder')) return 'All Rounder';
  if (clean.includes('bowl')) return 'Bowler';
  if (clean.includes('keeper') || clean.includes('wk')) return 'Wicketkeeper';
  return 'Batsman';
}

export function parsePlayerCSV(csvContent: string): { players: Player[]; errors: string[] } {
  const errors: string[] = [];
  const players: Player[] = [];

  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  (parsed.data as Record<string, unknown>[]).forEach((row, index: number) => {
    // Find matching keys regardless of slight naming variations
    const nameKey = Object.keys(row).find((k) =>
      k.includes('player') || k.includes('name')
    );
    const ratingKey = Object.keys(row).find((k) => k.includes('rating'));
    const roleKey = Object.keys(row).find((k) => k.includes('type') || k.includes('role'));
    const priceKey = Object.keys(row).find((k) =>
      k.includes('price') || k.includes('base')
    );

    const rawName = nameKey ? String(row[nameKey] ?? '').trim() : '';

    // Ignore empty lines or separator rows (e.g. ,,,)
    if (!rawName || rawName === ',' || rawName.toLowerCase() === 'players') {
      return;
    }

    const rawRating = ratingKey ? parseFloat(String(row[ratingKey]).trim()) : NaN;
    const rating = isNaN(rawRating) ? 7.5 : Math.min(10, Math.max(1, rawRating));

    const rawRole = roleKey ? String(row[roleKey]) : 'Batsman';
    const role = normalizeRole(rawRole);

    const rawPrice = priceKey ? String(row[priceKey]) : '1cr';
    const basePrice = parsePriceToNumber(rawPrice);

    players.push({
      id: `p-${index + 1}-${rawName.toLowerCase().replace(/\s+/g, '-')}`,
      name: rawName,
      rating,
      role,
      basePrice,
      isSold: false,
      isUnsold: false,
      soldPrice: null,
      soldTo: null,
    });
  });

  if (players.length === 0) {
    errors.push('No valid player rows found in the CSV file.');
  }

  return { players, errors };
}
