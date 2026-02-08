'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import * as GameManager from '@/lib/gameManager';
import { LOVE_WHEEL_ACTIONS } from '@/lib/gameContent';

export default function LoveWheelPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [spins, setSpins] = useState(0);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        if (!gameId) { router.push(returnTo); return; }
        const fetchGame = async () => {
            try {
                const g = await GameManager.getGameById(gameId);
                if (!g) { router.push(returnTo); return; }
                setGame(g);
                if (g?.status === 'waiting') await GameManager.setPlayerReady(gameId, username, true);
            } catch (e) { console.error(e); }
        };
        fetchGame();
    }, [gameId, session]);

    const spin = () => {
        if (spinning) return;
        setSpinning(true);
        setResult(null);

        setTimeout(async () => {
            const randomAction = LOVE_WHEEL_ACTIONS[Math.floor(Math.random() * LOVE_WHEEL_ACTIONS.length)];
            setResult(randomAction);
            setSpinning(false);
            setSpins(s => s + 1);
            if (gameId) {
                await GameManager.updatePlayerScore(gameId, username, randomAction.points);
                await GameManager.submitAnswer(gameId, username, { action: randomAction.action });
            }
        }, 2000);
    };

    const finish = async () => {
        if (gameId) await GameManager.endGame(gameId);
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (game.status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">🎡</div>
                    <h2 className="text-3xl font-bold">Thanks for Playing!</h2>
                    <p className="text-5xl font-bold text-love-gold">{game.players?.[0]?.score || 0}</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/love-wheel')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
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
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl font-bold">
                            <Trophy className="w-5 h-5 inline text-love-gold mr-2" />
                            {game.players?.[0]?.score || 0}
                        </div>
                        <div className="bg-love-rose px-4 py-2 rounded-xl text-white font-bold">
                            Spins: {spins}
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <motion.div
                        animate={spinning ? { rotate: 360 } : {}}
                        transition={spinning ? { duration: 2, ease: "easeOut" } : {}}
                        className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-pink-400 via-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-2xl"
                    >
                        <Sparkles className="w-32 h-32 text-white" />
                    </motion.div>

                    {result && !spinning && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="glass-card p-8 mb-6">
                            <div className="text-6xl mb-4">{result.emoji}</div>
                            <h2 className="text-3xl font-bold mb-2">{result.action}</h2>
                            <p className="text-2xl font-bold text-love-gold">+{result.points} points!</p>
                        </motion.div>
                    )}

                    {!result && !spinning && (
                        <h2 className="text-3xl font-bold mb-8">Spin the Love Wheel!</h2>
                    )}

                    <div className="flex gap-4 justify-center">
                        <button onClick={spin} disabled={spinning}
                            className="px-12 py-4 bg-gradient-to-r from-love-crimson to-love-rose text-white text-2xl rounded-xl font-bold disabled:opacity-50 hover:shadow-lg transition">
                            {spinning ? 'Spinning...' : 'Spin! 🎡'}
                        </button>
                        {spins >= 5 && (
                            <button onClick={finish}
                                className="px-12 py-4 bg-white text-love-charcoal text-2xl rounded-xl font-bold hover:bg-love-blush transition">
                                Finish
                            </button>
                        )}
                    </div>

                    {spins > 0 && spins < 5 && (
                        <p className="mt-6 text-love-charcoal/70">Spin at least 5 times to finish!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
