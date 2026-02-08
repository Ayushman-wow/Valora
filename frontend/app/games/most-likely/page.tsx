'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Crown } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { MOST_LIKELY_TO } from '@/lib/gameContent';
import { useSession } from 'next-auth/react';

function MostLikelyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [myVote, setMyVote] = useState('');
    const [showResults, setShowResults] = useState(false);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const g = await GameManager.getGameById(gameId);
                if (!g) { router.push(returnTo); return; }
                if (!g.gameData?.questions || !Array.isArray(g.gameData.questions) || g.gameData.questions.length === 0) await GameManager.updateGameData(gameId, { questions: MOST_LIKELY_TO });
                setGame(g || { gameData: { questions: MOST_LIKELY_TO }, players: [] });
                if (g?.status === 'waiting') await GameManager.setPlayerReady(gameId, username, true);
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, session]);

    const handleVote = async (person: string) => {
        if (myVote || !gameId) return;
        setMyVote(person);
        setShowResults(true);
        await GameManager.submitAnswer(gameId, username, { vote: person });
        await GameManager.updatePlayerScore(gameId, username, 5);
        setTimeout(async () => {
            setMyVote('');
            setShowResults(false);
            if (currentQ + 1 >= MOST_LIKELY_TO.length) {
                await GameManager.endGame(gameId);
            } else {
                setCurrentQ(c => c + 1);
            }
        }, 3000);
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (game.status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">👑</div>
                    <h2 className="text-3xl font-bold">All Voted!</h2>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/most-likely')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-3 bg-white rounded-xl font-bold">Exit</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const q = MOST_LIKELY_TO[currentQ];

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between mb-8">
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl"><ArrowLeft /></button>
                    <div className="bg-white px-4 py-2 rounded-xl font-bold">
                        {currentQ + 1}/{MOST_LIKELY_TO.length}
                    </div>
                </div>

                <motion.div key={currentQ} className="glass-card p-12 text-center">
                    <Crown className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-12">{q}</h2>

                    {!showResults ? (
                        <div className="space-y-4">
                            <input type="text" value={myVote} onChange={(e) => setMyVote(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && myVote && handleVote(myVote)}
                                placeholder="Type a name and press Enter" className="w-full px-6 py-4 rounded-xl border-2 border-love-blush text-center text-xl" />
                            <button onClick={() => myVote && handleVote(myVote)} disabled={!myVote}
                                className="w-full py-4 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold text-xl disabled:opacity-50">
                                Submit Vote
                            </button>
                        </div>
                    ) : (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-yellow-100 rounded-2xl p-8">
                            <p className="text-2xl font-bold text-yellow-900">You voted for:</p>
                            <p className="text-4xl font-bold mt-4">{myVote}</p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default function MostLikelyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <MostLikelyContent />
        </Suspense>
    );
}
