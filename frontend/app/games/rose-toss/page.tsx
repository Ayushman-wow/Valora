'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Target, Play, RotateCcw } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import confetti from 'canvas-confetti';
import { useSession } from 'next-auth/react';

// Game Constants
const GAME_DURATION = 45;
const SPAWN_RATE = 800;
const GRAVITY = 3;
const BASKET_WIDTH = 15; // percentage

function RoseTossContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';

    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
    const [items, setItems] = useState<{ id: number; x: number; y: number; type: 'rose' | 'golden' | 'thorn'; caught: boolean }[]>([]);
    const [basketX, setBasketX] = useState(50);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    // Refs for game loop to avoid stale closures
    const requestRef = useRef<number | undefined>(undefined);
    const lastSpawnTime = useRef<number>(0);
    const basketRef = useRef<number>(50); // Direct ref for smooth movement
    const scoreRef = useRef(0);

    // Initial Setup
    const startGame = async () => {
        setScore(0);
        scoreRef.current = 0;
        setTimeLeft(GAME_DURATION);
        setItems([]);
        setGameState('playing');
        lastSpawnTime.current = Date.now();
        if (gameId) {
            await GameManager.updatePlayerScore(gameId, username, 0);
        }
    };

    // Game Loop
    const updateGame = () => {
        if (gameState !== 'playing') return;

        const now = Date.now();

        // Spawn logic
        if (now - lastSpawnTime.current > SPAWN_RATE) {
            const typeProb = Math.random();
            const type = typeProb > 0.9 ? 'golden' : typeProb > 0.7 ? 'thorn' : 'rose';

            setItems(prev => [...prev, {
                id: Date.now(),
                x: Math.random() * 90 + 5, // keep within 5-95%
                y: -10,
                type,
                caught: false
            }]);
            lastSpawnTime.current = now;
        }

        // Move items & Check collisions
        setItems(prev => {
            return prev
                .map(item => {
                    // Update Y position (Slower speeds)
                    let newY = item.y + (item.type === 'golden' ? 0.8 : item.type === 'thorn' ? 0.6 : 0.4);

                    // Collision Detection
                    let caught = item.caught;
                    if (!caught && newY > 80 && newY < 90) { // Basket Height Zone
                        const basketLeft = basketRef.current - (BASKET_WIDTH / 2);
                        const basketRight = basketRef.current + (BASKET_WIDTH / 2);

                        if (item.x > basketLeft && item.x < basketRight) {
                            caught = true; // Mark as caught to render effect/remove

                            // Update Score
                            const points = item.type === 'golden' ? 50 : item.type === 'thorn' ? -20 : 10;
                            setScore(s => s + points);
                            scoreRef.current += points; // Update ref for immediate logic if needed

                            // Visual Feedbacks
                            if (item.type === 'golden') {
                                confetti({
                                    particleCount: 20,
                                    spread: 30,
                                    origin: { x: item.x / 100, y: 0.8 },
                                    colors: ['#FFD700']
                                });
                            }
                        }
                    }

                    return { ...item, y: newY, caught };
                })
                .filter(item => item.y < 110 && !item.caught); // Remove if off screen or caught
        });

        // Loop
        requestRef.current = requestAnimationFrame(updateGame);
    };

    // Start/Stop Loop
    useEffect(() => {
        if (gameState === 'playing') {
            requestRef.current = requestAnimationFrame(updateGame);
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setGameState('end');
                        if (gameId) {
                            GameManager.updatePlayerScore(gameId, username, scoreRef.current);
                            GameManager.endGame(gameId);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => {
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
                clearInterval(timer);
            };
        }
    }, [gameState]);

    // Input Handling (Mouse/Touch)
    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (gameState !== 'playing') return;

        let clientX;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = (e as React.MouseEvent).clientX;
        }

        // Calculate percentage (0-100)
        const width = window.innerWidth;
        const x = (clientX / width) * 100;
        const clampedX = Math.max(BASKET_WIDTH / 2, Math.min(100 - BASKET_WIDTH / 2, x));

        setBasketX(clampedX);
        basketRef.current = clampedX;
    };

    return (
        <div
            className="h-[calc(100vh-160px)] relative overflow-hidden bg-gradient-to-b from-sky-100 to-pink-50 touch-none select-none rounded-xl shadow-inner"
            onMouseMove={handleMove}
            onTouchMove={handleMove}
        >
            {/* Header / UI Layer */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between z-20 pointer-events-none">
                <button onClick={() => router.push(returnTo)} className="pointer-events-auto p-3 bg-white shadow rounded-xl">
                    <ArrowLeft className="w-6 h-6 text-love-charcoal" />
                </button>
                <div className="flex gap-4">
                    <div className="bg-white/80 backdrop-blur px-6 py-2 rounded-xl shadow border-b-4 border-love-crimson">
                        <span className="text-sm font-bold text-gray-400 block text-center">SCORE</span>
                        <span className="text-2xl font-black text-love-crimson">{score}</span>
                    </div>
                    <div className={`bg-white/80 backdrop-blur px-6 py-2 rounded-xl shadow border-b-4 ${timeLeft < 10 ? 'border-red-500 animate-pulse' : 'border-love-rose'}`}>
                        <span className="text-sm font-bold text-gray-400 block text-center">TIME</span>
                        <span className="text-2xl font-black text-love-charcoal">{timeLeft}</span>
                    </div>
                </div>
            </div>

            {/* Game Background Elements */}
            <div className="absolute top-20 left-10 opacity-20 animate-pulse text-6xl">☁️</div>
            <div className="absolute top-40 right-20 opacity-20 animate-pulse delay-700 text-6xl">☁️</div>

            {/* START SCREEN */}
            {gameState === 'start' && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card p-12 text-center max-w-sm mx-auto shadow-2xl space-y-8"
                    >
                        <div className="w-24 h-24 bg-love-crimson rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner border-4 border-white">
                            🧺
                        </div>
                        <div>
                            <h1 className="text-4xl font-playfair font-bold text-love-charcoal">Rose Catch</h1>
                            <p className="text-love-charcoal/70 mt-2">Catch the 🌹 & 🌟. <br />Avoid the 🥀!</p>
                        </div>

                        <div className="flex justify-center gap-4 text-sm font-bold text-gray-500">
                            <div className="flex flex-col items-center"><span className="text-2xl">🌹</span>+10</div>
                            <div className="flex flex-col items-center"><span className="text-2xl">🌟</span>+50</div>
                            <div className="flex flex-col items-center"><span className="text-2xl">🥀</span>-20</div>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold text-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Play className="fill-current" /> START
                        </button>
                    </motion.div>
                </div>
            )}

            {/* END SCREEN */}
            {gameState === 'end' && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card p-12 text-center max-w-sm mx-auto shadow-2xl space-y-6"
                    >
                        <div className="text-6xl mb-4">🏆</div>
                        <h2 className="text-3xl font-bold text-white drop-shadow-md">Time's Up!</h2>

                        <div className="bg-white/90 p-6 rounded-2xl shadow-inner">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Final Score</p>
                            <p className="text-6xl font-black text-love-crimson">{score}</p>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={startGame} className="flex-1 py-4 bg-love-crimson text-white rounded-xl font-bold shadow-lg hover:bg-love-rose transition flex items-center justify-center gap-2">
                                <RotateCcw className="w-5 h-5" /> Replay
                            </button>
                            <button onClick={() => router.push(returnTo)} className="flex-1 py-4 bg-white text-love-charcoal rounded-xl font-bold shadow-lg hover:bg-gray-100 transition">
                                Exit
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* GAME AREA */}
            {gameState !== 'start' && (
                <>
                    {/* Items */}
                    {items.map(item => (
                        <div
                            key={item.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-4xl"
                            style={{
                                left: `${item.x}%`,
                                top: `${item.y}%`,
                                zIndex: 10,
                                filter: item.type === 'golden' ? 'drop-shadow(0 0 10px gold)' : 'none'
                            }}
                        >
                            {item.type === 'rose' ? '🌹' : item.type === 'golden' ? '🌟' : '🥀'}
                        </div>
                    ))}

                    {/* Basket */}
                    <div
                        className="absolute bottom-5 transform -translate-x-1/2 transition-transform duration-75 ease-out z-20"
                        style={{ left: `${basketX}%`, width: `${BASKET_WIDTH}%` }}
                    >
                        <div className="text-6xl relative text-center filter drop-shadow-xl">
                            🧺
                            {/* Hitbox Indicator (Optional Debug) */}
                            {/* <div className="absolute inset-x-0 bottom-0 h-4 bg-red-500/20" /> */}
                        </div>
                    </div>

                    {/* Floor Grass */}
                    <div className="absolute bottom-0 w-full h-8 bg-green-300 rounded-t-[50px] z-0" />
                    <div className="absolute bottom-[-10px] w-full h-12 bg-green-400 opacity-50 z-0" />
                </>
            )}
        </div>
    );
}

export default function RoseTossPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <RoseTossContent />
        </Suspense>
    );
}
