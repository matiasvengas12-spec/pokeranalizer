
import type { RankChar, Suit } from './types';

export const RANKS_ORDERED: RankChar[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
export const SUITS_ORDERED: Suit[] = ['s', 'h', 'd', 'c'];

export const RANK_MAP: { [key in RankChar]: number } = {
    'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10,
    '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
};

export const REVERSE_RANK_MAP: { [key: number]: RankChar } = {
    14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: 'T',
    9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2'
};

export const SUIT_SYMBOLS: { [key in Suit]: { symbol: string, color: string, rankMap: { [key: number]: string } } } = {
    s: { symbol: '♠', color: 'text-gray-400', rankMap: REVERSE_RANK_MAP },
    h: { symbol: '♥', color: 'text-red-500', rankMap: REVERSE_RANK_MAP },
    d: { symbol: '♦', color: 'text-blue-500', rankMap: REVERSE_RANK_MAP },
    c: { symbol: '♣', color: 'text-green-500', rankMap: REVERSE_RANK_MAP }
};
