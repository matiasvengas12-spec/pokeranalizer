
import React, { useState, useCallback, useMemo } from 'react';
import type { Card, AnalysisResult } from './types';
import { analyzeRange } from './services/pokerLogic';
import RangeMatrix from './components/RangeMatrix';
import FlopSelector from './components/FlopSelector';
import ResultsDisplay from './components/ResultsDisplay';
import { SUIT_SYMBOLS } from './constants';

const App: React.FC = () => {
    const [selectedRange, setSelectedRange] = useState<Set<string>>(new Set());
    const [selectedFlop, setSelectedFlop] = useState<Card[]>([]);
    const [analysis, setAnalysis] = useState<{ results: AnalysisResult; totalCombos: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRangeToggle = useCallback((combo: string) => {
        setSelectedRange(prev => {
            const newSet = new Set(prev);
            if (newSet.has(combo)) {
                newSet.delete(combo);
            } else {
                newSet.add(combo);
            }
            return newSet;
        });
    }, []);

    const handleFlopChange = useCallback((flop: Card[]) => {
        setSelectedFlop(flop);
    }, []);

    const handleAnalyze = useCallback(() => {
        if (selectedRange.size === 0) {
            setError("Please select a range of hands to analyze.");
            return;
        }
        if (selectedFlop.length !== 3) {
            setError("Please select exactly 3 cards for the flop.");
            return;
        }

        setError(null);
        setIsLoading(true);
        setAnalysis(null);

        // Use a timeout to allow the UI to update to the loading state
        setTimeout(() => {
            try {
                const rangeArray = Array.from(selectedRange);
                const result = analyzeRange(rangeArray, selectedFlop);
                if (result.totalCombos === 0) {
                  setError("The selected range is invalid or does not produce any valid hand combinations.");
                } else {
                  setAnalysis(result);
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : "An unknown error occurred during analysis.");
            } finally {
                setIsLoading(false);
            }
        }, 50);

    }, [selectedRange, selectedFlop]);

    const rangePercentage = useMemo(() => {
        let comboCount = 0;
        selectedRange.forEach(combo => {
            if (combo.length === 2) comboCount += 6; // Pair
            else if (combo.endsWith('s')) comboCount += 4; // Suited
            else if (combo.endsWith('o')) comboCount += 12; // Off-suit
        });
        return ((comboCount / 1326) * 100).toFixed(1);
    }, [selectedRange]);
    
    const flopIsSet = selectedFlop.length === 3;
    const rangeIsSet = selectedRange.size > 0;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-cyan-400">Poker Range Analyzer</h1>
                    <p className="text-gray-400 mt-2">Analyze hand range composition on any given flop.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Range and Flop Selection */}
                    <div className="space-y-8">
                       <RangeMatrix selectedRange={selectedRange} onRangeToggle={handleRangeToggle} setSelectedRange={setSelectedRange} />
                       <FlopSelector selectedFlop={selectedFlop} onFlopChange={handleFlopChange} />
                    </div>

                    {/* Right Column: Analysis Control and Results */}
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col h-full">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">Analysis</h2>
                        <div className="flex-grow">
                             <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-md mb-4">
                                <span className="font-semibold">Range Selected:</span>
                                <span className="text-cyan-400 font-mono">{selectedRange.size} combos ({rangePercentage}%)</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-md mb-6">
                                <span className="font-semibold">Flop:</span>
                                {selectedFlop.length > 0 ? (
                                    <div className="flex space-x-1 font-mono text-lg">
                                        {selectedFlop.map((card, i) => (
                                            <span key={i} className={`px-2 py-1 rounded-sm bg-gray-800 border border-gray-600 ${SUIT_SYMBOLS[card[1]].color}`}>
                                                {SUIT_SYMBOLS[card[1]].rankMap[card[0]]}{SUIT_SYMBOLS[card[1]].symbol}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-500">Not set</span>
                                )}
                            </div>
                           
                            {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4">{error}</div>}

                            {isLoading && (
                                <div className="text-center p-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                                    <p className="mt-4 text-gray-400">Analyzing combos...</p>
                                </div>
                            )}

                            {analysis && analysis.totalCombos > 0 && (
                                <ResultsDisplay results={analysis.results} totalCombos={analysis.totalCombos} />
                            )}
                            {!isLoading && !analysis && (
                                <div className="text-center p-8 bg-gray-700/30 rounded-lg">
                                    <p className="text-gray-400">Select a range and a flop, then click 'Analyze' to see the breakdown.</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !flopIsSet || !rangeIsSet}
                            className="w-full mt-6 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Range'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
