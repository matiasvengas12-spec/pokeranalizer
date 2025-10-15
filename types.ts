
export type Suit = 's' | 'h' | 'd' | 'c';
export type RankChar = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
export type Card = [number, Suit];

export type HandStrength = 
    "Quads" | "Full House" | "Flush" | "Straight" | "Trips" | 
    "Two Pair" | "Top Pair" | "Middle Pair" | "Bottom Pair" | "Weak Pair" |
    "Nut FD" | "Second Nut FD" | "Flush Draw" |
    "Open Ended Straight Draw" | "Gutshot" |
    "Overcards" | "No Made Hand";

export type AnalysisResult = {
    [key in HandStrength]?: number;
};
