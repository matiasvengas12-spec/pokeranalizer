
import React from 'react';
import type { Card, Suit } from '../types';
import { RANKS_ORDERED, RANK_MAP, SUITS_ORDERED, SUIT_SYMBOLS } from '../constants';

interface FlopSelectorProps {
    selectedFlop: Card[];
    onFlopChange: (flop: Card[]) => void;
}

const FlopSelector: React.FC<FlopSelectorProps> = ({ selectedFlop, onFlopChange }) => {

    const handleCardClick = (card: Card) => {
        const isSelected = selectedFlop.some(c => c[0] === card[0] && c[1] === card[1]);
        if (isSelected) {
            onFlopChange(selectedFlop.filter(c => !(c[0] === card[0] && c[1] === card[1])));
        } else if (selectedFlop.length < 3) {
            onFlopChange([...selectedFlop, card]);
        }
    };

    const clearFlop = () => onFlopChange([]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-400">Select Flop</h2>
                <button onClick={clearFlop} className="text-sm bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded-md transition">Clear</button>
            </div>
            <div className="grid grid-cols-13 gap-1">
                {SUITS_ORDERED.map(suit => (
                    RANKS_ORDERED.map(rankChar => {
                        const rankVal = RANK_MAP[rankChar];
                        const card: Card = [rankVal, suit];
                        const isSelected = selectedFlop.some(c => c[0] === card[0] && c[1] === card[1]);
                        const isDisabled = !isSelected && selectedFlop.length >= 3;

                        const suitInfo = SUIT_SYMBOLS[suit];
                        const baseClasses = `font-mono text-sm w-full h-8 flex items-center justify-center rounded-md cursor-pointer transition-all duration-150 focus:outline-none ${suitInfo.color}`;
                        const stateClasses = isDisabled 
                            ? 'opacity-30 cursor-not-allowed' 
                            : isSelected 
                                ? 'bg-gray-600 ring-2 ring-cyan-400' 
                                : 'bg-gray-900/50 hover:bg-gray-700/80';

                        return (
                             <div
                                key={`${rankChar}${suit}`}
                                onClick={() => !isDisabled && handleCardClick(card)}
                                className={`${baseClasses} ${stateClasses}`}
                            >
                                {rankChar}{suitInfo.symbol}
                            </div>
                        );
                    })
                ))}
            </div>
        </div>
    );
};

export default FlopSelector;
