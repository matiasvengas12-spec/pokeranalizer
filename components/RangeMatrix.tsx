
import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { RANKS_ORDERED } from '../constants';

interface RangeMatrixProps {
    selectedRange: Set<string>;
    onRangeToggle: (combo: string) => void;
    setSelectedRange: Dispatch<SetStateAction<Set<string>>>;
}

const RangeMatrix: React.FC<RangeMatrixProps> = ({ selectedRange, onRangeToggle, setSelectedRange }) => {

    const clearRange = () => setSelectedRange(new Set());
    const selectAll = () => {
        const allCombos = new Set<string>();
        for (let i = 0; i < RANKS_ORDERED.length; i++) {
            for (let j = 0; j < RANKS_ORDERED.length; j++) {
                const r1 = RANKS_ORDERED[i];
                const r2 = RANKS_ORDERED[j];
                if (i === j) allCombos.add(`${r1}${r2}`);
                else if (i < j) allCombos.add(`${r1}${r2}s`);
                else allCombos.add(`${r2}${r1}o`);
            }
        }
        setSelectedRange(allCombos);
    }
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-400">Select Range</h2>
                <div className="flex space-x-2">
                    <button onClick={clearRange} className="text-sm bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded-md transition">Clear</button>
                    <button onClick={selectAll} className="text-sm bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded-md transition">Select All</button>
                </div>
            </div>
            <div className="grid grid-cols-13 gap-1">
                {RANKS_ORDERED.map((r1, i) => (
                    RANKS_ORDERED.map((r2, j) => {
                        let combo: string, type: 'pair' | 'suited' | 'offsuit';
                        if (i === j) {
                            combo = `${r1}${r2}`;
                            type = 'pair';
                        } else if (i < j) {
                            combo = `${r1}${r2}s`;
                            type = 'suited';
                        } else {
                            combo = `${r2}${r1}o`;
                            type = 'offsuit';
                        }
                        
                        const isSelected = selectedRange.has(combo);
                        
                        const baseClasses = "font-mono text-xs w-full h-8 flex items-center justify-center rounded-md cursor-pointer transition-all duration-150 focus:outline-none";
                        const typeClasses = {
                            pair: 'bg-blue-900/50 hover:bg-blue-800/60',
                            suited: 'bg-green-900/50 hover:bg-green-800/60',
                            offsuit: 'bg-red-900/50 hover:bg-red-800/60'
                        };
                        const selectedClasses = isSelected ? 'ring-2 ring-cyan-400 opacity-100' : 'opacity-70 hover:opacity-100';

                        return (
                            <div
                                key={combo}
                                onClick={() => onRangeToggle(combo)}
                                className={`${baseClasses} ${typeClasses[type]} ${selectedClasses}`}
                            >
                                {combo}
                            </div>
                        );
                    })
                ))}
            </div>
        </div>
    );
};

// Add a utility to tailwind config if possible, or define it here
const gridTemplateColumns = {
  'grid-cols-13': 'repeat(13, minmax(0, 1fr))',
};

// This is a bit of a hack for pure tailwind cdn, but it works.
const style = document.createElement('style');
style.innerHTML = `
  .grid-cols-13 {
    grid-template-columns: repeat(13, minmax(0, 1fr));
  }
`;
document.head.appendChild(style);


export default RangeMatrix;
