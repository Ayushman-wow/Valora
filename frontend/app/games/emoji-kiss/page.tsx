'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, ArrowLeft, Film, Star } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { GameSession } from '@/lib/gameTypes';
import { EMOJI_PUZZLES, shuffleArray } from '@/lib/gameContent';
import { useSession } from 'next-auth/react';
import Leaderboard from '@/components/Leaderboard';
import { API_BASE_URL } from '@/config/env';

function EmojiKissContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<GameSession | null>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const g = await GameManager.getGameById(gameId);
                if (!g) { router.push(returnTo); return; }
                if (!g.gameData?.questions || !Array.isArray(g.gameData.questions) || g.gameData.questions.length === 0) {
                    const q = shuffleArray([...EMOJI_PUZZLES]);
                    await GameManager.updateGameData(gameId, { questions: q });
                    if (!g.gameData) g.gameData = {};
                    g.gameData.questions = q;
                }
                setGame(g);
                if (g.status === 'waiting') await GameManager.setPlayerReady(gameId, username, true);
            } catch (e) {
                console.error(e);
            }
        };
        loadGame();
    }, [gameId, session]);

    useEffect(() => {
        if (game?.status === 'active' && !showResult) {
            const t = setInterval(() => setTimeLeft(p => p <= 1 ? (handleTimeout(), 20) : p - 1), 1000);
            return () => clearInterval(t);
        }
    }, [game, showResult, currentQ]);

    const handleTimeout = () => { setShowResult(true); setTimeout(next, 2500); };

    const handleAnswer = async (a: string) => {
        if (showResult || !game || !gameId) return;
        setSelected(a);
        const correct = a === game.gameData.questions[currentQ].answer;
        setShowResult(true);
        if (correct) {
            const updated = await GameManager.updatePlayerScore(gameId, username, 15);
            setGame(updated);
        }
        setTimeout(next, 2500);
    };

    const next = async () => {
        if (!game || !gameId) return;
        setShowResult(false); setSelected(null); setTimeLeft(20);
        if (currentQ + 1 >= game.gameData.questions.length) {
            const finalGame = await GameManager.endGame(gameId);
            setGame(finalGame);

            // Submit to Global Leaderboard
            const finalScore = finalGame.players?.find(p => p.username === username)?.score || 0;
            try {
                await fetch(`${API_BASE_URL}/api/leaderboard`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gameType: 'emoji-kiss',
                        username,
                        score: finalScore
                    })
                });
            } catch (err) {
                console.error('Failed to submit high score:', err);
            }
            return;
        }
        setCurrentQ(p => p + 1);
    };

    if (!game) return <div className="p-12 text-center text-love-rose animate-pulse">Loading Magic...</div>;

    if (game.status === 'completed') {
        const p = game.players?.find(x => x.username === username);
        return (
            <div className="min-h-screen bg-gradient-to-br from-love-blush to-love-rose/20 flex flex-col items-center justify-center p-6 space-y-8">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12 max-w-md w-full text-center space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-love-crimson" />
                    <div className="text-8xl animate-bounce">💋</div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-playfair font-black text-love-charcoal">Finished!</h2>
                        <p className="text-love-charcoal/60 font-medium">You've mastered the language of love.</p>
                    </div>
                    <div className="py-6 bg-love-crimson/5 rounded-3xl border-2 border-love-crimson/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-love-crimson/5 to-transparent" />
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-love-crimson mb-2">Final Score</p>
                        <p className="text-7xl font-black text-love-crimson drop-shadow-sm">{p?.score || 0}</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => router.push('/games/emoji-kiss')} className="flex-1 py-4 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-2xl font-black shadow-lg hover:translate-y-[-2px] transition-all">REPLAY</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-4 bg-white text-love-crimson border-2 border-love-crimson/20 rounded-2xl font-black hover:bg-love-blush transition-all">EXIT</button>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full max-w-md">
                    <Leaderboard gameType="emoji-kiss" />
                </motion.div>
            </div>
        );
    }

    const q = game.gameData.questions?.[currentQ];
    if (!q) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-love-blush/30 py-8 px-4 font-outfit">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border border-white/50">
                    <button onClick={() => router.push(returnTo)} className="p-4 bg-white rounded-2xl shadow-sm group active:scale-90 transition-all">
                        <ArrowLeft className="w-6 h-6 text-love-crimson group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex gap-6">
                        <div className="bg-white px-6 py-3 rounded-2xl font-black shadow-sm flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-love-gold" />
                            <span className="text-xl text-love-charcoal">{game.players?.find(p => p.username === username)?.score || 0}</span>
                        </div>
                        <div className="bg-gradient-to-r from-love-crimson to-love-rose px-6 py-3 rounded-2xl text-white font-black shadow-lg flex items-center gap-3">
                            <Clock className="w-5 h-5" />
                            <span className="text-xl">{timeLeft}s</span>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={currentQ} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} transition={{ type: "spring", damping: 20 }} className="glass-card p-12 shadow-glass relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                            <Film className="w-64 h-64" />
                        </div>
                        <div className="text-center mb-12 relative z-10">
                            <div className="inline-flex p-4 bg-love-crimson/5 rounded-3xl mb-6">
                                <Film className="w-10 h-10 text-love-crimson" />
                            </div>
                            <div className="text-7xl mb-8 drop-shadow-md select-none">{q.emojis}</div>
                            <h2 className="text-3xl font-playfair font-black text-love-charcoal">Guess the Movie!</h2>
                            <p className="text-love-charcoal/50 font-medium">Identify the film from these symbols</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {q.options.map((o: string, i: number) => {
                                const isSel = selected === o;
                                const isRight = showResult && o === q.answer;
                                const isWrong = showResult && isSel && o !== q.answer;
                                return (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAnswer(o)}
                                        disabled={showResult}
                                        className={`p-6 rounded-[2rem] font-black text-lg shadow-sm border-2 transition-all ${isRight ? 'bg-green-50 text-green-700 border-green-500 shadow-xl scale-105' :
                                            isWrong ? 'bg-red-50 text-red-700 border-red-500' :
                                                isSel ? 'bg-love-crimson text-white border-love-crimson' :
                                                    'bg-white/80 border-transparent hover:border-love-rose/20'
                                            }`}
                                    >
                                        {o}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress dot indicators */}
                <div className="flex justify-center gap-2">
                    {game.gameData.questions.map((_: any, i: number) => (
                        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === currentQ ? 'w-8 bg-love-rose' : i < currentQ ? 'w-2 bg-love-crimson' : 'w-2 bg-love-charcoal/10'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function EmojiKissPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <EmojiKissContent />
        </Suspense>
    );
}
