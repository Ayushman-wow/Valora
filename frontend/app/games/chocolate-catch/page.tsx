'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Clock } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { useSession } from 'next-auth/react';
import Leaderboard from '@/components/Leaderboard';
import { API_BASE_URL } from '@/config/env';

function ChocolateCatchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';

    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [items, setItems] = useState<{ id: number; x: number; type: 'choco' | 'bomb'; y: number }[]>([]);
    const [playerX, setPlayerX] = useState(50);
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const [gameOver, setGameOver] = useState(false);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        const interval = setInterval(() => {
            if (!gameOver) setTimeLeft(t => {
                if (t <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [gameOver]);

    useEffect(() => {
        if (gameOver && gameId) {
            const submitScore = async () => {
                await GameManager.updatePlayerScore(gameId, username, score);
                await GameManager.endGame(gameId);

                // Submit to Global Leaderboard
                try {
                    await fetch(`${API_BASE_URL}/api/leaderboard`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            gameType: 'chocolate-catch',
                            username,
                            score
                        })
                    });
                } catch (err) {
                    console.error('Failed to submit high score:', err);
                }
            };
            submitScore();
        }

        if (!gameOver) {
            const spawn = setInterval(() => {
                setItems(curr => [...curr, {
                    id: Date.now(),
                    x: Math.random() * 90 + 5,
                    y: -10,
                    type: Math.random() > 0.8 ? 'bomb' : 'choco'
                }]);
            }, 600);

            const move = setInterval(() => {
                setItems(curr => curr.map(i => ({ ...i, y: i.y + 2 })).filter(i => i.y < 110));
            }, 30);
            return () => { clearInterval(spawn); clearInterval(move); };
        }
    }, [gameOver]);

    useEffect(() => {
        if (!gameOver) {
            const check = setInterval(() => {
                setItems(curr => {
                    const next = [];
                    let hit = false;
                    for (const i of curr) {
                        if (i.y > 80 && i.y < 95 && Math.abs(i.x - playerX) < 10) {
                            if (i.type === 'choco') setScore(s => s + 10);
                            else setScore(s => Math.max(0, s - 20));
                            hit = true;
                        } else {
                            next.push(i);
                        }
                    }
                    return next;
                });
            }, 50);
            return () => clearInterval(check);
        }
    }, [playerX, gameOver]);

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (gameAreaRef.current && !gameOver) {
            const rect = gameAreaRef.current.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
            const x = ((clientX - rect.left) / rect.width) * 100;
            setPlayerX(Math.max(5, Math.min(95, x)));
        }
    };

    if (gameOver) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center p-6 space-y-8">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12 max-w-md w-full text-center space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-amber-600" />
                    <div className="text-8xl animate-bounce">🍫</div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-playfair font-black text-amber-900">Sweet Catch!</h2>
                        <p className="text-amber-800/60 font-medium">You've got a taste for high scores.</p>
                    </div>
                    <div className="py-6 bg-amber-600/5 rounded-3xl border-2 border-amber-600/10">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-700 mb-2">Total Score</p>
                        <p className="text-7xl font-black text-amber-700 drop-shadow-sm">{score}</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-amber-600 text-white rounded-2xl font-black shadow-lg hover:translate-y-[-2px] transition-all">REPLAY</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-4 bg-white text-amber-600 border-2 border-amber-600/20 rounded-2xl font-black hover:bg-amber-50 transition-all">EXIT</button>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full max-w-md">
                    <Leaderboard gameType="chocolate-catch" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 overflow-hidden touch-none font-outfit bg-amber-50/30"
            onMouseMove={handleMove} onTouchMove={handleMove}>
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between mb-8 items-center bg-white/60 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border border-white/50">
                    <button onClick={() => router.push(returnTo)} className="p-4 bg-white rounded-2xl shadow-sm hover:translate-x-[-2px] transition-all active:scale-90"><ArrowLeft className="w-6 h-6 text-amber-700" /></button>
                    <div className="flex gap-6">
                        <div className="bg-white px-6 py-3 rounded-2xl font-black shadow-sm flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <span className="text-xl text-amber-900">{score}</span>
                        </div>
                        <div className="bg-amber-600 px-6 py-3 rounded-2xl text-white font-black shadow-lg flex items-center gap-3">
                            <Clock className="w-5 h-5" />
                            <span className="text-xl">{timeLeft}s</span>
                        </div>
                    </div>
                </div>

                <div ref={gameAreaRef} className="relative w-full h-[65vh] glass-card overflow-hidden cursor-none border-b-8 border-amber-900/10 shadow-2xl bg-white/20">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-900/5 pointer-events-none" />

                    <AnimatePresence>
                        {items.map(i => (
                            <motion.div
                                key={i.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute text-5xl transform -translate-x-1/2 drop-shadow-lg"
                                style={{ left: `${i.x}%`, top: `${i.y}%` }}
                            >
                                {i.type === 'choco' ? '🍫' : '💣'}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <motion.div
                        className="absolute bottom-4 text-7xl transform -translate-x-1/2 transition-all duration-75 drop-shadow-2xl"
                        style={{ left: `${playerX}%` }}
                    >
                        🧺
                    </motion.div>
                </div>
                <div className="mt-8 text-center space-y-2">
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-900/40">Catch the Treats, Avoid the Bombs!</p>
                    <p className="text-xs text-amber-900/20">Move mouse or swipe to catch chocolate</p>
                </div>
            </div>
        </div>
    );
}

export default function ChocolateCatchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ChocolateCatchContent />
        </Suspense>
    );
}
