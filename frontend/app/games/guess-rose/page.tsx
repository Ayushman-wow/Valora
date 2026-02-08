'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, ArrowLeft, Heart, Sparkles, Flame, Star } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { ROSE_MEANINGS, shuffleArray } from '@/lib/gameContent';
import confetti from 'canvas-confetti';
import { useSession } from 'next-auth/react';

function GuessTheRoseContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const [streak, setStreak] = useState(0);
    const [score, setScore] = useState(0);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const loadedGame = await GameManager.getGameById(gameId);
                if (!loadedGame) { router.push(returnTo); return; }

                // Ensure questions exist
                if (!loadedGame.gameData?.questions || !Array.isArray(loadedGame.gameData.questions) || loadedGame.gameData.questions.length === 0) {
                    const questions = shuffleArray([...ROSE_MEANINGS]).slice(0, 5);
                    await GameManager.updateGameData(gameId, { questions });
                    if (!loadedGame.gameData) loadedGame.gameData = {};
                    loadedGame.gameData.questions = questions;
                }
                setGame(loadedGame);

                if (loadedGame.status === 'waiting') {
                    await GameManager.setPlayerReady(gameId, username, true);
                }
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, session]);

    // Timer Logic
    useEffect(() => {
        if (game?.status === 'active' && !showResult) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimeout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [game?.status, showResult, currentQ]);

    const handleTimeout = () => {
        setShowResult(true);
        setIsCorrect(false);
        setStreak(0);
        setTimeout(() => nextQuestion(), 2500);
    };

    const handleAnswer = async (answer: string) => {
        if (showResult || !game || !gameId) return;

        setSelected(answer);
        const question = game.gameData.questions[currentQ];
        const correct = answer === question.color;

        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            // Calculate Score: Base (100) + Time Bonus (10 * seconds) + Streak Bonus (20 * streak)
            const timeBonus = timeLeft * 10;
            const streakBonus = streak * 20;
            const points = 100 + timeBonus + streakBonus;

            setScore(s => s + points);
            setStreak(s => s + 1);
            await GameManager.updatePlayerScore(gameId, username, points);

            // Celebration effect
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#FF1493', '#FF69B4', '#FFB6C1']
            });
        } else {
            setStreak(0);
        }

        setTimeout(() => nextQuestion(), 2000);
    };

    const nextQuestion = async () => {
        if (!game || !gameId) return;

        if (currentQ + 1 >= game.gameData.questions.length) {
            await GameManager.endGame(gameId);
        } else {
            setShowResult(false);
            setSelected(null);
            setTimeLeft(15);
            setCurrentQ(prev => prev + 1);
        }
    };

    // Helper to get personality based on score
    const getRosePersonality = (finalScore: number) => {
        if (finalScore > 2000) return { title: "Eternal Romantic 🌹", desc: "You speak the language of love fluently!" };
        if (finalScore > 1500) return { title: "Passionate Soul ❤️", desc: "Your heart knows what it wants!" };
        if (finalScore > 1000) return { title: "Sweet Admirer 🌸", desc: "You have a gentle way of loving." };
        return { title: "Budding Romance 🌱", desc: "Love is blooming in your heart!" };
    };

    if (!game) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">🌹</div></div>;

    // GAME OVER SCREEN
    if (game.status === 'completed') {
        const personality = getRosePersonality(score);
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-red-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-pink-500 to-red-500" />

                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto shadow-inner"
                    >
                        <span className="text-6xl">🌹</span>
                    </motion.div>

                    <div>
                        <h2 className="text-2xl font-bold text-love-charcoal mb-1">Game Over!</h2>
                        <h1 className="text-4xl font-playfair font-bold text-love-crimson mb-2">{personality.title}</h1>
                        <p className="text-love-charcoal/70">{personality.desc}</p>
                    </div>

                    <div className="bg-white/50 p-6 rounded-2xl border border-love-blush">
                        <p className="text-sm font-bold text-love-charcoal/50 uppercase tracking-widest mb-1">Final Score</p>
                        <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-love-crimson to-love-rose">
                            {score}
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:-translate-y-1">
                            Play Again 🔄
                        </button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-4 bg-white text-love-charcoal rounded-xl font-bold hover:bg-gray-50 transition-all border border-gray-200">
                            Exit
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const question = game.gameData.questions?.[currentQ];
    if (!question) return null;

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-pink-50 to-white">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white shadow-sm hover:shadow rounded-xl transition">
                        <ArrowLeft className="w-5 h-5 text-love-charcoal" />
                    </button>

                    <div className="flex gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 border border-orange-100">
                            <Flame className={`w-5 h-5 ${streak > 1 ? 'text-orange-500 animate-pulse' : 'text-gray-300'}`} />
                            <span className="font-bold text-orange-600">{streak}</span>
                        </div>
                        <div className="bg-love-crimson px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm text-white transition-all duration-300"
                            style={{ opacity: timeLeft < 5 ? 0.8 : 1, transform: timeLeft < 5 ? 'scale(1.05)' : 'scale(1)' }}>
                            <Clock className="w-4 h-4" />
                            <span className="font-bold">{timeLeft}s</span>
                        </div>
                    </div>
                </div>

                {/* Score Banner */}
                <div className="text-center mb-6">
                    <span className="inline-block px-4 py-1 bg-love-blush/30 rounded-full text-love-crimson font-bold text-sm">
                        Total Score: {score}
                    </span>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQ}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card p-8 mb-6 relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-love-rose/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="text-center mb-8 relative z-10">
                            <h3 className="text-love-charcoal/60 font-medium mb-2 uppercase tracking-wider text-sm">Meaning of</h3>
                            <h2 className="text-3xl font-bold text-love-charcoal">"{question.meaning}"</h2>
                            <div className="mt-4 w-16 h-1 bg-love-crimson/20 mx-auto rounded-full" />
                        </div>

                        <div className="grid gap-3">
                            {question.options.map((option: string, i: number) => {
                                const isSelected = selected === option;
                                const isRight = showResult && option === question.color;
                                const isWrong = showResult && isSelected && option !== question.color;

                                // Dynamic Styles
                                let btnClass = "w-full p-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-between group relative overflow-hidden ";
                                if (isRight) btnClass += "bg-green-100 text-green-700 border-2 border-green-500 shadow-md transform scale-[1.02]";
                                else if (isWrong) btnClass += "bg-red-100 text-red-700 border-2 border-red-500 opacity-80";
                                else if (isSelected) btnClass += "bg-love-crimson text-white shadow-lg transform scale-[1.02]";
                                else btnClass += "bg-white text-love-charcoal hover:bg-love-blush/20 hover:shadow-md border border-transparent";

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(option)}
                                        disabled={showResult}
                                        className={btnClass}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="text-2xl">{getEmojiForColor(option)}</span>
                                            <span className="capitalize">{option} Rose</span>
                                        </span>

                                        {isRight && <Sparkles className="w-5 h-5 text-green-600 animate-spin" />}
                                        {isWrong && <span className="text-xl">💔</span>}
                                        {!showResult && <span className="opacity-0 group-hover:opacity-100 transition-opacity text-love-rose">👉</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-love-crimson"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQ) / 5) * 100}%` }}
                    />
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">Question {currentQ + 1} of 5</p>
            </div>
        </div>
    );
}

// Helper for emojis
function getEmojiForColor(color: string) {
    const map: Record<string, string> = {
        'red': '🌹', 'pink': '🌸', 'white': '🤍', 'yellow': '🌻',
        'orange': '🧡', 'lavender': '💜', 'peach': '🍑', 'black': '🖤', 'blue': '💙'
    };
    return map[color.toLowerCase()] || '🌹';
}

export default function GuessTheRosePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <GuessTheRoseContent />
        </Suspense>
    );
}
