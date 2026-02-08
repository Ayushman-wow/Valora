'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Zap, ArrowLeft } from 'lucide-react';
import * as GameManager from '@/lib/gameManager';
import { useSession } from 'next-auth/react';

function HugMeterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId');
    const returnTo = searchParams.get('returnTo') || '/games';
    const [game, setGame] = useState<any>(null);
    const [hugs, setHugs] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [started, setStarted] = useState(false);
    const [ended, setEnded] = useState(false);

    const { data: session } = useSession();
    const username = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('heartsync_username') : 'Guest') || 'Guest';

    useEffect(() => {
        const loadGame = async () => {
            if (!gameId) { router.push(returnTo); return; }
            try {
                const g = await GameManager.getGameById(gameId);
                if (!g) { router.push(returnTo); return; }
                setGame(g);
                if (g.status === 'waiting') await GameManager.setPlayerReady(gameId, username, true);
            } catch (e) { console.error(e); }
        };
        loadGame();
    }, [gameId, session]);

    const start = () => {
        setStarted(true);
        setTimeLeft(30);
        setHugs(0);
        const t = setInterval(() => setTimeLeft(p => p <= 1 ? (end(), 0) : p - 1), 1000);
        return () => clearInterval(t);
    };

    const end = async () => {
        setEnded(true);
        setStarted(false);
        if (gameId) {
            await GameManager.updatePlayerScore(gameId, username, hugs);
            await GameManager.endGame(gameId);
        }
    };

    const handleHug = () => { if (started && !ended) setHugs(h => h + 1); };

    if (!game) return <div className="p-12 text-center">Loading...</div>;

    if (ended) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-8 max-w-md text-center space-y-6">
                    <div className="text-8xl">🤗</div>
                    <h2 className="text-3xl font-bold">Hug Master!</h2>
                    <p className="text-6xl font-bold text-love-gold">{hugs}</p>
                    <p className="text-lg">Hugs Sent!</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/games/hug-meter')} className="flex-1 py-3 bg-gradient-to-r from-love-crimson to-love-rose text-white rounded-xl font-bold">Again</button>
                        <button onClick={() => router.push(returnTo)} className="flex-1 py-3 bg-white rounded-xl font-bold">Exit</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div className="glass-card p-12 text-center space-y-6">
                    <div className="text-9xl">🤗</div>
                    <h1 className="text-4xl font-bold">Hug Meter!</h1>
                    <p className="text-xl text-love-charcoal/70">Tap to send hugs! Fill the meter in 30 seconds!</p>
                    <button onClick={start} className="px-12 py-4 bg-gradient-to-r from-love-crimson to-love-rose text-white text-2xl rounded-xl font-bold">Start!</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="flex justify-between mb-8">
                    <button onClick={() => router.push(returnTo)} className="p-3 bg-white rounded-xl"><ArrowLeft /></button>
                    <div className="flex gap-4">
                        <div className="bg-white px-6 py-3 rounded-xl"><Trophy className="w-6 h-6 inline text-love-gold mr-2" /><span className="text-2xl font-bold">{hugs}</span></div>
                        <div className="bg-love-crimson px-6 py-3 rounded-xl text-white"><Zap className="w-6 h-6 inline mr-2" /><span className="text-2xl font-bold">{timeLeft}s</span></div>
                    </div>
                </div>

                <motion.button onClick={handleHug} whileTap={{ scale: 0.9 }}
                    className="w-full aspect-square bg-gradient-to-br from-pink-400 via-red-400 to-pink-500 rounded-3xl shadow-2xl flex items-center justify-center text-9xl hover:scale-105 active:scale-95 transition">
                    🤗
                </motion.button>
                <p className="text-center mt-6 text-2xl font-bold">Tap to Send Hugs!</p>

                <div className="mt-8 bg-white/50 rounded-full h-8">
                    <motion.div animate={{ width: `${Math.min(100, (hugs / 100) * 100)}%` }} className="h-full bg-gradient-to-r from-love-crimson to-love-rose rounded-full" />
                </div>
            </div>
        </div>
    );
}

export default function HugMeterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <HugMeterContent />
        </Suspense>
    );
}
