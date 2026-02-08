'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, AlertTriangle, HeartCrack, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { COUPLE_SCENARIOS } from '@/lib/gameContent';
import confetti from 'canvas-confetti';

export default function CoupleChaosPage() {
    const router = useRouter();
    const [scenario, setScenario] = useState<{ scenario: string; options: string[] } | null>(null);
    const [result, setResult] = useState<string | null>(null);

    const generateScenario = () => {
        const random = COUPLE_SCENARIOS[Math.floor(Math.random() * COUPLE_SCENARIOS.length)];
        setScenario(random);
        setResult(null);
    };

    const handleOption = (option: string) => {
        const funnyResults = [
            "Surprisingly, it worked! (Somehow)",
            "Chaos ensued. The neighbors called the police.",
            "Instant regret. But a good story later.",
            "Partner laughed. Crisis averted!",
            "You are now sleeping on the couch."
        ];
        const randomResult = funnyResults[Math.floor(Math.random() * funnyResults.length)];
        setResult(randomResult);
        confetti({
            particleCount: 50,
            spread: 60,
            colors: ['#FF4500', '#FFD700']
        });
    };

    return (
        <div className="min-h-screen bg-red-50 p-4 font-outfit select-none flex flex-col items-center justify-center">

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <button onClick={() => router.push(returnTo)} className="p-2 bg-white rounded-full shadow-sm hover:bg-red-100">
                    <ArrowLeft className="w-6 h-6 text-red-600" />
                </button>
            </div>

            <div className="w-full max-w-lg mx-auto z-10 text-center">

                <div className="mb-8 relative inline-block">
                    <span className="absolute -top-6 -right-6 text-4xl animate-bounce">🌪️</span>
                    <h1 className="text-4xl md:text-5xl font-black text-red-600 uppercase tracking-tighter transform -rotate-2">
                        Couple Chaos
                    </h1>
                    <p className="text-red-400 font-bold uppercase tracking-widest text-xs mt-2">SURVIVE THE CRISIS</p>
                </div>

                <AnimatePresence mode="wait">
                    {!scenario ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-8 rounded-3xl shadow-xl border-4 border-red-100 space-y-6"
                        >
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
                            <h2 className="text-2xl font-bold text-gray-800">Ready for trouble?</h2>
                            <p className="text-gray-500">Face hilarious relationship disasters and choose your fate!</p>
                            <button
                                onClick={generateScenario}
                                className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-red-600 hover:scale-[1.02] transition-transform"
                            >
                                START CHAOS 💣
                            </button>
                        </motion.div>
                    ) : !result ? (
                        <motion.div
                            key={scenario.scenario}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-red-200 text-left relative overflow-hidden"
                        >
                            <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500 mb-6">
                                <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">THE SITUATION</h3>
                                <p className="text-xl font-bold text-gray-900 font-playfair">
                                    "{scenario.scenario}"
                                </p>
                            </div>

                            <div className="space-y-3">
                                {scenario.options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleOption(opt)}
                                        className="w-full p-4 text-left bg-gray-50 hover:bg-red-50 rounded-xl border-2 border-transparent hover:border-red-200 transition-colors font-medium text-gray-700 flex items-center gap-3 group"
                                    >
                                        <span className="w-8 h-8 flex items-center justify-center bg-gray-200 group-hover:bg-red-200 rounded-full font-bold text-gray-500 group-hover:text-red-600 transition-colors">
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gray-900 text-white p-10 rounded-3xl shadow-2xl border-4 border-red-500 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-red-600/10 animate-pulse" />
                            <div className="relative z-10 space-y-6">
                                <Zap className="w-16 h-16 text-yellow-400 mx-auto" />

                                <div>
                                    <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">THE AFTERMATH</h2>
                                    <p className="text-2xl md:text-3xl font-black leading-tight font-playfair text-white">
                                        "{result}"
                                    </p>
                                </div>

                                <button
                                    onClick={generateScenario}
                                    className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold shadow-lg hover:bg-gray-100 mt-4 flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-5 h-5" /> Next Disaster
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
