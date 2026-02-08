'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Send, Zap } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HUG_STYLES } from '@/lib/gameContent';
import confetti from 'canvas-confetti';

function HugSimContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/games';
    const [selectedHug, setSelectedHug] = useState<typeof HUG_STYLES[0] | null>(null);
    const [hugging, setHugging] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const startHug = () => {
        if (!selectedHug) return;
        setHugging(true);
        setTimeout(() => {
            setHugging(false);

            // Generate reaction
            let reaction = "That was nice!";
            if (selectedHug.awkwardness > 50) reaction = "Uhh... okay then. 😅";
            if (selectedHug.warmth > 80) reaction = "So warm and cozy! 🥰";
            if (selectedHug.type === 'The "Bro" Hug') reaction = "Solid. Respect. 🤜🤛";
            if (selectedHug.awkwardness === 100) reaction = "Did you just... hover at me? 🤨";

            setResult(reaction);
            confetti({
                particleCount: 30,
                spread: 50,
                colors: ['#FFB6C1', '#FF69B4']
            });
        }, 1500);
    };

    const reset = () => {
        setSelectedHug(null);
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-pink-50 p-4 font-outfit select-none">

            {/* Header */}
            <div className="max-w-md mx-auto flex items-center justify-between mb-8">
                <button onClick={() => router.push(returnTo)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                    <ArrowLeft className="w-6 h-6 text-pink-500" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🫂</span>
                    <h1 className="text-xl font-bold text-gray-800">Hug Simulator</h1>
                </div>
                <div className="w-10" />
            </div>

            <div className="max-w-md mx-auto space-y-6">

                {!result ? (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Choose Your Hug</h2>
                            <p className="text-gray-500 text-sm">Pick a style to send!</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {HUG_STYLES.map((hug) => (
                                <button
                                    key={hug.type}
                                    onClick={() => setSelectedHug(hug)}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedHug?.type === hug.type
                                        ? 'bg-pink-100 border-pink-400 shadow-md transform scale-105'
                                        : 'bg-white border-transparent hover:border-pink-200'
                                        }`}
                                >
                                    <span className="text-4xl">{hug.emoji}</span>
                                    <span className="font-bold text-gray-700 text-sm">{hug.type}</span>
                                </button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {selectedHug && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="fixed bottom-0 left-0 w-full p-6 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20"
                                >
                                    <div className="max-w-md mx-auto space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl p-4 bg-pink-50 rounded-2xl">{selectedHug.emoji}</div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-800">{selectedHug.type}</h3>
                                                <p className="text-gray-500 text-sm">{selectedHug.desc}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                                                <span>Warmth</span>
                                                <span>{selectedHug.warmth}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${selectedHug.warmth}%` }}
                                                    className="h-full bg-gradient-to-r from-pink-400 to-red-400"
                                                />
                                            </div>

                                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mt-2">
                                                <span>Awkwardness</span>
                                                <span>{selectedHug.awkwardness}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${selectedHug.awkwardness}%` }}
                                                    className="h-full bg-gradient-to-r from-gray-400 to-gray-600"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={startHug}
                                            disabled={hugging}
                                            className="w-full py-4 bg-pink-500 text-white rounded-xl font-bold shadow-lg hover:bg-pink-600 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
                                        >
                                            {hugging ? (
                                                <span className="animate-pulse">Hugging...</span>
                                            ) : (
                                                <>SEND HUG <Send className="w-5 h-5" /></>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-8 rounded-3xl shadow-xl text-center space-y-6 mt-12 border-4 border-pink-100"
                    >
                        <div className="inline-block p-4 bg-pink-50 rounded-full text-6xl shadow-inner border-4 border-white">
                            {selectedHug?.emoji}
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">REACTION</h2>
                            <p className="text-2xl font-black text-gray-800 font-playfair leading-tight">"{result}"</p>
                        </div>

                        <button
                            onClick={reset}
                            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" /> Try Another
                        </button>
                    </motion.div>
                )}

            </div>
        </div>
    );
}

export default function HugSimPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <HugSimContent />
        </Suspense>
    );
}
