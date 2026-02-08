'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, RefreshCw } from 'lucide-react';
import JSConfetti from 'js-confetti';

export default function CoupleSyncPage() {
    const [state, setState] = useState<'idle' | 'counting' | 'sync' | 'result'>('idle');
    const [countdown, setCountdown] = useState(3);
    const [result, setResult] = useState<'match' | 'miss' | null>(null);
    const [touchTime, setTouchTime] = useState(0);

    const handleStart = () => {
        setState('counting');
        let count = 3;
        setCountdown(3);

        const interval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(interval);
                setState('sync');
            }
        }, 1000);
    };

    // Simulate "Sync" by having users tap a button at the EXACT same time
    // For single device: "Tap the button when the heart beats"
    // Let's do a reaction test for two people on one screen: Split screen tapping?
    // Actually, simpler: "Tap the button exactly 5 seconds after start"

    // Better idea for "Couples":
    // Split screen buttons. Player 1 top, Player 2 bottom.
    // "Tap your button when the heart turns RED!"

    const [p1Ready, setP1Ready] = useState(false);
    const [p2Ready, setP2Ready] = useState(false);

    const [p1Time, setP1Time] = useState<number | null>(null);
    const [p2Time, setP2Time] = useState<number | null>(null);

    const [targetTime, setTargetTime] = useState<number>(0);

    const startGame = () => {
        setP1Time(null);
        setP2Time(null);
        setState('counting');

        // Random time between 2s and 5s
        const randomDelay = Math.random() * 3000 + 2000;

        setTimeout(() => {
            setState('sync');
            setTargetTime(Date.now());
        }, randomDelay);
    };

    const handleTap = (player: 1 | 2) => {
        if (state !== 'sync') return;

        const time = Date.now();
        if (player === 1 && !p1Time) setP1Time(time);
        if (player === 2 && !p2Time) setP2Time(time);
    };

    useEffect(() => {
        if (p1Time && p2Time) {
            const diff = Math.abs(p1Time - p2Time);
            setState('result');
            if (diff < 100) { // Under 100ms diff
                setResult('match');
                const confetti = new JSConfetti();
                confetti.addConfetti({ emojis: ['⚡', '💖', '🔥'] });
            } else {
                setResult('miss');
            }
        }
    }, [p1Time, p2Time]);

    return (
        <div className="h-[calc(100vh-100px)] max-h-[800px] max-w-md mx-auto relative flex flex-col">
            {/* Header */}
            <div className="absolute top-4 left-0 w-full text-center z-20 pointer-events-none">
                <h1 className="text-2xl font-bold text-white drop-shadow-md">Love Sync ⚡</h1>
                {state === 'idle' && <p className="text-white/80 text-sm">Tap together when the screen flashes!</p>}
            </div>

            {/* Player 1 Button (Upside Down) */}
            <button
                onClick={() => state === 'idle' ? startGame() : handleTap(1)}
                className={`flex-1 w-full flex items-center justify-center transition-all ${state === 'sync' ? 'bg-[#FF2171] active:scale-95' :
                        state === 'result' ? (result === 'match' ? 'bg-green-500' : 'bg-love-charcoal') :
                            'bg-love-rose'
                    } rounded-b-3xl mb-1 relative overflow-hidden`}
                disabled={state === 'counting' || (state === 'sync' && !!p1Time)}
            >
                <div className="transform rotate-180 flex flex-col items-center">
                    {state === 'idle' && <span className="text-white font-bold text-2xl animate-pulse">START GAME</span>}
                    {state === 'counting' && <span className="text-white font-black text-6xl">...</span>}
                    {state === 'sync' && <span className="text-white font-black text-4xl">{p1Time ? 'WAITING...' : 'TAP!'}</span>}
                    {state === 'result' && (
                        <div className="text-center">
                            <span className="text-6xl block mb-2">{result === 'match' ? '🔥' : '💔'}</span>
                            <span className="text-white font-bold text-xl">{p1Time && p2Time ? `${Math.abs(p1Time - p2Time)}ms` : ''}</span>
                        </div>
                    )}
                </div>
            </button>

            {/* Divider */}
            <div className="h-2 bg-white flex items-center justify-center relative z-10">
                <div className="bg-white rounded-full p-2">
                    <Heart className={`w-8 h-8 ${state === 'sync' ? 'text-[#FF2171] fill-[#FF2171] animate-ping' : 'text-love-blush fill-love-blush'}`} />
                </div>
            </div>

            {/* Player 2 Button */}
            <button
                onClick={() => state === 'idle' ? startGame() : handleTap(2)}
                className={`flex-1 w-full flex items-center justify-center transition-all ${state === 'sync' ? 'bg-[#FF2171] active:scale-95' :
                        state === 'result' ? (result === 'match' ? 'bg-green-500' : 'bg-love-charcoal') :
                            'bg-love-dusk'
                    } rounded-t-3xl mt-1 relative overflow-hidden`}
                disabled={state === 'counting' || (state === 'sync' && !!p2Time)}
            >
                <div className="flex flex-col items-center">
                    {state === 'idle' && <span className="text-white font-bold text-2xl animate-pulse">START GAME</span>}
                    {state === 'counting' && <span className="text-white font-black text-6xl">...</span>}
                    {state === 'sync' && <span className="text-white font-black text-4xl">{p2Time ? 'WAITING...' : 'TAP!'}</span>}
                    {state === 'result' && (
                        <div className="text-center">
                            <span className="text-6xl block mb-2">{result === 'match' ? '🔥' : '💔'}</span>
                            {result === 'miss' && <span className="text-white font-bold block mb-4">Too slow! Sync up!</span>}

                            {state === 'result' && (
                                <div
                                    onClick={(e) => { e.stopPropagation(); setState('idle'); }}
                                    className="px-6 py-2 bg-white/20 rounded-full border border-white/40 text-white font-bold mt-4 cursor-pointer hover:bg-white/30"
                                >
                                    Play Again ↻
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </button>
        </div>
    );
}
