'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, ArrowLeft, CheckCircle, XCircle, Heart } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { GameSession } from '@/lib/gameTypes';
import { CONFESSIONS, shuffleArray } from '@/lib/gameContent';

export default function GuessConfessionPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<GameSession | null>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);

    const getCurrentUsername = () => {
        return session?.user?.name || localStorage.getItem('heartsync_username') || 'Guest';
    };

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const loadedGame = await GameManager.getGameById(gameId);
                if (!loadedGame) { router.push(returnTo); return; }
                if (!loadedGame.gameData?.questions || !Array.isArray(loadedGame.gameData.questions) || loadedGame.gameData.questions.length === 0) {
                    const questions = shuffleArray([...CONFESSIONS]).slice(0, 5);
                    await GameManager.updateGameData(gameId, { questions });
                    if (!loadedGame.gameData) loadedGame.gameData = {};
                    loadedGame.gameData.questions = questions;
                }
                setGame(loadedGame);
                if (loadedGame.status === 'waiting') {
                    await GameManager.setPlayerReady(gameId, getCurrentUsername(), true);
                }
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, router, session]);

    useEffect(() => {
        if (game?.status === 'active' && !showResult) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) { handleTimeout(); return 15; }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [game?.status, showResult, currentQ]);

    const handleTimeout = () => {
        setShowResult(true);
        setIsCorrect(false);
        setTimeout(() => nextQuestion(), 2000);
    };

    const handleAnswer = async (answer: string) => {
        if (showResult || !game || !gameId) return;
        setSelected(answer);
        const question = game.gameData.questions[currentQ];
        const correct = answer === question.type;
        setIsCorrect(correct);
        setShowResult(true);
        if (correct) {
            await GameManager.updatePlayerScore(gameId, getCurrentUsername(), 15);
        }
        setTimeout(() => nextQuestion(), 2000);
    };

    const nextQuestion = async () => {
        if (!game || !gameId) return;
        setShowResult(false);
        setSelected(null);
        setTimeLeft(15);
        if (currentQ + 1 >= game.gameData.questions.length) {
            await GameManager.endGame(gameId);
            return;
        }
        setCurrentQ(prev => prev + 1);
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (game.status === 'completed') {
        const player = game.players?.find(p => p.username === getCurrentUsername());
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 max-w-md w-full text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <Trophy className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-playfair font-bold">Game Over!</h2>
                    <p className="text-5xl font-bold text-love-gold">{player?.score || 0}</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/guess-confession')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Play Again</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-3 bg-white text-love-charcoal rounded-xl font-bold">Exit</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const question = game.gameData.questions?.[currentQ];
    if (!question) return null;
    const player = game.players?.find(p => p.username === getCurrentUsername());

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-love-gold" />
                            <span className="font-bold">{player?.score || 0}</span>
                        </div>
                        <div className="bg-love-crimson px-4 py-2 rounded-xl flex items-center gap-2">
                            <Clock className="w-5 h-5 text-white" />
                            <span className="font-bold text-white">{timeLeft}s</span>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={currentQ} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="glass-card p-8">
                        <div className="text-center mb-8">
                            <Heart className="w-16 h-16 text-love-rose mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-love-charcoal mb-4">Confession</h2>
                            <p className="text-xl italic text-love-charcoal/80 mb-4">"{question.hint}"</p>
                            <p className="text-love-charcoal/60">What type of confession is this?</p>
                        </div>

                        <div className="grid gap-4">
                            {question.options.map((option: string, i: number) => {
                                const isSelected = selected === option;
                                const isRight = showResult && option === question.type;
                                const isWrong = showResult && isSelected && option !== question.type;
                                return (
                                    <button key={i} onClick={() => handleAnswer(option)} disabled={showResult}
                                        className={`p-4 rounded-xl font-bold transition-all flex items-center justify-between ${isRight ? 'bg-green-100 text-green-700 border-2 border-green-500' :
                                            isWrong ? 'bg-red-100 text-red-700 border-2 border-red-500' :
                                                isSelected ? 'bg-love-crimson text-white' :
                                                    'bg-white text-love-charcoal hover:bg-love-blush/30'
                                            }`}>
                                        <span className="capitalize">{option}</span>
                                        {isRight && <CheckCircle className="w-5 h-5" />}
                                        {isWrong && <XCircle className="w-5 h-5" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {showResult && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 text-center p-6 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                        <p className={`text-2xl font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {isCorrect ? '🎉 Correct!' : '❌ Wrong!'}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
