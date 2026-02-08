'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Sparkles, MessageCircle, Zap } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { TRUTH_OR_DARE } from '@/lib/gameContent';
import { useSession } from 'next-auth/react';

export default function TruthOrDarePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [current, setCurrent] = useState<string | null>(null);
    const [type, setType] = useState<'truth' | 'dare' | null>(null);
    const [completed, setCompleted] = useState(0);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const g = await GameManager.getGameById(gameId);
                if (!g) { router.push(returnTo); return; }
                setGame(g);
                if (g?.status === 'waiting') await GameManager.setPlayerReady(gameId, username, true);
            } catch (e) {
                console.error(e);
            }
        };
        loadGame();
    }, [gameId, session]);

    const handleChoice = (choice: 'truth' | 'dare') => {
        setType(choice);
        const list = choice === 'truth' ? TRUTH_OR_DARE.truths : TRUTH_OR_DARE.dares;
        const randomItem = list[Math.floor(Math.random() * list.length)];
        setCurrent(randomItem);
    };

    const handleComplete = async () => {
        if (!gameId) return;
        setCompleted(c => c + 1);
        await GameManager.updatePlayerScore(gameId, username, type === 'truth' ? 5 : 10);
        setCurrent(null);
        setType(null);
        if (completed >= 9) {
            await GameManager.endGame(gameId);
        }
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (game.status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">🔮</div>
                    <h2 className="text-3xl font-bold">Game Over!</h2>
                    <p className="text-5xl font-bold text-love-gold">{game.players?.[0]?.score || 0}</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/truth-dare')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-3 bg-white rounded-xl font-bold">Exit</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between mb-8">
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl"><ArrowLeft /></button>
                    <div className="bg-white px-4 py-2 rounded-xl font-bold text-love-crimson">
                        <Trophy className="w-5 h-5 inline mr-2" />
                        {game.players?.[0]?.score || 0}
                    </div>
                </div>

                <div className="text-center max-w-lg mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-love-charcoal">Truth or Dare?</h1>

                    {!current ? (
                        <div className="grid grid-cols-2 gap-6">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleChoice('truth')}
                                className="aspect-square bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-6 text-white shadow-xl flex flex-col items-center justify-center gap-4">
                                <MessageCircle className="w-16 h-16" />
                                <span className="text-3xl font-bold">TRUTH</span>
                                <span className="text-sm opacity-80">Be Honest! (5 pts)</span>
                            </motion.button>

                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleChoice('dare')}
                                className="aspect-square bg-gradient-to-br from-red-400 to-red-600 rounded-3xl p-6 text-white shadow-xl flex flex-col items-center justify-center gap-4">
                                <Zap className="w-16 h-16" />
                                <span className="text-3xl font-bold">DARE</span>
                                <span className="text-sm opacity-80">Be Brave! (10 pts)</span>
                            </motion.button>
                        </div>
                    ) : (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12">
                            <div className="text-xl font-bold text-love-rose mb-4 uppercase tracking-widest">{type}</div>
                            <h2 className="text-3xl font-bold mb-12 text-love-charcoal">"{current}"</h2>
                            <button onClick={handleComplete} className="px-8 py-4 bg-love-crimson text-white rounded-xl font-bold text-xl hover:bg-love-rose transition">
                                I Did It! ✅
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
