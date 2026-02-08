'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CHOCOLATE_MOODS, shuffleArray } from '@/lib/gameContent';
import confetti from 'canvas-confetti';

function ChocolateMoodContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/games';

    // Game State
    const [chocolates, setChocolates] = useState(() => shuffleArray([...CHOCOLATE_MOODS]));
    const [moods, setMoods] = useState(() => shuffleArray([...CHOCOLATE_MOODS]));
    const [selectedChoco, setSelectedChoco] = useState<string | null>(null);
    const [matches, setMatches] = useState<string[]>([]);
    const [wrongPair, setWrongPair] = useState(false);

    const handleChocoClick = (type: string) => {
        if (matches.includes(type)) return;
        setSelectedChoco(type);
        setWrongPair(false);
    };

    const handleMoodClick = (mood: string) => {
        if (!selectedChoco || matches.includes(selectedChoco)) return;

        const correct = CHOCOLATE_MOODS.find(c => c.type === selectedChoco)?.mood === mood;

        if (correct) {
            setMatches([...matches, selectedChoco]);
            setSelectedChoco(null);

            // Check win
            if (matches.length + 1 === CHOCOLATE_MOODS.length) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } else {
            setWrongPair(true);
            setTimeout(() => setWrongPair(false), 500);
        }
    };

    const restart = () => {
        setChocolates(shuffleArray([...CHOCOLATE_MOODS]));
        setMoods(shuffleArray([...CHOCOLATE_MOODS]));
        setMatches([]);
        setSelectedChoco(null);
    };

    const allMatched = matches.length === CHOCOLATE_MOODS.length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4 font-outfit select-none">
            {/* Header */}
            <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
                <button onClick={() => router.push(returnTo)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                    <ArrowLeft className="w-6 h-6 text-amber-800" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🍫</span>
                    <h1 className="text-xl font-bold text-amber-900">Mood Match</h1>
                </div>
                <button onClick={restart} className="p-2 bg-white rounded-full shadow-sm">
                    <RefreshCw className="w-5 h-5 text-amber-800" />
                </button>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">

                {/* Chocolates Column */}
                <div className="space-y-4">
                    <h2 className="text-center font-bold text-amber-800 opacity-60">CHOCOLATES</h2>
                    {chocolates.map((item) => {
                        const isMatched = matches.includes(item.type);
                        const isSelected = selectedChoco === item.type;

                        return (
                            <motion.button
                                key={item.type}
                                onClick={() => handleChocoClick(item.type)}
                                disabled={isMatched}
                                animate={{ scale: isSelected ? 1.05 : 1, opacity: isMatched ? 0.5 : 1 }}
                                className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${isSelected
                                    ? 'bg-amber-600 text-white shadow-lg ring-4 ring-amber-200'
                                    : isMatched
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-white hover:bg-amber-100 text-amber-900 shadow-sm'
                                    }`}
                            >
                                <span className="text-4xl">{item.emoji}</span>
                                <span className="font-bold text-lg">{item.type}</span>
                                {isMatched && <Check className="ml-auto w-6 h-6" />}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Moods Column */}
                <div className="space-y-4">
                    <h2 className="text-center font-bold text-amber-800 opacity-60">MOODS</h2>
                    {moods.map((item) => {
                        // Find matching chocolate only if matched
                        const correspondingChoco = CHOCOLATE_MOODS.find(c => c.mood === item.mood);
                        const isMatched = matches.includes(correspondingChoco!.type);

                        return (
                            <motion.button
                                key={item.mood}
                                onClick={() => handleMoodClick(item.mood)}
                                disabled={isMatched}
                                animate={{
                                    x: (wrongPair && selectedChoco && !isMatched) ? [0, -10, 10, 0] : 0,
                                    opacity: isMatched ? 0.5 : 1
                                }}
                                className={`w-full p-6 rounded-xl flex items-center justify-center text-center transition-all ${isMatched
                                    ? 'bg-green-100 text-green-800 border-2 border-green-200'
                                    : 'bg-white hover:bg-orange-100 text-amber-900 border-2 border-amber-100'
                                    }`}
                            >
                                <span className="font-bold text-lg">{item.mood}</span>
                            </motion.button>
                        );
                    })}
                </div>

            </div>

            {/* Victory Overlay */}
            <AnimatePresence>
                {allMatched && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl space-y-6"
                        >
                            <div className="text-6xl">🎉</div>
                            <h2 className="text-3xl font-playfair font-bold text-amber-900">Sweet Success!</h2>
                            <p className="text-amber-800/70">You know your chocolates perfectly!</p>
                            <button
                                onClick={restart}
                                className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold shadow-lg hover:bg-amber-700"
                            >
                                Play Again 🍫
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

export default function ChocolateMoodPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ChocolateMoodContent />
        </Suspense>
    );
}
