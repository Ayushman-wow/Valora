'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Lock, Key } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { useSession } from 'next-auth/react';

function TruthLockContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [promise, setPromise] = useState('');
    const [locked, setLocked] = useState(false);

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
    }, [gameId, session]);

    const handleLock = async () => {
        if (!promise.trim()) return;
        setLocked(true);
        if (gameId) {
            await GameManager.submitAnswer(gameId, username, { promise });
            await GameManager.updatePlayerScore(gameId, username, 20);
            await GameManager.endGame(gameId);
        }
    };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (locked) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card p-12 text-center space-y-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-love-rose to-love-crimson rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <Lock className="w-16 h-16 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">Promise Locked!</h2>
                    <p className="text-love-charcoal/70">Your secret is safe with us.</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/truth-lock')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">New Lock</button>
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
                    <div className="bg-white px-4 py-2 rounded-xl font-bold">Create a Lock</div>
                </div>

                <motion.div className="glass-card p-12 text-center">
                    <Key className="w-16 h-16 text-love-gold mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Lock a Truth</h2>
                    <p className="text-love-charcoal/70 mb-8">Write a promise or secret to lock away.</p>

                    <textarea value={promise} onChange={(e) => setPromise(e.target.value)}
                        placeholder="I promise to..."
                        className="w-full p-4 rounded-xl border-2 border-love-blush min-h-[150px] mb-6 focus:ring-2 focus:ring-love-rose outline-none resize-none" />

                    <button onClick={handleLock} disabled={!promise.trim()}
                        className="w-full py-4 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold text-xl disabled:opacity-50 hover:shadow-lg transition flex items-center justify-center gap-2">
                        <Lock className="w-5 h-5" /> Lock It!
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

export default function TruthLockPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <TruthLockContent />
        </Suspense>
    );
}
