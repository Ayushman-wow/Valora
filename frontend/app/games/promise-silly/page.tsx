'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Lock, Share2, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SILLY_PROMISES } from '@/lib/gameContent';
import confetti from 'canvas-confetti';

function SillyPromiseContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/games';

    // State
    const [action, setAction] = useState(SILLY_PROMISES.actions[0]);
    const [object, setObject] = useState(SILLY_PROMISES.objects[0]);
    const [time, setTime] = useState(SILLY_PROMISES.times[0]);
    const [locked, setLocked] = useState(false);
    const [spinning, setSpinning] = useState(false);

    const generatePromise = () => {
        setLocked(false);
        setSpinning(true);

        let spins = 0;
        const interval = setInterval(() => {
            spins++;
            setAction(SILLY_PROMISES.actions[Math.floor(Math.random() * SILLY_PROMISES.actions.length)]);
            setObject(SILLY_PROMISES.objects[Math.floor(Math.random() * SILLY_PROMISES.objects.length)]);
            setTime(SILLY_PROMISES.times[Math.floor(Math.random() * SILLY_PROMISES.times.length)]);

            if (spins > 10) {
                clearInterval(interval);
                setSpinning(false);
            }
        }, 100);
    };

    const handleLock = () => {
        setLocked(true);
        confetti({
            particleCount: 80,
            spread: 60,
            colors: ['#FFD700', '#FF69B4']
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 font-outfit select-none">
            {/* Header */}
            <div className="max-w-md mx-auto flex items-center justify-between mb-8">
                <button onClick={() => router.push(returnTo)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                    <ArrowLeft className="w-6 h-6 text-blue-600" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🤞</span>
                    <h1 className="text-xl font-bold text-gray-800">Silly Promises</h1>
                </div>
                <div className="w-10" />
            </div>

            <div className="max-w-md mx-auto space-y-8">

                {/* Promise Machine */}
                <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-blue-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-400" />

                    <div className="text-center mb-6">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">I HEREBY PROMISE TO...</p>
                    </div>

                    <div className="space-y-4 font-playfair font-black text-2xl md:text-3xl text-center text-gray-800">
                        <motion.div
                            key={action}
                            animate={{ scale: spinning ? [1, 1.1, 1] : 1, opacity: spinning ? 0.5 : 1 }}
                            className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100"
                        >
                            {action.toUpperCase()}
                        </motion.div>

                        <div className="text-sm font-outfit text-gray-400 font-bold">...</div>

                        <motion.div
                            key={object}
                            animate={{ scale: spinning ? [1, 1.1, 1] : 1, opacity: spinning ? 0.5 : 1 }}
                            className="p-4 bg-purple-50 rounded-xl border-2 border-purple-100"
                        >
                            {object.toUpperCase()}
                        </motion.div>

                        <div className="text-sm font-outfit text-gray-400 font-bold">...</div>

                        <motion.div
                            key={time}
                            animate={{ scale: spinning ? [1, 1.1, 1] : 1, opacity: spinning ? 0.5 : 1 }}
                            className="p-4 bg-pink-50 rounded-xl border-2 border-pink-100"
                        >
                            {time.toUpperCase()}
                        </motion.div>
                    </div>

                    {locked && (
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: -12 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-6 py-2 rounded-full font-black border-4 border-white shadow-lg z-10 text-xl whitespace-nowrap"
                        >
                            LOCKED! 🔒
                        </motion.div>
                    )}
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={generatePromise}
                        disabled={spinning || locked}
                        className="py-4 bg-white text-gray-600 rounded-2xl font-bold shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
                        Spin
                    </button>
                    <button
                        onClick={handleLock}
                        disabled={spinning || locked}
                        className="py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Lock className="w-5 h-5" />
                        Lock It
                    </button>
                </div>

                {locked && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                    >
                        <button className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition-colors">
                            <Share2 className="w-4 h-4" /> Share This Promise
                        </button>
                    </motion.div>
                )}

            </div>
        </div>
    );
}

export default function SillyPromisePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SillyPromiseContent />
        </Suspense>
    );
}
