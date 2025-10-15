
import React from 'react';
import type { AnalysisResult, HandStrength } from '../types';

interface ResultsDisplayProps {
    results: AnalysisResult;
    totalCombos: number;
}

const CATEGORY_ORDER: HandStrength[] = [
    "Quads", "Full House", "Flush", "Straight", "Trips", "Two Pair", "Top Pair", 
    "Middle Pair", "Bottom Pair", "Weak Pair", "Overcards", "Nut FD", "Second Nut FD",
    "Flush Draw", "Open Ended Straight Draw", "Gutshot", "No Made Hand"
];

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, totalCombos }) => {
    
    const sortedResults = Object.entries(results)
        .sort(([catA], [catB]) => {
            return CATEGORY_ORDER.indexOf(catA as HandStrength) - CATEGORY_ORDER.indexOf(catB as HandStrength);
        });

    return (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {sortedResults.map(([category, count]) => {
                const percentage = (count / totalCombos) * 100;
                return (
                    <div key={category} className="flex items-center justify-between text-sm bg-gray-700/50 p-2 rounded-md">
                        <div className="flex-1 font-semibold text-gray-300">{category}</div>
                        <div className="w-24 text-right font-mono text-gray-400">{count} combos</div>
                        <div className="w-20 text-right font-mono text-cyan-400">{percentage.toFixed(1)}%</div>
                        <div className="w-32 ml-3 bg-gray-600 rounded-full h-2.5">
                            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ResultsDisplay;
