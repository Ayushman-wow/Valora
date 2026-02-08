'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Users, Link } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { useSession } from 'next-auth/react';

export default function HugChainPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [chain, setChain] = useState(0);
    const [lastHugger, setLastHugger] = useState('');

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
            } catch (e) { console.error(e); }
        };
        loadGame();

        // Polling for updates
        const interval = setInterval(async () => {
            if (gameId) {
                try {
                    const updated = await GameManager.getGameById(gameId);
                    if (updated) {
                        setGame(updated);
                        setChain(updated.gameData?.chain || 0);
                        setLastHugger(updated.gameData?.lastHugger || '');
                    }
                } catch (e) {
                    // ignore polling errors
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [gameId, session]);

    const handleHug = async () => {
        if (!gameId || lastHugger === username) return; // Can't hug yourself back immediately

        const newChain = chain + 1;
        setChain(newChain);
        setLastHugger(username);

        await GameManager.updateGameData(gameId, { chain: newChain, lastHugger: username });
        await GameManager.updatePlayerScore(gameId, username, 5);

        if (newChain >= 10) { // Goal: Chain of 10 hugs
            await GameManager.endGame(gameId);
        }
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (game.status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">🔗</div>
                    <h2 className="text-3xl font-bold">Chain Complete!</h2>
                    <p className="text-5xl font-bold text-love-gold">{chain}</p>
                    <p className="text-lg">Hugs Connected!</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/hug-chain')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">New Chain</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-3 bg-white rounded-xl font-bold">Exit</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between mb-8">
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl"><ArrowLeft /></button>
                    <div className="bg-white px-4 py-2 rounded-xl font-bold text-love-crimson"><Link className="w-5 h-5 inline mr-2" />Chain: {chain}</div>
                </div>

                <motion.div className="glass-card p-12 text-center">
                    <Users className="w-20 h-20 text-love-rose mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Start a Hug Chain!</h2>
                    <p className="text-love-charcoal/70 mb-8">Pass the hug to keep the chain going. You can't hug twice in a row!</p>

                    {lastHugger && (
                        <div className="mb-8 p-4 bg-love-blush/30 rounded-xl">
                            <span className="font-bold">{lastHugger}</span> just hugged!
                        </div>
                    )}

                    <motion.button whileTap={{ scale: 0.95 }}
                        onClick={handleHug}
                        disabled={lastHugger === username}
                        className="w-full py-6 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-2xl font-bold text-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition flex items-center justify-center gap-3">
                        {lastHugger === username ? 'Min 2 Players Needed' : 'Pass the Hug 🤗'}
                    </motion.button>
                </motion.div>

                <p className="text-center mt-6 text-sm text-love-charcoal/50">Tip: Invite a friend to play this game!</p>
            </div>
        </div>
    );
}
