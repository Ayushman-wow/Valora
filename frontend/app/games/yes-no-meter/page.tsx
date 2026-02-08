'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { YES_NO_QUESTIONS, shuffleArray } from '@/lib/gameContent';
import { useSession } from 'next-auth/react';

function YesNoMeterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [votes, setVotes] = useState({ yes: 0, no: 0, maybe: 0 });
    const [voted, setVoted] = useState<string | null>(null);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const g = await GameManager.getGameById(gameId);
                if (!g) { router.push(returnTo); return; }
                if (!g.gameData?.questions || !Array.isArray(g.gameData.questions) || g.gameData.questions.length === 0) {
                    const q = shuffleArray([...YES_NO_QUESTIONS]);
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

    const handleVote = async (vote: string) => {
        if (voted || !game || !gameId) return;
        setVoted(vote);
        await GameManager.submitAnswer(gameId, username, { vote });
        await GameManager.updatePlayerScore(gameId, username, 5);
        setVotes(v => ({ ...v, [vote]: v[vote as keyof typeof v] + 1 }));
        setTimeout(async () => {
            setVoted(null);
            if (currentQ + 1 >= game.gameData.questions.length) {
                await GameManager.endGame(gameId);
            } else {
                setCurrentQ(c => c + 1);
                setVotes({ yes: 0, no: 0, maybe: 0 });
            }
        }, 3000);
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (game.status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">💍</div>
                    <h2 className="text-3xl font-bold">Thanks for Voting!</h2>
                    <p className="text-5xl font-bold text-love-gold">{game.players?.[0]?.score || 0}</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/yes-no-meter')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
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
                    <div className="bg-white px-4 py-2 rounded-xl font-bold">
                        <Trophy className="w-5 h-5 inline text-love-gold mr-2" />
                        Question {currentQ + 1}/{game.gameData.questions.length}
                    </div>
                </div>

                <motion.div className="glass-card p-8 text-center">
                    <div className="text-7xl mb-6">💍</div>
                    <h2 className="text-3xl font-bold mb-8">{q}</h2>

                    <div className="grid gap-4 mb-8">
                        <button onClick={() => handleVote('yes')} disabled={!!voted}
                            className={`p-6 rounded-2xl font-bold text-xl transition ${voted === 'yes' ? 'bg-green-500 text-white' : 'bg-white hover:bg-green-100'}`}>
                            <ThumbsUp className="w-8 h-8 inline mr-3" /> Yes!
                        </button>
                        <button onClick={() => handleVote('maybe')} disabled={!!voted}
                            className={`p-6 rounded-2xl font-bold text-xl transition ${voted === 'maybe' ? 'bg-yellow-500 text-white' : 'bg-white hover:bg-yellow-100'}`}>
                            <Meh className="w-8 h-8 inline mr-3" /> Maybe
                        </button>
                        <button onClick={() => handleVote('no')} disabled={!!voted}
                            className={`p-6 rounded-2xl font-bold text-xl transition ${voted === 'no' ? 'bg-red-500 text-white' : 'bg-white hover:bg-red-100'}`}>
                            <ThumbsDown className="w-8 h-8 inline mr-3" /> No
                        </button>
                    </div>

                    {voted && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/50 rounded-xl p-6">
                            <p className="font-bold mb-4">Results:</p>
                            <div className="space-y-3">
                                <div className="bg-green-100 rounded-lg p-3 flex justify-between">
                                    <span className="font-bold">Yes</span>
                                    <span>{votes.yes}</span>
                                </div>
                                <div className="bg-yellow-100 rounded-lg p-3 flex justify-between">
                                    <span className="font-bold">Maybe</span>
                                    <span>{votes.maybe}</span>
                                </div>
                                <div className="bg-red-100 rounded-lg p-3 flex justify-between">
                                    <span className="font-bold">No</span>
                                    <span>{votes.no}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default function YesNoMeterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <YesNoMeterContent />
        </Suspense>
    );
}
