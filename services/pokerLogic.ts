
import type { Card, Suit, HandStrength, AnalysisResult } from '../types';
import { RANK_MAP, SUITS_ORDERED } from '../constants';

function parseCombo(comboStr: string): Card[][] {
    const ranks = RANK_MAP;
    const suits: Suit[] = ['s', 'h', 'd', 'c'];

    if (!comboStr || comboStr.length < 2) return [];

    // Pairs: "TT"
    if (comboStr.length === 2 && comboStr[0] === comboStr[1]) {
        const rank = ranks[comboStr[0] as keyof typeof ranks];
        if (!rank) return [];
        const combos: Card[][] = [];
        for (let i = 0; i < suits.length; i++) {
            for (let j = i + 1; j < suits.length; j++) {
                combos.push([[rank, suits[i]], [rank, suits[j]]]);
            }
        }
        return combos;
    }

    // Connectors "AKs" or "AKo"
    if (comboStr.length === 3 && (comboStr[2] === 's' || comboStr[2] === 'o')) {
        const rank1 = ranks[comboStr[0] as keyof typeof ranks];
        const rank2 = ranks[comboStr[1] as keyof typeof ranks];
        if (!rank1 || !rank2) return [];

        const combos: Card[][] = [];
        if (comboStr[2] === 's') { // Suited
            for (const s of suits) {
                combos.push([[rank1, s], [rank2, s]]);
            }
        } else { // Off-suit
            for (const s1 of suits) {
                for (const s2 of suits) {
                    if (s1 !== s2) {
                        combos.push([[rank1, s1], [rank2, s2]]);
                    }
                }
            }
        }
        return combos;
    }

    return [];
}

function evaluateHandStrength(hole: Card[], board: Card[]): HandStrength[] {
    if (!hole || hole.length !== 2) return [];

    const allCards = [...hole, ...board];
    const ranks = allCards.map(c => c[0]);
    const suits = allCards.map(c => c[1]);
    const holeRanks = hole.map(c => c[0]);
    const holeSuits = hole.map(c => c[1]);

    const suitCount: { [key in Suit]: number } = { s: 0, h: 0, d: 0, c: 0 };
    for (const s of suits) {
        suitCount[s]++;
    }
    const dominantSuit = Object.keys(suitCount).reduce((a, b) => suitCount[a as Suit] > suitCount[b as Suit] ? a : b) as Suit;
    const dominantCount = suitCount[dominantSuit];
    
    const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);

    let isStraight = false;
    if (uniqueRanks.length >= 5) {
        for (let i = 0; i <= uniqueRanks.length - 5; i++) {
            if (uniqueRanks[i] - uniqueRanks[i+4] === 4) {
                isStraight = true;
                break;
            }
        }
        // Ace-low straight
        const aceLowRanks = uniqueRanks.map(r => r === 14 ? 1 : r).sort((a, b) => b - a);
        if ([5,4,3,2,1].every(r => aceLowRanks.includes(r))) {
            isStraight = true;
        }
    }
    
    const rankCounts: { [key: number]: number } = {};
    for (const r of ranks) {
        rankCounts[r] = (rankCounts[r] || 0) + 1;
    }
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const categories: Set<HandStrength> = new Set();

    // Made Hands
    const isFlush = dominantCount >= 5;
    if (isStraight && isFlush) categories.add("Flush"); // SF not implemented for simplicity, just flush
    else if (counts[0] === 4) categories.add("Quads");
    else if (counts[0] === 3 && counts[1] >= 2) categories.add("Full House");
    else if (isFlush) categories.add("Flush");
    else if (isStraight) categories.add("Straight");
    else if (counts[0] === 3) categories.add("Trips");
    else if (counts[0] === 2 && counts[1] === 2) categories.add("Two Pair");
    else if (counts[0] === 2) {
        const boardRanks = board.map(c => c[0]).sort((a, b) => b - a);
        const pairRank = parseInt(Object.keys(rankCounts).find(r => rankCounts[parseInt(r)] === 2)!);
        
        let pairMadeWithHole = holeRanks.includes(pairRank);

        if (pairMadeWithHole || board.filter(c => c[0] === pairRank).length === 1) { // Pocket pair or one card pair
            if(board.length > 0 && pairRank === boardRanks[0]) categories.add("Top Pair");
            else if (board.length > 1 && pairRank === boardRanks[1]) categories.add("Middle Pair");
            else if (board.length > 2 && pairRank === boardRanks[2]) categories.add("Bottom Pair");
            else categories.add("Weak Pair");
        }
    }

    // Draws
    if (dominantCount === 4) {
        if(holeSuits.includes(dominantSuit)) {
            const flushRanksOnBoard = board.filter(c => c[1] === dominantSuit).map(c => c[0]);
            const ourFlushRank = hole.find(c => c[1] === dominantSuit)![0];
            if (ourFlushRank === 14 && !flushRanksOnBoard.includes(14)) categories.add("Nut FD");
            else if (ourFlushRank === 13 && !flushRanksOnBoard.includes(14)) categories.add("Second Nut FD");
            else categories.add("Flush Draw");
        }
    }
    
    // Straight Draws
    const potentialStraightRanks = [...new Set(allCards.map(c => c[0]))].sort((a, b) => b - a);
    if(potentialStraightRanks.length >= 4){
        // OESD
        for(let i = 0; i <= potentialStraightRanks.length - 4; i++){
            if(potentialStraightRanks[i] - potentialStraightRanks[i+3] === 3) {
                 if (holeRanks.includes(potentialStraightRanks[i]) || holeRanks.includes(potentialStraightRanks[i+3])) {
                    categories.add("Open Ended Straight Draw");
                 }
            }
        }
         // Gutshot
        for(let i = 0; i <= potentialStraightRanks.length - 4; i++){
            if(potentialStraightRanks[i] - potentialStraightRanks[i+3] <= 4) {
                 categories.add("Gutshot");
            }
        }
    }


    // Overcards
    const topBoardRank = board.length > 0 ? Math.max(...board.map(c => c[0])) : 0;
    if (holeRanks.some(r => r > topBoardRank) && !categories.size) {
        categories.add("Overcards");
    }

    if (categories.size === 0) {
        categories.add("No Made Hand");
    }

    return Array.from(categories);
}


export function analyzeRange(range: string[], board: Card[]): { results: AnalysisResult; totalCombos: number } {
    const results: AnalysisResult = {};
    let totalCombos = 0;

    for (const comboStr of range) {
        const parsedCombos = parseCombo(comboStr);
        for (const holeCards of parsedCombos) {
            // Filter out combos that conflict with the board
            const holeCardStrings = holeCards.map(c => `${c[0]}-${c[1]}`);
            const boardCardStrings = board.map(c => `${c[0]}-${c[1]}`);
            if (holeCardStrings.some(hc => boardCardStrings.includes(hc))) {
                continue;
            }

            totalCombos++;
            const strengthCategories = evaluateHandStrength(holeCards, board);
            for (const category of strengthCategories) {
                results[category] = (results[category] || 0) + 1;
            }
        }
    }

    return { results, totalCombos };
}
