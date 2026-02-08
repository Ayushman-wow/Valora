'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Clock, Zap, ArrowLeft } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { GameSession } from '@/lib/gameTypes';
import Leaderboard from '@/components/Leaderboard';
import { API_BASE_URL } from '@/config/env';

function FastTapContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';

    const [game, setGame] = useState<GameSession | null>(null);
    const [taps, setTaps] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [combo, setCombo] = useState(0);
    const [showCombo, setShowCombo] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const comboRef = useRef<NodeJS.Timeout | null>(null);

    const getCurrentUsername = () => {
        return session?.user?.name || localStorage.getItem('heartsync_username') || 'Guest';
    };

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) {
                router.push(returnTo);
                return;
            }

            try {
                const loadedGame = await GameManager.getGameById(gameId);
                if (!loadedGame) {
                    router.push(returnTo);
                    return;
                }

                setGame(loadedGame);

                // Start game
                if (loadedGame.status === 'waiting') {
                    await GameManager.setPlayerReady(gameId, getCurrentUsername(), true);
                }
            } catch (e) {
                console.error(e);
            }
        };
        loadGame();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (comboRef.current) clearTimeout(comboRef.current);
        };
    }, [gameId, router, session]);

    const startGame = () => {
        setGameStarted(true);
        setTimeLeft(30);
        setTaps(0);

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const endGame = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameEnded(true);
        setGameStarted(false);

        const currentTaps = taps; // Capture local closure value

        if (gameId) {
            await GameManager.updatePlayerScore(gameId, getCurrentUsername(), currentTaps);
            await GameManager.endGame(gameId);

            // Submit to Global Leaderboard
            try {
                await fetch(`${API_BASE_URL}/api/leaderboard`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gameType: 'fast-tap',
                        username: getCurrentUsername(),
                        score: currentTaps
                    })
                });
            } catch (err) {
                console.error('Failed to submit high score:', err);
            }
        }
    };

    const handleTap = () => {
        if (!gameStarted || gameEnded) return;

        setTaps(prev => prev + 1);
        setCombo(prev => {
            const newCombo = prev + 1;
            if (newCombo % 10 === 0) {
                setShowCombo(true);
                setTimeout(() => setShowCombo(false), 500);
            }
            return newCombo;
        });

        // Reset combo after 1 second of no tapping
        if (comboRef.current) clearTimeout(comboRef.current);
        comboRef.current = setTimeout(() => setCombo(0), 1000);
    };

    const handleExit = async () => {
        if (gameId) {
            await GameManager.leaveGame(gameId, getCurrentUsername());
        }
        router.push(returnTo);
    };

    const restartGame = () => {
        setGameEnded(false);
        setTaps(0);
        setCombo(0);
        router.push('/games/fast-tap');
    };

    if (!game) {
        return <div className="p-12 text-center">Loading game...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{
            background: 'linear-gradient(135deg, #FFE5EC 0%, #FFC2D4 100%)'
        }}>
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={handleExit}
                        className="p-3 bg-white rounded-xl hover:bg-love-blush transition-all shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5 text-love-charcoal" />
                    </button>

                    {gameStarted && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-lg">
                                <Trophy className="w-6 h-6 text-love-gold" />
                                <span className="text-2xl font-bold text-love-charcoal">{taps}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-love-crimson px-6 py-3 rounded-xl shadow-lg">
                                <Clock className="w-6 h-6 text-white" />
                                <span className="text-2xl font-bold text-white">{timeLeft}s</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Game Area */}
                {!gameStarted && !gameEnded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-12 text-center space-y-6"
                    >
                        <div className="w-32 h-32 bg-gradient-to-br from-love-rose to-love-crimson rounded-full flex items-center justify-center mx-auto shadow-2xl">
                            <Zap className="w-16 h-16 text-white" />
                        </div>

                        <div>
                            <h1 className="text-5xl font-playfair font-bold text-love-charcoal mb-4">
                                Fast Tap Hearts ⚡
                            </h1>
                            <p className="text-xl text-love-charcoal/70 max-w-md mx-auto">
                                Tap the heart as fast as you can in 30 seconds! How many can you get?
                            </p>
                        </div>

                        <button
                            onClick={startGame}
                            className="px-12 py-4 bg-gradient-to-r from-love-crimson to-love-rose text-white text-2xl rounded-xl font-bold hover:shadow-2xl transition-all"
                        >
                            Start Game! 🚀
                        </button>
                    </motion.div>
                )}

                {/* Active Game */}
                {gameStarted && !gameEnded && (
                    <div className="relative">
                        <motion.button
                            onClick={handleTap}
                            whileTap={{ scale: 0.9 }}
                            className="w-full aspect-square bg-gradient-to-br from-red-400 via-pink-400 to-red-500 rounded-3xl shadow-2xl flex items-center justify-center text-white text-9xl hover:scale-105 transition-transform active:scale-95"
                            style={{
                                boxShadow: '0 20px 60px rgba(220, 20, 60, 0.4)'
                            }}
                        >
                            ❤️
                        </motion.button>

                        {/* Combo Popup */}
                        {showCombo && (
                            <motion.div
                                initial={{ opacity: 0, y: -50, scale: 0.5 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            >
                                <div className="bg-yellow-400 text-yellow-900 px-8 py-4 rounded-full text-4xl font-bold shadow-2xl">
                                    🔥 {combo} COMBO!
                                </div>
                            </motion.div>
                        )}

                        <p className="text-center mt-6 text-2xl font-bold text-love-charcoal">
                            Tap the heart!
                        </p>
                    </div>
                )}

                {/* Game Over */}
                {gameEnded && (
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-12 text-center space-y-6"
                        >
                            <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                                <Trophy className="w-16 h-16 text-white" />
                            </div>

                            <div>
                                <h2 className="text-5xl font-playfair font-bold text-love-charcoal mb-2">
                                    Amazing! 🎉
                                </h2>
                                <p className="text-6xl font-bold text-love-gold mb-4">
                                    {taps} Taps!
                                </p>
                                <p className="text-xl text-love-charcoal/70">
                                    That's {(taps / 30).toFixed(1)} taps per second!
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={restartGame}
                                    className="flex-1 py-4 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                                >
                                    Play Again
                                </button>
                                <button
                                    onClick={handleExit}
                                    className="flex-1 py-4 bg-white text-love-charcoal rounded-xl font-bold text-lg hover:bg-love-blush transition-all"
                                >
                                    Exit
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Leaderboard gameType="fast-tap" />
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function FastTapPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <FastTapContent />
        </Suspense>
    );
}
