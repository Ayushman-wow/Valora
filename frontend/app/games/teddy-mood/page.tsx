'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, ArrowLeft, CheckCircle, XCircle, Smile } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { GameSession } from '@/lib/gameTypes';
import { TEDDY_MOODS, shuffleArray } from '@/lib/gameContent';

export default function TeddyMoodPage() {
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
    const [timeLeft, setTimeLeft] = useState(10);

    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';
    const getCurrentUsername = () => username;

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const loadedGame = await GameManager.getGameById(gameId);
                if (!loadedGame) { router.push(returnTo); return; }
                if (!loadedGame.gameData?.questions || !Array.isArray(loadedGame.gameData.questions) || loadedGame.gameData.questions.length === 0) {
                    const questions = shuffleArray([...TEDDY_MOODS]);
                    await GameManager.updateGameData(gameId, { questions });
                    if (!loadedGame.gameData) loadedGame.gameData = {};
                    loadedGame.gameData.questions = questions;
                }
                setGame(loadedGame);
                if (loadedGame.status === 'waiting') await GameManager.setPlayerReady(gameId, getCurrentUsername(), true);
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, session]);

    useEffect(() => {
        if (game?.status === 'active' && !showResult) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev <= 1 ? (handleTimeout(), 10) : prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [game?.status, showResult, currentQ]);

    const handleTimeout = () => { setShowResult(true); setIsCorrect(false); setTimeout(nextQuestion, 2000); };

    const handleAnswer = async (answer: string) => {
        if (showResult || !game || !gameId) return;
        setSelected(answer);
        const correct = answer === game.gameData.questions[currentQ].mood;
        setIsCorrect(correct);
        setShowResult(true);
        if (correct) await GameManager.updatePlayerScore(gameId, getCurrentUsername(), 10);
        setTimeout(nextQuestion, 2000);
    };

    const nextQuestion = async () => {
        if (!game || !gameId) return;
        setShowResult(false); setSelected(null); setTimeLeft(10);
        if (currentQ + 1 >= game.gameData.questions.length) { await GameManager.endGame(gameId); return; }
        setCurrentQ(prev => prev + 1);
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (game.status === 'completed') {
        const player = game.players?.find(p => p.username === getCurrentUsername());
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card p-8 max-w-md w-full text-center space-y-6">
                    <div className="text-8xl">🧸</div>
                    <h2 className="text-3xl font-bold">All Done!</h2>
                    <p className="text-5xl font-bold text-love-gold">{player?.score || 0}</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/teddy-mood')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Play Again</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-3 bg-white rounded-xl font-bold">Exit</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const q = game.gameData.questions?.[currentQ];
    if (!q) return null;

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between mb-8">
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl"><ArrowLeft className="w-5 h-5" /></button>
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl"><Trophy className="w-5 h-5 inline text-love-gold mr-2" /><span className="font-bold">{game.players?.[0]?.score || 0}</span></div>
                        <div className="bg-love-crimson px-4 py-2 rounded-xl"><Clock className="w-5 h-5 inline text-white mr-2" /><span className="font-bold text-white">{timeLeft}s</span></div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={currentQ} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-card p-8">
                        <div className="text-center mb-8">
                            <div className="text-9xl mb-6">{q.emoji}</div>
                            <Smile className="w-12 h-12 text-love-rose mx-auto mb-4" />
                            <h2 className="text-2xl font-bold">How is this teddy feeling?</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {q.options.map((opt: string, i: number) => {
                                const isSel = selected === opt;
                                const isRight = showResult && opt === q.mood;
                                const isWrong = showResult && isSel && opt !== q.mood;
                                return (
                                    <button key={i} onClick={() => handleAnswer(opt)} disabled={showResult}
                                        className={`p-4 rounded-xl font-bold ${isRight ? 'bg-green-100 text-green-700 border-2 border-green-500' : isWrong ? 'bg-red-100 text-red-700' : isSel ? 'bg-love-crimson text-white' : 'bg-white hover:bg-love-blush/30'}`}>
                                        {opt} {isRight && '✓'} {isWrong && '✗'}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {showResult && (
                    <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className={`mt-6 p-6 rounded-xl text-center ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <p className="text-2xl font-bold">{isCorrect ? '🎉 Correct!' : '❌ Wrong!'}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
