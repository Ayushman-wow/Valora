'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Heart, Zap } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PROMISE_DARES } from '@/lib/gameContent';

function PromiseDareContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/games';

    const [result, setResult] = useState<{ type: string; text: string } | null>(null);
    const [flipping, setFlipping] = useState(false);

    const handleChoice = (type: 'promise' | 'dare') => {
        setFlipping(true);
        setTimeout(() => {
            const options = PROMISE_DARES.filter(d => d.type === type);
            const random = options[Math.floor(Math.random() * options.length)];
            setResult(random);
            setFlipping(false);
        }, 600);
    };

    const reset = () => {
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 font-outfit select-none flex flex-col items-center justify-center">

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <button onClick={() => router.push(returnTo)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
            </div>

            <div className="w-full max-w-4xl text-center z-10">

                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-700 shadow-2xl space-y-8"
                        >
                            <h1 className="text-4xl md:text-6xl font-black mb-2 uppercase tracking-tighter">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Promise</span>
                                <span className="text-gray-600 mx-4">VS</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Dare</span>
                            </h1>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">CHOOSE YOUR FATE</p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <button
                                    onClick={() => handleChoice('promise')}
                                    disabled={flipping}
                                    className="group relative h-64 bg-gradient-to-br from-pink-600 to-purple-700 rounded-2xl flex flex-col items-center justify-center gap-4 hover:scale-105 hover:shadow-pink-500/20 shadow-xl transition-all overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    <Heart className="w-16 h-16 text-pink-200 group-hover:scale-110 transition-transform" />
                                    <span className="text-2xl font-black text-white relative z-10">PROMISE</span>
                                    <span className="text-xs text-pink-200/60 relative z-10 font-bold uppercase">Sweet & Safe</span>
                                </button>

                                <button
                                    onClick={() => handleChoice('dare')}
                                    disabled={flipping}
                                    className="group relative h-64 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex flex-col items-center justify-center gap-4 hover:scale-105 hover:shadow-red-500/20 shadow-xl transition-all overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    <Zap className="w-16 h-16 text-yellow-200 group-hover:scale-110 transition-transform group-hover:rotate-12" />
                                    <span className="text-2xl font-black text-white relative z-10">DARE</span>
                                    <span className="text-xs text-orange-200/60 relative z-10 font-bold uppercase">Wild & Risky</span>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, rotateY: 90 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            className={`p-10 rounded-3xl shadow-2xl border-4 max-w-xl mx-auto ${result.type === 'promise'
                                ? 'bg-gradient-to-br from-pink-100 to-purple-100 border-pink-300 text-purple-900'
                                : 'bg-gradient-to-br from-red-900 to-orange-900 border-red-500 text-white'
                                }`}
                        >
                            <div className="mb-6">
                                {result.type === 'promise' ? (
                                    <Heart className="w-12 h-12 text-pink-500 mx-auto" />
                                ) : (
                                    <Zap className="w-12 h-12 text-yellow-400 mx-auto animate-pulse" />
                                )}
                            </div>

                            <h2 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-4">
                                YOU MUST {result.type.toUpperCase()}...
                            </h2>

                            <p className="text-3xl md:text-4xl font-black leading-tight mb-8 font-playfair">
                                "{result.text}"
                            </p>

                            <button
                                onClick={reset}
                                className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:scale-105 ${result.type === 'promise'
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'bg-white text-red-600 hover:bg-gray-100'
                                    }`}
                            >
                                Play Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

export default function PromiseDarePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PromiseDareContent />
        </Suspense>
    );
}
