'use client';
// Movie Emoji - Same as emoji-kiss but themed differently
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Clock, ArrowLeft, Film } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { EMOJI_PUZZLES, shuffleArray } from '@/lib/gameContent';
import { useSession } from 'next-auth/react';

export default function MovieEmojiPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
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
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, session]);

    useEffect(() => {
        if (game?.status === 'active' && !showResult) {
            const t = setInterval(() => setTimeLeft(p => p <= 1 ? (nextQ(), 20) : p - 1), 1000);
            return () => clearInterval(t);
        }
    }, [game, showResult, currentQ]);

    const handleAnswer = async (a: string) => {
        if (showResult || !game || !gameId) return;
        setSelected(a);
        const correct = a === game.gameData.questions[currentQ].answer;
        setShowResult(true);
        if (correct) await GameManager.updatePlayerScore(gameId, username, 20);
        setTimeout(nextQ, 2500);
    };

    const nextQ = async () => {
        if (!game || !gameId) return;
        setShowResult(false); setSelected(null); setTimeLeft(20);
        if (currentQ + 1 >= game.gameData.questions.length) { await GameManager.endGame(gameId); return; }
        setCurrentQ(p => p + 1);
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;
    if (game.status === 'completed') {
        const p = game.players?.find((x: any) => x.username === username);
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">🎬</div>
                    <h2 className="text-3xl font-bold">Cinema Master!</h2>
                    <p className="text-5xl font-bold text-love-gold">{p?.score || 0}</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/movie-emoji')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
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
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl"><ArrowLeft /></button>
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl font-bold"><Trophy className="w-5 h-5 inline text-love-gold mr-2" />{game.players?.[0]?.score || 0}</div>
                        <div className="bg-love-crimson px-4 py-2 rounded-xl text-white font-bold"><Clock className="w-5 h-5 inline mr-2" />{timeLeft}s</div>
                    </div>
                </div>

                <motion.div key={currentQ} className="glass-card p-8">
                    <div className="text-center mb-8">
                        <Film className="w-16 h-16 text-love-crimson mx-auto mb-4" />
                        <div className="text-7xl mb-6">{q.emojis}</div>
                        <h2 className="text-2xl font-bold">Guess the Movie!</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((o: string, i: number) => {
                            const isSel = selected === o;
                            const isRight = showResult && o === q.answer;
                            const isWrong = showResult && isSel && o !== q.answer;
                            return (
                                <button key={i} onClick={() => handleAnswer(o)} disabled={showResult}
                                    className={`p-4 rounded-xl font-bold ${isRight ? 'bg-green-100 text-green-700 border-2 border-green-500' : isWrong ? 'bg-red-100 text-red-700' : isSel ? 'bg-love-crimson text-white' : 'bg-white hover:bg-love-blush/30'}`}>
                                    {o}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
