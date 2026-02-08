'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Hand } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { NEVER_HAVE_I } from '@/lib/gameContent';
import { useSession } from 'next-auth/react';

function NeverHaveIContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [voted, setVoted] = useState(false);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const g = await GameManager.getGameById(gameId);
                if (!g) { router.push(returnTo); return; }
                if (!g.gameData?.questions || !Array.isArray(g.gameData.questions) || g.gameData.questions.length === 0) await GameManager.updateGameData(gameId, { questions: NEVER_HAVE_I });
                setGame(g || { gameData: { questions: NEVER_HAVE_I }, players: [] });
                if (g?.status === 'waiting') await GameManager.setPlayerReady(gameId, username, true);
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, session]);

    const handleVote = async (have: boolean) => {
        if (voted || !gameId) return;
        setVoted(true);
        await GameManager.submitAnswer(gameId, username, { have });
        if (have) await GameManager.updatePlayerScore(gameId, username, 10);
        setTimeout(async () => {
            setVoted(false);
            if (currentQ + 1 >= NEVER_HAVE_I.length) {
                await GameManager.endGame(gameId);
            } else {
                setCurrentQ(c => c + 1);
            }
        }, 2000);
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (game.status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">🙈</div>
                    <h2 className="text-3xl font-bold">Game Over!</h2>
                    <p className="text-lg">Thanks for sharing!</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/never-have-i')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-3 bg-white rounded-xl font-bold">Exit</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const q = NEVER_HAVE_I[currentQ];

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between mb-8">
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl"><ArrowLeft /></button>
                    <div className="bg-white px-4 py-2 rounded-xl font-bold">
                        {currentQ + 1}/{NEVER_HAVE_I.length}
                    </div>
                </div>

                <motion.div key={currentQ} className="glass-card p-12 text-center">
                    <Hand className="w-20 h-20 text-love-rose mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-12">{q}</h2>

                    <div className="grid grid-cols-2 gap-6">
                        <button onClick={() => handleVote(true)} disabled={voted}
                            className="p-8 rounded-2xl font-bold text-2xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition">
                            I Have! 🙋
                        </button>
                        <button onClick={() => handleVote(false)} disabled={voted}
                            className="p-8 rounded-2xl font-bold text-2xl bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition">
                            Never! 😇
                        </button>
                    </div>

                    {voted && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-xl font-bold text-love-gold">
                            Next question coming up...
                        </motion.p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default function NeverHaveIPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <NeverHaveIContent />
        </Suspense>
    );
}
